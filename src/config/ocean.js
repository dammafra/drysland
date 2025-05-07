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

    this.waves = {
      frequencyX: 0.03,
      frequencyY: 0.03,
      speed: 0.05,
      scale: 0.25,
    }
  }
}
