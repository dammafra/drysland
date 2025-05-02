import resourcesConfig from '@config/resources'
import { CubeTextureLoader, EventDispatcher, TextureLoader } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import SoundLoader from './sound-loader'

export default class Resources extends EventDispatcher {
  constructor() {
    super()

    // Options
    this.sources = resourcesConfig

    // Setup
    this.items = {}
    this.toLoad = this.sources.length
    this.loaded = 0

    this.setLoaders()
    this.startLoading()
  }

  setLoaders() {
    const gltfLoader = new GLTFLoader()
    const textureLoader = new TextureLoader()
    const cubeTextureLoader = new CubeTextureLoader()
    const soundLoader = new SoundLoader()

    this.loaders = {
      gltfLoader,
      textureLoader,
      cubeTextureLoader,
      soundLoader,
    }
  }

  startLoading() {
    for (const source of this.sources) {
      switch (source.type) {
        case 'gltfModel':
          this.loaders.gltfLoader.load(source.path, file => this.sourceLoaded(source, file))
          break

        case 'texture':
          this.loaders.textureLoader.load(source.path, file => this.sourceLoaded(source, file))
          break

        case 'cubeTexture':
          this.loaders.cubeTextureLoader.load(source.path, file => this.sourceLoaded(source, file))
          break

        case 'sound':
          this.loaders.soundLoader.load(source.path, file => this.sourceLoaded(source, file))
          break
      }
    }
  }

  sourceLoaded(source, file) {
    this.items[source.name] = file
    this.loaded++

    if (this.loaded === this.toLoad) {
      this.dispatchEvent({ type: 'ready' })
    }
  }
}
