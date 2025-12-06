import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { HelmetProvider } from 'react-helmet-async';
import { BlogProvider } from './context/BlogContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import Projects from './pages/Projects';
import Resume from './pages/Resume';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Login from './pages/Admin/Login';
import Dashboard from './pages/Admin/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

import { Toaster } from 'sonner';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BlogProvider>
      <Router>
        <Toaster position="top-center" theme="dark" richColors />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="services" element={<Services />} />
            <Route path="projects" element={<Projects />} />
            <Route path="resume" element={<Resume />} />
            <Route path="contact" element={<Contact />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:slug" element={<BlogPost />} />
          </Route>
          <Route path="/admin/login" element={<Login />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/success" element={<Success />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </BlogProvider>
  );
}

export default App;
