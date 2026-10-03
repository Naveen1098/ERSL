import React, { StrictMode, Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ERSL Portal Error caught by boundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif', background: '#f8fafc' }}>
          <div style={{ maxWidth: '480px', width: '100%', background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fee2e2', color: '#9E1B32', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '24px' }}>
              ⚠️
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Application Refresh Required</h2>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5', marginBottom: '16px' }}>
              The portal encountered a temporary state. Click below to refresh the page or reset the session.
            </p>
            {this.state.error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '11px', color: '#991b1b', textAlign: 'left', overflowX: 'auto', fontFamily: 'monospace', maxHeight: '120px' }}>
                <strong>Error:</strong> {this.state.error.message}
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => window.location.reload()}
                style={{ padding: '10px 18px', fontSize: '12px', fontWeight: '700', color: 'white', background: '#9E1B32', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                Reload Page
              </button>
              <button
                onClick={() => {
                  try {
                    Object.keys(localStorage).forEach(k => {
                      if (k.startsWith('sb-') || k.includes('auth') || k === 'ersl_user') {
                        localStorage.removeItem(k);
                      }
                    });
                    sessionStorage.clear();
                  } catch {}
                  window.location.reload();
                }}
                style={{ padding: '10px 18px', fontSize: '12px', fontWeight: '700', color: '#9E1B32', background: '#fee2e2', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                Reset Login Session
              </button>
              <button
                onClick={() => {
                  try { localStorage.clear(); sessionStorage.clear(); } catch {}
                  window.location.reload();
                }}
                style={{ padding: '10px 18px', fontSize: '12px', fontWeight: '700', color: '#475569', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                Clear All Cache
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

