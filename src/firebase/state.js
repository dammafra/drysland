import Modal from '@ui/modal'
import SaveSlot from '@ui/save-slot'
import debounce from '@utils/debounce'
import Debug from '@utils/debug'
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore'
import FirebasApp from './app'
import Auth from './auth'

export default class State {
  static instance = new State()
  constructor() {
    if (State.instance) return State.instance

    this.db = getFirestore(FirebasApp.instance)
  }

  #save(state) {
    if (Debug.enabled) return

    this.#saveLocal(state)
    return this.#saveRemote(state)
  }

  save = debounce(this.#save.bind(this), 1000)

  load = this.#loadLocal.bind(this)

  async sync() {
    const localState = this.#loadLocal()
    const remoteState = await this.#loadRemote()

    if (!localState && !remoteState) return // nothing to do

    if (!localState && remoteState) {
      this.#saveLocal(remoteState) // download remote
      return
    }

    if (localState && !remoteState) {
      this.#saveRemote(localState) // upload local
      return
    }

    if (localState.level === remoteState.level && localState.timestamp === remoteState.timestamp) {
      // are the same state, nothing to do
      return
    }

    // handle conflict
    Modal.instance.open('#state-conflict.modal', {
      disableClose: true,
      onBeforeOpen: content => {
        const slot1 = new SaveSlot(localState)
          .onClick(() => {
            this.#saveRemote(localState) // upload local
            Modal.instance.close()
          })
          .show()

        const slot2 = new SaveSlot(remoteState)
          .onClick(() => {
            this.#saveLocal(remoteState) // download remote
            Modal.instance.close()
          })
          .show()

        content.querySelector('.slots').innerHTML = ''
        content.querySelector('.slots').append(slot1.element, slot2.element)
      },
    })
  }

  #saveLocal(state) {
    localStorage.setItem('state', btoa(JSON.stringify(state)))
  }

  async #saveRemote(state) {
    if (!navigator.onLine || !Auth.instance.user) return

    const docRef = doc(this.db, 'states', Auth.instance.user.uid)
    await setDoc(docRef, state, { merge: true })
  }

  #loadLocal() {
    const state = localStorage.getItem('state')
    if (state) return JSON.parse(atob(state))
  }

  async #loadRemote() {
    return getDoc(doc(this.db, 'states', Auth.instance.user.uid)).then(res => res.data())
  }
}
