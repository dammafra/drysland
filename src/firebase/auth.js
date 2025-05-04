import Button from '@ui/button'
import Modal from '@ui/modal'
import UI from '@ui/ui'
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import FirebasApp from './app'
import State from './state'

export default class Auth {
  static instance = new Auth()

  constructor() {
    if (Auth.instance) return Auth.instance

    this.auth = getAuth(FirebasApp.instance)
    this.provider = new GoogleAuthProvider()

    setPersistence(this.auth, browserLocalPersistence)

    UI.authToggle
      .onClick(() => (Auth.instance.user ? Auth.instance.signOut() : Auth.instance.signIn()))
      .disable(true)

    this.subscribe(user => {
      UI.authToggle
        .setLabel(user ? 'Log out' : 'Log in')
        .toggle(!user)
        .enable()
      user && State.instance.sync()
    })
  }

  signIn() {
    Modal.instance.open('#auth-login.modal', {
      disableClose: true,
      onBeforeOpen: content => {
        new Button(content.querySelector('#cancel')).onClick(() => Modal.instance.close()).show()
        new Button(content.querySelector('#continue'))
          .onClick(() => {
            signInWithPopup(this.auth, this.provider)
            Modal.instance.close()
          })
          .show()
      },
    })
  }

  async signOut() {
    Modal.instance.open('#auth-logout.modal', {
      disableClose: true,
      onBeforeOpen: content => {
        new Button(content.querySelector('#cancel')).onClick(() => Modal.instance.close()).show()
        new Button(content.querySelector('#continue'))
          .onClick(async () => {
            await State.instance.desync()
            signOut(this.auth)
            Modal.instance.close()
          })
          .show()
      },
    })
  }

  subscribe(callback) {
    onAuthStateChanged(this.auth, user => {
      this.user = user || undefined
      callback(this.user)
    })
  }
}
