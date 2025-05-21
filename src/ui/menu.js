import gsap from 'gsap'

export default class Menu {
  constructor() {
    this.element = document.querySelector('.menu')
    this.title = this.element.querySelector('.title')
    this.bgHex = this.element.querySelector('.bg-hex')
    this.buttons = this.element.querySelectorAll('button')
    this.footer = this.element.querySelector('footer')

    this.open()
  }

  init() {
    this.element.classList.remove('hidden')
    gsap.set(this.element, { scale: 1 })
    gsap.set(this.bgHex, { scale: 0, rotate: -60 })
    gsap.set(this.title, { scale: 0 })
    gsap.set(this.footer, { opacity: 0 })
    gsap.set(this.buttons, { scale: 0 })
  }

  async open() {
    this.init()

    await gsap
      .timeline()
      .to(this.element, { opacity: 1 })
      .to(this.title, {
        scale: 1,
        duration: 0.5,
        ease: 'back.out',
      })
      .to(
        this.bgHex,
        {
          scale: 1,
          rotate: 0,
          duration: 0.5,
          ease: 'back.out',
        },
        '<+0.2',
      )
      .to(this.footer, {
        opacity: 1,
        duration: 1,
      })
      .to(
        this.buttons,
        {
          scale: 1,
          duration: 0.5,
          ease: 'back.out',
        },
        '<+0.2',
      )

    this.idle = gsap.to(this.bgHex, {
      rotate: '+=60',
      duration: 0.5,
      repeatDelay: 1.5,
      ease: 'back.inOut',
      repeat: -1,
      repeatRefresh: true,
    })
  }

  async close() {
    await gsap
      .timeline()
      .to(this.footer, {
        opacity: 0,
        duration: 0.1,
      })
      .to(this.buttons, {
        scale: 0,
        duration: 0.25,
        ease: 'back.in',
      })
      .to(
        this.bgHex,
        {
          scale: 0,
          rotate: 60,
          duration: 0.25,
          ease: 'back.in',
        },
        '<+0.1',
      )
      .to(
        this.element,
        {
          scale: 0,
          duration: 0.25,
          ease: 'back.in',
        },
        '<+0.1',
      )

    this.dispose()
  }

  dispose() {
    this.idle?.kill()
    this.element.classList.add('hidden')
  }
}
