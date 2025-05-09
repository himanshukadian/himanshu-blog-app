import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Loader from "./components/Loader";
import SEO from "./components/SEO";
import { ThemeProvider } from './context/ThemeContext';
import "./style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import NotFound from "./components/NotFound";
import BackToTop from "./components/BackToTop";
import { HelmetProvider } from 'react-helmet-async';
import AdminLayout from "./components/AdminLayout";
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { getTheme } from './theme';
import { useTheme as useCustomTheme } from './context/ThemeContext';
import LandingPage from './components/LandingPage';

const Blog = lazy(() => import("./components/Blog/Blog"));
const BlogDetail = lazy(() => import("./components/Blog/BlogDetail"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const AdminPosts = lazy(() => import("./components/AdminPosts"));
const AdminTags = lazy(() => import("./components/AdminTags"));
const AdminTypes = lazy(() => import("./components/AdminTypes"));
const AdminUsers = lazy(() => import("./components/AdminUsers"));
const AdminLogin = lazy(() => import("./components/AdminLogin"));

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          marginTop: '50px' 
        }}>
          <h2>Something went wrong.</h2>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              padding: '10px 20px',
              marginTop: '20px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function PrivateRoute() {
  const isAdmin = Boolean(localStorage.getItem('adminToken'));
  return isAdmin ? <Outlet /> : <Navigate to="/" />;
}

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { isDark } = useCustomTheme();

  return (
    <MuiThemeProvider theme={getTheme(isDark)}>
      <div className="App">
        {!isAdminRoute && <Navbar />}
        <BackToTop />
        <Suspense fallback={<Loader />}>
          <ErrorBoundary>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/articles" element={<Blog />} />
              <Route path="/:slug" element={<BlogDetail />} />
              <Route path="/login" element={<AdminLogin />} />
              <Route element={<PrivateRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="posts" replace />} />
                  <Route path="posts" element={<AdminPosts />} />
                  <Route path="tags" element={<AdminTags />} />
                  <Route path="types" element={<AdminTypes />} />
                  <Route path="users" element={<AdminUsers />} />
                </Route>
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </Suspense>
        {!isAdminRoute && <Footer />}
      </div>
    </MuiThemeProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ThemeProvider>
          <Router>
            <SEO />
            <AppContent />
          </Router>
        </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App; 