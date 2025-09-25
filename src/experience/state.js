export default class State {
  static #key = 'drysland-state'
  static instance = new State()

  constructor() {
    if (State.instance) return State.instance
  }

  async save(state) {
    await bridge.storage.set(State.#key, JSON.stringify(state))
  }

  async load() {
    const state = await bridge.storage.get(State.#key)
    return state
  }
}
