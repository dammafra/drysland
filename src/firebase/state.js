import Modal from '@ui/modal'
import SaveSlot from '@ui/save-slot'
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

  #save = state => (Auth.instance.user ? this.saveRemote(state) : this.saveLocal(state))
  save = debounce(this.#save.bind(this), 1000)

  load = () => (Auth.instance.user ? this.loadRemote() : this.loadLocal())

  async sync() {
    const localState = this.loadLocal()
    const remoteState = await this.loadRemote()

    if (!localState && !remoteState) return // nothing to do
    if (!localState && remoteState) return // will use remote

    if (localState && !remoteState) {
      this.saveRemote(localState) // upload local, will use remote
      this.deleteLocal() // avoid conflict on next reload
      return
    }

    if (localState && remoteState) {
      if (
        localState.level === remoteState.level &&
        localState.timestamp === remoteState.timestamp
      ) {
        this.deleteLocal() // are the same state, will use remote
        return
      }

      // handle conflict
      Modal.instance.open('#state-conflict.modal', {
        disableClose: true,
        onBeforeOpen: content => {
          const slot1 = new SaveSlot(localState)
            .onClick(() => {
              this.saveRemote(localState) // upload local, will use remote
              this.deleteLocal() // avoid conflict on next reload
              Modal.instance.close()
            })
            .show()

          const slot2 = new SaveSlot(remoteState)
            .onClick(() => {
              this.deleteLocal() // will use remote, avoid conflict on next reload
              Modal.instance.close()
            })
            .show()

          content.querySelector('.slots').innerHTML = ''
          content.querySelector('.slots').append(slot1.element, slot2.element)
        },
      })
    }
  }

  async desync() {
    const remoteState = await this.loadRemote()
    this.saveLocal(remoteState)
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

  deleteLocal() {
    localStorage.removeItem('state')
  }
}
