const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  }
});

const PORT = process.env.PORT || 5000;

// Validate JWT_SECRET exists
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('ERROR: JWT_SECRET environment variable is required');
  process.exit(1);
}

// Enhanced CORS configuration
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Security middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Handle preflight requests
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// MySQL connection pool with enhanced configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST || '192.168.75.101',
  user: process.env.DB_USER || 'ctos',
  password: process.env.DB_PASSWORD || 'gameclub11',
  database: process.env.DB_NAME || 'medschedule',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.on('error', (err) => {
  console.error('MySQL pool error:', err);
});

// Database initialization
async function initializeDatabase() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Create tables if they don't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('patient', 'doctor', 'admin') DEFAULT 'patient',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        phone VARCHAR(20),
        date_of_birth DATE,
        emergency_contact VARCHAR(255),
        blood_type VARCHAR(10),
        insurance_provider VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        doctor_id INT,
        patient_name VARCHAR(255) NOT NULL,
        doctor_name VARCHAR(255) NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        appointment_type VARCHAR(255) NOT NULL,
        status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS doctors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        doctor_id VARCHAR(20) UNIQUE,
        name VARCHAR(255) NOT NULL,
        specialty VARCHAR(255) NOT NULL,
        available BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    try {
      await connection.execute('SELECT doctor_id FROM doctors LIMIT 1');
    } catch (err) {
      if (err.code === 'ER_BAD_FIELD_ERROR') {
        console.log('Adding doctor_id column to doctors table');
        await connection.execute('ALTER TABLE doctors ADD COLUMN doctor_id VARCHAR(20) UNIQUE AFTER user_id');
      }
    }

    const [doctors] = await connection.execute('SELECT COUNT(*) as count FROM doctors');
    if (doctors[0].count === 0) {
      const sampleDoctors = [
        [null, 'DOC001', 'Dr. Johnson', 'General Practice', true],
        [null, 'DOC002', 'Dr. Lee', 'Cardiology', true],
        [null, 'DOC003', 'Dr. Brown', 'Dermatology', false],
        [null, 'DOC004', 'Dr. Davis', 'Orthopedics', true]
      ];
      for (const doctor of sampleDoctors) {
        await connection.execute(
          'INSERT INTO doctors (user_id, doctor_id, name, specialty, available) VALUES (?, ?, ?, ?, ?)',
          doctor
        );
      }
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  } finally {
    if (connection) connection.release();
  }
}

// Modern JWT authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    
    if (!token) throw new Error('Access token required');
    
    const user = await new Promise((resolve, reject) => {
      jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) reject(new Error('Invalid or expired token'));
        resolve(user);
      });
    });
    
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

// Socket.IO logic for broadcasting updates
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Helper to emit to all clients
function broadcastAppointmentsChange() {
  io.emit('appointments:update');
}

// API Routes

// User registration
app.post('/api/register', async (req, res, next) => {
  try {
    const { name, email, password, role = 'patient' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const connection = await pool.getConnection();
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      connection.release();
      return res.status(409).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await connection.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    // Create empty profile for new user
    await connection.execute(
      'INSERT INTO profiles (user_id) VALUES (?)',
      [result.insertId]
    );

    connection.release();

    const token = jwt.sign(
      { userId: result.insertId, email, name, role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: result.insertId, name, email, role }
    });
  } catch (error) {
    next(error);
  }
});

// Doctor registration with ID verification
app.post('/api/register/doctor', async (req, res, next) => {
  try {
    const { name, email, password, doctorId, specialty } = req.body;

    if (!name || !email || !password || !doctorId || !specialty) {
      return res.status(400).json({ error: 'All fields are required including Doctor ID' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const validDoctorIds = [
      'DOC001', 'DOC002', 'DOC003', 'DOC004', 'DOC005',
      'DOC006', 'DOC007', 'DOC008', 'DOC009', 'DOC010'
    ];

    if (!validDoctorIds.includes(doctorId)) {
      return res.status(400).json({ error: 'Invalid Doctor ID. Please contact administration.' });
    }

    const connection = await pool.getConnection();
    
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      connection.release();
      return res.status(409).json({ error: 'Email already exists' });
    }

    let existingDoctors = [];
    try {
      [existingDoctors] = await connection.execute(
        'SELECT id FROM doctors WHERE doctor_id = ?',
        [doctorId]
      );
    } catch (err) {
      if (err.code === 'ER_BAD_FIELD_ERROR') {
        console.log('doctor_id column not found, will be created during registration');
      } else {
        throw err;
      }
    }

    if (existingDoctors.length > 0) {
      connection.release();
      return res.status(409).json({ error: 'Doctor ID already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [userResult] = await connection.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'doctor']
    );

    // Create empty profile for new doctor
    await connection.execute(
      'INSERT INTO profiles (user_id) VALUES (?)',
      [userResult.insertId]
    );

    const [doctorCheck] = await connection.execute(
      'SELECT id FROM doctors WHERE name = ? AND specialty = ?',
      [name, specialty]
    );

    if (doctorCheck.length > 0) {
      await connection.execute(
        'UPDATE doctors SET user_id = ?, doctor_id = ? WHERE id = ?',
        [userResult.insertId, doctorId, doctorCheck[0].id]
      );
    } else {
      await connection.execute(
        'INSERT INTO doctors (user_id, doctor_id, name, specialty, available) VALUES (?, ?, ?, ?, ?)',
        [userResult.insertId, doctorId, name, specialty, true]
      );
    }

    connection.release();

    const token = jwt.sign(
      { userId: userResult.insertId, email, name, role: 'doctor', doctorId },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Doctor registration successful',
      token,
      user: { id: userResult.insertId, name, email, role: 'doctor', doctorId, specialty }
    });
  } catch (error) {
    next(error);
  }
});

// User login
app.post('/api/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const connection = await pool.getConnection();
    const [users] = await connection.execute(
      'SELECT id, name, email, password, role FROM users WHERE email = ?',
      [email]
    );
    connection.release();

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    next(error);
  }
});

// Get user profile
app.get('/api/user/profile', authenticateToken, async (req, res, next) => {
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.execute(
      `SELECT u.id, u.name, u.email, u.role, 
              p.phone, p.date_of_birth, p.emergency_contact, 
              p.blood_type, p.insurance_provider
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.id = ?`,
      [req.user.userId]
    );
    connection.release();

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    next(error);
  }
});

