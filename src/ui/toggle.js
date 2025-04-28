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
  }

  set(value) {
    if (value) {
      this.element.classList.add('!text-green-700')
      this.element.classList.remove('!text-red-700')
    } else {
      this.element.classList.remove('!text-green-700')
      this.element.classList.add('!text-red-700')
    }
  }
}
