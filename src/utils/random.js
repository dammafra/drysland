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

  static color() {
    return `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')}`
  }

  static runOneIn(callback, chance = 0.5) {
    Random.boolean(chance) && callback && callback()
  }
}