// Update user profile
app.put('/api/user/profile', authenticateToken, async (req, res, next) => {
  try {
    const { name, email, phone, dateOfBirth, emergencyContact, bloodType, insurance } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const connection = await pool.getConnection();
    
    // Check if email is already taken by another user
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, req.user.userId]
    );

    if (existingUsers.length > 0) {
      connection.release();
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Update user basic info
    const [userResult] = await connection.execute(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, req.user.userId]
    );

    if (userResult.affectedRows === 0) {
      connection.release();
      return res.status(404).json({ error: 'User not found' });
    }

    // Update or insert profile information
    const [profileCheck] = await connection.execute(
      'SELECT id FROM profiles WHERE user_id = ?',
      [req.user.userId]
    );

    if (profileCheck.length > 0) {
      // Update existing profile
      await connection.execute(
        `UPDATE profiles SET 
         phone = ?, date_of_birth = ?, emergency_contact = ?, 
         blood_type = ?, insurance_provider = ?
         WHERE user_id = ?`,
        [phone || null, dateOfBirth || null, emergencyContact || null, 
         bloodType || null, insurance || null, req.user.userId]
      );
    } else {
      // Insert new profile
      await connection.execute(
        `INSERT INTO profiles (user_id, phone, date_of_birth, emergency_contact, blood_type, insurance_provider) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [req.user.userId, phone || null, dateOfBirth || null, emergencyContact || null, 
         bloodType || null, insurance || null]
      );
    }

    connection.release();

    res.json({ 
      message: 'Profile updated successfully',
      user: { 
        id: req.user.userId, 
        name, 
        email, 
        phone, 
        dateOfBirth, 
        emergencyContact, 
        bloodType, 
        insurance 
      }
    });
  } catch (error) {
    next(error);
  }
});

// Delete user account
app.delete('/api/user/delete/:id', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    if (req.user.role !== 'admin' && req.user.userId !== parseInt(userId)) {
      return res.status(403).json({ error: 'Unauthorized to delete this account' });
    }

    const connection = await pool.getConnection();
    
    const [users] = await connection.execute(
      'SELECT id, name FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'User not found' });
    }

    await connection.execute('DELETE FROM users WHERE id = ?', [userId]);
    connection.release();

    res.json({ 
      message: 'User account deleted successfully',
      deletedUser: users[0]
    });
  } catch (error) {
    next(error);
  }
});

// Get all doctors
app.get('/api/doctors', async (req, res, next) => {
  try {
    const connection = await pool.getConnection();
    const [doctors] = await connection.execute(
      'SELECT id, name, specialty, available FROM doctors WHERE available = true'
    );
    connection.release();
    res.json(doctors);
  } catch (error) {
    next(error);
  }
});

// Create appointment
app.post('/api/appointments', authenticateToken, async (req, res, next) => {
  try {
    const { doctor_id, doctor_name, appointment_date, appointment_time, appointment_type } = req.body;
    
    if (!doctor_id || !doctor_name || !appointment_date || !appointment_time || !appointment_type) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      `INSERT INTO appointments (patient_id, doctor_id, patient_name, doctor_name, 
       appointment_date, appointment_time, appointment_type) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.userId, doctor_id, req.user.name, doctor_name, appointment_date, appointment_time, appointment_type]
    );
    connection.release();

    res.status(201).json({
      message: 'Appointment created successfully',
      appointmentId: result.insertId
    });
    broadcastAppointmentsChange();
  } catch (error) {
    next(error);
  }
});


