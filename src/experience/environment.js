import Debug from '@utils/debug'
import { AmbientLight, CameraHelper, DirectionalLight } from 'three'
import Experience from './experience'

export default class Environment {
  constructor() {
    // Setup
    this.experience = Experience.instance

    this.scene = this.experience.scene
    this.resources = this.experience.resources

    this.setLight()

    addEventListener('debug', this.setDebug)
  }

  setLight() {
    this.ambientLight = new AmbientLight('white', 1)

    this.directionalLight = new DirectionalLight('white', 3)
    this.directionalLight.position.set(3, 3, 2)

    this.directionalLight.castShadow = true
    this.directionalLight.shadow.mapSize.setScalar(2048)
    this.directionalLight.shadow.camera.far = 10
    this.directionalLight.shadow.bias = -0.003
    this.directionalLight.shadow.normalBias = 0.01

    this.scene.add(this.ambientLight, this.directionalLight)
  }

  setDebug = () => {
    Debug.gui.root.addBinding(this.directionalLight, 'position', {
      label: 'light position',
    })

    this.shadowHelper = new CameraHelper(this.directionalLight.shadow.camera)
    this.shadowHelper.visible = false
    this.scene.add(this.shadowHelper)

    Debug.gui.root.addBinding(this.shadowHelper, 'visible', {
      label: 'shadow helper',
    })

    Debug.gui.root.addBinding(this.directionalLight.shadow, 'bias', {
      label: 'shadow bias',
      min: -1,
      max: 1,
      step: 0.001,
    })

    Debug.gui.root.addBinding(this.directionalLight.shadow, 'normalBias', {
      label: 'shadow normal bias',
      min: -1,
      max: 1,
      step: 0.001,
    })
  }
}
