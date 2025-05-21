export default class Versioning {
  static #key = 'drysland-version'

  static init(version, onVersionChange) {
    if (!version) {
      console.warn('[Versioning] missing version, skipping...')
      return
    }

    const oldVersion = localStorage.getItem(Versioning.#key)

    if (
      oldVersion &&
      version !== oldVersion &&
      onVersionChange &&
      typeof onVersionChange === 'function'
    ) {
      onVersionChange()
    }

    localStorage.setItem(Versioning.#key, version)
  }
}
