import Experience from '@experience'
import { UI } from '@ui/ui'

export default class Settings {
  constructor() {
    this.experience = Experience.instance
    this.soundPlayer = this.experience.soundPlayer

    UI.soundsToggle.onToggle(this.toggleSounds.bind(this))
    UI.loopToggle.onToggle(this.toggleLoop.bind(this))
    UI.ambienceToggle.onToggle(this.toggleAmbience.bind(this))
  }

  // ui
  show() {
    const settings = this.loadSettings()
    this.sounds = settings.sounds
    this.loop = settings.loop
    this.ambience = settings.ambience

    this.soundPlayer.setMuted(!this.sounds)
    if (this.loop) this.playLoop()
    if (this.ambience) this.playAmbience()

    UI.soundsToggle.toggle(this.sounds).show()
    UI.loopToggle.toggle(this.loop).show()
    UI.ambienceToggle.toggle(this.ambience).show()
  }

  hide() {
    UI.soundsToggle.hide()
    UI.loopToggle.hide()
    UI.ambienceToggle.hide()

    this.stopLoop()
    this.stopAmbience()
  }

  // settings
  ensureDefault() {
    if (!localStorage.getItem('settings')) {
      localStorage.setItem('settings', JSON.stringify({ sounds: true, loop: true, ambience: true }))
    }
  }

  loadSettings() {
    this.ensureDefault()
    return JSON.parse(localStorage.getItem('settings'))
  }

  saveSettings(key, value) {
    this.ensureDefault()

    const settings = JSON.parse(localStorage.getItem('settings'))
    settings[key] = value

    localStorage.setItem('settings', JSON.stringify(settings))
  }

  // toggle
  toggleSounds() {
    this.sounds = !this.sounds
    this.soundPlayer.setMuted(!this.sounds)
    this.saveSettings('sounds', this.sounds)
    return this.sounds
  }

  playLoop() {
    this.loop = true
    this.soundPlayer.playBackground('loop', 0.5)
  }

  stopLoop() {
    this.loop = false
    this.soundPlayer.stopBackground('loop')
  }

  toggleLoop() {
    this.loop ? this.stopLoop() : this.playLoop()
    this.saveSettings('loop', this.loop)
    return this.loop
  }

  playAmbience() {
    this.ambience = true
    this.soundPlayer.playBackground('seagulls', 0)
    this.soundPlayer.playBackground('sailing', 0)
    this.soundPlayer.playBackground('waves', 0.1)
  }

  stopAmbience() {
    this.ambience = false
    this.soundPlayer.stopBackground('seagulls')
    this.soundPlayer.stopBackground('sailing')
    this.soundPlayer.stopBackground('waves')
  }

  toggleAmbience() {
    this.ambience ? this.stopAmbience() : this.playAmbience()
    this.saveSettings('ambience', this.ambience)
    return this.ambience
  }
}
