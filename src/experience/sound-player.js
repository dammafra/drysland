import Experience from '@experience'

export class SoundPlayer {
  constructor() {
    this.experience = Experience.instance
    this.resources = this.experience.resources

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    this.unlockAudioContext()

    this.muted = false
    this.backgrounds = new Map()
  }

  unlockAudioContext() {
    if (this.audioContext.state !== 'suspended') return

    const b = document.body
    const events = ['touchstart', 'touchend', 'mousedown', 'keydown']
    events.forEach(e => b.addEventListener(e, unlock.bind(this), false))
    function unlock() {
      this.audioContext.resume().then(clean)
    }
    function clean() {
      events.forEach(e => b.removeEventListener(e, unlock))
    }
  }

  setMuted(value) {
    this.muted = value
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

    this.backgrounds.set(sound, source)
  }

  async stopBackground(sound) {
    this.backgrounds.get(sound)?.stop()
    this.backgrounds.delete(sound)
  }
}
