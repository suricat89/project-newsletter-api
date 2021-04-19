export default class CustomField {
  constructor (id, description, type) {
    this._id = id
    this._description = description
    this._type = type
  }

  /** @param {string} id */
  set id (id) { this._id = id }
  get id () { return this._id }

  /** @param {string} description */
  set description (description) { this._description = description }
  get description () { return this._description }

  /** @param {string} type */
  set type (type) { this._type = type }
  get type () { return this._type }

  /** @param {string|Date|number} value */
  set value (value) { this._value = value }
  get value () { return this._value }

  getUserObject () {
    return {
      id: this.id,
      description: this.description,
      type: this.type,
      value: this.value
    }
  }
}
