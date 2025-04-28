import Button from './button'

export default class Toggle extends Button {
  constructor(id) {
    super(id)
  }

  onToggle(callback) {
    const newCallback = async () => {
      const res = await callback()
      this.set(res)
    }

    super.onClick(newCallback)

    return this
  }

  set(value) {
    value
      ? this.element.classList.remove('!text-red-700')
      : this.element.classList.add('!text-red-700')

    return this
  }
}
