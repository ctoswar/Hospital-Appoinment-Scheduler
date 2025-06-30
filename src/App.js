import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { 
  Calendar, Clock, User, Stethoscope, Plus, Edit, Trash2, Heart,
  Activity, FileText, Bell, Settings, Search, Filter, ChevronRight,
  MapPin, Phone, Mail, Star, X, Shield, LogOut
} from 'lucide-react';
import './styles/PatientPortal.css';
import './styles/Navigation.css';
import { useNavigate } from 'react-router-dom';
import Homepage from './Homepage';
import DoctorPortal from './DoctorPortal';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const PatientPortal = ({ user, onLogout }) => { 
  // State management
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [bookingData, setBookingData] = useState({
    patientName: user?.name || 'Patient',
    doctorName: '',
    date: '',
    time: '',
    type: ''
  });
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  // Handler functions
 const handleBooking = () => {
  const selectedDoctor = doctors.find(doc => doc.name === bookingData.doctorName);
  if (selectedDoctor && bookingData.doctorName && bookingData.date && bookingData.time && bookingData.type) {
    addAppointment({
      doctor_id: selectedDoctor.id, // Add this
      doctor_name: bookingData.doctorName,
      appointment_date: bookingData.date,
      appointment_time: bookingData.time,
      appointment_type: bookingData.type,
      patient_name: bookingData.patientName
    });
    }
  };

  const handleEditSave = () => {
    if (editingAppointment) {
      updateAppointment(editingAppointment);
    }
  };

  // Socket.IO and data initialization
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        const [appointmentsRes, doctorsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/appointments`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          }),
          fetch(`${API_BASE_URL}/doctors`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          })
        ]);

        if (appointmentsRes.ok) setAppointments(await appointmentsRes.json());
        if (doctorsRes.ok) setDoctors(await doctorsRes.json());
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    // Socket.IO setup
    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    newSocket.on('appointments:update', () => {
      console.log('Appointments updated - refreshing data');
      fetchInitialData();
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    return () => {
      newSocket.off('appointments:update');
      newSocket.disconnect();
    };
  }, []);

  // Appointment CRUD operations
  const addAppointment = async (appointmentData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        doctor_id: appointmentData.doctor_id, // Add this
        doctor_name: appointmentData.doctor_name,
        appointment_date: appointmentData.appointment_date,
        appointment_time: appointmentData.appointment_time,
        appointment_type: appointmentData.appointment_type,
        patient_id: user.id,
        patient_name: appointmentData.patient_name
      })
    });

    if (response.ok) {
      setBookingData({ 
        patientName: user?.name || 'Patient',
        doctorName: '', 
        date: '', 
        time: '', 
        type: '' 
      });
      setShowBookingForm(false);
    } else {
      const errorData = await response.json();
      console.error('Error response:', errorData);
    }
  } catch (error) {
    console.error('Error adding appointment:', error);
  }
};

  const updateAppointment = async (updatedAppointment) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/appointments/${updatedAppointment.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(updatedAppointment)
      });

      if (response.ok) {
        setEditingAppointment(null);
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const deleteAppointment = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/appointments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  // Filtering and helper functions
  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.appointment_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || apt.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const upcomingAppointments = appointments.filter(apt => {
    const today = new Date();
    const appointmentDate = new Date(apt.appointment_date);
    return appointmentDate >= today && apt.status !== 'cancelled';
  }).slice(0, 3);

  const Sidebar = ({ setCurrentPage, currentPage }) => (
    <div className="sidebar">
      <div className="sidebar-content">
        <div className="sidebar-nav">
          {[
            { id: 'dashboard', icon: Activity, label: 'Dashboard' },
            { id: 'appointments', icon: Calendar, label: 'Appointments' },
            { id: 'doctors', icon: Stethoscope, label: 'Find Doctors' },
            { id: 'records', icon: FileText, label: 'Medical Records' },
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
      <div className="card gradient-card" style={{ marginBottom: '2rem', padding: '2rem' }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: 'white' }}>
            Welcome back, John! 👋
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', marginBottom: '1.5rem' }}>
            Your health journey continues here. Stay on top of your appointments and wellness.
          </p>
          <button 
            onClick={() => setShowBookingForm(true)}
            className="btn btn-secondary"
          >
            Book New Appointment
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid-stats" style={{ marginBottom: '2rem' }}>
        {[
          { 
            title: 'Upcoming Appointments', 
            value: upcomingAppointments.length, 
            icon: Calendar, 
            gradient: 'var(--success-gradient)',
            change: '+2 this week'
          },
          { 
            title: 'Health Score', 
            value: '94%', 
            icon: Heart, 
            gradient: 'var(--warning-gradient)',
            change: '+5% this month'
          },
          { 
            title: 'Active Treatments', 
            value: '3', 
            icon: Activity, 
            gradient: 'var(--secondary-gradient)',
            change: '1 completed'
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

      {/* Upcoming Appointments */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1a1a1a' }}>Upcoming Appointments</h3>
          <button 
            onClick={() => setCurrentPage('appointments')}
            className="btn-icon"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
          >
            <span>View All</span>
            <ChevronRight size={16} />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {upcomingAppointments.map((appointment) => (
            <div key={appointment.id} className="appointment-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="appointment-avatar">
                  {appointment.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontWeight: '600', color: '#1a1a1a', marginBottom: '0.25rem' }}>
                    {appointment.doctorName}
                  </h4>
                  <p style={{ color: '#666', marginBottom: '0.5rem' }}>{appointment.type}</p>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#888' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={14} />
                      {appointment.date}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={14} />
                      {appointment.time}
                    </span>
                  </div>
                </div>
                <span className={`status-badge status-${appointment.status}`}>
                  {appointment.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const AppointmentsPage = () => (
    <div className="content-container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '0.5rem' }}>
            My Appointments
          </h2>
          <p style={{ color: '#666' }}>Manage your scheduled visits</p>
        </div>
        <button
          onClick={() => setShowBookingForm(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={20} />
          <span>Book Appointment</span>
        </button>
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
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
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
                <div className="appointment-avatar">
                  {appointment.avatar}
                </div>
                <div>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '0.25rem' }}>
                    {appointment.doctorName}
                  </h4>
                  <p style={{ color: '#666', marginBottom: '0.5rem' }}>{appointment.type}</p>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#888' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={16} />
                      {appointment.date}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={16} />
                      {appointment.time}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={16} />
                      {appointment.location}
                    </span>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className={`status-badge status-${appointment.status}`}>
                  {appointment.status}
                </span>
                <button
                  onClick={() => setEditingAppointment(appointment)}
                  className="btn-icon"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => deleteAppointment(appointment.id)}
                  className="btn-icon"
                >
                  <Trash2 size={16} />
                </button>
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
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Get started by booking your first appointment'
              }
            </p>
            <button
              onClick={() => setShowBookingForm(true)}
              className="btn btn-primary"
            >
              Book Your First Appointment
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const DoctorsPage = () => (
    <div className="content-container animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '0.5rem' }}>
          Find Doctors
        </h2>
        <p style={{ color: '#666' }}>Connect with healthcare professionals</p>
      </div>

      <div className="grid-responsive">
        {doctors.map((doctor) => (
          <div key={doctor.id} className="card doctor-card hover-lift">
            <div className="doctor-avatar">
              {doctor.image}
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '0.5rem' }}>
              {doctor.name}
            </h3>
            <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '1rem' }}>{doctor.specialty}</p>
            <div className="rating-stars">
              <Star className="star-icon" size={16} fill="currentColor" />
              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1a1a1a' }}>{doctor.rating}</span>
              <span style={{ fontSize: '0.875rem', color: '#666' }}>(127 reviews)</span>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: '#666' }}>Next Available:</span>
                <span style={{ fontWeight: '500', color: '#1a1a1a' }}>{doctor.nextAvailable}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: '#666' }}>Status:</span>
                <span className={`status-badge ${doctor.available ? 'status-confirmed' : 'status-cancelled'}`}>
                  {doctor.available ? 'Available' : 'Busy'}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => {
                setBookingData({...bookingData, doctorName: doctor.name});
                setShowBookingForm(true);
              }}
              disabled={!doctor.available}
              className={doctor.available ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ 
                width: '100%',
                opacity: doctor.available ? 1 : 0.5,
                cursor: doctor.available ? 'pointer' : 'not-allowed'
              }}
            >
              {doctor.available ? 'Book Appointment' : 'Currently Unavailable'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const RecordsPage = () => (
    <div className="content-container animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '0.5rem' }}>
          Medical Records
        </h2>
        <p style={{ color: '#666' }}>Access your health information</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '1rem' }}>
            Recent Test Results
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { test: 'Blood Panel', date: '2025-06-15', status: 'Normal' },
              { test: 'X-Ray Chest', date: '2025-06-10', status: 'Normal' },
              { test: 'ECG', date: '2025-06-05', status: 'Normal' }
            ].map((record, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '0.75rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '0.5rem'
              }}>
                <div>
                  <p style={{ fontWeight: '500', color: '#1a1a1a' }}>{record.test}</p>
                  <p style={{ fontSize: '0.875rem', color: '#666' }}>{record.date}</p>
                </div>
                <span className="status-badge status-confirmed">
                  {record.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '1rem' }}>
            Medications
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
              { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
              { name: 'Vitamin D3', dosage: '1000 IU', frequency: 'Once daily' }
            ].map((med, index) => (
              <div key={index} style={{ 
                padding: '0.75rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '0.5rem'
              }}>
                <p style={{ fontWeight: '500', color: '#1a1a1a' }}>{med.name}</p>
                <p style={{ fontSize: '0.875rem', color: '#666' }}>{med.dosage} - {med.frequency}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const ProfilePage = () => (
    <div className="content-container animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '0.5rem' }}>
          Profile Settings
        </h2>
        <p style={{ color: '#666' }}>Manage your personal information</p>
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
            JS
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1a1a1a' }}>John Smith</h3>
            <p style={{ color: '#666' }}>Patient ID: #PAT-2025-001</p>
            <span className="status-badge status-confirmed" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
              Active Patient
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
                <span style={{ color: '#1a1a1a' }}>john.smith@email.com</span>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#1a1a1a', marginBottom: '0.5rem' }}>
                Phone
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: '0.5rem' }}>
                <Phone size={16} color="#666" />
                <span style={{ color: '#1a1a1a' }}>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#1a1a1a', marginBottom: '0.5rem' }}>
                Date of Birth
              </label>
              <div style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: '0.5rem' }}>
                <span style={{ color: '#1a1a1a' }}>January 15, 1985</span>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#1a1a1a', marginBottom: '0.5rem' }}>
                Emergency Contact
              </label>
              <div style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: '0.5rem' }}>
                <span style={{ color: '#1a1a1a' }}>Jane Smith - +1 (555) 987-6543</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
          <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '1rem' }}>
            Health Information
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#1a1a1a', marginBottom: '0.5rem' }}>
                Blood Type
              </label>
              <div style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: '0.5rem' }}>
                <span style={{ color: '#1a1a1a' }}>O+</span>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#1a1a1a', marginBottom: '0.5rem' }}>
                Insurance
              </label>
              <div style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: '0.5rem' }}>
                <span style={{ color: '#1a1a1a' }}>BlueCross BlueShield</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Booking Form Modal
  const BookingFormModal = () => (
    showBookingForm && (
      <div className="modal-overlay">
        <div className="modal-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1a1a1a' }}>Book New Appointment</h3>
            <button
              onClick={() => setShowBookingForm(false)}
              className="btn-icon"
            >
              <X size={20} />
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#1a1a1a', marginBottom: '0.5rem' }}>
                Doctor
              </label>
              <select
                value={bookingData.doctorName}
                onChange={(e) => setBookingData({...bookingData, doctorName: e.target.value})}
                className="form-input"
              >
                <option value="">Select a doctor</option>
                {doctors.filter(doc => doc.available).map(doctor => (
                  <option key={doctor.id} value={doctor.name}>
                    {doctor.name} - {doctor.specialty}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#1a1a1a', marginBottom: '0.5rem' }}>
                Appointment Type
              </label>
              <select
                value={bookingData.type}
                onChange={(e) => setBookingData({...bookingData, type: e.target.value})}
                className="form-input"
              >
                <option value="">Select type</option>
                <option value="General Checkup">General Checkup</option>
                <option value="Consultation">Consultation</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#1a1a1a', marginBottom: '0.5rem' }}>
                Date
              </label>
              <input
                type="date"
                value={bookingData.date}
                onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                className="form-input"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#1a1a1a', marginBottom: '0.5rem' }}>
                Time
              </label>
              <select
                value={bookingData.time}
                onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                className="form-input"
              >
                <option value="">Select time</option>
                {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'].map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              onClick={() => setShowBookingForm(false)}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              onClick={handleBooking}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              Book Appointment
            </button>
          </div>
        </div>
      </div>
    )
  );

  // Edit Appointment Modal
  const EditAppointmentModal = () => (
    editingAppointment && (
      <div className="modal-overlay">
        <div className="modal-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1a1a1a' }}>Edit Appointment</h3>
            <button
              onClick={() => setEditingAppointment(null)}
              className="btn-icon"
            >
              <X size={20} />
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#1a1a1a', marginBottom: '0.5rem' }}>
                Date
              </label>
              <input
                type="date"
                value={editingAppointment.date}
                onChange={(e) => setEditingAppointment({...editingAppointment, date: e.target.value})}
                className="form-input"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#1a1a1a', marginBottom: '0.5rem' }}>
                Time
              </label>
              <select
                value={editingAppointment.time}
                onChange={(e) => setEditingAppointment({...editingAppointment, time: e.target.value})}
                className="form-input"
              >
                {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'].map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#1a1a1a', marginBottom: '0.5rem' }}>
                Status
              </label>
              <select
                value={editingAppointment.status}
                onChange={(e) => setEditingAppointment({...editingAppointment, status: e.target.value})}
                className="form-input"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              onClick={() => setEditingAppointment(null)}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              onClick={handleEditSave}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    )
  );

  const Navigation = () => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const settingsRef = useRef(null);

    // Close dropdown when clicking outside
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
      console.log('Logging out...');
      setIsSettingsOpen(false);
      onLogout();
    };

    const handleProfileSettings = () => {
      console.log('Opening profile settings...');
      alert('Profile settings clicked!');
      setIsSettingsOpen(false);
    };

    const handlePrivacySettings = () => {
      console.log('Opening privacy settings...');
      alert('Privacy settings clicked!');
      setIsSettingsOpen(false);
    };

    return (
      <nav className="navbar">
        <div className="navbar-content">
          <div className="logo-container">
            <div className="logo-icon">
              <Heart size={24} color="white" />
            </div>
            <div>
              <h1 className="logo-text">HealthPortal</h1>
              <p className="logo-subtitle">Patient Dashboard</p>
            </div>
          </div>
          <div className="navbar-actions">
            <button className="navbar-btn">
              <Bell size={20} />
              <span className="notification-dot"></span>
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
                  <button className="dropdown-item" onClick={handleProfileSettings}>
                    <User size={16} />
                    <span>Profile Settings</span>
                  </button>
                  <button className="dropdown-item" onClick={handlePrivacySettings}>
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
            
            <div className="user-avatar">JS</div>
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
      case 'doctors':
        return <DoctorsPage />;
      case 'records':
        return <RecordsPage />;
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
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : (
          renderCurrentPage()
        )}
      </main>

      <BookingFormModal />
      <EditAppointmentModal />
    </div>
  );
};

const MainApp = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData, userToken) => {
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setToken(userToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  if (!user) return <Homepage onLogin={handleLogin} />;
  if (user.role === 'doctor') return <DoctorPortal user={user} onLogout={handleLogout} />;
  return <PatientPortal user={user} onLogout={handleLogout} />;
};

export default MainApp;