import request from 'request'
import { sleep } from '../misc/utilities'

/**
 *
 * @param {string} uri
 * @param {request.CoreOptions} options
 */
export default async function requestApi (uri, options = undefined, retryCount = 5, retryInterval = 1000) {
  return new Promise((resolve, reject) => {
    request(
      uri,
      options,
      async (error, response, body) => {
        if (error) {
          if (retryCount === 0) {
            reject(error)
          } else {
            console.warn(`Received error: ${error}. Gonna retry now... Retry count: ${retryCount}`)
            await sleep(retryInterval)
            try {
              resolve(await requestApi(uri, options, --retryCount, retryInterval))
            } catch (error) {
              reject(error)
            }
          }
        } else {
          if (response.statusCode >= 200 && response.statusCode <= 299) {
            /** @type {Object[]} */
            const objBody = typeof body === 'string' ? JSON.parse(body) : body
            if (objBody instanceof Array) {
              console.debug(`[requestApi] statusCode: ${response.statusCode}. Items: ${objBody.length}`)
            } else {
              console.debug(`[requestApi] statusCode: ${response.statusCode}. Single object`)
            }
            resolve(objBody)
          } else {
            if (retryCount === 0) {
              reject(new Error(`Received statusCode: ${response.statusCode}`))
            } else {
              console.warn(`Received statusCode: ${response.statusCode}. Gonna retry now... Retry count: ${retryCount}`)
              await sleep(retryInterval)
              try {
                resolve(await requestApi(uri, options, --retryCount, retryInterval))
              } catch (error) {
                reject(error)
              }
            }
          }
        }
      }
    )
  })
}
