import Experience from '@experience'
import { EventDispatcher } from 'three'
import { Timer } from 'three/addons/misc/Timer.js'

export default class Time extends EventDispatcher {
  constructor() {
    super()

    // Options
    this.elapsed = 0
    this.delta = 16 // how many milliseconds there is between two frames at 60fps

    // Setup
    this.experience = Experience.instance
    this.timer = new Timer()

    // Events
    // don't call the tick method immediately to avoid having a delta equal to 0 on the first frame
    window.requestAnimationFrame(this.tick)
  }

  tick = () => {
    this.timer.update()

    this.delta = this.timer.getDelta()
    this.elapsed = this.timer.getElapsed()

    this.dispatchEvent({ type: 'tick' })

    window.requestAnimationFrame(this.tick)
  }
}
