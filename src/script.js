import Experience from '@experience'
import Loading from '@ui/loading'
import DoubleTapPreventer from '@utils/double-tap-preventer'
import Fullscreen from '@utils/fullscreen'
import Versioning from '@utils/versioning'

DoubleTapPreventer.init()
Versioning.init('1.0')
Fullscreen.init('#fullscreen')

const loading = Loading.init()
Experience.init('canvas.webgl', loading)
