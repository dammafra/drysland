import Button from './button'
import Text from './text'

export default class SaveSlot extends Button {
  static counter = 0

  constructor(state) {
    super('#save-slot')

    this.element = this.element.cloneNode(true)
    this.element.id = this.element.id + ++SaveSlot.counter

    const level = `Level ${state.level}`
    const date = state.timestamp
      ? new Date(state.timestamp).toLocaleString(undefined, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      : 'N/D'

    this.level = new Text(this.element.querySelector('.level')).set(level).show()
    this.level = new Text(this.element.querySelector('.date')).set(date).show()
  }
}
