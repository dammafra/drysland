import Element from './element'

export default class RadioGroup {
  constructor(nameOrElements) {
    const elements =
      typeof nameOrElements === 'string'
        ? document.querySelector(`input[name="${nameOrElements}"]`)
        : nameOrElements

    this.radios = Array.from(elements).reduce(
      (map, radio) => map.set(radio.value, new Element(radio)),
      new Map(),
    )
  }

  setChecked(value) {
    this.radios.get(value).element.setAttribute('checked', '')
    return this
  }

  onChange(callback) {
    this.radios
      .values()
      .forEach(radio => radio.element.addEventListener('change', e => callback(e.target.value)))

    return this
  }
}
