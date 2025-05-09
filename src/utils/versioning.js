export default class Versioning {
  static init(version, onVersionChange) {
    if (!version) {
      console.warn('[Versioning] missing version, skipping...')
      return
    }

    const oldVersion = localStorage.getItem('version')

    if (oldVersion && version !== oldVersion) {
      if (onVersionChange && typeof onVersionChange === 'function') {
        onVersionChange()
      } else {
        console.warn('[Versioning] missing version changed callback')
      }
    }

    localStorage.setItem('version', version)
  }
}
