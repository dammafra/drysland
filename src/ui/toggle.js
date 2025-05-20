import Button from './button'

export default class Toggle extends Button {
  constructor(id) {
    super(id)
  }

  onToggle(callback) {
    const newCallback = async () => {
      const res = await callback()
      this.toggle(res)
    }

    super.onClick(newCallback)

    return this
  }

  toggle(value) {
    this.element.classList.toggle('toggle-off', !value)
    return this
  }
}
