// ===========================
// server.js - Backend Server
// Node.js + Express + MySQL (Railway)
// ===========================

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARE =====
app.use(cors({
  origin: [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'https://25bcae37-alt.github.io'
  ],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== DATABASE CONNECTION =====
const pool = mysql.createPool(process.env.MYSQL_PUBLIC_URL || {
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQLPORT,
  ssl: { rejectUnauthorized: false }
});

// Create table if it doesn't exist
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        name       VARCHAR(100) NOT NULL,
        email      VARCHAR(150) NOT NULL,
        message    TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Database table ready');
  } catch (err) {
    console.error('❌ DB init error:', err.message);
  }
}

// ===== ROUTES =====

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: '🚀 Portfolio Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// POST /api/contact - Save a contact message
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }

  if (name.length > 100 || email.length > 150 || message.length > 2000) {
    return res.status(400).json({ message: 'Input exceeds maximum length.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)',
      [name.trim(), email.trim(), message.trim()]
    );

    console.log(`📨 New message from ${name} (${email})`);

    res.status(201).json({
      success: true,
      message: 'Message received successfully!',
      id: result.insertId
    });

  } catch (err) {
    console.error('❌ DB error:', err.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// GET /api/contacts - View all messages (admin only)
app.get('/api/contacts', async (req, res) => {
  const secret = req.headers['x-admin-key'];
  if (secret !== process.env.ADMIN_KEY) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const [rows] = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC');
    res.json({ count: rows.length, contacts: rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ===== START SERVER =====
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 Routes:`);
    console.log(`   GET  /              → Health check`);
    console.log(`   POST /api/contact   → Save contact message`);
    console.log(`   GET  /api/contacts  → View all messages (admin)\n`);
  });
});