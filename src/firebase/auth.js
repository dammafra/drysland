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
    setPersistence(this.auth, browserLocalPersistence)

    this.provider = new GoogleAuthProvider()
  }

  signIn = () => signInWithPopup(this.auth, this.provider)

  async signOut() {
    await State.instance.desync()
    return signOut(this.auth)
  }

  subscribe(callback) {
    onAuthStateChanged(this.auth, user => {
      this.user = user || undefined
      callback(this.user)
    })
  }
}
