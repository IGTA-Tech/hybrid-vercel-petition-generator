'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#e00' }}>Error</h1>
      <h2 style={{ fontSize: '1.5rem', color: '#666', marginBottom: '1rem' }}>
        Something went wrong
      </h2>
      <p style={{ color: '#999', marginBottom: '2rem', textAlign: 'center', maxWidth: '500px' }}>
        {error.message || 'An unexpected error occurred'}
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={reset}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Try Again
        </button>
        <a
          href="/"
          style={{
            padding: '0.75rem 1.5rem',
            background: '#666',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem'
          }}
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
