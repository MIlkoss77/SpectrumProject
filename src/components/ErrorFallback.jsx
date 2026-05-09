import React from 'react';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div style={{
      height: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, #1a1a1a 0%, #000 100%)',
      color: '#fff',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '500px',
        padding: '3rem',
        borderRadius: '24px',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ 
          fontSize: '4rem', 
          marginBottom: '1rem',
          filter: 'drop-shadow(0 0 10px rgba(255, 59, 48, 0.5))'
        }}>
          ⚠️
        </div>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          marginBottom: '1rem',
          background: 'linear-gradient(to right, #ff3b30, #ff9f0a)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Упс! Что-то пошло не так
        </h2>
        <p style={{ color: '#888', marginBottom: '2rem', lineHeight: '1.6' }}>
          Произошла ошибка при загрузке компонента. Попробуйте обновить страницу или вернуться на главную.
        </p>
        <div style={{
          padding: '1rem',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          marginBottom: '2rem',
          textAlign: 'left',
          fontSize: '0.875rem',
          overflowX: 'auto',
          border: '1px solid rgba(255, 59, 48, 0.2)'
        }}>
          <code style={{ color: '#ff3b30' }}>{error.message}</code>
        </div>
        <button
          onClick={resetErrorBoundary}
          style={{
            padding: '12px 32px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
            color: '#fff',
            border: 'none',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 10px 20px -5px rgba(46, 204, 113, 0.3)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 15px 25px -5px rgba(46, 204, 113, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(46, 204, 113, 0.3)';
          }}
        >
          Попробовать снова
        </button>
      </div>
    </div>
  );
};

export default ErrorFallback;
