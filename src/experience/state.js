export default class State {
  static #key = 'drysland-state'
  static instance = new State()

  constructor() {
    if (State.instance) return State.instance
  }

  save(state) {
    localStorage.setItem(State.#key, btoa(JSON.stringify(state)))
  }

  load() {
    const state = localStorage.getItem(State.#key)
    if (state) return JSON.parse(atob(state))
  }
}
