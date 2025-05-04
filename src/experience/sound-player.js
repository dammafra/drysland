import Experience from '@experience'

export default class SoundPlayer {
  constructor() {
    this.experience = Experience.instance
    this.resources = this.experience.resources

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()

    this.muted = false
    this.backgrounds = new Map()

    /**
     * This code helps resume audioContext when the tab is suspended (e.g., when switching apps or locking the phone) and later resumed,
     * especially on mobile where browsers often suspend audio contexts to save resources;
     * by listening to user interactions (touchstart, touchend, mousedown, keydown), it ensures audio resumes reliably after the tab becomes active again.
     */
    ;['touchstart', 'touchend', 'mousedown', 'keydown'].forEach(e =>
      document.body.addEventListener(e, () => this.audioContext.resume(), false),
    )
  }

  setMuted(value) {
    this.muted = value
    return !this.muted
  }

  async play(sound, times = 1) {
    const buffer = this.resources.items[sound]

    if (!buffer || this.muted) return

    let playCount = 0
    const playSound = () => {
      if (playCount >= times) return
      playCount++
      const source = this.audioContext.createBufferSource()
      source.buffer = buffer

      const gainNode = this.audioContext.createGain()
      gainNode.gain.value = 0.5

      source.connect(gainNode).connect(this.audioContext.destination)
      source.start()
      source.onended = playSound
    }

    playSound()
  }

  async playBackground(sound, volume) {
    if (this.backgrounds.has(sound)) return

    const buffer = this.resources.items[sound]

    const source = this.audioContext.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const gainNode = this.audioContext.createGain()
    gainNode.gain.value = volume
    source.connect(gainNode).connect(this.audioContext.destination)
    source.start()

    this.backgrounds.set(sound, { source, gainNode })
    return true
  }

  async stopBackground(sound) {
    this.backgrounds.get(sound)?.source.stop()
    this.backgrounds.delete(sound)
    return false
  }

  async updateBackgoundVolume(sound, volume) {
    if (!this.backgrounds.has(sound)) return
    this.backgrounds.get(sound).gainNode.gain.value = volume
  }
}
