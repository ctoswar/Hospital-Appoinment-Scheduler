// Create a new file: DoctorPortal.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  FileText,
  Bell,
  Settings,
  Search,
  Filter,
  Users,
  Heart,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  Shield,
  LogOut,
  Edit
} from 'lucide-react';
import './styles/DoctorPortal.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const DoctorPortal = ({ user, onLogout }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch doctor's appointments
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/doctor/appointments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/doctor/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchAppointments(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.appointment_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || apt.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const todaysAppointments = appointments.filter(apt => {
    const today = new Date().toISOString().split('T')[0];
    return apt.appointment_date === today;
  });

  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');

  const Sidebar = ({ setCurrentPage, currentPage }) => (
    <div className="sidebar doctor-sidebar">
      <div className="sidebar-content">
        <div className="sidebar-nav">
          {[
            { id: 'dashboard', icon: Activity, label: 'Dashboard' },
            { id: 'appointments', icon: Calendar, label: 'Appointments' },
            { id: 'patients', icon: Users, label: 'Patients' },
            { id: 'schedule', icon: Clock, label: 'Schedule' },
            { id: 'profile', icon: User, label: 'Profile' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`sidebar-btn ${currentPage === item.id ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const Dashboard = () => (
    <div className="content-container animate-fade-in">
      {/* Welcome Card */}
      <div className="card gradient-card doctor-gradient" style={{ marginBottom: '2rem', padding: '2rem' }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: 'white' }}>
            Welcome, {user?.name}! 👨‍⚕️
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', marginBottom: '1rem' }}>
            Specialty: {user?.specialty}
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            Ready to provide excellent healthcare to your patients.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid-stats" style={{ marginBottom: '2rem' }}>
        {[
          { 
            title: "Today's Appointments", 
            value: todaysAppointments.length, 
            icon: Calendar, 
            gradient: 'var(--success-gradient)',
            change: `${appointments.filter(apt => apt.status === 'confirmed').length} confirmed`
          },
          { 
            title: 'Pending Reviews', 
            value: pendingAppointments.length, 
            icon: AlertCircle, 
            gradient: 'var(--warning-gradient)',
            change: 'Need attention'
          },
          { 
            title: 'Total Patients', 
            value: new Set(appointments.map(apt => apt.patient_id)).size, 
            icon: Users, 
            gradient: 'var(--secondary-gradient)',
            change: 'This month'
          }
        ].map((stat, index) => (
          <div key={stat.title} className="card stat-card hover-lift">
            <div className="stat-icon" style={{ background: stat.gradient }}>
              <stat.icon size={24} color="white" />
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.title}</div>
            <div className="stat-change">{stat.change}</div>
          </div>
        ))}
      </div>

      {/* Today's Appointments */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '1.5rem' }}>
          Today's Schedule
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {todaysAppointments.length > 0 ? todaysAppointments.map((appointment) => (
            <div key={appointment.id} className="appointment-card doctor-appointment">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="patient-avatar">
                    {appointment.patient_name.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ fontWeight: '600', color: '#1a1a1a', marginBottom: '0.25rem' }}>
                      {appointment.patient_name}
                    </h4>
                    <p style={{ color: '#666', marginBottom: '0.5rem' }}>{appointment.appointment_type}</p>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#888' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={14} />
                        {appointment.appointment_time}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Mail size={14} />
                        {appointment.patient_email}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className={`status-badge status-${appointment.status}`}>
                    {appointment.status}
                  </span>
                  {appointment.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                        className="btn-icon btn-success"
                        title="Confirm"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                        className="btn-icon btn-danger"
                        title="Cancel"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              <Calendar size={48} color="#ddd" style={{ margin: '0 auto 1rem' }} />
              <p>No appointments scheduled for today</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const AppointmentsPage = () => (
    <div className="content-container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '0.5rem' }}>
            All Appointments
          </h2>
          <p style={{ color: '#666' }}>Manage your patient appointments</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div className="search-container" style={{ flex: 1 }}>
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input form-input"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="form-input"
          style={{ minWidth: '150px' }}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Appointments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredAppointments.map((appointment) => (
          <div key={appointment.id} className="card appointment-card hover-lift">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="patient-avatar">
                  {appointment.patient_name.charAt(0)}
                </div>
                <div>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '0.25rem' }}>
                    {appointment.patient_name}
                  </h4>
                  <p style={{ color: '#666', marginBottom: '0.5rem' }}>{appointment.appointment_type}</p>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#888' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={16} />
                      {appointment.appointment_date}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={16} />
                      {appointment.appointment_time}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Mail size={16} />
                      {appointment.patient_email}
                    </span>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className={`status-badge status-${appointment.status}`}>
                  {appointment.status}
                </span>
                
                <select
                  value={appointment.status}
                  onChange={(e) => updateAppointmentStatus(appointment.id, e.target.value)}
                  className="form-input"
                  style={{ minWidth: '120px', fontSize: '0.875rem' }}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        ))}
        
        {filteredAppointments.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <Calendar size={64} color="#ddd" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#1a1a1a', marginBottom: '0.5rem' }}>
              No appointments found
            </h3>
            <p style={{ color: '#666' }}>
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'No appointments scheduled yet'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const ProfilePage = () => (
    <div className="content-container animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '0.5rem' }}>
          Doctor Profile
        </h2>
        <p style={{ color: '#666' }}>Manage your professional information</p>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ 
            width: '6rem', 
            height: '6rem', 
            background: 'var(--primary-gradient)', 
            borderRadius: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}>
            {user?.name?.charAt(0)}
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1a1a1a' }}>{user?.name}</h3>
            <p style={{ color: '#666' }}>Doctor ID: {user?.doctorId}</p>
            <p style={{ color: '#666' }}>Specialty: {user?.specialty}</p>
            <span className="status-badge status-confirmed" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
              Active Doctor
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#1a1a1a', marginBottom: '0.5rem' }}>
                Email
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: '0.5rem' }}>
                <Mail size={16} color="#666" />
                <span style={{ color: '#1a1a1a' }}>{user?.email}</span>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#1a1a1a', marginBottom: '0.5rem' }}>
                Specialty
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: '0.5rem' }}>
                <Stethoscope size={16} color="#666" />
                <span style={{ color: '#1a1a1a' }}>{user?.specialty}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const Navigation = () => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const settingsRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (settingsRef.current && !settingsRef.current.contains(event.target)) {
          setIsSettingsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSettingsToggle = () => {
      setIsSettingsOpen(!isSettingsOpen);
    };

    const handleLogout = () => {
      setIsSettingsOpen(false);
      onLogout();
    };

    return (
      <nav className="navbar doctor-navbar">
        <div className="navbar-content">
          <div className="logo-container">
            <div className="logo-icon doctor-logo">
              <Stethoscope size={24} color="white" />
            </div>
            <div>
              <h1 className="logo-text">HealthPortal</h1>
              <p className="logo-subtitle">Doctor Dashboard</p>
            </div>
          </div>
          <div className="navbar-actions">
            <button className="navbar-btn">
              <Bell size={20} />
              {pendingAppointments.length > 0 && (
                <span className="notification-dot">{pendingAppointments.length}</span>
              )}
            </button>
            
            <div className="settings-container" ref={settingsRef}>
              <button 
                className="navbar-btn" 
                onClick={handleSettingsToggle}
                aria-expanded={isSettingsOpen}
              >
                <Settings size={20} />
              </button>
              
              {isSettingsOpen && (
                <div className="dropdown">
                  <button className="dropdown-item" onClick={() => setCurrentPage('profile')}>
                    <User size={16} />
                    <span>Profile Settings</span>
                  </button>
                  <button className="dropdown-item">
                    <Shield size={16} />
                    <span>Privacy Settings</span>
                  </button>
                  <hr className="dropdown-divider" />
                  <button className="dropdown-item logout-item" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
            
            <div className="user-avatar doctor-avatar">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </div>
      </nav>
    );
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'appointments':
        return <AppointmentsPage />;
      case 'patients':
        return <AppointmentsPage />; // For now, same as appointments
      case 'schedule':
        return <AppointmentsPage />; // For now, same as appointments
      case 'profile':
        return <ProfilePage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navigation />
      <Sidebar setCurrentPage={setCurrentPage} currentPage={currentPage} />
      
      <main style={{ marginLeft: '16rem', paddingTop: '4rem', minHeight: '100vh' }}>
        {renderCurrentPage()}
      </main>
    </div>
  );
};

export default DoctorPortal;