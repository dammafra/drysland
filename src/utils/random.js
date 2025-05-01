export default class Random {
  static boolean(chance = 0.5) {
    return Math.random() < chance
  }

  static integer({ min, max } = {}) {
    min = min || 0
    max = max || 10
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  static float({ min, max, precision } = {}) {
    min = min || 0
    max = max || 10
    precision = precision || 2

    const factor = Math.pow(10, precision)
    return Math.round((Math.random() * (max - min) + min) * factor) / factor
  }

  static oneOf(first, ...params) {
    const array = Array.isArray(first) ? first : [first, ...params]
    return array[Math.floor(Math.random() * array.length)]
  }

  static weightedOneOf(options) {
    const entries = Object.entries(options)
    const candidates = entries.filter(([, weight]) => weight < 1)
    const fallback = entries.find(([, weight]) => weight === 1)

    if (!fallback) throw new Error('You must provide one option with weight 1 as fallback.')

    for (const [key, weight] of candidates) {
      if (Math.random() < weight) return key
    }

    return fallback[0]
  }

  static alternate(i, options) {
    return i % 2 ? options.at(0) : options.at(1)
  }

  static color() {
    return `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')}`
  }

  static runOneIn(callback, chance = 0.5) {
    Random.boolean(chance) && callback && callback()
  }
}
