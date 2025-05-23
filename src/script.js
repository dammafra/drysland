import Experience from '@experience'
import Loading from '@ui/loading'
import DoubleTapPreventer from '@utils/double-tap-preventer'
import Versioning from '@utils/versioning'
import 'core-js/actual'
import State from './experience/state'

DoubleTapPreventer.init()
Versioning.init('1.1', State.reset)

const loading = Loading.init()
Experience.init('canvas.webgl', loading)
