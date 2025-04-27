import Button from './button'
import Text from './text'

export class UI {
  static startButton = new Button('start')
  static nextButton = new Button('next')
  static backButton = new Button('back')

  static soundsButton = new Button('sounds')
  static loopButton = new Button('loop')
  static wavesButton = new Button('waves')
  static fullscreenButton = new Button('fullscreen')

  static levelText = new Text('level')
  static hintText = new Text('hint')
}
