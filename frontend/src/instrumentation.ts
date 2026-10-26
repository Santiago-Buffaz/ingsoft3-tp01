import { useEffect } from 'react'
import * as Sentry from '@sentry/react'
import { createRoutesFromChildren, matchRoutes, useLocation, useNavigationType } from 'react-router-dom'

// Se carga antes de App: el cliente de API debe tomar el fetch ya instrumentado.
Sentry.init({
  // El DSN del navegador es público: identifica el destino de los eventos.
  dsn: 'https://d4877037724c161963cd1338ad95e282@o4512320497057792.ingest.us.sentry.io/4512320576094208',
  enabled: window.location.hostname === 'lexagenda-front-prod-sbuffaz.onrender.com',
  environment: 'production',
  dataCollection: {
    userInfo: false,
    cookies: false,
    httpHeaders: false,
    httpBodies: [],
    urlQueryParams: false,
    stackFrameVariables: false,
  },
  integrations: [Sentry.reactRouterV7BrowserTracingIntegration({
    useEffect,
    useLocation,
    useNavigationType,
    createRoutesFromChildren,
    matchRoutes,
  })],
  tracesSampleRate: 1.0, // Muestreo completo para las mediciones del TP9.
  tracePropagationTargets: [/^https:\/\/lexagenda-front-prod-sbuffaz\.onrender\.com\/api\//],
})
