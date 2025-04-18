import Experience from '@experience'
import DoubleTapPreventer from '@utils/double-tap-preventer'
import Fullscreen from '@utils/fullscreen'
import Versioning from '@utils/versioning'
import { inject } from '@vercel/analytics'

inject()

DoubleTapPreventer.init()
Versioning.init()
Fullscreen.init()
// Debug.init()

Experience.init('canvas.webgl')
