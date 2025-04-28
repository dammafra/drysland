export default class Versioning {
  static init(version, onVersionChange) {
    if (!version) {
      console.warn('[Versioning] missing version, skipping...')
      return
    }

    if (!onVersionChange) {
      console.warn('[Versioning] missing version changed callback')
    }

    if (
      version !== localStorage.getItem('version') &&
      onVersionChange &&
      typeof onVersionChange === 'function'
    ) {
      onVersionChange()
    }

    localStorage.setItem('version', version)
  }
}
