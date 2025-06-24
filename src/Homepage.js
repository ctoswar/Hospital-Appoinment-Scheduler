import React, { useState, useCallback } from 'react';
import { 
  Stethoscope, 
  Calendar, 
  Clock, 
  Shield, 
  Users, 
  Star, 
  ArrowRight, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle 
} from 'lucide-react';
import Button from './Components/button.js';
import './styles/Homepage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Homepage = ({ onLogin = () => {} }) => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [userType, setUserType] = useState('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
    doctorId: '',
    specialty: ''
  });

  // Sanitize input to prevent XSS
  const sanitizeInput = (input) => {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    if (error) setError('');
  }, [error]);

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }

    if (authMode === 'register') {
      if (!formData.name) {
        setError('Please enter your full name');
        return false;
      }
      
      // Additional validation for doctor registration
      if (userType === 'doctor' && (!formData.doctorId || !formData.specialty)) {
        setError('Doctor ID and specialty are required for doctor registration');
        return false;
      }
      
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long');
        return false;
      }
      if (!/[A-Z]/.test(formData.password) || 
          !/[a-z]/.test(formData.password) || 
          !/[0-9]/.test(formData.password)) {
        setError('Password must contain uppercase, lowercase, and numbers');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      let endpoint = '/login';
      let payload = {
        email: sanitizeInput(formData.email.trim().toLowerCase()),
        password: formData.password
      };

      if (authMode === 'register') {
        if (userType === 'doctor') {
          endpoint = '/register/doctor';
          payload = {
            name: sanitizeInput(formData.name.trim()),
            email: sanitizeInput(formData.email.trim().toLowerCase()),
            password: formData.password,
            doctorId: sanitizeInput(formData.doctorId.trim().toUpperCase()),
            specialty: sanitizeInput(formData.specialty.trim())
          };
        } else {
          endpoint = '/register';
          payload = {
            name: sanitizeInput(formData.name.trim()),
            email: sanitizeInput(formData.email.trim().toLowerCase()),
            password: formData.password,
            role: 'patient'
          };
        }
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Authentication failed');
      }

      const data = await response.json();

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      onLogin(data.user, data.token);

      setFormData({ 
        email: '', 
        password: '', 
        name: '', 
        confirmPassword: '', 
        doctorId: '', 
        specialty: '' 
      });
      setShowAuth(false);

    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'signin' ? 'register' : 'signin');
    setFormData({ 
      email: '', 
      password: '', 
      name: '', 
      confirmPassword: '', 
      doctorId: '', 
      specialty: '' 
    });
    setUserType('patient');
    setError('');
  };

  const features = [
    {
      icon: Calendar,
      title: 'Easy Scheduling',
      description: 'Book appointments with your preferred doctors in just a few clicks'
    },
    {
      icon: Clock,
      title: 'Real-time Updates',
      description: 'Get instant notifications about appointment confirmations and changes'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your medical information is protected with enterprise-grade security'
    },
    {
      icon: Users,
      title: 'Multi-user Support',
      description: 'Separate portals for patients and healthcare providers'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Patient',
      content: 'MedSchedule has made booking appointments so much easier. No more long phone calls!',
      rating: 5
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Cardiologist',
      content: 'The doctor portal helps me manage my schedule efficiently. Great tool for medical professionals.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Patient',
      content: 'I love how I can see all my appointments in one place. Very user-friendly interface.',
      rating: 5
    }
  ];

  if (showAuth) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <div className="auth-logo">
              <Stethoscope size={40} />
              <h1>MedSchedule</h1>
            </div>
            <Button
              variant="ghost"
              size="small"
              onClick={() => {
                setShowAuth(false);
                setError('');
                setFormData({ 
                  email: '', 
                  password: '', 
                  name: '', 
                  confirmPassword: '', 
                  doctorId: '', 
                  specialty: '' 
                });
              }}
            >
              ← Back to Home
            </Button>
          </div>

          <div className="auth-card">
            <div className="auth-form-header">
              <h2>{authMode === 'signin' ? 'Welcome Back' : 'Create Account'}</h2>
              <p>
                {authMode === 'signin' 
                  ? 'Sign in to access your medical appointments' 
                  : 'Join MedSchedule to start managing your healthcare'
                }
              </p>
            </div>

            {error && (
              <div className="error-message">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              {authMode === 'register' && (
                <div className="user-type-selector" style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <button
                      type="button"
                      className={`user-type-btn ${userType === 'patient' ? 'active' : ''}`}
                      onClick={() => setUserType('patient')}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        border: '2px solid',
                        borderColor: userType === 'patient' ? '#2563eb' : '#e5e7eb',
                        borderRadius: '0.5rem',
                        backgroundColor: userType === 'patient' ? '#eff6ff' : 'white',
                        color: userType === 'patient' ? '#2563eb' : '#6b7280',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      👥 Patient
                    </button>
                    <button
                      type="button"
                      className={`user-type-btn ${userType === 'doctor' ? 'active' : ''}`}
                      onClick={() => setUserType('doctor')}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        border: '2px solid',
                        borderColor: userType === 'doctor' ? '#2563eb' : '#e5e7eb',
                        borderRadius: '0.5rem',
                        backgroundColor: userType === 'doctor' ? '#eff6ff' : 'white',
                        color: userType === 'doctor' ? '#2563eb' : '#6b7280',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      🩺 Doctor
                    </button>
                  </div>
                  {userType === 'doctor' && (
                    <div style={{ 
                      padding: '0.75rem', 
                      backgroundColor: '#fef3c7', 
                      borderRadius: '0.5rem', 
                      fontSize: '0.875rem',
                      color: '#92400e'
                    }}>
                      <strong>Note:</strong> You'll need a valid Doctor ID provided by the administration to register as a doctor.
                    </div>
                  )}
                </div>
              )}

              {authMode === 'register' && (
                <div className="form-group">
                  <label className="form-label">
                    <User size={18} />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="auth-input"
                    placeholder="Enter your full name"
                    required
                    disabled={loading}
                  />
                </div>
              )}

              {authMode === 'register' && userType === 'doctor' && (
                <>
                  <div className="form-group">
                    <label className="form-label">
                      <Shield size={18} />
                      Doctor ID
                    </label>
                    <input
                      type="text"
                      name="doctorId"
                      value={formData.doctorId}
                      onChange={handleInputChange}
                      className="auth-input"
                      placeholder="Enter your Doctor ID (e.g., DOC001)"
                      required
                      disabled={loading}
                      style={{ textTransform: 'uppercase' }}
                    />
                    <small className="form-hint">
                      Contact administration if you don't have your Doctor ID
                    </small>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      <Stethoscope size={18} />
                      Specialty
                    </label>
                    <select
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleInputChange}
                      className="auth-input"
                      required
                      disabled={loading}
                    >
                      <option value="">Select your specialty</option>
                      <option value="General Practice">General Practice</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Psychiatry">Psychiatry</option>
                      <option value="Surgery">Surgery</option>
                      <option value="Emergency Medicine">Emergency Medicine</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">
                  <Mail size={18} />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="auth-input"
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Lock size={18} />
                  Password
                </label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="auth-input"
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                    minLength={authMode === 'register' ? 8 : undefined}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {authMode === 'register' && (
                  <small className="form-hint">
                    Password must be at least 8 characters with uppercase, lowercase, and numbers
                  </small>
                )}
              </div>

              {authMode === 'register' && (
                <div className="form-group">
                  <label className="form-label">
                    <Lock size={18} />
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="auth-input"
                    placeholder="Confirm your password"
                    required
                    disabled={loading}
                  />
                </div>
              )}
              
              <Button
                type="submit"
                variant="primary"
                size="large"
                fullWidth
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    {authMode === 'signin' ? 'Signing In...' : 'Creating Account...'}
                  </>
                ) : (
                  <>
                    {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                    <ArrowRight size={18} />
                  </>
                )}
              </Button>
            </form>

            <div className="auth-footer">
              <p>
                {authMode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  className="auth-toggle-btn"
                  onClick={toggleAuthMode}
                  disabled={loading}
                >
                  {authMode === 'signin' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <Stethoscope size={32} />
              <span>MedSchedule</span>
            </div>
            <div className="header-buttons">
              <Button
                variant="outline"
                size="medium"
                onClick={() => {
                  setAuthMode('signin');
                  setShowAuth(true);
                  setError('');
                }}
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="medium"
                onClick={() => {
                  setAuthMode('register');
                  setShowAuth(true);
                  setError('');
                }}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Simplify Your <span className="highlight">Medical Appointments</span>
              </h1>
              <p className="hero-description">
                MedSchedule is the modern solution for managing medical appointments. 
                Book, reschedule, and track your healthcare visits with ease.
              </p>
              <div className="hero-buttons">
                <Button
                  variant="primary"
                  size="extra-large"
                  onClick={() => {
                    setAuthMode('register');
                    setShowAuth(true);
                    setError('');
                  }}
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Start Scheduling
                </Button>
                <Button
                  variant="ghost"
                  size="extra-large"
                >
                  Watch Demo
                </Button>
              </div>
            </div>
            <div className="hero-image">
              <div className="hero-card">
                <div className="mini-calendar">
                  <div className="calendar-header">
                    <Calendar size={20} />
                    <span>June 2025</span>
                  </div>
                  <div className="calendar-grid">
                    <div className="calendar-day active">25</div>
                    <div className="calendar-day">26</div>
                    <div className="calendar-day">27</div>
                  </div>
                </div>
                <div className="appointment-preview">
                  <div className="appointment-item">
                    <Clock size={16} />
                    <span>10:00 AM - Dr. Johnson</span>
                  </div>
                  <div className="appointment-item">
                    <Clock size={16} />
                    <span>2:30 PM - Dr. Lee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose MedSchedule?</h2>
            <p>Everything you need to manage your healthcare appointments efficiently</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <feature.icon size={32} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2>What Our Users Say</h2>
            <p>Join thousands of satisfied patients and healthcare providers</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-stars">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="testimonial-content">"{testimonial.content}"</p>
                <div className="testimonial-author">
                  <strong>{testimonial.name}</strong>
                  <span>{testimonial.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Get Started?</h2>
            <p>Join MedSchedule today and take control of your healthcare appointments</p>
            <Button
              variant="primary"
              size="extra-large"
              onClick={() => {
                setAuthMode('register');
                setShowAuth(true);
                setError('');
              }}
              icon={ArrowRight}
              iconPosition="right"
            >
              Create Your Account
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <Stethoscope size={24} />
              <span>MedSchedule</span>
            </div>
            <p>&copy; 2025 MedSchedule. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;