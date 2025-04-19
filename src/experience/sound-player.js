import Experience from '@experience'

export class SoundPlayer {
  constructor() {
    this.experience = Experience.instance
    this.resources = this.experience.resources

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    this.muted = false
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
}
