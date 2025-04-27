export default class Button {
  constructor(id) {
    this.element = document.getElementById(id)
  }

  show() {
    this.element.classList.remove('hidden')
  }

  hide() {
    this.element.classList.add('hidden')
  }

  onClick(callback) {
    this.element.onclick = callback
  }
}
