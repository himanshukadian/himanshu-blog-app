import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button, Container, Form } from 'react-bootstrap';
import { FaCalendarAlt, FaClock, FaEye, FaArrowLeft, FaThumbsUp, FaCommentDots } from 'react-icons/fa';
import api from '../../api';
import './Blog.css';
import './BlogDetail.css';

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likesCount, setLikesCount] = useState(0);
  const [likeMessage, setLikeMessage] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    api.get(`/articles/${slug}`)
      .then(res => {
        setPost(res.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    if (post?.id) {
      setLikesCount(post.stats?.likes ?? 0);
    }
  }, [post]);

  useEffect(() => {
    if (post?.id) {
      api.get(`/articles/${post.id}/comments`)
        .then(res => {
          setComments(res.data.data || []);
        })
        .catch(() => {});
    }
  }, [post]);

  const handleLike = async () => {
    if (!token) {
      setLikeMessage(true);
      return;
    }
    try {
      const res = await api.post(`/articles/${post.id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLikesCount(res.data.data.stats.likes);
      setLikeMessage(false);
    } catch (err) {
      setLikeMessage(false);
    }
  };

  const handlePostComment = async () => {
    const content = commentText.trim();
    if (!content) return;
    try {
      const res = await api.post(`/articles/${post.id}/comments`, { content }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(prev => [...prev, res.data.data]);
      setCommentText('');
    } catch (err) {}
  };

  if (loading) {
    return <Container className="py-5 text-center"><h2>Loading...</h2></Container>;
  }

  if (!post) {
    return (
      <Container className="py-5 text-center">
        <h2>Article Not Found</h2>
        <Button variant="primary" onClick={() => navigate('/writings')} className="mt-3">
          <FaArrowLeft className="me-2" />Back to writings
        </Button>
      </Container>
    );
  }

  return (
    <section className="terminal-detail resume-section" style={{ minHeight: '100vh', background: '#000000', color: '#ffffff' }}>
      <Container fluid>
        <div style={{ maxWidth: 760, padding: '3rem 0' }}>
          <Button variant="link" onClick={() => navigate('/writings')} className="mb-3" style={{ textDecoration: 'none', color: '#00ff41', fontWeight: 600, paddingLeft: 0, paddingRight: 0 }}>
            <FaArrowLeft className="me-2" />Back to writings
          </Button>
          <h1 className="mb-3" style={{ fontWeight: 600, fontSize: 'clamp(1.7rem,3.5vw,2.3rem)', lineHeight: 1.25, color: '#ffffff', fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>{post.title}</h1>
          <div className="d-flex align-items-center mb-3" style={{ gap: '0.5rem', flexWrap: 'wrap', fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
            <span><FaCalendarAlt className="me-1" />{new Date(post.publishedAt || post.createdAt || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span>·</span>
            <span><FaClock className="me-1" />5 min read</span>
            <span>·</span>
            <span><FaEye className="me-1" />{post.stats?.views ?? 0} Views</span>
            {post.tags && post.tags.length > 0 && <span>·</span>}
            <span>
              {post.tags && post.tags.map((tag, idx) => (
                <span key={idx} className="detail-tag" onClick={() => navigate('/writings')}>{'#' + tag.name}</span>
              ))}
            </span>
          </div>
          <hr className="detail-divider" />
          <div style={{ fontSize: '1.15rem', lineHeight: 1.8, marginTop: 24 }}>
            <div className="markdown-content" dangerouslySetInnerHTML={{ __html: post.content || '' }} />
            <div style={{ marginTop: 32, color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', fontSize: '1rem' }}>
              <hr />
              <div>Author: <span style={{ color: '#00ff41', fontWeight: 600 }}>{post.author?.name || ''}</span></div>
            </div>
          </div>
          <div style={{ marginTop: '2rem' }}>
            <div className="d-flex align-items-center" style={{ gap: '1rem', flexWrap: 'wrap' }}>
              <Button variant="outline-primary" onClick={handleLike} style={{ fontWeight: 600 }}>
                <FaThumbsUp className="me-2" />Like ({likesCount})
              </Button>
            </div>
            {likeMessage && (
              <p style={{ marginTop: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                <Link to="/login" style={{ color: '#00ff41', fontWeight: 600 }}>Login</Link> to like this article
              </p>
            )}
            <hr style={{ borderColor: 'rgba(0, 255, 65, 0.25)', margin: '2rem 0' }} />
            <h5 style={{ fontWeight: 700, color: '#ffffff' }}>
              <FaCommentDots className="me-2" />Comments ({comments.length})
            </h5>
            {!token ? (
              <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.75rem' }}>
                <Link to="/login" style={{ color: '#00ff41', fontWeight: 600 }}>Login</Link> to comment
              </p>
            ) : (
              <div style={{ marginTop: '1rem' }}>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  style={{ background: '#000000', color: '#ffffff', borderColor: 'rgba(0, 255, 65, 0.40)' }}
                />
                <Button variant="outline-primary" onClick={handlePostComment} className="mt-3" style={{ fontWeight: 600 }}>
                  Post Comment
                </Button>
              </div>
            )}
            <div style={{ marginTop: '2rem' }}>
              {comments.map(comment => (
                <div key={comment._id} className="comment" style={{ marginBottom: '1.5rem' }}>
                  <div className="d-flex align-items-baseline" style={{ justifyContent: 'space-between' }}>
                    <strong style={{ color: '#00ff41' }}>{comment.author?.name || 'Unknown'}</strong>
                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>{new Date(comment.createdAt || '').toLocaleDateString()}</span>
                  </div>
                  <p style={{ margin: '0.5rem 0 0', color: '#ffffff' }}>
                    {comment.content}{comment.status === 'pending' ? <span style={{ color: '#ffff00' }}> (pending approval)</span> : ''}
                  </p>
                  {comment.replies && comment.replies.length > 0 && (
                    <div style={{ marginLeft: 24, marginTop: '0.75rem', borderLeft: '2px solid #00ff41', paddingLeft: 16 }}>
                      {comment.replies.map((reply, idx) => (
                        <div key={idx} style={{ marginBottom: '0.5rem' }}>
                          <strong style={{ color: 'rgba(255,255,255,0.6)' }}>{reply.author?.name || 'Unknown'}</strong>
                          <p style={{ margin: '0.25rem 0 0', color: 'rgba(255,255,255,0.6)' }}>{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default BlogDetail;