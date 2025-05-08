export default class Versioning {
  static #key = 'drysland-version'

  static init(version, onVersionChange) {
    if (!version) {
      console.warn('[Versioning] missing version, skipping...')
      return
    }

    if (!onVersionChange) {
      console.warn('[Versioning] missing version changed callback')
    }

    if (
      version !== GamePix.localStorage.getItem(Versioning.#key) &&
      onVersionChange &&
      typeof onVersionChange === 'function'
    ) {
      onVersionChange()
    }

    GamePix.localStorage.setItem(Versioning.#key, version)
  }
}
