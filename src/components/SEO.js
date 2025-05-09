import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, image }) => {
  const siteTitle = "Himanshu Chaudhary - Software Engineer";
  const siteDescription = description || "Software Engineer specializing in Full Stack Development, Cloud Computing, and AI solutions";
  const siteImage = image || "/og-image.jpg";
  const siteUrl = "https://himanshuchaudhary.com"; // Replace with your actual domain

  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{title ? `${title} | ${siteTitle}` : siteTitle}</title>
      <meta name="description" content={siteDescription} />
      <meta name="image" content={siteImage} />

      {/* OpenGraph meta tags for social media */}
      <meta property="og:title" content={title ? `${title} | ${siteTitle}` : siteTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={siteImage} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:type" content="website" />

      {/* Twitter meta tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title ? `${title} | ${siteTitle}` : siteTitle} />
      <meta name="twitter:description" content={siteDescription} />
      <meta name="twitter:image" content={siteImage} />

      {/* Additional meta tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#00e6fe" />
      <meta name="keywords" content="software engineer, full stack developer, cloud computing, AI, machine learning, react, nodejs" />
      <meta name="author" content="Himanshu Chaudhary" />

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

      {/* Preconnect to important third-party domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </Helmet>
  );
};

export default SEO; 