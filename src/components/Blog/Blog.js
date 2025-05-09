import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Dropdown } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { FaSearch, FaCalendarAlt, FaClock, FaTag } from 'react-icons/fa';
import aboutImg from '../../Assets/about.png';
import './Blog.css';
import api from '../../api';
import { useNavigate, useLocation } from 'react-router-dom';

const PAGE_SIZE = 12;

const Blog = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedType, setSelectedType] = useState("All");
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [tagSearch, setTagSearch] = useState("");
  const { isDark } = useTheme();
  const [articles, setArticles] = useState([]);
  const [types, setTypes] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const tagSearchRef = useRef(null);

  // Fetch types and tags for filter buttons
  useEffect(() => {
    api.get('/types')
      .then(res => setTypes(res.data.map(t => t.name)));
    api.get('/tags')
      .then(res => setTags(res.data));
  }, []);

  // Sync filters from URL on mount (after tags are loaded)
  useEffect(() => {
    if (tags.length === 0) return;
    const params = new URLSearchParams(location.search);
    const type = params.get('type') || 'All';
    const tagParam = params.get('tag') || '';
    const tagNames = tagParam ? tagParam.split(',').map(t => t.trim()).filter(Boolean) : [];
    const search = params.get('search') || '';
    const pageParam = parseInt(params.get('page') || '1', 10);
    setSelectedType(type);
    setSelectedTags(tagNames);
    setSearchQuery(search);
    setPage(pageParam);
    if (tagNames.length === 1) {
      setTagSearch(tagNames[0]);
    } else {
      setTagSearch('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tags]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedType && selectedType !== 'All') params.set('type', selectedType);
    if (selectedTags.length > 0) params.set('tag', selectedTags.join(','));
    if (searchQuery) params.set('search', searchQuery);
    if (page && page !== 1) params.set('page', page);
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
  }, [selectedType, selectedTags, searchQuery, page, navigate, location.pathname]);

  // Fetch articles for selected type, tags, and page
  useEffect(() => {
    setLoading(true);
    let url = `/articles?page=${page}&limit=${PAGE_SIZE}`;
    if (selectedType !== "All") url += `&type=${selectedType}`;
    if (selectedTags.length > 0) url += `&tag=${selectedTags.join(',')}`;
    api.get(url)
      .then(res => {
        setArticles(res.data);
        setHasMore(res.data.length === PAGE_SIZE);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedType, selectedTags, page, tags]);

  // Filter by search query (client-side)
  const filteredPosts = articles.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.content && post.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.tags && post.tags.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesSearch;
  });

  // Filter tags for tag filter search box
  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(tagSearch.toLowerCase())
  );

  // Handle tag selection (add or remove tag name)
  const handleTagSelect = (tagName) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter(t => t !== tagName));
      setTagSearch('');
    } else {
      setSelectedTags([...selectedTags, tagName]);
      setTagSearch('');
    }
    setShowTagDropdown(false);
  };

  // Handle tag clear (remove a tag or clear all)
  const handleTagClear = (tagName) => {
    if (tagName) {
      setSelectedTags(selectedTags.filter(t => t !== tagName));
    } else {
      setSelectedTags([]);
    }
    setTagSearch('');
    setShowTagDropdown(true);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tagSearchRef.current && !tagSearchRef.current.contains(event.target)) {
        setShowTagDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  if (loading) return <div style={{textAlign: 'center', marginTop: 80}}>Loading...</div>;

  return (
    <section className="resume-section" id="blog">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Search Bar */}
          <div className="search-container mb-4">
            <InputGroup className="search-input-group">
              <InputGroup.Text className={`search-icon ${isDark ? 'bg-dark text-light' : 'bg-light'}`}>
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`search-input ${isDark ? 'bg-dark text-light' : 'bg-light'}`}
              />
            </InputGroup>
          </div>

          {/* Type Filter */}
          <div className="category-filter mb-5">
            <motion.button
              key="all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`category-btn ${selectedType === "All" ? 'active' : ''} ${isDark ? 'dark' : ''}`}
              onClick={() => { setSelectedType("All"); setSelectedTags([]); setPage(1); }}
            >
              All
            </motion.button>
            {types.map((type) => (
              <motion.button
                key={type}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`category-btn ${selectedType === type ? 'active' : ''} ${isDark ? 'dark' : ''}`}
                onClick={() => { setSelectedType(type); setSelectedTags([]); setPage(1); }}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </motion.button>
            ))}
          </div>

          {/* Tag Filter Search Box */}
          <div style={{ position: 'relative', marginBottom: 12, maxWidth: 320 }} ref={tagSearchRef}>
            <InputGroup className="search-input-group" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', minHeight: 48 }}>
              <InputGroup.Text className={`search-icon ${isDark ? 'bg-dark text-light' : 'bg-light'}`} style={{ height: '100%' }}>
                <FaSearch />
              </InputGroup.Text>
              {/* Render selected tag pills */}
              {selectedTags.map((tag, index) => (
                <span
                  key={index}
                  style={{
                    marginRight: 6,
                    marginLeft: 2,
                    padding: '2px 8px',
                    background: isDark ? '#2d3a4a' : '#f5f5f5',
                    borderRadius: 4,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: 15,
                  }}
                >
                  {tag}
                  <span
                    onClick={() => handleTagClear(tag)}
                    style={{
                      marginLeft: 4,
                      color: isDark ? '#fff' : '#333',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: 16,
                      lineHeight: 1,
                    }}
                    aria-label={`Remove tag ${tag}`}
                  >
                    ×
                  </span>
                </span>
              ))}
              {/* Always show the input */}
              <Form.Control
                type="text"
                placeholder={selectedTags.length === 0 ? "Search tags..." : "Add more..."}
                value={tagSearch}
                onChange={(e) => {
                  setTagSearch(e.target.value);
                  setShowTagDropdown(true);
                }}
                className={`search-input ${isDark ? 'bg-dark text-light' : 'bg-light'}`}
                style={{ minWidth: 80, flex: 1, border: 'none', boxShadow: 'none' }}
                onFocus={() => setShowTagDropdown(true)}
              />
              {/* Clear all tags button */}
              {selectedTags.length > 0 && (
                <span
                  onClick={() => handleTagClear()}
                  style={{
                    marginLeft: 6,
                    color: isDark ? '#fff' : '#333',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: 18,
                    lineHeight: 1,
                  }}
                  aria-label="Clear all tags"
                >
                  ×
                </span>
              )}
            </InputGroup>
            {/* Dropdown only if there are filtered tags and input is focused */}
            {showTagDropdown && filteredTags.length > 0 && (
              <div
                className="tag-dropdown"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  width: '100%',
                  background: isDark ? '#232b39' : '#fff',
                  border: '1px solid #2d3a4a',
                  borderRadius: 6,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  zIndex: 1000,
                  marginTop: 2,
                }}
              >
                {filteredTags.map(tag => (
                  <div
                    key={tag.name}
                    className="dropdown-item"
                    style={{
                      padding: '10px 16px',
                      cursor: 'pointer',
                      color: isDark ? '#fff' : '#333',
                      borderRadius: 4,
                      background: selectedTags.includes(tag.name) ? (isDark ? '#2d3a4a' : '#e0e0e0') : 'transparent',
                      fontWeight: selectedTags.includes(tag.name) ? 600 : 400,
                    }}
                    onClick={() => handleTagSelect(tag.name)}
                    onMouseOver={e => (e.currentTarget.style.background = isDark ? '#2d3a4a' : '#f5f5f5')}
                    onMouseOut={e => (e.currentTarget.style.background = selectedTags.includes(tag.name) ? (isDark ? '#2d3a4a' : '#e0e0e0') : 'transparent')}
                  >
                    {tag.name}
                    {selectedTags.includes(tag.name) && (
                      <span style={{ marginLeft: 8, color: isDark ? '#00e6fe' : '#007bff' }}>✓</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Blog Posts Grid */}
          <AnimatePresence>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="blog-posts-grid"
            >
              <Row>
                {filteredPosts.map((post) => (
                  <Col key={post._id} md={6} lg={4} className="mb-4 d-flex align-items-stretch">
                    <motion.div
                      variants={itemVariants}
                      whileHover={{ y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="w-100"
                    >
                      <Card className="project-card-view h-100 d-flex flex-column justify-content-between">
                        <Card.Body className="d-flex flex-column">
                          <Card.Title className="h4 mb-3">{post.title}</Card.Title>
                          <div 
                            className="card-text mb-4" 
                            dangerouslySetInnerHTML={{ 
                              __html: post.content ? 
                                post.content.replace(/<[^>]*>/g, '').substring(0, 120) + '...' : 
                                '' 
                            }} 
                          />
                          <div className="post-meta mb-3">
                            <span className="me-3">
                              <FaCalendarAlt className="me-1" />
                              {post.date && new Date(post.date).toLocaleDateString()}
                            </span>
                            <span>
                              <FaClock className="me-1" />
                              5 min read
                            </span>
                          </div>
                          <div className="tags-container mb-3">
                            {post.tags && post.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="tag"
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                  setSelectedTags([tag.name]);
                                  setSelectedType("All");
                                  setPage(1);
                                }}
                              >
                                <FaTag className="me-1" />
                                {tag.name}
                              </span>
                            ))}
                          </div>
                          <Button 
                            variant="primary" 
                            className="w-100 read-more-btn mt-auto"
                            onClick={() => window.location.href = `/${post.slug}`}
                          >
                            Read Article
                          </Button>
                        </Card.Body>
                      </Card>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            </motion.div>
          </AnimatePresence>

          {/* Pagination Controls */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
            <Button
              variant="secondary"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              style={{ marginRight: 12 }}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              disabled={!hasMore || filteredPosts.length < PAGE_SIZE}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-5">
              <h3>No articles found</h3>
              <p className="text-muted">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </motion.div>
      </Container>
    </section>
  );
};

export default Blog; 