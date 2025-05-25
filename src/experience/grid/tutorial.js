import UI from '@ui/ui'
import Touch from '@utils/touch'

export default class Tutorial {
  constructor(grid) {
    this.grid = grid
    this.first()
  }

  first() {
    UI.tutorialText.set(`${Touch.support ? 'Touch' : 'Click'} and rotate one of the highlighted river tiles to start`) //prettier-ignore
    this.grid.level === 1 && UI.tutorialText.show()

    this.grid.riverBlocks.forEach(b => (b.material.uniforms.uTutorial.value = true))
  }

  second() {
    UI.tutorialText.set('Restore the course of the river by connecting the tiles all together with no loops and un-Dry the Island') //prettier-ignore
    this.grid.level === 1 && UI.tutorialText.show()

    this.grid.riverBlocks.forEach(b => (b.material.uniforms.uTutorial.value = false))
  }

  third() {
    UI.tutorialText.set('Great job! Now sail to the next Drysland!')
    this.grid.level === 1 && UI.tutorialText.show()

    this.grid.riverBlocks.forEach(b => (b.material.uniforms.uTutorial.value = false))
  }

  dispose() {
    UI.tutorialText.hide()
  }
}
