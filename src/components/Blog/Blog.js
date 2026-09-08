import React, { useState, useEffect, useMemo } from 'react';
import { Container, Form, InputGroup, Button } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { FaSearch } from 'react-icons/fa';

import './Blog.css';
import api from '../../api';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const PAGE_SIZE = 12;
const SEARCH_LIMIT = 30;

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const toPlainText = (html) =>
  String(html || '')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<img[^>]*>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const estimateReadingTime = (post) => {
  if (post.readingTime && Number(post.readingTime) > 0) return `${post.readingTime} min read`;
  const words = toPlainText(post.content).split(' ').filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
};

const Blog = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedType, setSelectedType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { isDark } = useTheme();
  const [articles, setArticles] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const searching = searchQuery.trim().length > 0;

  // Fetch unfiltered catalog of published articles once (independent of page/type filters)
  useEffect(() => {
    api.get('/articles?limit=200')
      .then(res => setCatalog(res.data))
      .catch(() => {});
  }, []);

  // Derive type filter options from the catalog (only types that actually have articles)
  const types = useMemo(() => {
    const uniqueTypes = new Set();
    catalog.forEach(post => {
      const typeName = post.type?.name || post.type;
      if (typeName) uniqueTypes.add(typeName);
    });
    return [...uniqueTypes].sort((a, b) => String(a).toLowerCase().localeCompare(String(b).toLowerCase()));
  }, [catalog]);

  // Sync filters from URL on mount (after catalog is loaded)
  useEffect(() => {
    if (catalog.length === 0) return;
    const params = new URLSearchParams(location.search);
    const type = params.get('type') || 'All';
    const search = params.get('search') || '';
    const pageParam = parseInt(params.get('page') || '1', 10);
    setSelectedType(type);
    setSearchQuery(search);
    setPage(pageParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedType && selectedType !== 'All') params.set('type', selectedType);
    if (searchQuery) params.set('search', searchQuery);
    if (page && page !== 1) params.set('page', page);
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
  }, [selectedType, searchQuery, page, navigate, location.pathname]);

  // Fetch articles for selected type and page
  useEffect(() => {
    setLoading(true);
    let url = `/articles?page=${page}&limit=${PAGE_SIZE}`;
    if (selectedType !== "All") url += `&type=${selectedType}`;
    api.get(url)
      .then(res => {
        setArticles(res.data);
        setHasMore(res.data.length === PAGE_SIZE);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedType, page]);

  // Search runs across the full catalog (not just the current page); type filter still applies
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return catalog.filter(post => {
      const typeName = post.type?.name || post.type;
      if (selectedType !== 'All' && String(typeName || '') !== selectedType) return false;
      return (
        (post.title || '').toLowerCase().includes(q) ||
        (post.content || '').toLowerCase().includes(q) ||
        (post.tags || []).some(t => (t?.name || String(t) || '').toLowerCase().includes(q))
      );
    });
  }, [catalog, searchQuery, selectedType]);

  const visiblePosts = searching ? searchResults.slice(0, SEARCH_LIMIT) : articles;
  const resultCount = searching ? searchResults.length : null;
  const showPagination = !searching;

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

  if (loading && articles.length === 0 && !searching) return <div style={{textAlign: 'center', marginTop: 80}}>Loading...</div>;

  return (
    <section className="resume-section" id="blog">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="terminal-section-title">Writings</h2>

          {/* Search Bar */}
          <div className="search-container mb-4">
            <InputGroup className="search-input-group">
              <InputGroup.Text className={`search-icon ${isDark ? 'bg-dark text-light' : 'bg-light'}`}>
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search writings…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`search-input ${isDark ? 'bg-dark text-light' : 'bg-light'}`}
                aria-label="Search writings"
              />
            </InputGroup>
          </div>

          {/* Search feedback */}
          {searching && (
            <div className="search-feedback">
              <span className="writing-heading-prompt">{'>'}</span>{' '}
              {resultCount === 0
                ? `no writings match “${searchQuery.trim()}”`
                : `${resultCount} ${resultCount === 1 ? 'result' : 'results'} for “${searchQuery.trim()}”`}
            </div>
          )}

          {/* Type Filter */}
          <div className="category-filter mb-5">
            <motion.button
              key="all"
              type="button"
              whileTap={{ scale: 0.95 }}
              className={`category-btn ${selectedType === "All" ? 'active' : ''} ${isDark ? 'dark' : ''}`}
              onClick={() => { setSelectedType("All"); setPage(1); }}
            >
              All
            </motion.button>
            {types.map((type) => (
              <motion.button
                key={type}
                type="button"
                whileTap={{ scale: 0.95 }}
                className={`category-btn ${selectedType === type ? 'active' : ''} ${isDark ? 'dark' : ''}`}
                onClick={() => { setSelectedType(type); setPage(1); }}
              >
                {String(type ?? '').charAt(0).toUpperCase() + String(type ?? '').slice(1)}
              </motion.button>
            ))}
          </div>

          {loading && articles.length > 0 && !searching && (
            <span
              style={{
                display: 'block',
                marginBottom: 12,
                color: '#00ff41',
                fontFamily: "'JetBrains Mono','Fira Code',monospace",
                fontSize: '0.8rem',
              }}
            >
              &gt; refreshing…
            </span>
          )}

          {/* Writings List */}
          {visiblePosts.length > 0 ? (
            <AnimatePresence>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="writing-list"
              >
                {visiblePosts.map((post) => {
                  const tags = (post.tags || [])
                    .slice(0, 3)
                    .map((t) => (typeof t === 'string' ? t : t?.name))
                    .filter(Boolean);
                  const date = dateFormatter.format(new Date(post.publishedAt || post.createdAt));
                  return (
                    <motion.div
                      key={post._id}
                      variants={itemVariants}
                      transition={{ duration: 0.2 }}
                    >
                      <article className="writing-card">
                        <div className="writing-card-header">
                          <Link className="writing-card-title" to={`/${post.slug}`}>
                            {post.title}
                          </Link>
                        </div>
                        <div className="writing-card-meta">
                          <span className="writing-card-date">{date}</span>
                          <span className="writing-card-separator">·</span>
                          <span className="writing-card-reading-time">{estimateReadingTime(post)}</span>
                        </div>
                        {tags.length > 0 && (
                          <div className="writing-card-tags">
                            {tags.map((tag) => (
                              <span className="writing-tag" key={tag}>{tag}</span>
                            ))}
                          </div>
                        )}
                      </article>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="text-center py-5">
              <h3>{searching ? 'No writings found' : 'No writings yet'}</h3>
              <p className="text-muted">
                {searching
                  ? `Nothing matches “${searchQuery.trim()}”. Try fewer or different keywords, or browse another type.`
                  : 'Check back soon for new writing.'}
              </p>
            </div>
          )}

          {/* Pagination Controls */}
          {showPagination && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 32 }}>
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
                disabled={!hasMore}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </motion.div>
      </Container>
    </section>
  );
};

export default Blog;