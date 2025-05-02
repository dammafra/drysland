import Experience from '@experience'
import Grid from '@grid/grid'
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

// const TAU = Math.PI * 2

// function normalizeAngle(angle) {
//   const normalized = angle % TAU
//   return normalized > Math.PI ? normalized - TAU : normalized
// }

// function deltaAngle(targetAngle, sourceAngle) {
//   const angle = targetAngle - sourceAngle
//   return MathUtils.euclideanModulo(angle + Math.PI, TAU) - Math.PI
// }

// -- set rotation to 0
// const normalized = normalizeAngle(this.controls.azimuthAngle)
// const delta = deltaAngle(0, normalized)
// this.controls.azimuthAngle = normalized
// this.controls.rotate(delta, 0, true)

export default class Camera {
  constructor() {
    // Setup
    this.experience = Experience.instance
    this.debug = this.experience.debug
    this.time = this.experience.time
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.canvas = this.experience.canvas

    this.setInstance()
    this.setControls()

    this.setDebug()
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
    this.autoRotate = false
    this.autorotationSpeed = 3

    const box = new Box3()
    box.min.set(-10, 0, -10)
    box.max.set(10, 10, 10)
    this.controls.setBoundary(box)

    this.controls.addEventListener('controlstart', () => {
      this.controls.removeEventListener('rest', onRest)
      this.userDragging = true
      this.disableAutoRotate = true
    })

    this.controls.addEventListener('controlend', () => {
      this.controls.active ? this.controls.addEventListener('rest', onRest) : onRest()
    })

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
    if (!this.controls.enabled) return

    this.controls.update(this.time.delta)
    this.cameraPositionPane?.refresh()

    if (this.autoRotate && !this.disableAutoRotate) {
      this.controls.azimuthAngle += this.autorotationSpeed * this.time.delta * MathUtils.DEG2RAD
    }
  }

  distanceTo(position) {
    return this.instance.position.distanceTo(position)
  }

  normalizedDistanceTo(position) {
    const distance = this.distanceTo(position)
    return (
      (distance - this.controls.minDistance) /
      (this.controls.maxDistance - this.controls.minDistance)
    )
  }

  setExplorationControls(radius) {
    this.autoRotate = true
    this.autoRotatePane?.refresh()
    this.canvas.classList.remove('move')

    this.controls.mouseButtons.left = CameraControls.ACTION.ROTATE
    this.controls.touches.one = CameraControls.ACTION.TOUCH_ROTATE

    this.controls.setLookAt(3, 6, 10, 0, 0, 0, true)
    this.controls.dollyTo(radius + 15, true)
  }

  setGameControls(block) {
    this.autoRotate = false
    this.autoRotatePane?.refresh()
    this.canvas.classList.add('move')

    this.controls.mouseButtons.left = CameraControls.ACTION.TRUCK
    this.controls.touches.one = CameraControls.ACTION.TOUCH_TRUCK

    if (
      this.controls.polarAngle > 0.1 ||
      block.neighbors.some(n => n && n.mesh && !this.canView(n.mesh.position))
    ) {
      this.controls.setLookAt(
        block.mesh.position.x,
        block.mesh.position.y + 15,
        block.mesh.position.z,
        block.mesh.position.x,
        block.mesh.position.y,
        block.mesh.position.z,
        true,
      )
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

  setDebug() {
    if (!this.debug) return

    const folder = this.debug.root.addFolder({ title: '🎥 camera', index: 5, expanded: false })

    folder
      .addBinding(this.controls, 'enabled', { label: 'controls' })
      .on('change', e => (this.cameraPositionPane.disabled = e.value))

    this.autoRotatePane = folder.addBinding(this, 'autoRotate', { label: 'auto rotation' })

    folder.addBinding(this, 'autorotationSpeed', {
      label: 'auto rotation speed',
      min: 0,
      max: 20,
      step: 0.1,
    })

    this.cameraPositionPane = folder
      .addBinding(this.instance, 'position', { disabled: true })
      .on('change', () => {
        if (!this.controls.enabled) {
          this.instance.lookAt(Grid.center)
        }
      })
  }
}
