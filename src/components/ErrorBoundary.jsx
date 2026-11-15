import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Safe error telemetry
    if (window?.console?.error) {
      console.error('[FindCo ErrorBoundary caught exception]:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            padding: '32px 16px',
            textAlign: 'center',
            color: 'var(--text-main, #0f172a)'
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: '#fef2f2',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}
          >
            <AlertTriangle size={28} />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 8px 0' }}>
            We hit an unexpected snag
          </h2>

          <p
            style={{
              maxWidth: 460,
              fontSize: '0.88rem',
              color: 'var(--text-secondary, #64748b)',
              lineHeight: 1.5,
              margin: '0 0 24px 0'
            }}
          >
            Your session, wallet balance, and verified tokens remain completely safe. You can reload this view or return to the main dashboard.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={this.handleReset}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#fa6e5e',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 10,
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={16} />
              Reload View
            </button>

            <button
              onClick={() => {
                this.handleReset();
                if (this.props.onGoHome) {
                  this.props.onGoHome();
                } else {
                  window.location.href = '/';
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--bg-elevated, #f1f5f9)',
                color: 'var(--text-main, #0f172a)',
                border: '1px solid var(--border-subtle, #cbd5e1)',
                padding: '10px 18px',
                borderRadius: 10,
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Home size={16} />
              Go to Home
            </button>
          </div>

          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <div
              style={{
                marginTop: 32,
                maxWidth: 600,
                padding: 16,
                background: '#f8fafc',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                fontSize: '0.75rem',
                textAlign: 'left',
                overflowX: 'auto',
                color: '#ef4444'
              }}
            >
              <strong>Diagnostic details:</strong>
              <pre style={{ margin: '8px 0 0 0', whiteSpace: 'pre-wrap' }}>
                {this.state.error.toString()}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
