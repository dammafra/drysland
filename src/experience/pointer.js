import Experience from '@experience'
import { forwardHtmlEvents } from '@pmndrs/pointer-events'

export default class Pointer {
  constructor() {
    this.experience = Experience.instance
    this.canvas = this.experience.canvas
    this.camera = this.experience.camera
    this.scene = this.experience.scene

    const { update, destroy } = forwardHtmlEvents(
      this.canvas,
      () => this.camera.instance,
      this.scene,
      {},
    )
    this.update = update
    this.dispose = destroy
  }

  add(object) {
    const { onHover, onLeave, onClick } = object

    object.onHover = () => {
      this.canvas.classList.add('pointer')
      onHover && typeof onHover === 'function' && onHover.apply(object)
    }

    object.onLeave = () => {
      this.canvas.classList.remove('pointer')
      onLeave && typeof onLeave === 'function' && onLeave.apply(object)
    }

    object.onClick = e => {
      onClick && typeof onClick === 'function' && onClick.apply(object)
    }

    object.mesh.addEventListener('pointerover', object.onHover)
    object.mesh.addEventListener('pointerout', object.onLeave)
    object.mesh.addEventListener('click', object.onClick)
  }

  remove(object) {
    object.mesh.removeEventListener('pointerover', object.onHover)
    object.mesh.removeEventListener('pointerout', object.onLeave)
    object.mesh.removeEventListener('click', object.onClick)
  }
}
