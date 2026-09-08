import React, { useEffect, useState } from "react";
import { Button, Container, Row, Col, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./LandingPage.css";

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
          <Col md={12}>
            <p className="terminal-prompt mb-2">~$ ./blog --init</p>
            <h1 className="mb-3 terminal-title">Welcome to <span className="gradient-text">Himanshu's Writing</span></h1>
            <p className="lead mb-3">
              Engineering notes, experiments, and things I learn while building software, AI systems, and developer tools.
            </p>
            <Button
              size="lg"
              className="hero-cta terminal-btn"
              onClick={() => navigate("/articles")}
            >
              &gt; explore articles
            </Button>
          </Col>
        </Row>

        {/* Featured Posts */}
        <h2 className="mb-4 text-center terminal-section-title">Featured Posts</h2>
        <Row>
          {featured.map(post => (
            <Col md={4} className="mb-4" key={post._id}>
              <Card className="h-100 featured-card">
                <Card.Body>
                  <Card.Title>{post.title}</Card.Title>
                  <Card.Text>
                    {(post.content || '').replace(/<[^>]+>/g, '').substring(0, 120)}...
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
                    By {post.author?.name || post.author || "Unknown"} &middot; {new Date(post.publishedAt || post.createdAt || '').toLocaleDateString()}
                  </small>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default LandingPage; 