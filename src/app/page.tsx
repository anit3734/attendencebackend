export default function Home() {
  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '40px',
      maxWidth: '600px',
      margin: '60px auto',
      backgroundColor: '#0F172A',
      color: '#F8FAFC',
      borderRadius: '16px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
      border: '1px solid #1E293B'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <span style={{
          height: '14px',
          width: '14px',
          backgroundColor: '#10B981',
          borderRadius: '50%',
          display: 'inline-block',
          boxShadow: '0 0 10px #10B981'
        }}></span>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 600 }}>Attendance System Backend API</h1>
      </div>
      <p style={{ color: '#94A3B8', fontSize: '14px', lineHeight: 1.6 }}>
        The REST API server is up and running successfully on Vercel Cloud infrastructure.
      </p>
      <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#1E293B', borderRadius: '8px' }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
          Available Endpoints
        </p>
        <code style={{ color: '#38BDF8', fontSize: '13px' }}>GET /api/v1/health</code>
        <br />
        <code style={{ color: '#38BDF8', fontSize: '13px' }}>POST /api/v1/auth/login</code>
      </div>
    </div>
  );
}
