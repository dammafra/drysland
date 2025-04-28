import Element from './element'

export default class Text extends Element {
  constructor(id) {
    super(id)
  }

  set(content) {
    this.element.textContent = content
    return this
  }
}
