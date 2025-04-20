import gsap from 'gsap'
import Experience from './experience'
export default class Loading {
  constructor() {
    this.experience = Experience.instance
    this.time = this.experience.time

    this.element = document.querySelector('.loading')
    this.start()
  }

  start() {
    return gsap
      .timeline()
      .to('.spinner', {
        scale: 1,
        duration: 0.5,
        ease: 'back.out',
      })
      .to(
        '.title',
        {
          scale: 1,
          duration: 0.5,
          ease: 'back.out',
        },
        '<+0.2',
      )
      .to('.spinner', {
        rotation: '+=30',
        duration: 0.5,
        ease: 'back.inOut',
        repeat: -1,
        repeatRefresh: true,
      })
  }

  stop() {
    return gsap
      .timeline()
      .to('.spinner', {
        scale: 0,
        duration: 0.5,
        ease: 'back.in',
      })
      .to(
        '.title',
        {
          scale: 0,
          duration: 0.5,
          ease: 'back.in',
        },
        '<+0.2',
      )
  }

  async ready() {
    await this.stop()
    this.dispose()
  }

  dispose = () => {
    this.element.remove()
    this.element = null
  }
}
