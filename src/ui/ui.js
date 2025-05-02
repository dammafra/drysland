import Button from './button'
import Text from './text'
import Toggle from './toggle'

export default class UI {
  static startButton = new Button('#start')
  static authToggle = new Toggle('#auth')
  static creditsButton = new Button('#credits')

  static backButton = new Button('#back')
  static nextButton = new Button('#next')

  static menuButton = new Button('#menu')
  static soundsToggle = new Toggle('#sounds')
  static loopToggle = new Toggle('#loop')
  static ambienceToggle = new Toggle('#ambience')
  static fullscreenToggle = new Toggle('#fullscreen')

  static levelText = new Text('#level')
  static tutorialText = new Text('#tutorial')
}
