export default class Versioning {
  static #key = 'drysland-version'

  static init(version, onVersionChange) {
    if (!version) {
      console.warn('[Versioning] missing version, skipping...')
      return
    }

    const oldVersion = window.CrazyGames.SDK.data.getItem(Versioning.#key)

    if (
      oldVersion &&
      version !== oldVersion &&
      onVersionChange &&
      typeof onVersionChange === 'function'
    ) {
      onVersionChange()
    }

    window.CrazyGames.SDK.data.setItem(Versioning.#key, version)
  }
}
