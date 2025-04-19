import Experience from '@experience'
import { Raycaster, Vector2 } from 'three'
import { DragControls } from 'three/addons/controls/DragControls.js'

export default class Pointer {
  #enabled = true

  set enabled(value) {
    this.#enabled = value
    if (this.drag) this.drag.enabled = value
  }

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
    this.draggableObjects = new Map()

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

  click = () => {
    this.currentIntersect?.onClick && this.currentIntersect.onClick()
  }

  update() {
    this.currentIntersect = null

    for (const object of this.clickableObjects.values()) {
      object.onLeave && object.onLeave()
    }

    if (!this.#enabled) return

    this.raycaster.setFromCamera(new Vector2(this.x, this.y), this.camera.instance)

    const test = Array.from(this.clickableObjects.keys())
    const intersects = this.raycaster.intersectObjects(test, false)
    this.currentIntersect = intersects.length
      ? this.clickableObjects.get(intersects[0].object)
      : null

    this.canvas.classList.toggle('pointer', this.currentIntersect)
    this.currentIntersect?.onHover && this.currentIntersect.onHover()
  }

  add(object, event = 'click') {
    if (event === 'click') {
      this.clickableObjects.set(object.mesh, object)
    } else if (event === 'drag') {
      this.draggableObjects.set(object.mesh, object)

      const previousObjects = this.drag?.getObjects() || []
      this.setDrag([...previousObjects, object.mesh])
    }
  }

  remove(object, event = 'click') {
    if (event === 'click') {
      this.clickableObjects.delete(object.mesh)
    } else if (event === 'drag') {
      this.draggableObjects.delete(object.mesh)

      const filteredObjects = this.drag?.getObjects().filter(o => o.uuid !== object.uuid) || []
      this.setDrag(filteredObjects)
    }
  }

  setDrag(objects) {
    this.drag?.dispose()
    this.drag = new DragControls(objects, this.camera.instance, this.canvas)

    this.drag.addEventListener('hoveron', () => this.canvas.classList.add('grab'))
    this.drag.addEventListener('hoveroff', () => this.canvas.classList.remove('grab'))
    this.drag.addEventListener('dragstart', () => {
      this.camera.controls.enabled = false
      this.canvas.classList.add('grabbing')
    })
    this.drag.addEventListener('dragend', () => {
      this.camera.controls.enabled = true
      this.canvas.classList.remove('grabbing')
    })
    this.drag.addEventListener('drag', e => e.object.onDrag && e.object.onDrag())
  }
}
