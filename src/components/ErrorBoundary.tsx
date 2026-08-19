import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React tree:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0b1329',
            color: '#e6edfc',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '24px'
          }}
        >
          <div
            style={{
              maxWidth: '500px',
              width: '100%',
              backgroundColor: '#131f3d',
              borderRadius: '24px',
              padding: '32px',
              border: '1px solid #283958',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                backgroundColor: '#ffe4e6',
                color: '#e11d48',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                margin: '0 auto 20px'
              }}
            >
              ⚠️
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#8da4ff' }}>
              ប្រព័ន្ធជួបប្រទះបញ្ហាបច្ចេកទេស
            </h2>
            <p style={{ fontSize: '13px', color: '#9da9c7', marginBottom: '20px', lineHeight: '1.6' }}>
              សូមចុចប៊ូតុងខាងក្រោមដើម្បីផ្ទុកទិន្នន័យឡើងវិញ ឬជម្រះ Cache នៃកម្មវិធី។
            </p>
            {this.state.error && (
              <div
                style={{
                  backgroundColor: '#0b1329',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  color: '#f87171',
                  textAlign: 'left',
                  overflowX: 'auto',
                  marginBottom: '24px',
                  border: '1px solid #1e293b',
                  fontFamily: 'monospace'
                }}
              >
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '14px',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                ផ្ទុកឡើងវិញ (Reload)
              </button>
              <button
                onClick={this.handleReset}
                style={{
                  backgroundColor: '#334155',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '14px',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                ជម្រះ Cache & ផ្ទុកឡើងវិញ
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
