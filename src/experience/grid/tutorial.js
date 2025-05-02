import UI from '@ui/ui'
import Touch from '@utils/touch'

export default class Tutorial {
  constructor(grid) {
    this.grid = grid
    this.first()
  }

  first() {
    UI.tutorialText.set(`${Touch.support ? 'Touch' : 'Click'} any river tile to start`).show()
    this.grid.riverBlocks.forEach(b => (b.material.uniforms.uTutorial.value = true))
  }

  second() {
    UI.tutorialText
      .set('Rotate the tiles to restore the course of the river and un-Dry the Island')
      .show()
    this.grid.riverBlocks.forEach(b => (b.material.uniforms.uTutorial.value = false))
  }

  third() {
    UI.tutorialText.set('Great job! Now sail to the next Drysland!').show()
    this.grid.riverBlocks.forEach(b => (b.material.uniforms.uTutorial.value = false))
  }

  dispose() {
    UI.tutorialText.hide()
  }
}
