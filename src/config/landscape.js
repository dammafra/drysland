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
    const speed = 0.08
    const audio = { volume: 1, refDistance: 3, maxDistance: 25, rolloffFactor: 2 }

    return this.settings.isGraphicsQuality
      ? { speed, audio, min: 3, max: 6 }
      : { speed, audio, min: 1, max: 3 }
  }

  constructor() {
    if (LandscapeConfig.instance) return LandscapeConfig.instance
    LandscapeConfig.instance = this

    this.experience = Experience.instance
    this.settings = this.experience.settings
    this.debug = this.experience.debug

    this.ship = {
      speed: 0.05,
      audio: { volume: 0.3, refDistance: 3, maxDistance: 25, rolloffFactor: 2 },
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

    folder.addBinding(this.ship.audio, 'volume', {
      label: 'ship volume',
      min: 0,
      max: 1,
      step: 0.01,
    })

    folder.addBinding(this.ship.audio, 'refDistance', {
      label: 'ship ref distance',
      min: 1,
      max: 20,
      step: 1,
    })

    folder.addBinding(this.seagulls, 'speed', {
      label: 'seagulls speed',
      min: 0,
      max: 1,
      step: 0.01,
    })

    folder.addBinding(this.seagulls.audio, 'volume', {
      label: 'seagulls volume',
      min: 0,
      max: 1,
      step: 0.01,
    })

    folder.addBinding(this.seagulls.audio, 'refDistance', {
      label: 'seagulls ref distance',
      min: 1,
      max: 20,
      step: 1,
    })
  }
}
