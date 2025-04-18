import gsap from 'gsap'
import Experience from './experience'
export default class Loading {
  constructor() {
    this.experience = Experience.instance
    this.time = this.experience.time

    this.element = document.querySelector('.loading')
    this.startSpinner()
  }

  startSpinner() {
    gsap.to('.spinner', {
      rotation: '+=30',
      duration: 0.5,
      ease: 'back.inOut',
      repeat: -1,
      repeatRefresh: true,
    })
  }

  stopSpinner() {
    return gsap.to('.spinner', {
      scale: 0,
      duration: 1,
      ease: 'back.inOut',
    })
  }

  async ready() {
    await this.stopSpinner()
    this.dispose()
  }

  dispose = () => {
    this.element.remove()
    this.element = null
  }
}
