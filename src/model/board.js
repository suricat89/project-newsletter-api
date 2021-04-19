import CustomField from './customField'

export default class Board {
  constructor (id) {
    this._id = id
    this._lists = []
    this._customFields = []
  }

  /** @param {string} id */
  set id (id) { this._id = id }
  get id () { return this._id }

  /** @param {import('./list').default[]} lists */
  set lists (lists) { this._lists = lists }
  get lists () { return this._lists }

  /** @param {import('./customField').default[]} customFields */
  set customFields (customFields) { this._customFields = customFields }
  get customFields () { return this._customFields }

  getUserObject () {
    return {
      boardId: this.id,
      lists: this.lists.map((list) => list.getUserObject()),
      customFields: this.customFields.map((customField) => customField.getUserObject())
    }
  }

  customFieldFactory (id) {
    if (this.customFields && this.customFields.length) {
      for (let i = 0, length = this.customFields.length; i < length; i++) {
        if (this.customFields[i].id === id) {
          return new CustomField(
            this.customFields[i].id,
            this.customFields[i].description,
            this.customFields[i].type
          )
        }
      }
      return undefined
    } else return undefined
  }

  getTotalCardCount () {
    let count = 0
    this.lists.forEach((list) => {
      count += list.cards.length
    })

    return count
  }
}
