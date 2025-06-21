const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Validate JWT_SECRET exists
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('ERROR: JWT_SECRET environment variable is required');
  console.error('Please set JWT_SECRET in your .env file or environment variables');
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// MySQL connection configuration
const dbConfig = {
  host: process.env.DB_HOST || '192.168.75.101',
  user: process.env.DB_USER || 'ctos',
  password: process.env.DB_PASSWORD || 'gameclub11',
  database: process.env.DB_NAME || 'medschedule',
  port: process.env.DB_PORT || 3306
};

// Create MySQL connection pool
const pool = mysql.createPool(dbConfig);

// Initialize database tables
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create users table
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

    // Create appointments table
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

    // Create doctors table
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

    // Insert sample doctors if table is empty
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

    connection.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Register new user
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role = 'patient' } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const connection = await pool.getConnection();

    // Check if user already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      connection.release();
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await connection.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    connection.release();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: result.insertId, 
        email: email, 
        name: name, 
        role: role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: result.insertId,
        name,
        email,
        role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const connection = await pool.getConnection();

    // Find user by email
    const [users] = await connection.execute(
      'SELECT id, name, email, password, role FROM users WHERE email = ?',
      [email]
    );

    connection.release();

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [users] = await connection.execute(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.user.userId]
    );

    connection.release();

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all doctors
app.get('/api/doctors', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [doctors] = await connection.execute(
      'SELECT id, name, specialty, available FROM doctors ORDER BY name'
    );

    connection.release();
    res.json({ doctors });
  } catch (error) {
    console.error('Doctors fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create appointment
app.post('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const { doctorName, appointmentDate, appointmentTime, appointmentType } = req.body;
    const patientId = req.user.userId;
    const patientName = req.user.name;

    // Validate input
    if (!doctorName || !appointmentDate || !appointmentTime || !appointmentType) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const connection = await pool.getConnection();

    // Insert appointment
    const [result] = await connection.execute(
      `INSERT INTO appointments 
       (patient_id, patient_name, doctor_name, appointment_date, appointment_time, appointment_type) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [patientId, patientName, doctorName, appointmentDate, appointmentTime, appointmentType]
    );

    connection.release();

    res.status(201).json({
      message: 'Appointment created successfully',
      appointmentId: result.insertId
    });
  } catch (error) {
    console.error('Appointment creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get appointments for a user
app.get('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    let query = `
      SELECT id, patient_name, doctor_name, appointment_date, appointment_time, 
             appointment_type, status, created_at 
      FROM appointments 
    `;
    let params = [];

    // If user is a patient, only show their appointments
    if (req.user.role === 'patient') {
      query += 'WHERE patient_id = ? ';
      params.push(req.user.userId);
    }

    query += 'ORDER BY appointment_date DESC, appointment_time DESC';

    const [appointments] = await connection.execute(query, params);

    connection.release();
    res.json({ appointments });
  } catch (error) {
    console.error('Appointments fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update appointment status (for doctors)
app.put('/api/appointments/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const connection = await pool.getConnection();

    const [result] = await connection.execute(
      'UPDATE appointments SET status = ? WHERE id = ?',
      [status, id]
    );

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ message: 'Appointment status updated successfully' });
  } catch (error) {
    console.error('Appointment update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete appointment
app.delete('/api/appointments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    let query = 'DELETE FROM appointments WHERE id = ?';
    let params = [id];

    // If user is a patient, only allow deleting their own appointments
    if (req.user.role === 'patient') {
      query += ' AND patient_id = ?';
      params.push(req.user.userId);
    }

    const [result] = await connection.execute(query, params);

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Appointment not found or unauthorized' });
    }

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Appointment deletion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initializeDatabase();
});

module.exports = app;