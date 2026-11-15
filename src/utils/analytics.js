/**
 * FindCo Production Privacy-First Analytics & Event Instrumentation
 * Operates strictly with user consent (DPDP Act compliant).
 * Fallback to structured telemetry logging when external provider is not loaded.
 */

class AnalyticsService {
  constructor() {
    this.hasConsent = false;
    this.checkConsent();
  }

  checkConsent() {
    try {
      const consentRaw = localStorage.getItem('findco_cookie_consent_v1');
      if (consentRaw) {
        const parsed = JSON.parse(consentRaw);
        this.hasConsent = parsed.type === 'all';
      }
    } catch (e) {
      this.hasConsent = false;
    }
  }

  track(eventName, properties = {}) {
    this.checkConsent();

    const payload = {
      event: eventName,
      timestamp: new Date().toISOString(),
      properties: {
        ...properties,
        platform: 'web',
        locale: 'en_IN'
      }
    };

    // Forward to PostHog if initialized on window
    if (this.hasConsent && window.posthog && typeof window.posthog.capture === 'function') {
      try {
        window.posthog.capture(eventName, properties);
      } catch (err) {
        // Silently swallow analytics errors
      }
    }

    // In local development or fallback mode, log cleanly
    if (import.meta.env?.DEV) {
      console.info('[FindCo Analytics]:', eventName, payload.properties);
    }
  }

  page(pageName, properties = {}) {
    this.track('page_view', { page: pageName, ...properties });
  }

  identify(userId, traits = {}) {
    if (!this.hasConsent) return;
    if (window.posthog && typeof window.posthog.identify === 'function') {
      try {
        window.posthog.identify(userId, traits);
      } catch (err) {
        // Silently swallow analytics errors
      }
    }
  }
}

export const analytics = new AnalyticsService();

