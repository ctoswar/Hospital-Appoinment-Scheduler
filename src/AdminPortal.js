import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Calendar,
  Shield,
  Search,
  Plus,
  LogOut,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import './styles/AdminPortal.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminPortal = ({ onLogout, user }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Data states
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    pendingAppointments: 0
  });

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    doctorId: '',
    name: '',
    specialty: '',
    available: true,
    email: '',
    phone: '',
    dateOfBirth: '',
    emergencyContact: '',
    bloodType: '',
    insurance: ''
  });

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch all data
      const [usersRes, appointmentsRes, doctorsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/users`, { headers }),
        fetch(`${API_BASE_URL}/admin/appointments`, { headers }),
        fetch(`${API_BASE_URL}/doctors`, { headers })
      ]);

      if (!usersRes.ok || !appointmentsRes.ok || !doctorsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const users = await usersRes.json();
      const appointments = await appointmentsRes.json();
      const doctorsList = await doctorsRes.json();

      setPatients(users.filter(user => user.role === 'patient'));
      setDoctors(doctorsList);
      setAppointments(appointments);

      // Calculate stats
      setStats({
        totalPatients: users.filter(user => user.role === 'patient').length,
        totalDoctors: doctorsList.length,
        totalAppointments: appointments.length,
        pendingAppointments: appointments.filter(apt => apt.status === 'pending').length
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setShowModal(true);
    setError('');
    setSuccess('');

    if (item) {
      setFormData(item);
    } else {
      setFormData({
        doctorId: '',
        name: '',
        specialty: '',
        available: true,
        email: '',
        phone: '',
        dateOfBirth: '',
        emergencyContact: '',
        bloodType: '',
        insurance: ''
      });
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setFormData({
      doctorId: '',
      name: '',
      specialty: '',
      available: true,
      email: '',
      phone: '',
      dateOfBirth: '',
      emergencyContact: '',
      bloodType: '',
      insurance: ''
    });
    setError('');
    setSuccess('');
  };

  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const endpoint = selectedItem 
        ? `${API_BASE_URL}/admin/doctors/${selectedItem.id}`
        : `${API_BASE_URL}/admin/doctors`;

      const response = await fetch(endpoint, {
        method: selectedItem ? 'PUT' : 'POST',
        headers,
        body: JSON.stringify({
          doctorId: formData.doctorId,
          name: formData.name,
          specialty: formData.specialty,
          available: formData.available
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save doctor');
      }

      setSuccess(selectedItem ? 'Doctor updated successfully' : 'Doctor added successfully');
      fetchDashboardData();
      setTimeout(() => closeModal(), 2000);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/doctors/${doctorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete doctor');
      }

      setSuccess('Doctor deleted successfully');
      fetchDashboardData();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/patients/${selectedItem.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          emergencyContact: formData.emergencyContact,
          bloodType: formData.bloodType,
          insurance: formData.insurance
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update patient');
      }

      setSuccess('Patient updated successfully');
      fetchDashboardData();
      setTimeout(() => closeModal(), 2000);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDoctors = doctors.filter(doctor => 
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.doctor_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-portal">
      <div className="admin-sidebar">
        <div className="admin-logo">
          <Shield size={32} />
          <span>Admin Portal</span>
        </div>
        
        <nav className="admin-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Settings size={20} />
            Dashboard
          </button>
          <button 
            className={`nav-item ${activeTab === 'doctors' ? 'active' : ''}`}
            onClick={() => setActiveTab('doctors')}
          >
            <UserPlus size={20} />
            Manage Doctors
          </button>
          <button 
            className={`nav-item ${activeTab === 'patients' ? 'active' : ''}`}
            onClick={() => setActiveTab('patients')}
          >
            <Users size={20} />
            Manage Patients
          </button>
          <button 
            className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            <Calendar size={20} />
            Appointments
          </button>
        </nav>

        <div className="admin-user-info">
          <div className="user-details">
            <strong>{user?.name}</strong>
            <span>Administrator</span>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-header">
          <h1>
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'doctors' && 'Manage Doctors'}
            {activeTab === 'patients' && 'Manage Patients'}
            {activeTab === 'appointments' && 'Appointments'}
          </h1>
          
          {(activeTab === 'doctors' || activeTab === 'patients') && (
            <div className="admin-actions">
              <div className="search-box">
                <Search size={20} />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {activeTab === 'doctors' && (
                <button 
                  className="add-btn"
                  onClick={() => openModal('add-doctor')}
                >
                  <Plus size={20} />
                  Add Doctor
                </button>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <CheckCircle size={20} />
            {success}
          </div>
        )}

        <div className="admin-main">
          {activeTab === 'dashboard' && (
            <div className="dashboard">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <Users size={24} />
                  </div>
                  <div className="stat-info">
                    <h3>{stats.totalPatients}</h3>
                    <p>Total Patients</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <UserPlus size={24} />
                  </div>
                  <div className="stat-info">
                    <h3>{stats.totalDoctors}</h3>
                    <p>Total Doctors</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <Calendar size={24} />
                  </div>
                  <div className="stat-info">
                    <h3>{stats.totalAppointments}</h3>
                    <p>Total Appointments</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <AlertCircle size={24} />
                  </div>
                  <div className="stat-info">
                    <h3>{stats.pendingAppointments}</h3>
                    <p>Pending Appointments</p>
                  </div>
                </div>
              </div>

              <div className="recent-activities">
                <h2>Recent Appointments</h2>
                <div className="activities-list">
                  {appointments.slice(0, 5).map(appointment => (
                    <div key={appointment.id} className="activity-item">
                      <div className="activity-info">
                        <strong>{appointment.patient_name}</strong>
                        <span>with {appointment.doctor_name}</span>
                      </div>
                      <div className="activity-meta">
                        <span className={`status ${appointment.status}`}>
                          {appointment.status}
                        </span>
                        <span>{new Date(appointment.appointment_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'doctors' && (
            <div className="doctors-management">
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Doctor ID</th>
                      <th>Name</th>
                      <th>Specialty</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDoctors.map(doctor => (
                      <tr key={doctor.id}>
                        <td>{doctor.doctor_id || 'N/A'}</td>
                        <td>{doctor.name}</td>
                        <td>{doctor.specialty}</td>
                        <td>
                          <span className={`status ${doctor.available ? 'available' : 'unavailable'}`}>
                            {doctor.available ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="edit-btn"
                              onClick={() => openModal('edit-doctor', doctor)}
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              className="delete-btn"
                              onClick={() => handleDeleteDoctor(doctor.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'patients' && (
            <div className="patients-management">
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map(patient => (
                      <tr key={patient.id}>
                        <td>{patient.name}</td>
                        <td>{patient.email}</td>
                        <td>{patient.role}</td>
                        <td>{new Date(patient.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="edit-btn"
                              onClick={() => openModal('edit-patient', patient)}
                            >
                              <Edit size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="appointments-management">
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map(appointment => (
                      <tr key={appointment.id}>
                        <td>{appointment.patient_name}</td>
                        <td>{appointment.doctor_name}</td>
                        <td>{new Date(appointment.appointment_date).toLocaleDateString()}</td>
                        <td>{appointment.appointment_time}</td>
                        <td>{appointment.appointment_type}</td>
                        <td>
                          <span className={`status ${appointment.status}`}>
                            {appointment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modalType === 'add-doctor' && 'Add New Doctor'}
                {modalType === 'edit-doctor' && 'Edit Doctor'}
                {modalType === 'edit-patient' && 'Edit Patient'}
              </h3>
              <button className="close-btn" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={modalType.includes('doctor') ? handleDoctorSubmit : handlePatientUpdate}>
              <div className="modal-body">
                {modalType.includes('doctor') && (
                  <>
                    <div className="form-group">
                      <label>Doctor ID</label>
                      <input
                        type="text"
                        name="doctorId"
                        value={formData.doctorId}
                        onChange={handleInputChange}
                        placeholder="e.g., DOC011"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Specialty</label>
                      <select
                        name="specialty"
                        value={formData.specialty}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Specialty</option>
                        <option value="General Practice">General Practice</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Dermatology">Dermatology</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Psychiatry">Psychiatry</option>
                        <option value="Surgery">Surgery</option>
                        <option value="Emergency Medicine">Emergency Medicine</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="available"
                          checked={formData.available}
                          onChange={handleInputChange}
                        />
                        Available for appointments
                      </label>
                    </div>
                  </>
                )}

                {modalType === 'edit-patient' && (
                  <>
                    <div className="form-group">
                      <label>Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Date of Birth</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Emergency Contact</label>
                      <input
                        type="text"
                        name="emergencyContact"
                        value={formData.emergencyContact || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Blood Type</label>
                      <select
                        name="bloodType"
                        value={formData.bloodType || ''}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Blood Type</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Insurance Provider</label>
                      <input
                        type="text"
                        name="insurance"
                        value={formData.insurance || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;