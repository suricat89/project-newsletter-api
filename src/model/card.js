export default class Card {
  constructor (id, description) {
    this._id = id
    this._description = description
    this._customFields = []
    this._idList = undefined
  }

  /** @param {string} id */
  set id (id) { this._id = id }
  get id () { return this._id }

  /** @param {string} description */
  set description (description) { this._description = description }
  get description () { return this._description }

  /** @param {import('./customField').default[]} customFields */
  set customFields (customFields) { this._customFields = customFields }
  get customFields () { return this._customFields }

  /** @param {string} idList */
  set idList (idList) { this._idList = idList }
  get idList () { return this._idList }

  getUserObject () {
    return {
      id: this.id,
      description: this.description,
      customFields: this.customFields.map((customField) => customField.getUserObject())
    }
  }
}
