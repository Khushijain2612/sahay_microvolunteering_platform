const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock data for testing
const mockUsers = [];
let mockUserId = 1;

// Basic routes without database
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Microvolunteering API is running',
    timestamp: new Date().toISOString(),
    database: 'Mock (MongoDB not connected)'
  });
});

app.get('/api/opportunities', (req, res) => {
  res.json({
    success: true,
    data: {
      opportunities: [
        {
          id: 1,
          title: "Community Garden Volunteer",
          description: "Help maintain our community garden",
          category: "environment"
        },
        {
          id: 2, 
          title: "Food Bank Assistant",
          description: "Sort and package food donations",
          category: "community"
        }
      ],
      total: 2,
      message: "Mock opportunities data"
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role } = req.body;
  
  // Check if user already exists
  const existingUser = mockUsers.find(user => user.email === email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }

  // Create mock user
  const newUser = {
    id: mockUserId++,
    name,
    email,
    role: role || 'volunteer',
    createdAt: new Date()
  };
  
  mockUsers.push(newUser);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      token: 'mock-jwt-token-for-testing'
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = mockUsers.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token: 'mock-jwt-token-for-testing'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
  console.log(`❤️ Health check: http://localhost:${PORT}/api/health`);
  console.log(`📝 Register: http://localhost:${PORT}/api/auth/register`);
  console.log(`🔐 Login: http://localhost:${PORT}/api/auth/login`);
  console.log('💡 Note: Using mock data (MongoDB not required)');
});

