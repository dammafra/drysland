import Experience from '@experience'
import { Uniform } from 'three'

export default class OceanConfig {
  /** @type {OceanConfig} */
  static instance

  static init() {
    return new OceanConfig()
  }

  get size() {
    return this.settings.isGraphicsQuality ? 20 : 10
  }

  get roughness() {
    return new Uniform(this.settings.isGraphicsQuality ? 0.65 : 1)
  }

  get transparent() {
    return this.settings.isGraphicsQuality
  }

  constructor() {
    if (OceanConfig.instance) return OceanConfig.instance
    OceanConfig.instance = this

    this.experience = Experience.instance
    this.settings = this.experience.settings
    this.debug = this.experience.debug

    this.waves = {
      frequencyX: 0.03,
      frequencyY: 0.03,
      speed: 0.05,
      scale: 0.25,
    }
  }

  setDebug() {
    if (!this.debug) return

    const folder = this.debug.root.addFolder({ title: '🌊 ocean', index: 9, expanded: false })

    folder.addBinding(this.roughness, 'value', {
      label: 'roughness',
      min: 0,
      max: 1,
      step: 0.01,
    })

    folder.addBinding(this.waves, 'frequencyX', {
      label: 'waves frequencyX',
      min: 0,
      max: 1,
      step: 0.01,
    })

    folder.addBinding(this.waves, 'frequencyY', {
      label: 'waves frequencyY',
      min: 0,
      max: 1,
      step: 0.01,
    })

    folder.addBinding(this.waves, 'speed', {
      label: 'waves speed',
      min: 0,
      max: 5,
      step: 0.01,
    })

    folder.addBinding(this.waves, 'scale', {
      label: 'waves scale',
      min: 0,
      max: 1,
      step: 0.01,
    })
  }
}
