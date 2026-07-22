import * as Sentry from '@sentry/react-native';

export function initTelemetry() {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (dsn) {
    Sentry.init({
      dsn,
      tracesSampleRate: 1.0,
    });
  } else {
    console.warn('Sentry DSN is missing. Telemetry not initialized.');
  }
}

export function logError(error: Error | string, context?: Record<string, any>) {
  if (typeof error === 'string') {
    Sentry.captureMessage(error, { extra: context });
  } else {
    Sentry.captureException(error, { extra: context });
  }
}

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  Sentry.captureMessage(`Event: ${eventName}`, { extra: properties });
}
