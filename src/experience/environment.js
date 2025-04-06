import { AmbientLight, DirectionalLight } from 'three'
import Experience from './experience'

export default class Environment {
  constructor() {
    // Setup
    this.experience = Experience.instance

    this.scene = this.experience.scene
    this.resources = this.experience.resources

    this.setLight()
  }

  setLight() {
    this.ambientLight = new AmbientLight('white', 1)

    this.directionalLight = new DirectionalLight('white', 3)
    this.directionalLight.position.set(3, 3, 2)

    this.directionalLight.castShadow = true
    this.directionalLight.shadow.mapSize.setScalar(512)
    this.directionalLight.shadow.camera.far = 10
    this.directionalLight.shadow.normalBias = 0.03

    this.scene.add(this.ambientLight, this.directionalLight)
  }
}
