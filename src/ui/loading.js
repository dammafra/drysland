import gsap from 'gsap'

export default class Loading {
  /** @type {Loading} */
  static instance

  static init() {
    return new Loading()
  }

  constructor() {
    // Singleton
    if (Loading.instance) {
      return Loading.instance
    }

    Loading.instance = this

    this.element = document.querySelector('.loading')
    this.title = this.element.querySelector('.title')
    this.spinner = this.element.querySelector('.spinner')

    this.start()
  }

  start() {
    return gsap
      .timeline()
      .to(this.spinner, {
        scale: 1,
        duration: 0.5,
        ease: 'back.out',
      })
      .to(
        this.title,
        {
          scale: 1,
          duration: 0.5,
          ease: 'back.out',
        },
        '<+0.2',
      )
      .to(this.spinner, {
        rotation: '+=30',
        duration: 0.5,
        ease: 'back.inOut',
        repeat: -1,
        repeatRefresh: true,
      })
  }

  async stop() {
    await gsap.to(this.element, {
      scale: 0,
      duration: 0.25,
      ease: 'back.in',
    })

    this.dispose()
  }

  dispose = () => {
    this.element.remove()
    this.element = null
  }
}
