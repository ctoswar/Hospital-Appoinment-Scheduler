const express = require('express');
const app = express();
const PORT = 5000;

// Basic middleware
app.use(express.json());

// Simple test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Debug server running on port ${PORT}`);
});

module.exports = app;