import gridConfig from '@config/grid'
import Experience from '@experience'
import {
  CameraHelper,
  DirectionalLight,
  DirectionalLightHelper,
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

    this.setDebug()
  }

  setLight() {
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
    this.setSunDebug()
  }

  disposeLensFlare() {
    if (!this.lensflare && !this.pointLight) return
    this.pointLight.remove(this.lensflare)
    this.lensflare.dispose()
    delete this.lensflare

    this.pointLight.dispose()
    this.scene.remove(this.pointLight)
    delete this.pointLight

    this.disposeSunDebug()
  }

  setDebug() {
    if (!this.debug) return

    this.lightHelper = new DirectionalLightHelper(this.directionalLight)
    this.lightHelper.visible = false

    this.shadowHelper = new CameraHelper(this.directionalLight.shadow.camera)
    this.shadowHelper.visible = false

    this.scene.add(this.lightHelper, this.shadowHelper)

    this.folder = this.debug.root.addFolder({ title: '💡 environment', index: 6, expanded: false })

    this.folder.addBinding(this.scene, 'backgroundBlurriness', {
      label: 'background blur',
      min: 0,
      max: 1,
      step: 0.01,
    })

    this.folder.addBinding(this.directionalLight.shadow.camera, 'near', {
      label: 'shadow near',
      min: -500,
      max: 500,
      step: 1,
    })

    this.folder.addBinding(this.directionalLight.shadow.camera, 'far', {
      label: 'shadow far',
      min: -500,
      max: 500,
      step: 1,
    })

    this.folder
      .addBinding(this.directionalLight.shadow.camera, 'right', {
        label: 'shadow left/right',
        min: -50,
        max: 50,
        step: 1,
      })
      .on('change', event => (this.directionalLight.shadow.camera.left = -event.value))

    this.folder
      .addBinding(this.directionalLight.shadow.camera, 'top', {
        label: 'shadow top/bottom',
        min: -50,
        max: 50,
        step: 1,
      })
      .on('change', event => (this.directionalLight.shadow.camera.bottom = -event.value))

    this.folder.addBinding(this.directionalLight.shadow, 'bias', {
      label: 'shadow bias',
      min: -1,
      max: 1,
      step: 0.001,
    })

    this.folder.addBinding(this.directionalLight.shadow, 'normalBias', {
      label: 'shadow normal bias',
      min: -1,
      max: 1,
      step: 0.001,
    })

    this.folder.on('change', () => {
      this.directionalLight.shadow.camera.updateProjectionMatrix()
      this.shadowHelper.update()
    })
  }

  setSunDebug() {
    if (!this.folder) return

    this.folder
      .addBinding(this.sunSpherical, 'phi', {
        min: 0,
        max: Math.PI,
        label: 'sun polar',
        format: value => MathUtils.radToDeg(value),
      })
      .on('change', this.updateSun)

    this.folder
      .addBinding(this.sunSpherical, 'theta', {
        min: -Math.PI,
        max: Math.PI,
        label: 'sun azimuth',
        format: value => MathUtils.radToDeg(value),
      })
      .on('change', this.updateSun)
  }

  disposeSunDebug() {
    if (!this.folder) return
    this.folder.children.at(-1).dispose()
    this.folder.children.at(-1).dispose()
  }
}
