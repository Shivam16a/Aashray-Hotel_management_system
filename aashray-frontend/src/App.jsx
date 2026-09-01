// src/App.jsx
import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// Eager load core structural wrapper
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load pages & heavy widgets
const AuthModal = lazy(() => import('./components/AuthModal'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PropertyExplorer = lazy(() => import('./pages/PropertyExplorer'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const HotelDetail = lazy(() => import('./pages/HotelDetail'));
const About = lazy(() => import('./pages/About'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AIAssistantModal = lazy(() => import('./components/AIAssistantModal'));

// Sleek fallback loading spinner
const PageLoader = () => (
  <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center text-cyan-glow">
    <div className="spinner-border text-info mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
    <div className="small tracking-wider text-subtext text-uppercase font-monospace">
      Loading Sanctuary Portal...
    </div>
  </div>
);

function App() {
  return (
    <>
      <div className="ambient-glow-bg"></div>

      <Suspense fallback={null}>
        <AIAssistantModal />
      </Suspense>

      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<AuthModal />} />
          <Route path="/login" element={<AuthModal />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/property" element={<ProtectedRoute><PropertyExplorer /></ProtectedRoute>} />
          <Route path="/hotel/:id" element={<ProtectedRoute><HotelDetail /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/about" element={<About />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;