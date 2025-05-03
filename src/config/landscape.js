import Experience from '@experience'

export default class LandscapeConfig {
  /** @type {LandscapeConfig} */
  static instance

  static init() {
    return new LandscapeConfig()
  }

  get size() {
    return this.settings.isGraphicsQuality ? 2 : 1
  }

  get animate() {
    return this.settings.isGraphicsQuality
  }

  get wind() {
    const speed = 0.25

    return this.settings.isGraphicsQuality ? { speed, min: 1, max: 3 } : { speed, min: 1, max: 1 }
  }

  get seagulls() {
    const maxVolume = 1
    const speed = 0.08

    return this.settings.isGraphicsQuality
      ? { speed, maxVolume, min: 3, max: 6 }
      : { speed, maxVolume, min: 1, max: 3 }
  }

  constructor() {
    if (LandscapeConfig.instance) return LandscapeConfig.instance
    LandscapeConfig.instance = this

    this.experience = Experience.instance
    this.settings = this.experience.settings
    this.debug = this.experience.debug

    this.ship = {
      maxVolume: 0.3,
      speed: 0.05,
      models: {
        ship: { scale: 0.2, rotationOffset: 0, elevationOffset: 0.05 },
        boat: { scale: 0.005, rotationOffset: -Math.PI * 0.5, elevationOffset: 0.1 },
      },
    }
  }

  setDebug() {
    if (!this.debug) return

    const folder = this.debug.root.addFolder({ title: '🏔️ landscape', index: 8, expanded: false })

    folder.addBinding(this.wind, 'speed', {
      label: 'wind speed',
      min: 0,
      max: 1,
      step: 0.01,
    })

    folder.addBinding(this.ship, 'speed', {
      label: 'ship speed',
      min: 0,
      max: 1,
      step: 0.01,
    })

    folder.addBinding(this.ship, 'maxVolume', {
      label: 'ship volume',
      min: 0,
      max: 1,
      step: 0.01,
    })

    folder.addBinding(this.seagulls, 'speed', {
      label: 'seagulls speed',
      min: 0,
      max: 1,
      step: 0.01,
    })

    folder.addBinding(this.seagulls, 'maxVolume', {
      label: 'seagulls volume',
      min: 0,
      max: 1,
      step: 0.01,
    })
  }
}
