import GridConfig from '@config/grid'
import Experience from '@experience'
import {
  DirectionalLight,
  EquirectangularReflectionMapping,
  FogExp2,
  MathUtils,
  PointLight,
  Spherical,
  SRGBColorSpace,
  Vector3,
} from 'three'
import { Lensflare, LensflareElement } from 'three/examples/jsm/Addons.js'

export default class Environment {
  get enableLensflare() {
    return this.settings.isGraphicsQuality
  }

  constructor() {
    // Setup
    this.experience = Experience.instance
    this.settings = this.experience.settings

    this.scene = this.experience.scene
    this.resources = this.experience.resources

    this.setLight()
    this.enableLensflare && this.setLensflare()
    this.setEnvironmentMap()
  }

  setLight() {
    this.directionalLight = new DirectionalLight('#ffddb1', 4)

    this.directionalLight.castShadow = true
    this.directionalLight.shadow.mapSize.setScalar(2048)

    this.directionalLight.shadow.camera.near = 80
    this.directionalLight.shadow.camera.far = 120

    const offset = GridConfig.instance.maxRadius * 2
    this.directionalLight.shadow.camera.right = offset
    this.directionalLight.shadow.camera.left = -offset
    this.directionalLight.shadow.camera.top = offset / 1.5
    this.directionalLight.shadow.camera.bottom = -offset / 1.5

    this.directionalLight.shadow.bias = -0.003
    this.directionalLight.shadow.normalBias = 0.01

    this.sunSpherical = new Spherical(1, MathUtils.degToRad(60), MathUtils.degToRad(120))
    this.sunDirection = new Vector3()
    this.updateSun()

    this.scene.add(this.directionalLight)
  }

  updateSun = () => {
    this.sunDirection.setFromSpherical(this.sunSpherical)
    this.directionalLight.position.copy(this.sunDirection).multiplyScalar(100)

    if (!this.pointLight) return
    this.pointLight.position.copy(this.sunDirection).multiplyScalar(1000)
    this.pointLight.position.y -= 350
  }

  setEnvironmentMap() {
    const environmentMap = this.resources.items.envMap
    environmentMap.mapping = EquirectangularReflectionMapping
    environmentMap.colorSpace = SRGBColorSpace

    this.scene.environment = environmentMap
    this.scene.background = environmentMap

    this.scene.backgroundBlurriness = 0.08
    this.scene.fog = new FogExp2('#8FBAC2', 0.025)
  }

  setLensflare() {
    this.pointLight = new PointLight('#ffddb1', 1, 1000, 0)
    this.updateSun()

    const sunTexture = this.resources.items.lensflare0
    const flareTexture = this.resources.items.lensflare1

    this.lensflare = new Lensflare()
    this.lensflare.addElement(new LensflareElement(sunTexture, 200, 0, this.pointLight.color))
    this.lensflare.addElement(new LensflareElement(flareTexture, 60, 0.6))
    this.lensflare.addElement(new LensflareElement(flareTexture, 70, 0.7))
    this.lensflare.addElement(new LensflareElement(flareTexture, 120, 0.9))
    this.lensflare.addElement(new LensflareElement(flareTexture, 70, 1))
    this.pointLight.add(this.lensflare)

    this.scene.add(this.pointLight)
  }

  disposeLensFlare() {
    if (!this.lensflare && !this.pointLight) return
    this.pointLight.remove(this.lensflare)
    this.lensflare.dispose()
    delete this.lensflare

    this.pointLight.dispose()
    this.scene.remove(this.pointLight)
    delete this.pointLight
  }

  applySettings() {
    this.enableLensflare ? this.setLensflare() : this.disposeLensFlare()
  }
}
