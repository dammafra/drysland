import Experience from '@experience'
import CameraControls from 'camera-controls'
import {
  Box3,
  Matrix4,
  PerspectiveCamera,
  Quaternion,
  Raycaster,
  Sphere,
  Spherical,
  Vector2,
  Vector3,
  Vector4,
} from 'three'

const subsetOfTHREE = {
  Vector2: Vector2,
  Vector3: Vector3,
  Vector4: Vector4,
  Quaternion: Quaternion,
  Matrix4: Matrix4,
  Spherical: Spherical,
  Box3: Box3,
  Sphere: Sphere,
  Raycaster: Raycaster,
}

CameraControls.install({ THREE: subsetOfTHREE })

export default class Camera {
  constructor() {
    // Setup
    this.experience = Experience.instance
    this.time = this.experience.time
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.canvas = this.experience.canvas

    this.setInstance()
    this.setControls()
  }

  setInstance() {
    this.instance = new PerspectiveCamera(50, this.sizes.aspectRatio, 0.1, 100)
    this.instance.position.set(3, 6, 10)
    this.scene.add(this.instance)
  }

  setControls() {
    this.controls = new CameraControls(this.instance, this.canvas)
    this.controls.minDistance = 5
    this.controls.maxDistance = 25
    this.controls.maxPolarAngle = Math.PI / 2 - 0.2
    this.controls.restThreshold = 0.001
  }

  resize() {
    this.instance.aspect = this.sizes.aspectRatio
    this.instance.updateProjectionMatrix()
  }

  update() {
    this.controls.update(this.time.delta)
  }

  distanceTo(position) {
    return this.instance.position.distanceTo(position)
  }
}
