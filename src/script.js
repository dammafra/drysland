import Experience from '@experience'
import * as Sentry from '@sentry/browser'
import Loading from '@ui/loading'
import Debug from '@utils/debug'
import DoubleTapPreventer from '@utils/double-tap-preventer'
import Fullscreen from '@utils/fullscreen'
import Versioning from '@utils/versioning'
import { inject } from '@vercel/analytics'

inject()

Sentry.init({
  dsn: 'https://10c19be996a5f9bf3dc6156d9ba44361@o4509259613929472.ingest.de.sentry.io/4509259616092240',
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
})

DoubleTapPreventer.init()
Versioning.init('1.2', () => {
  localStorage.removeItem('debug')
  localStorage.removeItem('settings')
})
Fullscreen.init('#fullscreen')

const loading = Loading.init()
const debug = Debug.init()
Experience.init('canvas.webgl', loading, debug)
