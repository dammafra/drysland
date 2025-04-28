import { UI } from '@ui/ui'
import Touch from '@utils/touch'

export default class Tutorial {
  constructor(grid) {
    this.grid = grid
    this.show = this.grid.level === 1

    this.first()
  }

  first() {
    if (!this.show) return

    UI.hintText.set(`${Touch.support ? 'Touch' : 'Click'} any river tile to start`).show()
    this.grid.riverBlocks.forEach(b => (b.material.uniforms.uTutorial.value = true))
  }

  second() {
    if (!this.show) return

    UI.hintText
      .set('Rotate the tiles to restore the course of the river and un-Dry the Island')
      .show()
    this.grid.riverBlocks.forEach(b => (b.material.uniforms.uTutorial.value = false))
  }

  third() {
    if (!this.show) return

    UI.hintText.set('Great job! Now sail to the next Drysland!').show()
    this.grid.riverBlocks.forEach(b => (b.material.uniforms.uTutorial.value = false))
  }
}
