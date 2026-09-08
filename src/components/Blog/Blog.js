import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Container, Form, InputGroup, Button } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { FaSearch } from 'react-icons/fa';

import './Blog.css';
import api from '../../api';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const PAGE_SIZE = 12;

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
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [tagSearch, setTagSearch] = useState("");
  const { isDark } = useTheme();
  const [articles, setArticles] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const tagSearchRef = useRef(null);

  // Fetch unfiltered catalog of published articles once (independent of page/type/tag filters)
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

  // Derive distinct tag docs from the catalog (only tags that actually have articles)
  const tags = useMemo(() => {
    const tagMap = new Map();
    catalog.forEach(post => {
      (post.tags || []).forEach(t => {
        const name = typeof t === 'string' ? t : (t?.name || '');
        if (name && !tagMap.has(name)) {
          tagMap.set(name, typeof t === 'string' ? { name: t } : t);
        }
      });
    });
    return [...tagMap.values()].sort((a, b) => String(a.name).toLowerCase().localeCompare(String(b.name).toLowerCase()));
  }, [catalog]);

  // Sync filters from URL on mount (after catalog is loaded)
  useEffect(() => {
    if (catalog.length === 0) return;
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
  }, [catalog]);

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
  }, [selectedType, selectedTags, page, catalog]);

  // Filter by search query (client-side)
  const filteredPosts = articles.filter(post => {
    const matchesSearch = (post.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.content && post.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.tags && post.tags.some(tag => (tag?.name || String(tag)).toLowerCase().includes(searchQuery.toLowerCase())));
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

  if (loading && articles.length === 0) return <div style={{textAlign: 'center', marginTop: 80}}>Loading...</div>;

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
              type="button"
              whileTap={{ scale: 0.95 }}
              className={`category-btn ${selectedType === "All" ? 'active' : ''} ${isDark ? 'dark' : ''}`}
              onClick={() => { setSelectedType("All"); setSelectedTags([]); setPage(1); }}
            >
              All
            </motion.button>
            {types.map((type) => (
              <motion.button
                key={type}
                type="button"
                whileTap={{ scale: 0.95 }}
                className={`category-btn ${selectedType === type ? 'active' : ''} ${isDark ? 'dark' : ''}`}
                onClick={() => { setSelectedType(type); setSelectedTags([]); setPage(1); }}
              >
                {String(type ?? '').charAt(0).toUpperCase() + String(type ?? '').slice(1)}
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
                    background: isDark ? 'rgba(0, 255, 65, 0.12)' : 'rgba(255, 255, 255, 0.08)',
                    borderRadius: 4,
                    border: '1px solid rgba(0, 255, 65, 0.3)',
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
                      color: '#fff',
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
                    color: '#00ff41',
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
                  background: isDark ? '#000000' : '#0d0d0d',
                  border: '1px solid rgba(0, 255, 65, 0.35)',
                  borderRadius: 6,
                  boxShadow: '0 4px 18px rgba(0, 0, 0, 0.6)',
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
                      color: '#fff',
                      borderRadius: 4,
                      background: selectedTags.includes(tag.name) ? 'rgba(0, 255, 65, 0.14)' : 'transparent',
                      fontWeight: selectedTags.includes(tag.name) ? 600 : 400,
                    }}
                    onClick={() => handleTagSelect(tag.name)}
                  >
                    {tag.name}
                    {selectedTags.includes(tag.name) && (
                      <span style={{ marginLeft: 8, color: '#00ff41' }}>✓</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {loading && articles.length > 0 && (
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

          {/* Blog Posts Grid */}
          <AnimatePresence>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="writing-list"
            >
              {filteredPosts.map((post) => {
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

          {/* Pagination Controls */}
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