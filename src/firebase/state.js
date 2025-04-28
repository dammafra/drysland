import debounce from '@utils/debounce'
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore'
import FirebasApp from './app'
import Auth from './auth'

export default class State {
  static instance = new State()
  constructor() {
    if (State.instance) return State.instance

    this.db = getFirestore(FirebasApp.instance)
  }

  save = debounce(this.#save.bind(this), 1000)

  #save(state) {
    this.saveLocal(state)

    if (Auth.instance.user) {
      this.saveRemote(state)
    }
  }

  load() {
    return this.loadLocal()
  }

  async sync() {
    const localState = this.loadLocal()
    const remoteState = await this.loadRemote()

    if (remoteState && (!localState || remoteState.timestamp > localState.timestamp)) {
      this.saveLocal(remoteState)
    } else if (localState && (!remoteState || localState.timestamp > remoteState.timestamp)) {
      this.saveRemote(localState)
    }
  }

  saveLocal(state) {
    localStorage.setItem('state', JSON.stringify(state))
  }

  async saveRemote(state) {
    const docRef = doc(this.db, 'states', Auth.instance.user.uid)
    await setDoc(docRef, state, { merge: true })
  }

  loadLocal() {
    const state = localStorage.getItem('state')
    if (state) return JSON.parse(state)
  }

  async loadRemote() {
    return getDoc(doc(this.db, 'states', Auth.instance.user.uid)).then(res => res.data())
  }
}
