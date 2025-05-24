export default class State {
  static #key = 'drysland-state'
  static instance = new State()

  constructor() {
    if (State.instance) return State.instance
  }

  save(state) {
    localStorage.setItem(State.#key, JSON.stringify(state))
  }

  load() {
    const state = localStorage.getItem(State.#key)
    if (!state) return

    try {
      return JSON.parse(state)
    } catch {
      localStorage.removeItem(State.#key)
      return
    }
  }
}
