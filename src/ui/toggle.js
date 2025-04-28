import Button from './button'

export default class Toggle extends Button {
  constructor(id) {
    super(id)
  }

  onToggle(callback) {
    const newCallback = async () => {
      const res = await callback()

      if (res) {
        this.element.classList.add('!text-green-700')
        this.element.classList.remove('!text-red-700')
      } else {
        this.element.classList.remove('!text-green-700')
        this.element.classList.add('!text-red-700')
      }
    }

    super.onClick(newCallback)
  }
}
