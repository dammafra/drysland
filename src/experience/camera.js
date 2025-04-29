import Experience from '@experience'
import CameraControls from 'camera-controls'
import {
  Box3,
  Frustum,
  MathUtils,
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
    this.instance = new PerspectiveCamera(50, this.sizes.aspectRatio, 0.1, 1000)
    this.instance.position.set(3, 6, 10)
    this.scene.add(this.instance)
  }

  setControls() {
    this.controls = new CameraControls(this.instance, this.canvas)
    this.controls.minDistance = 5
    this.controls.maxDistance = 25
    this.controls.maxPolarAngle = Math.PI / 2 - 0.2
    this.controls.restThreshold = 0.00009
    this.controls.smoothTime = 0.25
    this.controls.draggingSmoothTime = 0.25

    const box = new Box3()
    box.min.set(-10, 0, -10)
    box.max.set(10, 10, 10)
    this.controls.setBoundary(box)

    this.controls.addEventListener('controlstart', () => {
      this.controls.removeEventListener('rest', onRest)
      this.userDragging = true
      this.disableAutoRotate = true
    })

    this.controls.addEventListener('controlend', () =>
      this.controls.active ? this.controls.addEventListener('rest', onRest) : onRest(),
    )

    const onRest = () => {
      this.controls.removeEventListener('rest', onRest)
      this.userDragging = false
      this.disableAutoRotate = false
    }
  }

  resize() {
    this.instance.aspect = this.sizes.aspectRatio
    this.instance.updateProjectionMatrix()
  }

  update() {
    this.controls.update(this.time.delta)

    if (this.autoRotate && !this.disableAutoRotate) {
      this.controls.azimuthAngle += 20 * this.time.delta * 0.3 * MathUtils.DEG2RAD
    }
  }

  distanceTo(position) {
    return this.instance.position.distanceTo(position)
  }

  async intro() {
    this.autoRotate = false
    await this.controls.setLookAt(3, 6, 10, 0, 0, 0, true)
    this.autoRotate = true
  }

  setExplorationControls() {
    this.autoRotate = true

    this.controls.mouseButtons.left = CameraControls.ACTION.ROTATE
    this.controls.touches.one = CameraControls.ACTION.TOUCH_ROTATE

    this.intro()
  }

  setGameControls(block) {
    this.autoRotate = false

    this.controls.mouseButtons.left = CameraControls.ACTION.TRUCK
    this.controls.touches.one = CameraControls.ACTION.TOUCH_TRUCK

    this.controls.rotatePolarTo(0, true)
    if (
      this.controls.distance > 10 ||
      block.neighbors.some(n => n && n.mesh && !this.canView(n.mesh.position))
    ) {
      this.controls.fitToBox(block.mesh, true)
      this.controls.dollyTo(10, true)
    }
  }

  canView(position) {
    const frustum = new Frustum()
    frustum.setFromProjectionMatrix(
      new Matrix4().multiplyMatrices(
        this.instance.projectionMatrix,
        this.instance.matrixWorldInverse,
      ),
    )
    return frustum.containsPoint(position)
  }
}
