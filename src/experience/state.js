export default class State {
  static instance = new State()

  constructor() {
    if (State.instance) return State.instance
  }

  save(state) {
    localStorage.setItem('state', btoa(JSON.stringify(state)))
  }

  load() {
    const state = localStorage.getItem('state')
    if (state) return JSON.parse(atob(state))
  }
}
