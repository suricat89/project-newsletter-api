import express from 'express'
import config from '../config.json'
import util from 'util'
import requestApi from '../control/requestApi'
import cors from 'cors'
import async from 'async'

import Board from '../model/board'
import List from '../model/list'
import CustomField from '../model/customField'
import Card from '../model/card'

const router = express.Router()

router.get('/', cors(), getNewsletterData)

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
async function getNewsletterData (req, res, next) {
  const boardId = process.env.BOARD_ID
  const apiKey = process.env.API_KEY
  const apiToken = process.env.API_TOKEN
  const asyncThreads = process.env.ASYNC_THREADS - 0

  let board = new Board(boardId)

  try {
    board = await getBoardLists(board, apiKey, apiToken)
    board = await getBoardCustomFields(board, apiKey, apiToken)
    board = await getBoardCards(board, apiKey, apiToken)

    const cards = []
    board.lists.forEach((list) => {
      list.cards.forEach((card) => {
        cards.push(card)
      })
    })

    async.mapLimit(cards, asyncThreads, async (card) => {
      const cardObj = await getCardDetails(board, card.id, apiKey, apiToken)
      return cardObj
    }, (error, result) => {
      if (error) {
        console.error(error)
      } else {
        result.forEach((card) => {
          board.lists
            .filter((list) => list.id === card.idList)
            .forEach((list) => {
              list.insertOrUpdateCard(card)
            })
        })

        res.status(200).send(board.getUserObject())
      }
    })
  } catch (error) {
    res.status(500).send(error)
  }
}

/**
 *
 * @param {Board} board
 * @param {string} apiKey
 * @param {string} apiToken
 * @returns {Promise<Board>}
 */
async function getBoardLists (board, apiKey, apiToken) {
  console.info('[getBoardLists] Will get board lists...')
  /** @type {Object[]} */
  const lists = await requestApi(
    util.format(
      config.uriList.getBoardLists.uri,
      board.id,
      apiKey,
      apiToken
    ),
    {
      method: 'GET'
    }
  )

  lists.forEach((item) => {
    board.lists.push(new List(item.id, item.name))
  })

  console.info(`[getBoardLists] Got ${board.lists.length} lists.`)
  return Promise.resolve(board)
}

/**
 *
 * @param {Board} board
 * @param {string} apiKey
 * @param {string} apiToken
 * @returns {Promise<Board>}
 */
async function getBoardCards (board, apiKey, apiToken) {
  console.info('[getBoardCards] Will get board cards...')

  /** @type {Object[]} */
  const cards = await requestApi(
    util.format(
      config.uriList.getBoardCards.uri,
      board.id,
      apiKey,
      apiToken
    ),
    {
      method: 'GET'
    }
  )

  cards.forEach((cardItem) => {
    board.lists
      .filter((listItem) => listItem.id === cardItem.idList)
      .forEach((listItem) => {
        listItem.cards.push(new Card(cardItem.id, cardItem.name))
      })
  })

  console.info(`[getBoardCards] Got ${board.getTotalCardCount()} cards.`)
  return Promise.resolve(board)
}

/**
 *
 * @param {Board} board
 * @param {string} apiKey
 * @param {string} apiToken
 * @returns {Promise<Board>}
 */
async function getBoardCustomFields (board, apiKey, apiToken) {
  console.info('[getBoardCustomFields] Will get board custom fields list...')
  /** @type {Object[]} */
  const customFields = await requestApi(
    util.format(
      config.uriList.getCustomFields.uri,
      board.id,
      apiKey,
      apiToken
    ),
    {
      method: 'GET'
    })

  customFields.forEach((item) => {
    board.customFields.push(new CustomField(item.id, item.name, item.type))
  })

  console.info(`[getBoardCustomFields] Got ${board.customFields.length} custom fields.`)
  return Promise.resolve(board)
}

/**
 *
 * @param {Board} board
 * @param {string} apiKey
 * @param {string} apiToken
 * @returns {Promise<Card>}
 */
async function getCardDetails (board, cardId, apiKey, apiToken) {
  console.info(`[getCardDetails] Will get card details. Card id '${cardId}'...`)

  /** @type {Object} */
  const value = await requestApi(
    util.format(
      config.uriList.getCardDetails.uri,
      cardId,
      apiKey,
      apiToken
    ),
    {
      method: 'GET'
    })

  const card = new Card(value.id, value.name)
  card.idList = value.idList

  if (value.customFieldItems && value.customFieldItems.length) {
    value.customFieldItems.forEach((customField) => {
      const newField = board.customFieldFactory(customField.idCustomField)
      newField.value =
        newField.type === 'date'
          ? newField.value = new Date(Date.parse(customField.value[newField.type]))
          : newField.value = customField.value[newField.type]

      card.customFields.push(newField)
    })
  }

  console.info('[getCardDetails] Got card details successfully.')
  return Promise.resolve(card)
}

export default router
