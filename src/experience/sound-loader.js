export default class SoundLoader {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }

  load(url, onLoad) {
    fetch(url)
      .then(res => res.arrayBuffer())
      .then(buffer => this.audioContext.decodeAudioData(buffer))
      .then(file => onLoad && typeof onLoad === 'function' && onLoad(file))
  }
}
