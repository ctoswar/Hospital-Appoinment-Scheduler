const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
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
  optionsSuccessStatus: 200
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
        name VARCHAR(255) NOT NULL,
        specialty VARCHAR(255) NOT NULL,
        available BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    const [doctors] = await connection.execute('SELECT COUNT(*) as count FROM doctors');
    if (doctors[0].count === 0) {
      const sampleDoctors = [
        ['Dr. Johnson', 'General Practice', true],
        ['Dr. Lee', 'Cardiology', true],
        ['Dr. Brown', 'Dermatology', false],
        ['Dr. Davis', 'Orthopedics', true]
      ];
      for (const doctor of sampleDoctors) {
        await connection.execute(
          'INSERT INTO doctors (name, specialty, available) VALUES (?, ?, ?)',
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

// API Routes with improved error handling

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
      'SELECT id, name, email, role FROM users WHERE id = ?',
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

// Delete user account
app.delete('/api/user/delete/:id', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // Check if user has permission (admin or deleting own account)
    if (req.user.role !== 'admin' && req.user.userId !== parseInt(userId)) {
      return res.status(403).json({ error: 'Unauthorized to delete this account' });
    }

    const connection = await pool.getConnection();
    
    // Check if user exists
    const [users] = await connection.execute(
      'SELECT id, name FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user (appointments will be cascade deleted due to foreign key)
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
  } catch (error) {
    next(error);
  }
});

// Get user appointments
app.get('/api/appointments', authenticateToken, async (req, res, next) => {
  try {
    const connection = await pool.getConnection();
    const [appointments] = await connection.execute(
      `SELECT id, doctor_name, appointment_date, appointment_time, 
       appointment_type, status FROM appointments WHERE patient_id = ? 
       ORDER BY appointment_date DESC, appointment_time DESC`,
      [req.user.userId]
    );
    connection.release();
    res.json(appointments);
  } catch (error) {
    next(error);
  }
});

// Update appointment status
app.put('/api/appointments/:id/status', authenticateToken, async (req, res, next) => {
  try {
    const { status } = req.body;
    const appointmentId = req.params.id;
    
    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'UPDATE appointments SET status = ? WHERE id = ? AND patient_id = ?',
      [status, appointmentId, req.user.userId]
    );
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ message: 'Appointment status updated successfully' });
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

// Central error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initializeDatabase();
});

module.exports = app;