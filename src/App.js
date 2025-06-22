import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  Plus, 
  Edit, 
  Trash2, 
  Heart,
  Activity,
  FileText,
  Bell,
  Settings,
  Search,
  Filter,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Star,
  X
} from 'lucide-react';

const PatientPortal = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      patientName: 'John Smith',
      doctorName: 'Dr. Sarah Johnson',
      date: '2025-06-25',
      time: '10:00',
      type: 'General Checkup',
      status: 'confirmed',
      location: 'Main Clinic - Room 102',
      avatar: '👨‍⚕️'
    },
    {
      id: 2,
      patientName: 'John Smith',
      doctorName: 'Dr. Michael Lee',
      date: '2025-06-28',
      time: '14:30',
      type: 'Cardiology Consultation',
      status: 'pending',
      location: 'Cardiology Wing - Room 205',
      avatar: '🩺'
    },
    {
      id: 3,
      patientName: 'John Smith',
      doctorName: 'Dr. Emily Brown',
      date: '2025-07-02',
      time: '09:15',
      type: 'Follow-up Visit',
      status: 'confirmed',
      location: 'Main Clinic - Room 108',
      avatar: '👩‍⚕️'
    }
  ]);

  const [doctors] = useState([
    { 
      id: 1, 
      name: 'Dr. Sarah Johnson', 
      specialty: 'General Practice', 
      available: true, 
      rating: 4.9,
      image: '👩‍⚕️',
      nextAvailable: '2025-06-24'
    },
    { 
      id: 2, 
      name: 'Dr. Michael Lee', 
      specialty: 'Cardiology', 
      available: true, 
      rating: 4.8,
      image: '👨‍⚕️',
      nextAvailable: '2025-06-25'
    },
    { 
      id: 3, 
      name: 'Dr. Emily Brown', 
      specialty: 'Dermatology', 
      available: true, 
      rating: 4.9,
      image: '👩‍⚕️',
      nextAvailable: '2025-06-26'
    },
    { 
      id: 4, 
      name: 'Dr. James Davis', 
      specialty: 'Orthopedics', 
      available: false, 
      rating: 4.7,
      image: '👨‍⚕️',
      nextAvailable: '2025-07-01'
    }
  ]);

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [bookingData, setBookingData] = useState({
    patientName: 'John Smith',
    doctorName: '',
    date: '',
    time: '',
    type: ''
  });

  const addAppointment = (appointmentData) => {
    const newAppointment = {
      id: appointments.length + 1,
      ...appointmentData,
      status: 'pending',
      location: 'Main Clinic - TBD',
      avatar: '📅'
    };
    setAppointments([...appointments, newAppointment]);
  };

  const updateAppointment = (updatedAppointment) => {
    setAppointments(appointments.map(apt => 
      apt.id === updatedAppointment.id ? updatedAppointment : apt
    ));
    setEditingAppointment(null);
  };

  const deleteAppointment = (id) => {
    setAppointments(appointments.filter(apt => apt.id !== id));
  };

  const handleBooking = () => {
    if (bookingData.patientName && bookingData.doctorName && bookingData.date && bookingData.time && bookingData.type) {
      addAppointment(bookingData);
      setBookingData({ 
        patientName: 'John Smith', 
        doctorName: '', 
        date: '', 
        time: '', 
        type: '' 
      });
      setShowBookingForm(false);
    }
  };

  const handleEditSave = () => {
    if (editingAppointment) {
      updateAppointment(editingAppointment);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || apt.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const upcomingAppointments = appointments.filter(apt => {
    const appointmentDate = new Date(apt.date);
    const today = new Date();
    return appointmentDate >= today && apt.status !== 'cancelled';
  }).slice(0, 3);

  const Navigation = () => (
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
          <button className="navbar-btn">
            <Settings size={20} />
          </button>
          <div className="user-avatar">JS</div>
        </div>
      </div>
    </nav>
  );

  const Sidebar = () => (
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

  // Main render function
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
    <>
      <style>
        {`
          /* Modern Patient Portal CSS */

          /* Global Styles & Variables */
          :root {
            --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            --success-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            --warning-gradient: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
            --danger-gradient: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
            
            --glass-bg: rgba(255, 255, 255, 0.08);
            --glass-border: rgba(255, 255, 255, 0.18);
            --dark-glass-bg: rgba(0, 0, 0, 0.05);
            --dark-glass-border: rgba(0, 0, 0, 0.1);
            
            --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);
            --shadow-md: 0 8px 30px rgba(0, 0, 0, 0.08);
            --shadow-lg: 0 20px 60px rgba(0, 0, 0, 0.12);
            --shadow-xl: 0 30px 80px rgba(0, 0, 0, 0.16);
            
            --blur-sm: blur(8px);
            --blur-md: blur(16px);
            --blur-lg: blur(24px);
          }

          /* Base Styles */
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            overflow-x: hidden;
          }

          /* Navigation Bar */
          .navbar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 100;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: var(--blur-lg);
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .navbar::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(90deg, 
              rgba(102, 126, 234, 0.1) 0%, 
              rgba(118, 75, 162, 0.1) 50%, 
              rgba(102, 126, 234, 0.1) 100%);
          }

          .navbar-content {
            position: relative;
            z-index: 2;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 4rem;
          }

          .logo-container {
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }

          .logo-icon {
            width: 2.5rem;
            height: 2.5rem;
            background: var(--primary-gradient);
            border-radius: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: var(--shadow-md);
            animation: pulse-glow 2s ease-in-out infinite alternate;
          }

          @keyframes pulse-glow {
            0% { box-shadow: var(--shadow-md); }
            100% { box-shadow: 0 0 30px rgba(102, 126, 234, 0.4); }
          }

          .logo-text {
            font-size: 1.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: -0.02em;
          }

          .logo-subtitle {
            font-size: 0.75rem;
            color: rgba(255, 255, 255, 0.7);
            font-weight: 500;
          }

          .navbar-actions {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .navbar-btn {
            position: relative;
            padding: 0.5rem;
            border: none;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border-radius: 0.5rem;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            backdrop-filter: var(--blur-sm);
          }

          .navbar-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
          }

          .notification-dot {
            position: absolute;
            top: -2px;
            right: -2px;
            width: 0.75rem;
            height: 0.75rem;
            background: var(--danger-gradient);
            border-radius: 50%;
            border: 2px solid white;
            animation: notification-pulse 2s infinite;
          }

          @keyframes notification-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
          }

          .user-avatar {
            width: 2rem;
            height: 2rem;
            background: var(--primary-gradient);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 0.875rem;
            box-shadow: var(--shadow-md);
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .user-avatar:hover {
            transform: scale(1.1);
            box-shadow: var(--shadow-lg);
          }

          /* Sidebar */
          .sidebar {
            position: fixed;
            left: 0;
            top: 4rem;
            bottom: 0;
            width: 16rem;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: var(--blur-md);
            border-right: 1px solid rgba(255, 255, 255, 0.1);
            overflow-y: auto;
            z-index: 50;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .sidebar-content {
            padding: 1.5rem;
          }

          .sidebar-nav {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .sidebar-btn {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            width: 100%;
            padding: 0.875rem 1rem;
            border: none;
            border-radius: 0.875rem;
            cursor: pointer;
            font-weight: 500;
            font-size: 0.9rem;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
          }

          .sidebar-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
            transition: left 0.5s ease;
          }

          .sidebar-btn:hover::before {
            left: 100%;
          }

          .sidebar-btn.active {
            background: var(--primary-gradient);
            color: white;
            box-shadow: var(--shadow-lg);
            transform: translateX(4px);
          }

          .sidebar-btn:not(.active) {
            color: rgba(255, 255, 255, 0.8);
            background: rgba(255, 255, 255, 0.05);
          }

          .sidebar-btn:not(.active):hover {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            transform: translateX(2px);
          }

          /* Main Content */
          .main-content {
            margin-left: 16rem;
            padding-top: 4rem;
            min-height: 100vh;
            background: linear-gradient(135deg, 
              rgba(102, 126, 234, 0.05) 0%, 
              rgba(118, 75, 162, 0.05) 100%);
          }

          .content-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
          }

          /* Cards */
          .card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: var(--blur-sm);
            border-radius: 1.5rem;
            box-shadow: var(--shadow-md);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
            position: relative;
          }

          .card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
          }

          .card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-lg);
          }

          .gradient-card {
            background: var(--primary-gradient);
            color: white;
            position: relative;
            overflow: hidden;
          }

          .gradient-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
            pointer-events: none;
          }

          .gradient-card::after {
            content: '';
            position: absolute;
            bottom: -50%;
            right: -50%;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%);
            pointer-events: none;
          }

          /* Stat Cards */
          .stat-card {
            padding: 1.5rem;
            position: relative;
            overflow: hidden;
          }

          .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background: var(--primary-gradient);
            transform: scaleX(0);
            transition: transform 0.5s ease;
          }

          .stat-card:hover::before {
            transform: scaleX(1);
          }

          .stat-icon {
            width: 3rem;
            height: 3rem;
            border-radius: 0.875rem;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1rem;
            position: relative;
            overflow: hidden;
          }

          .stat-icon::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
            animation: icon-shimmer 3s ease-in-out infinite;
          }

          @keyframes icon-shimmer {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(180deg); }
          }

          .stat-value {
            font-size: 2rem;
            font-weight: 800;
            color: #1a1a1a;
            margin-bottom: 0.25rem;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .stat-label {
            color: #6b7280;
            font-size: 0.875rem;
            font-weight: 500;
          }

          .stat-change {
            font-size: 0.75rem;
            color: #10b981;
            font-weight: 500;
            margin-top: 0.25rem;
          }

          /* Appointment Cards */
          .appointment-card {
            padding: 1.5rem;
            border-left: 4px solid transparent;
            transition: all 0.3s ease;
            position: relative;
          }

          .appointment-card.confirmed {
            border-left-color: #10b981;
          }

          .appointment-card.pending {
            border-left-color: #f59e0b;
          }

          .appointment-card.completed {
            border-left-color: #3b82f6;
          }

          .appointment-card.cancelled {
            border-left-color: #ef4444;
          }

          .appointment-avatar {
            width: 3.5rem;
            height: 3.5rem;
            background: var(--primary-gradient);
            border-radius: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
            box-shadow: var(--shadow-md);
            position: relative;
            overflow: hidden;
          }

          .appointment-avatar::before {
            content: '';
            position: absolute;
            top: -100%;
            left: -100%;
            width: 300%;
            height: 300%;
            background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            animation: avatar-shine 2s ease-in-out infinite;
          }

          @keyframes avatar-shine {
            0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
          }

          /* Status Badges */
          .status-badge {
            padding: 0.5rem 1rem;
            border-radius: 2rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            position: relative;
            overflow: hidden;
          }

          .status-badge::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            transition: left 0.5s ease;
          }

          .status-badge:hover::before {
            left: 100%;
          }

          .status-confirmed {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
          }

          .status-pending {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
            box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
          }

          .status-completed {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: white;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
          }

          .status-cancelled {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
          }

          /* Buttons */
          .btn {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
            font-size: 0.875rem;
          }

          .btn::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            transition: width 0.6s ease, height 0.6s ease;
          }

          .btn:active::before {
            width: 300px;
            height: 300px;
          }

          .btn-primary {
            background: var(--primary-gradient);
            color: white;
            box-shadow: var(--shadow-md);
          }

          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
          }

          .btn-secondary {
            background: rgba(255, 255, 255, 0.9);
            color: #374151;
            border: 1px solid rgba(0, 0, 0, 0.1);
            backdrop-filter: var(--blur-sm);
          }

          .btn-secondary:hover {
            background: rgba(255, 255, 255, 1);
            transform: translateY(-1px);
          }

          .btn-icon {
            padding: 0.5rem;
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            background: rgba(0, 0, 0, 0.05);
            color: #6b7280;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .btn-icon:hover {
            background: rgba(0, 0, 0, 0.1);
            color: #374151;
            transform: scale(1.1);
          }

          /* Form Inputs */
          .form-input {
            width: 100%;
            padding: 0.875rem 1rem;
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-radius: 0.875rem;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: var(--blur-sm);
            font-size: 0.875rem;
            transition: all 0.3s ease;
            position: relative;
          }

          .form-input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            transform: translateY(-1px);
          }

          /* Search Bar */
          .search-container {
            position: relative;
          }

          .search-input {
            padding-left: 2.5rem;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: var(--blur-sm);
          }

          .search-icon {
            position: absolute;
            left: 0.75rem;
            top: 50%;
            transform: translateY(-50%);
            color: #9ca3af;
            pointer-events: none;
          }

          /* Modal */
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: var(--blur-md);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            z-index: 200;
            animation: modal-fade-in 0.3s ease;
          }

          @keyframes modal-fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .modal-content {
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: var(--blur-md);
            border-radius: 1.5rem;
            padding: 2rem;
            width: 100%;
            max-width: 28rem;
            box-shadow: var(--shadow-xl);
            border: 1px solid rgba(255, 255, 255, 0.2);
            animation: modal-scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          @keyframes modal-scale-in {
            from { 
              opacity: 0; 
              transform: scale(0.9) translateY(20px); 
            }
            to { 
              opacity: 1; 
              transform: scale(1) translateY(0); 
            }
          }

          /* Doctor Cards */
          .doctor-card {
            padding: 1.5rem;
            text-align: center;
            position: relative;
            overflow: hidden;
          }

          .doctor-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: var(--primary-gradient);
            transform: scaleX(0);
            transition: transform 0.5s ease;
          }

          .doctor-card:hover::before {
            transform: scaleX(1);
          }

          .doctor-avatar {
            width: 5rem;
            height: 5rem;
            background: var(--primary-gradient);
            border-radius: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            margin: 0 auto 1rem;
            position: relative;
            overflow: hidden;
            box-shadow: var(--shadow-lg);
          }

          .doctor-avatar::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            animation: doctor-shine 3s ease-in-out infinite;
          }

          @keyframes doctor-shine {
            0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
          }

          .rating-stars {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.25rem;
            margin-bottom: 1rem;
          }

          .star-icon {
            color: #fbbf24;
            filter: drop-shadow(0 1px 2px rgba(251, 191, 36, 0.3));
          }

          /* Animations */
          @keyframes fade-in {
            from { 
              opacity: 0; 
              transform: translateY(20px); 
            }
            to { 
              opacity: 1; 
              transform: translateY(0); 
            }
          }

          @keyframes slide-up {
            from { 
              opacity: 0; 
              transform: translateY(30px); 
            }
            to { 
              opacity: 1; 
              transform: translateY(0); 
            }
          }

          @keyframes scale-in {
            from { 
              opacity: 0; 
              transform: scale(0.95); 
            }
            to { 
              opacity: 1; 
              transform: scale(1); 
            }
          }

          .animate-fade-in {
            animation: fade-in 0.6s ease-out forwards;
          }

          .animate-slide-up {
            animation: slide-up 0.6s ease-out forwards;
          }

          .animate-scale-in {
            animation: scale-in 0.3s ease-out forwards;
          }

          /* Grid Layouts */
          .grid-responsive {
            display: grid;
            gap: 1.5rem;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          }

          .grid-stats {
            display: grid;
            gap: 1.5rem;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          }

          /* Hover Effects */
          .hover-lift {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .hover-lift:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-lg);
          }

          /* Scrollbar Styling */
          ::-webkit-scrollbar {
            width: 6px;
          }

          ::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
          }

          ::-webkit-scrollbar-thumb {
            background: var(--primary-gradient);
            border-radius: 10px;
            box-shadow: var(--shadow-sm);
          }

          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #5a6fd8, #6b5b95);
          }

          /* Responsive Design */
          @media (max-width: 1024px) {
            .sidebar {
              transform: translateX(-100%);
            }
            
            .content-container {
              margin-left: 0;
            }
            
            .navbar-content {
              padding: 0 1rem;
            }
          }

          @media (max-width: 768px) {
            .content-container {
              padding: 1rem;
            }
            
            .logo-text {
              font-size: 1.25rem;
            }
            
            .navbar-actions {
              gap: 0.5rem;
            }
            
            .modal-content {
              padding: 1.5rem;
              margin: 1rem;
            }
          }
        `}
      </style>
      <div style={{ minHeight: '100vh' }}>
        <Navigation />
        <Sidebar />
        
        <main style={{ marginLeft: '16rem', paddingTop: '4rem', minHeight: '100vh' }}>
          {renderCurrentPage()}
        </main>

        <BookingFormModal />
        <EditAppointmentModal />
      </div>
    </>
  );
};

export default PatientPortal;
