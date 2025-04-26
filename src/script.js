import Experience from '@experience'
import Debug from '@utils/debug'
import DoubleTapPreventer from '@utils/double-tap-preventer'
import Fullscreen from '@utils/fullscreen'
import Loading from '@utils/loading'
import Versioning from '@utils/versioning'
import { inject } from '@vercel/analytics'

inject()

DoubleTapPreventer.init()
Versioning.init()
Fullscreen.init()

const loading = Loading.init()
const debug = Debug.init()
Experience.init('canvas.webgl', loading, debug)
