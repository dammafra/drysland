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
  integrations: [
    Sentry.replayIntegration({
      // NOTE: This will disable built-in masking. Only use this if your site has no sensitive data, or if you've already set up other options for masking or blocking relevant data, such as 'ignore', 'block', 'mask' and 'maskFn'.
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
})

DoubleTapPreventer.init()
Versioning.init('1.3', () => {
  localStorage.removeItem('debug')
  localStorage.removeItem('settings')

  const currentState = localStorage.getItem('state')
  if (currentState) localStorage.setItem('state', btoa(currentState))
})
Fullscreen.init('#fullscreen')

const loading = Loading.init()
const debug = Debug.init()
Experience.init('canvas.webgl', loading, debug)
