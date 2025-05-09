import React, { useEffect, useState } from "react";
import { Button, Container, Row, Col, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./LandingPage.css";
import heroImg from '../Assets/image.png';

const LandingPage = () => {
  const [featured, setFeatured] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch latest or featured posts (customize as needed)
    api.get("/articles?limit=6").then(res => setFeatured(res.data.slice(0, 6)));
  }, []);

  return (
    <div className="landing-hero-bg">
      <Container className="py-5">
        {/* Hero Section */}
        <Row className="align-items-center mb-5">
          <Col md={7}>
            <h1 className="display-3 fw-bold mb-3">Welcome to <span className="gradient-text">The Digital Pen</span></h1>
            <p className="lead mb-4">
              Explore insights, practical tutorials, and inspiring stories on technology, creativity, productivity, news and more.
            </p>
            <Button
              size="lg"
              className="hero-cta"
              onClick={() => navigate("/articles")}
            >
              Explore the Articles
            </Button>
          </Col>
          <Col md={5} className="d-none d-md-block">
            <img
              src={heroImg}
              alt="Boy with laptop and coffee"
              className="img-fluid hero-img"
            />
          </Col>
        </Row>

        {/* Featured Posts */}
        <h2 className="mb-4 text-center">Featured Posts</h2>
        <Row>
          {featured.map(post => (
            <Col md={4} className="mb-4" key={post._id}>
              <Card className="h-100 featured-card">
                <Card.Body>
                  <Card.Title>{post.title}</Card.Title>
                  <Card.Text>
                    {post.content.replace(/<[^>]+>/g, '').substring(0, 120)}...
                  </Card.Text>
                  <Button
                    variant="outline-primary"
                    onClick={() => navigate(`/${post.slug}`)}
                  >
                    Read More
                  </Button>
                </Card.Body>
                <Card.Footer>
                  <small className="text-muted">
                    By {post.author || "Unknown"} &middot; {new Date(post.date).toLocaleDateString()}
                  </small>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Call to Action */}
        <div className="text-center mt-5">
          <h3>Want updates?</h3>
          <Button
            size="lg"
            variant="success"
            className="mt-2"
            onClick={() => window.open("mailto:your@email.com")}
          >
            Subscribe to Newsletter
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default LandingPage; 