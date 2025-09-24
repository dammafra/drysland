import Experience from '@experience'
import Loading from '@ui/loading'
import DoubleTapPreventer from '@utils/double-tap-preventer'
import Versioning from '@utils/versioning'
import 'core-js/actual'

await window.CrazyGames.SDK.init()

DoubleTapPreventer.init()
Versioning.init('1.0')

const loading = Loading.init()
Experience.init('canvas.webgl', loading)
