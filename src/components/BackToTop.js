import React, { useState, useEffect } from 'react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    visible && (
      <button
        onClick={scrollToTop}
        style={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 9999,
          background: 'var(--primary-color)',
          color: '#fff',
          border: 'none',
          borderRadius: '50%',
          width: 48,
          height: 48,
          fontSize: 24,
          boxShadow: '0 2px 8px rgba(44,62,80,0.15)',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
        aria-label="Back to top"
      >
        ↑
      </button>
    )
  );
} 