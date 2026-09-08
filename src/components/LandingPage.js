import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import api from "../api";
import "./LandingPage.css";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const toPlainText = (html) =>
  String(html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<img[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const estimateReadingTime = (post) => {
  if (post.readingTime && Number(post.readingTime) > 0) return `${post.readingTime} min read`;
  const words = toPlainText(post.content).split(" ").filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
};

const LandingPage = () => {
  const [featured, setFeatured] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    api
      .get("/articles?limit=6")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data.slice(0, 6) : [];
        setFeatured(list);
        setStatus(list.length === 0 ? "empty" : "ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="landing-hero-bg">
      <Container className="py-5">
        <h2 className="terminal-section-title">Featured Posts</h2>

        {status === "loading" && <div className="writing-status">loading posts…</div>}

        {status === "ready" && (
          <div className="writing-list">
            {featured.map((post) => {
              const tags = (post.tags || [])
                .slice(0, 3)
                .map((t) => (typeof t === "string" ? t : t?.name))
                .filter(Boolean);
              const date = dateFormatter.format(new Date(post.publishedAt || post.createdAt));
              return (
                <article className="writing-card" key={post._id}>
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
              );
            })}
          </div>
        )}

        {status === "empty" && (
          <div className="writing-status">no articles yet — check back soon.</div>
        )}

        {status === "error" && (
          <div className="writing-status">the blog is unreachable right now.</div>
        )}
      </Container>
    </div>
  );
};

export default LandingPage;