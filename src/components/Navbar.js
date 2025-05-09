import React, { useState } from "react";
import { motion } from "framer-motion";
import { Container, Nav, Navbar } from "react-bootstrap";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { FaSun, FaMoon } from "react-icons/fa";

function NavBar() {
  console.log('Navbar rendered');
  const [expand, setExpand] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  const navVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={navVariants}
    >
      <Navbar
        expanded={expand}
        fixed="top"
        expand="md"
        className={`navbar modern-navbar ${isDark ? 'dark' : 'light'}`}
        style={{
          zIndex: 9999,
          backdropFilter: 'blur(12px)',
          background: isDark
            ? 'rgba(24, 24, 32, 0.98)'
            : 'rgba(255, 255, 255, 0.98)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
          borderBottom: isDark ? '1px solid #232946' : '1px solid #eaeaea',
          border: '3px solid red', // DEBUG: Remove after confirming
          padding: '0.7rem 0.5rem',
          minHeight: 64,
        }}
      >
        <Container>
          <Navbar.Brand as={RouterLink} to="/" className="d-flex align-items-center" style={{ fontWeight: 800, fontSize: 26, letterSpacing: 1.5, color: 'var(--primary-color)' }}>
            The Digital Pen
          </Navbar.Brand>
          <div className="d-flex align-items-center ms-auto">
          <motion.button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              background: isDark
                ? 'linear-gradient(90deg, #232946 60%, #00e6fe 100%)'
                : 'linear-gradient(90deg, #00e6fe 60%, #6C63FF 100%)',
              border: 'none',
              borderRadius: 50,
              padding: 8,
              marginLeft: 8,
              boxShadow: '0 2px 8px 0 rgba(44,62,80,0.10)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isDark ? (
              <FaSun style={{ color: '#ffd600', fontSize: 24 }} />
            ) : (
              <FaMoon style={{ color: '#232946', fontSize: 24 }} />
            )}
          </motion.button>
          <Navbar.Toggle
            aria-controls="responsive-navbar-nav"
            onClick={() => setExpand(expand ? false : "expanded")}
              style={{ border: 'none', background: 'transparent', marginLeft: 12 }}
            />
          </div>
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="ms-auto align-items-center" style={{ gap: 24 }}>
              <Nav.Item>
                <Nav.Link
                  href="https://portfolio.buildwithhimanshu.com"
                  className="modern-nav-link"
                  style={{
                    color: 'var(--primary-color)',
                    fontWeight: 700,
                    fontSize: 18,
                    borderBottom: 'none',
                    padding: '0.5rem 1rem',
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  About
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  as={RouterLink}
                  to="/articles"
                  className={`modern-nav-link${location.pathname === '/articles' ? ' active' : ''}`}
                  style={{
                    color: location.pathname === '/articles' ? 'var(--primary-color)' : 'var(--text-primary)',
                    fontWeight: 700,
                    fontSize: 18,
                    borderBottom: location.pathname === '/articles' ? '2.5px solid var(--primary-color)' : 'none',
                    padding: '0.5rem 1rem',
                  }}
                >
                  Articles
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </motion.div>
  );
}

export default NavBar;
