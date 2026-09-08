import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import {
  AiOutlineMail,
  AiOutlinePhone,
} from "react-icons/ai";
import { FaLinkedinIn } from "react-icons/fa";
import "./navFooter.css";

function Footer() {
  let date = new Date();
  let year = date.getFullYear();
  return (
    <Container fluid className="footer meyriva-footer">
      <Row>
        <Col md="4" className="footer-copywright">
          <h3 style={{ fontFamily: "'Fira Code', monospace", fontSize: '0.75rem', fontWeight: 400 }}>
            <span style={{ color: '#00ff41' }}>{'>'}</span> Himanshu Chaudhary
          </h3>
        </Col>
        <Col md="4" className="footer-copywright">
          <h3 style={{ fontFamily: "'Fira Code', monospace", fontSize: '0.75rem', fontWeight: 400 }}>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>{'//'} </span>copyright © {year}
          </h3>
        </Col>
        <Col md="4" className="footer-body">
          <ul className="footer-icons meyriva-footer-icons">
            <li className="social-icons">
              <a
                href="https://www.linkedin.com/in/himanshucofficial"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Profile"
                className="meyriva-social-link"
              >
                <FaLinkedinIn />
              </a>
            </li>
            <li className="social-icons">
              <a
                href="mailto:himanshu.c.official@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Email Contact"
                className="meyriva-social-link"
              >
                <AiOutlineMail />
              </a>
            </li>
            <li className="social-icons">
              <a
                href="tel:+919761744048"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Phone Contact"
                className="meyriva-social-link"
              >
                <AiOutlinePhone />
              </a>
            </li>
          </ul>
        </Col>
      </Row>
    </Container>
  );
}

export default Footer;