// Get user appointments with better error handling
app.get('/api/appointments', authenticateToken, async (req, res, next) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [appointments] = await connection.execute(
      `SELECT id, doctor_name, appointment_date, appointment_time, 
       appointment_type, status FROM appointments WHERE patient_id = ? 
       ORDER BY appointment_date DESC, appointment_time DESC`,
      [req.user.userId]
    );
    res.json(appointments);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  } finally {
    if (connection) connection.release();
  }
});

// Get doctor's appointments
app.get('/api/doctor/appointments', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Doctor access required' });
    }

    const connection = await pool.getConnection();
    const [appointments] = await connection.execute(
      `SELECT a.*, u.email as patient_email 
       FROM appointments a 
       JOIN users u ON a.patient_id = u.id 
       WHERE a.doctor_name = ?
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [req.user.name]
    );
    connection.release();
    res.json(appointments);
  } catch (error) {
    next(error);
  }
});

// Update appointment status with proper parameterization
app.put('/api/appointments/:id/status', authenticateToken, async (req, res, next) => {
  let connection;
  try {
    const { status } = req.body;
    const appointmentId = req.params.id;
    
    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    connection = await pool.getConnection();
    const [result] = await connection.execute(
      'UPDATE appointments SET status = ? WHERE id = ? AND patient_id = ?',
      [status, appointmentId, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Appointment not found or unauthorized' });
    }

    res.json({ message: 'Appointment status updated successfully' });
    broadcastAppointmentsChange();
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  } finally {
    if (connection) connection.release();
  }
});

// Update appointment status (doctor)
app.put('/api/doctor/appointments/:id/status', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Doctor access required' });
    }

    const { status } = req.body;
    const appointmentId = req.params.id;
    
    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'UPDATE appointments SET status = ? WHERE id = ? AND doctor_name = ?',
      [status, appointmentId, req.user.name]
    );
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ message: 'Appointment status updated successfully' });
    broadcastAppointmentsChange();
  } catch (error) {
    next(error);
  }
});

// Admin route to get all users
app.get('/api/admin/users', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const connection = await pool.getConnection();
    const [users] = await connection.execute(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    connection.release();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Admin route to get all appointments
app.get('/api/admin/appointments', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const connection = await pool.getConnection();
    const [appointments] = await connection.execute(
      `SELECT a.*, u.email as patient_email 
       FROM appointments a 
       JOIN users u ON a.patient_id = u.id 
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`
    );
    connection.release();
    res.json(appointments);
  } catch (error) {
    next(error);
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get appointment details by ID
app.get('/api/appointments/:id', authenticateToken, async (req, res, next) => {
  try {
    const appointmentId = req.params.id;
    const connection = await pool.getConnection();
    const [appointments] = await connection.execute(
      `SELECT a.*, u.email as patient_email 
       FROM appointments a 
       JOIN users u ON a.patient_id = u.id 
       WHERE a.id = ?`,
      [appointmentId]
    );
    connection.release();

    if (appointments.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(appointments[0]);
  } catch (error) {
    next(error);
  }
});

// Delete appointments
app.delete('/api/appointments/:id', authenticateToken, async (req, res, next) => {
  try {
    const appointmentId = req.params.id;
    const connection = await pool.getConnection();
    
    const [appointments] = await connection.execute(
      'SELECT patient_id FROM appointments WHERE id = ?',
      [appointmentId]
    );
    
    if (appointments.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    if (appointments[0].patient_id !== req.user.userId) {
      connection.release();
      return res.status(403).json({ error: 'Unauthorized to delete this appointment' });
    }

    await connection.execute('DELETE FROM appointments WHERE id = ?', [appointmentId]);
    connection.release();

    res.json({ message: 'Appointment deleted successfully' });
    broadcastAppointmentsChange();
  } catch (error) {
    next(error);
  }
});

// Update appointments
app.put('/api/appointments/:id', authenticateToken, async (req, res, next) => {
  try {
    const { date, time, type } = req.body;
    const appointmentId = req.params.id;
    
    const connection = await pool.getConnection();
    
    const [appointments] = await connection.execute(
      'SELECT patient_id FROM appointments WHERE id = ?',
      [appointmentId]
    );
    
    if (appointments.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    if (appointments[0].patient_id !== req.user.userId) {
      connection.release();
      return res.status(403).json({ error: 'Unauthorized to update this appointment' });
    }

    await connection.execute(
      'UPDATE appointments SET appointment_date = ?, appointment_time = ?, appointment_type = ? WHERE id = ?',
      [date, time, type, appointmentId]
    );
    connection.release();

    res.json({ message: 'Appointment updated successfully' });
    broadcastAppointmentsChange();
  } catch (error) {
    next(error);
  }
});

// Central error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server with Socket.IO
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initializeDatabase();
});

module.exports = app;