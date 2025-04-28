import { initializeApp } from 'firebase/app'

const config = {
  apiKey: 'AIzaSyC2c1aYh_Lwo_coiCvkge7cR5uTUvx4qtA',
  authDomain: 'drysland-a9637.firebaseapp.com',
  projectId: 'drysland-a9637',
  storageBucket: 'drysland-a9637.firebasestorage.app',
  messagingSenderId: '332006680874',
  appId: '1:332006680874:web:cb8fc6b0a7eab4989f5653',
  measurementId: 'G-BV9GHQ10S0',
}

export default class FirebasApp {
  static instance = initializeApp(config)
}
