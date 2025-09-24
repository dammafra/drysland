export default class State {
  static #key = 'drysland-state'
  static instance = new State()

  constructor() {
    if (State.instance) return State.instance
  }

  save(state) {
    window.CrazyGames.SDK.data.setItem(State.#key, JSON.stringify(state))
  }

  load() {
    const state = window.CrazyGames.SDK.data.getItem(State.#key)
    if (!state) return

    try {
      return JSON.parse(state)
    } catch {
      window.CrazyGames.SDK.data.removeItem(State.#key)
      return
    }
  }
}
