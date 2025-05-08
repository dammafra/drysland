import Experience from '@experience'
import UI from '@ui/ui'

export default class SoundControls {
  static #key = 'drysland-sound-controls'

  constructor() {
    this.experience = Experience.instance
    this.soundPlayer = this.experience.soundPlayer

    UI.soundsToggle.onToggle(this.toggleSounds.bind(this))
    UI.loopToggle.onToggle(this.toggleLoop.bind(this))
    UI.ambienceToggle.onToggle(this.toggleAmbience.bind(this))
  }

  // ui
  show() {
    const settings = this.load()
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

  // persist
  ensureDefault() {
    if (!localStorage.getItem(SoundControls.#key)) {
      localStorage.setItem(
        SoundControls.#key,
        JSON.stringify({ sounds: true, loop: true, ambience: true }),
      )
    }
  }

  load() {
    this.ensureDefault()
    return JSON.parse(localStorage.getItem(SoundControls.#key))
  }

  save(key, value) {
    this.ensureDefault()

    const settings = JSON.parse(localStorage.getItem(SoundControls.#key))
    settings[key] = value

    localStorage.setItem(SoundControls.#key, JSON.stringify(settings))
  }

  // toggle
  toggleSounds() {
    this.sounds = !this.sounds
    this.soundPlayer.setMuted(!this.sounds)
    this.save('sounds', this.sounds)
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
    this.save('loop', this.loop)
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
    this.save('ambience', this.ambience)
    return this.ambience
  }
}
