import Button from './button'
import Text from './text'
import Toggle from './toggle'

export default class UI {
  static startButton = new Button('#start')
  static creditsButton = new Button('#credits')
  static settingsButton = new Button('#settings')

  static nextButton = new Button('#next')

  static menuButton = new Button('#menu')
  static soundsToggle = new Toggle('#sounds')
  static loopToggle = new Toggle('#loop')
  static ambienceToggle = new Toggle('#ambience')

  static levelText = new Text('#level')
  static tutorialText = new Text('#tutorial')
}
