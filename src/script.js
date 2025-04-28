import Experience from '@experience'
import Loading from '@ui/loading'
import Debug from '@utils/debug'
import DoubleTapPreventer from '@utils/double-tap-preventer'
import Fullscreen from '@utils/fullscreen'
import Versioning from '@utils/versioning'
import { inject } from '@vercel/analytics'

inject()

DoubleTapPreventer.init()
Versioning.init('1.1', () => {
  localStorage.removeItem('debug')
  localStorage.removeItem('state')
})
Fullscreen.init('#fullscreen')

const loading = Loading.init()
const debug = Debug.init()
Experience.init('canvas.webgl', loading, debug)
