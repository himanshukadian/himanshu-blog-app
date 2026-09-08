import React, { useState } from "react";
import { motion } from "framer-motion";
import { Container, Nav, Navbar } from "react-bootstrap";
import { Link as RouterLink, useLocation } from "react-router-dom";
import "./navFooter.css";

function NavBar() {
  const [expand, setExpand] = useState(false);
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
        className="navbar modern-navbar terminal-navbar dark"
        style={{
          zIndex: 9999,
          backdropFilter: 'blur(12px)',
          background: 'rgba(0, 0, 0, 0.95)',
          boxShadow: '0 8px 32px 0 rgba(0, 255, 65, 0.08)',
          borderBottom: '1px solid rgba(0, 255, 65, 0.35)',
          padding: '0.7rem 0.5rem',
          minHeight: 64,
        }}
      >
        <Container>
<Navbar.Brand as={RouterLink} to="/" className="d-flex align-items-center terminal-brand" style={{ fontWeight: 700, fontSize: 22, letterSpacing: 1, color: '#00ff41' }}>
              Himanshu's Writing
            </Navbar.Brand>
          <div className="d-flex align-items-center ms-auto">
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
                  className="modern-nav-link terminal-nav-link"
                  style={{
                    color: 'rgba(255, 255, 255, 0.85)',
                    fontWeight: 700,
                    fontSize: 18,
                    borderBottom: 'none',
                    padding: '0.5rem 1rem',
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Portfolio
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  as={RouterLink}
                  to="/articles"
                  className={`modern-nav-link terminal-nav-link${location.pathname === '/articles' ? ' active' : ''}`}
                  style={{
                    color: location.pathname === '/articles' ? '#00ff41' : 'rgba(255, 255, 255, 0.85)',
                    fontWeight: 700,
                    fontSize: 18,
                    borderBottom: location.pathname === '/articles' ? '2.5px solid #00ff41' : 'none',
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
