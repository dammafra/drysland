import gridConfig from '@config/grid'
import Experience from '@experience'
import {
  CameraHelper,
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
  constructor() {
    // Setup
    this.experience = Experience.instance
    this.debug = this.experience.debug

    this.scene = this.experience.scene
    this.resources = this.experience.resources

    this.setLight()
    this.setEnvironmentMap()
    this.setLensflare()

    this.setDebug()
  }

  setLight() {
    this.pointLight = new PointLight('#ffddb1', 1, 1000, 0)
    this.directionalLight = new DirectionalLight('#ffddb1', 4)

    this.directionalLight.castShadow = true
    this.directionalLight.shadow.mapSize.setScalar(2048)

    this.directionalLight.shadow.camera.near = 80
    this.directionalLight.shadow.camera.far = 120

    const offset = gridConfig.maxRadius * 2
    this.directionalLight.shadow.camera.right = offset
    this.directionalLight.shadow.camera.left = -offset
    this.directionalLight.shadow.camera.top = offset / 1.5
    this.directionalLight.shadow.camera.bottom = -offset / 1.5

    this.directionalLight.shadow.bias = -0.003
    this.directionalLight.shadow.normalBias = 0.01

    this.sunSpherical = new Spherical(1, MathUtils.degToRad(60), MathUtils.degToRad(120))
    this.sunDirection = new Vector3()
    this.updateSun()

    this.scene.add(this.pointLight, this.directionalLight)
  }

  updateSun = () => {
    this.sunDirection.setFromSpherical(this.sunSpherical)
    this.pointLight.position.copy(this.sunDirection).multiplyScalar(1000)
    this.pointLight.position.y -= 350
    this.directionalLight.position.copy(this.sunDirection).multiplyScalar(100)
  }

  setEnvironmentMap() {
    const environmentMap = this.resources.items.envMap
    environmentMap.mapping = EquirectangularReflectionMapping
    environmentMap.colorSpace = SRGBColorSpace

    this.scene.environment = environmentMap
    this.scene.background = environmentMap

    this.scene.backgroundBlurriness = 0.1
    this.scene.fog = new FogExp2('#8FBAC2', 0.025)
  }

  setLensflare() {
    const sunTexture = this.resources.items.lensflare0
    const flareTexture = this.resources.items.lensflare1

    this.lensflare = new Lensflare()
    this.lensflare.addElement(new LensflareElement(sunTexture, 200, 0, this.pointLight.color))
    this.lensflare.addElement(new LensflareElement(flareTexture, 60, 0.6))
    this.lensflare.addElement(new LensflareElement(flareTexture, 70, 0.7))
    this.lensflare.addElement(new LensflareElement(flareTexture, 120, 0.9))
    this.lensflare.addElement(new LensflareElement(flareTexture, 70, 1))
    this.pointLight.add(this.lensflare)
  }

  setDebug() {
    if (!this.debug) return

    this.shadowHelper = new CameraHelper(this.directionalLight.shadow.camera)
    this.shadowHelper.visible = false
    this.scene.add(this.shadowHelper)

    const folder = this.debug.root.addFolder({ title: '💡 environment', index: 5, expanded: false })

    folder
      .addBinding(this.sunSpherical, 'phi', {
        min: 0,
        max: Math.PI,
        label: 'sun polar',
        format: value => MathUtils.radToDeg(value),
      })
      .on('change', this.updateSun)

    folder
      .addBinding(this.sunSpherical, 'theta', {
        min: -Math.PI,
        max: Math.PI,
        label: 'sun azimuth',
        format: value => MathUtils.radToDeg(value),
      })
      .on('change', this.updateSun)

    folder.addBinding(this.directionalLight.shadow.camera, 'near', {
      label: 'shadow near',
      min: -500,
      max: 500,
      step: 1,
    })

    folder.addBinding(this.directionalLight.shadow.camera, 'far', {
      label: 'shadow far',
      min: -500,
      max: 500,
      step: 1,
    })

    folder
      .addBinding(this.directionalLight.shadow.camera, 'right', {
        label: 'shadow left/right',
        min: -50,
        max: 50,
        step: 1,
      })
      .on('change', event => (this.directionalLight.shadow.camera.left = -event.value))

    folder
      .addBinding(this.directionalLight.shadow.camera, 'top', {
        label: 'shadow top/bottom',
        min: -50,
        max: 50,
        step: 1,
      })
      .on('change', event => (this.directionalLight.shadow.camera.bottom = -event.value))

    folder.addBinding(this.directionalLight.shadow, 'bias', {
      label: 'shadow bias',
      min: -1,
      max: 1,
      step: 0.001,
    })

    folder.addBinding(this.directionalLight.shadow, 'normalBias', {
      label: 'shadow normal bias',
      min: -1,
      max: 1,
      step: 0.001,
    })

    folder.on('change', () => {
      this.directionalLight.shadow.camera.updateProjectionMatrix()
      this.shadowHelper.update()
    })
  }
}
