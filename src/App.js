import React, { useState } from 'react';
import { Calendar, Clock, User, Stethoscope, Home, Plus, Edit, Trash2 } from 'lucide-react';
import './css/styles.css';

const AppointmentScheduler = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      patientName: 'John Smith',
      doctorName: 'Dr. Johnson',
      date: '2025-06-25',
      time: '10:00',
      type: 'General Checkup',
      status: 'confirmed'
    },
    {
      id: 2,
      patientName: 'Sarah Wilson',
      doctorName: 'Dr. Lee',
      date: '2025-06-26',
      time: '14:30',
      type: 'Cardiology',
      status: 'pending'
    }
  ]);

  const [doctors] = useState([
    { id: 1, name: 'Dr. Johnson', specialty: 'General Practice', available: true },
    { id: 2, name: 'Dr. Lee', specialty: 'Cardiology', available: true },
    { id: 3, name: 'Dr. Brown', specialty: 'Dermatology', available: false },
    { id: 4, name: 'Dr. Davis', specialty: 'Orthopedics', available: true }
  ]);

  const [editingAppointment, setEditingAppointment] = useState(null);

  const addAppointment = (appointmentData) => {
    const newAppointment = {
      id: appointments.length + 1,
      ...appointmentData,
      status: 'pending'
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

  const Navigation = () => (
    <nav className="nav">
      <div className="container nav-container">
        <h1 className="nav-title">
          <Stethoscope size={32} />
          MedSchedule
        </h1>
        <div className="nav-buttons">
          <button
            onClick={() => setCurrentPage('home')}
            className={`nav-button ${currentPage === 'home' ? 'active' : ''}`}
          >
            <Home size={16} />
            Home
          </button>
          <button
            onClick={() => setCurrentPage('patient')}
            className={`nav-button ${currentPage === 'patient' ? 'active' : ''}`}
          >
            <User size={16} />
            Patient Portal
          </button>
          <button
            onClick={() => setCurrentPage('doctor')}
            className={`nav-button ${currentPage === 'doctor' ? 'active' : ''}`}
          >
            <Stethoscope size={16} />
            Doctor Portal
          </button>
        </div>
      </div>
    </nav>
  );

  const HomePage = () => (
    <div className="home-bg">
      <div className="container home-container">
        <div className="home-header">
          <h2 className="home-title">
            Welcome to MedSchedule
          </h2>
          <p className="home-subtitle">
            Streamline your medical appointments with our easy-to-use scheduling system
          </p>
        </div>

        <div className="portal-grid">
          <div className="portal-card">
            <div>
              <User className="portal-icon patient" size={64} />
              <h3 className="portal-title">Patient Portal</h3>
              <p className="portal-description">
                Book appointments, view your schedule, and manage your healthcare visits
              </p>
              <button
                onClick={() => setCurrentPage('patient')}
                className="portal-button patient"
              >
                Access Patient Portal
              </button>
            </div>
          </div>

          <div className="portal-card">
            <div>
              <Stethoscope className="portal-icon doctor" size={64} />
              <h3 className="portal-title">Doctor Portal</h3>
              <p className="portal-description">
                Manage your schedule, view patient appointments, and update availability
              </p>
              <button
                onClick={() => setCurrentPage('doctor')}
                className="portal-button doctor"
              >
                Access Doctor Portal
              </button>
            </div>
          </div>
        </div>

        <div className="overview-card">
          <h3 className="overview-title">Today's Overview</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <Calendar className="stat-icon blue" size={48} />
              <h4 className="stat-title">Total Appointments</h4>
              <p className="stat-value blue">{appointments.length}</p>
            </div>
            <div className="stat-item">
              <Clock className="stat-icon green" size={48} />
              <h4 className="stat-title">Confirmed</h4>
              <p className="stat-value green">
                {appointments.filter(apt => apt.status === 'confirmed').length}
              </p>
            </div>
            <div className="stat-item">
              <User className="stat-icon orange" size={48} />
              <h4 className="stat-title">Pending</h4>
              <p className="stat-value orange">
                {appointments.filter(apt => apt.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const PatientPortal = () => {
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [bookingData, setBookingData] = useState({
      patientName: '',
      doctorName: '',
      date: '',
      time: '',
      type: ''
    });

    const handleBooking = () => {
      if (bookingData.patientName && bookingData.doctorName && bookingData.date && bookingData.time && bookingData.type) {
        addAppointment(bookingData);
        setBookingData({ patientName: '', doctorName: '', date: '', time: '', type: '' });
        setShowBookingForm(false);
      }
    };

    return (
      <div className="portal-bg">
        <div className="container">
          <div className="portal-header">
            <h2 className="portal-page-title">Patient Portal</h2>
            <p className="portal-page-subtitle">Book and manage your medical appointments</p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <button
              onClick={() => setShowBookingForm(!showBookingForm)}
              className="btn btn-primary"
            >
              <Plus size={20} />
              Book New Appointment
            </button>
          </div>

          {showBookingForm && (
            <div className="card">
              <div className="card-body">
                <h3 className="card-title" style={{ color: '#1f2937', marginBottom: '1rem' }}>Book New Appointment</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      Patient Name
                    </label>
                    <input
                      type="text"
                      required
                      value={bookingData.patientName}
                      onChange={(e) => setBookingData({...bookingData, patientName: e.target.value})}
                      className="form-input"
                      placeholder="Enter patient name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Doctor
                    </label>
                    <select
                      required
                      value={bookingData.doctorName}
                      onChange={(e) => setBookingData({...bookingData, doctorName: e.target.value})}
                      className="form-select"
                    >
                      <option value="">Select a doctor</option>
                      {doctors.filter(doc => doc.available).map(doctor => (
                        <option key={doctor.id} value={doctor.name}>
                          {doctor.name} - {doctor.specialty}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      value={bookingData.date}
                      onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                      className="form-input"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Time
                    </label>
                    <input
                      type="time"
                      required
                      value={bookingData.time}
                      onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">
                      Appointment Type
                    </label>
                    <input
                      type="text"
                      required
                      value={bookingData.type}
                      onChange={(e) => setBookingData({...bookingData, type: e.target.value})}
                      className="form-input"
                      placeholder="e.g., General Checkup, Consultation"
                    />
                  </div>
                  <div className="form-buttons" style={{ gridColumn: '1 / -1' }}>
                    <button
                      onClick={handleBooking}
                      className="btn btn-primary"
                    >
                      Book Appointment
                    </button>
                    <button
                      onClick={() => setShowBookingForm(false)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header primary">
              <h3 className="card-title">Your Appointments</h3>
            </div>
            <div className="card-body">
              {appointments.length === 0 ? (
                <p className="empty-state">No appointments scheduled</p>
              ) : (
                <div className="appointments-list">
                  {appointments.map(appointment => (
                    <div key={appointment.id} className="appointment-card">
                      <div className="appointment-header">
                        <div className="appointment-info">
                          <h4 className="appointment-patient">{appointment.patientName}</h4>
                          <p className="appointment-doctor">Dr: {appointment.doctorName}</p>
                          <p className="appointment-type">Type: {appointment.type}</p>
                          <div className="appointment-details">
                            <span className="appointment-detail">
                              <Calendar size={16} />
                              {appointment.date}
                            </span>
                            <span className="appointment-detail">
                              <Clock size={16} />
                              {appointment.time}
                            </span>
                          </div>
                        </div>
                        <div className="appointment-actions">
                          <span className={`status-badge ${appointment.status}`}>
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DoctorPortal = () => {
    const handleStatusChange = (appointmentId, newStatus) => {
      setAppointments(appointments.map(apt => 
        apt.id === appointmentId ? {...apt, status: newStatus} : apt
      ));
    };

    const handleEdit = (appointment) => {
      setEditingAppointment(appointment);
    };

    const handleUpdate = () => {
      if (editingAppointment.patientName && editingAppointment.date && editingAppointment.time) {
        updateAppointment(editingAppointment);
      }
    };

    return (
      <div className="portal-bg">
        <div className="container">
          <div className="portal-header">
            <h2 className="portal-page-title">Doctor Portal</h2>
            <p className="portal-page-subtitle">Manage appointments and schedules</p>
          </div>

          <div className="doctor-grid">
            <div>
              <div className="card">
                <div className="card-header success">
                  <h3 className="card-title">Appointment Management</h3>
                </div>
                <div className="card-body">
                  {appointments.length === 0 ? (
                    <p className="empty-state">No appointments to manage</p>
                  ) : (
                    <div className="appointments-list">
                      {appointments.map(appointment => (
                        <div key={appointment.id} className="appointment-card">
                          <div className="appointment-header">
                            <div className="appointment-info">
                              <h4 className="appointment-patient">{appointment.patientName}</h4>
                              <p className="appointment-doctor">Dr: {appointment.doctorName}</p>
                              <p className="appointment-type">Type: {appointment.type}</p>
                              <div className="appointment-details">
                                <span className="appointment-detail">
                                  <Calendar size={16} />
                                  {appointment.date}
                                </span>
                                <span className="appointment-detail">
                                  <Clock size={16} />
                                  {appointment.time}
                                </span>
                              </div>
                            </div>
                            <div className="appointment-actions">
                              <select
                                value={appointment.status}
                                onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
                                className="form-select"
                                style={{ width: 'auto', fontSize: '0.875rem' }}
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                              <button
                                onClick={() => handleEdit(appointment)}
                                className="action-btn edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => deleteAppointment(appointment.id)}
                                className="action-btn delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="card">
                <div className="card-header success">
                  <h3 className="card-title">Available Doctors</h3>
                </div>
                <div className="card-body">
                  <div className="doctors-list">
                    {doctors.map(doctor => (
                      <div key={doctor.id} className="doctor-item">
                        <div className="doctor-info">
                          <h4>{doctor.name}</h4>
                          <p>{doctor.specialty}</p>
                        </div>
                        <span className={`status-badge ${doctor.available ? 'available' : 'busy'}`}>
                          {doctor.available ? 'Available' : 'Busy'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header success">
                  <h3 className="card-title">Quick Stats</h3>
                </div>
                <div className="card-body">
                  <div className="stats-list">
                    <div className="stat-row">
                      <span>Total Appointments:</span>
                      <span>{appointments.length}</span>
                    </div>
                    <div className="stat-row">
                      <span>Confirmed:</span>
                      <span className="green">
                        {appointments.filter(apt => apt.status === 'confirmed').length}
                      </span>
                    </div>
                    <div className="stat-row">
                      <span>Pending:</span>
                      <span className="yellow">
                        {appointments.filter(apt => apt.status === 'pending').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {editingAppointment && (
            <div className="modal-overlay">
              <div className="modal">
                <h3 className="modal-title">Edit Appointment</h3>
                <div className="modal-form">
                  <div className="form-group">
                    <label className="form-label">
                      Patient Name
                    </label>
                    <input
                      type="text"
                      value={editingAppointment.patientName}
                      onChange={(e) => setEditingAppointment({...editingAppointment, patientName: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Date
                    </label>
                    <input
                      type="date"
                      value={editingAppointment.date}
                      onChange={(e) => setEditingAppointment({...editingAppointment, date: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Time
                    </label>
                    <input
                      type="time"
                      value={editingAppointment.time}
                      onChange={(e) => setEditingAppointment({...editingAppointment, time: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-buttons">
                    <button
                      onClick={handleUpdate}
                      className="btn btn-success"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => setEditingAppointment(null)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      {currentPage === 'home' && <HomePage />}
      {currentPage === 'patient' && <PatientPortal />}
      {currentPage === 'doctor' && <DoctorPortal />}
    </div>
  );
};

export default AppointmentScheduler;