import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div
      style={{
        textAlign: 'center',
        marginTop: '80px',
        background: '#000000',
        color: '#ffffff',
        fontFamily: '"Fira Code", "SFMono-Regular", Consolas, monospace',
      }}
    >
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" style={{ color: '#00ff41', fontWeight: 700 }}>
        Go to Home
      </Link>
    </div>
  );
}