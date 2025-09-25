export default class Versioning {
  static #key = 'drysland-version'

  static async init(version, onVersionChange) {
    if (!version) {
      console.warn('[Versioning] missing version, skipping...')
      return
    }

    const oldVersion = await bridge.storage.get(Versioning.#key)

    if (
      oldVersion &&
      version !== oldVersion &&
      onVersionChange &&
      typeof onVersionChange === 'function'
    ) {
      onVersionChange()
    }

    await bridge.storage.set(Versioning.#key, version)
  }
}
