export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', color: '#666' }}>Page Not Found</h2>
      <p style={{ marginTop: '1rem', color: '#999' }}>
        The page you're looking for doesn't exist.
      </p>
      <a
        href="/"
        style={{
          marginTop: '2rem',
          padding: '0.75rem 1.5rem',
          background: '#0070f3',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '0.5rem'
        }}
      >
        Go Home
      </a>
    </div>
  );
}
