export default class List {
  constructor (id, description) {
    this._id = id
    this._description = description
    this._cards = []
  }

  /** @param {string} id */
  set id (id) { this._id = id }
  get id () { return this._id }

  /** @param {string} description */
  set description (description) { this._description = description }
  get description () { return this._description }

  /** @param {import('./card').default[]} cards */
  set cards (cards) { this._cards = cards }
  get cards () { return this._cards }

  getUserObject () {
    return {
      id: this.id,
      description: this.description,
      cards: this.cards.map((card) => card.getUserObject())
    }
  }

  /**
   *
   * @param {import('./card').default} card
   */
  insertOrUpdateCard (card) {
    let indexCard = -1
    for (let i = 0, length = this.cards.length; i < length; i++) {
      if (this.cards[i].id === card.id) {
        indexCard = i
        break
      }
    }

    if (indexCard >= 0) {
      this.cards.splice(indexCard, 1, card)
    } else {
      this.cards.push(card)
    }
  }
}
