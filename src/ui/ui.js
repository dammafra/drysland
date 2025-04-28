import Button from './button'
import Text from './text'
import Toggle from './toggle'

export class UI {
  static startButton = new Button('start')
  static authToggle = new Toggle('auth')
  static nextButton = new Button('next')
  static backButton = new Button('back')

  static soundsToggle = new Toggle('sounds')
  static loopToggle = new Toggle('loop')
  static wavesToggle = new Toggle('waves')
  static fullscreenToggle = new Toggle('fullscreen')

  static authText = new Text('auth-label')
  static levelText = new Text('level')
  static hintText = new Text('hint')
}
