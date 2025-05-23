import Experience from '@experience'
import { Raycaster, Vector2 } from 'three'

export default class Pointer {
  constructor() {
    this.experience = Experience.instance
    this.canvas = this.experience.canvas
    this.sizes = this.experience.sizes
    this.camera = this.experience.camera

    this.x = Number.POSITIVE_INFINITY
    this.y = Number.POSITIVE_INFINITY

    this.raycaster = new Raycaster()
    this.currentIntersect = null

    this.clickableObjects = new Map()

    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    if (this.isTouchDevice) {
      window.addEventListener('touchstart', this.touchstart)
      window.addEventListener('touchend', this.click)

      this.camera.controls.addEventListener('control', () => {
        this.x = Number.POSITIVE_INFINITY
        this.y = Number.POSITIVE_INFINITY
        this.update()
      })
    } else {
      window.addEventListener('mousemove', this.setMouse)
      window.addEventListener('click', this.click)

      this.camera.controls.addEventListener('wake', () => {
        this.enabled = false
      })
      this.camera.controls.addEventListener('rest', () => {
        this.enabled = true
      })
    }

    this.camera.controls.addEventListener('sleep', () => {
      this.enabled = true
    })
  }

  setMouse = event => {
    this.clientX = event.clientX
    this.clientY = event.clientY

    this.x = (event.clientX / this.sizes.width) * 2 - 1
    this.y = -((event.clientY / this.sizes.height) * 2 - 1)
  }

  touchstart = event => {
    const touch = event.changedTouches[0]
    this.setMouse(touch)
    this.update()
  }

  click = event => {
    if (event.target !== this.canvas) return
    this.currentIntersect?.onClick && this.currentIntersect.onClick()
  }

  update() {
    this.currentIntersect = null

    for (const object of this.clickableObjects.values()) {
      object.onLeave && object.onLeave()
    }

    if (!this.enabled) return

    this.raycaster.setFromCamera(new Vector2(this.x, this.y), this.camera.instance)

    const test = Array.from(this.clickableObjects.keys())
    const intersects = this.raycaster.intersectObjects(test, false)
    this.currentIntersect = intersects.length
      ? this.clickableObjects.get(intersects[0].object)
      : null

    this.canvas.classList.toggle('pointer', this.currentIntersect)
    this.currentIntersect?.onHover && this.currentIntersect.onHover()
  }

  add(object) {
    this.clickableObjects.set(object.mesh, object)
  }

  remove(object) {
    this.clickableObjects.delete(object.mesh)
  }
}
