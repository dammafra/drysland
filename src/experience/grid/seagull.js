import Experience from '@experience'
import { dispose } from '@utils/dispose'
import Random from '@utils/random'
import gsap from 'gsap'
import { AnimationMixer } from 'three'
import { SkeletonUtils } from 'three/examples/jsm/Addons'
import Path from './path'

export default class Seagull {
  constructor() {
    this.experience = Experience.instance
    this.resources = this.experience.resources
    this.time = this.experience.time
    this.scene = this.experience.scene
    this.path = new Path(0, 0.008)
    this.offset = Random.float({ max: 2 })

    this.setMesh()
    this.setAnimation()
    this.init()
  }

  init() {
    this.mesh.traverse(child => {
      if (child.isMesh) {
        gsap.to(child.material, { opacity: 1, duration: 2 })
      }
    })
  }

  setMesh() {
    this.mesh = SkeletonUtils.clone(this.resources.items.seagull.scene)
    this.mesh.traverse(child => {
      if (child.isMesh) {
        child.material.transparent = true
        child.material.opacity = 0
      }
    })
    this.mesh.scale.setScalar(0.025)
    this.scene.add(this.mesh)
  }

  setAnimation() {
    const animation = this.resources.items.seagull.animations.at(0)

    this.animationMixer = new AnimationMixer(this.mesh)
    const action = this.animationMixer.clipAction(animation)

    action.play()
  }

  update() {
    const { position, angle } = this.path.update()

    this.mesh.position.copy(position)
    this.mesh.position.y = 0.25 * Math.sin(this.time.elapsed * this.offset) + 3
    this.mesh.rotation.y = angle

    this.animationMixer?.update(this.time.delta * 0.5)
  }

  dispose() {
    dispose(this.mesh)
    this.scene.remove(this.mesh)
    delete this.mesh
    delete this.pathPoints
    delete this.curve
  }
}
