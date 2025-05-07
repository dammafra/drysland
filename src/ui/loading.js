import gsap from 'gsap'
import Text from './text'

export default class Loading {
  /** @type {Loading} */
  static instance

  static init() {
    return new Loading()
  }

  constructor() {
    if (Loading.instance) return Loading.instance
    Loading.instance = this

    this.element = document.querySelector('.loading')
    this.title = this.element.querySelector('.title')
    this.spinner = this.element.querySelector('.spinner')
    this.progress = new Text('#progress')

    this.start()
  }

  async start() {
    gsap
      .timeline()
      .to(this.spinner, {
        scale: 1,
        duration: 0.5,
        ease: 'back.out',
      })
      .to(
        [this.title, this.progress.element],
        {
          scale: 1,
          duration: 0.5,
          ease: 'back.out',
        },
        '<+0.2',
      )

    this.idle = gsap.to(this.spinner, {
      rotation: '+=60',
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

  setProgress(progress) {
    this.progress.set(Math.round(progress))
  }

  dispose = () => {
    this.idle.kill()
    this.element.remove()
    this.element = null
  }
}
