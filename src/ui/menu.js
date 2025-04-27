import gsap from 'gsap'

export default class Menu {
  /** @type {Menu} */
  static instance

  static init() {
    return new Menu()
  }

  constructor() {
    // Singleton
    if (Menu.instance) {
      return Menu.instance
    }

    Menu.instance = this

    this.element = document.querySelector('.menu')
    this.title = this.element.querySelector('.title')
    this.button = this.element.querySelector('button')
    this.credits = this.element.querySelector('.credits')

    this.open()
  }

  open() {
    return gsap
      .timeline()
      .to(this.element, { opacity: 1 })
      .to(this.title, {
        scale: 1,
        duration: 0.5,
        ease: 'back.out',
      })
      .to(
        this.button,
        {
          scale: 1,
          duration: 0.5,
          ease: 'back.out',
        },
        '<+0.2',
      )
      .to(this.credits, {
        opacity: 1,
        duration: 1,
        ease: 'back.out',
      })
  }

  async close() {
    await gsap
      .timeline()
      .to(this.credits, {
        opacity: 0,
        duration: 0.25,
        ease: 'back.in',
      })
      .to(
        this.element,
        {
          scale: 0,
          duration: 0.5,
          ease: 'back.in',
        },
        '<',
      )

    this.dispose()
  }

  dispose = () => {
    this.element.remove()
    this.element = null
  }
}
