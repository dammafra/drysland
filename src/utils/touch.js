export default class Touch {
  static support = window.matchMedia('(any-pointer: coarse)').matches
}
