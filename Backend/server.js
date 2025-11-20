// // const express = require('express');
// // const cors = require('cors');
// // const helmet = require('helmet');
// // const dotenv = require('dotenv');
// // const mongoose = require('mongoose');

// // // Load env vars
// // dotenv.config();

// // // Import database connection
// // const connectDB = require('./config/database');

// // // Connect to database
// // connectDB();

// // const app = express();

// // // Security headers
// // app.use(helmet());

// // // CORS configuration
// // app.use(cors({
// //   origin: process.env.CLIENT_URL || 'http://localhost:3000',
// //   credentials: true
// // }));

// // // Body parsing middleware
// // app.use(express.json({ limit: '10mb' }));
// // app.use(express.urlencoded({ extended: true }));

// // // Routes with debugging
// // console.log('=== LOADING ROUTES ===');
// // const routes = [
// //   { path: '/api/auth', file: './routes/auth' },
// //   { path: '/api/opportunities', file: './routes/opportunities' },
// //   { path: '/api/events', file: './routes/events' },
// //   { path: '/api/volunteer', file: './routes/volunteer' },
// //   { path: '/api/admin', file: './routes/admin' }
// // ];

// // routes.forEach(route => {
// //   try {
// //     const router = require(route.file);
// //     console.log(`✓ ${route.path}:`, typeof router);
    
// //     if (typeof router !== 'function' && typeof router !== 'object') {
// //       console.error(`❌ ${route.path}: Expected function or object, got ${typeof router}`);
// //     }
    
// //     if (typeof router === 'object') {
// //       if (router.stack) {
// //         console.log(`  ↳ Router with ${router.stack.length} middleware layers`);
// //       } else {
// //         console.error(`❌ ${route.path}: Object without stack property (not a router)`);
// //         console.log(`  ↳ Object keys:`, Object.keys(router));
// //       }
// //     }
    
// //     app.use(route.path, router);
// //     console.log(`  ✅ ${route.path} mounted successfully`);
// //   } catch (error) {
// //     console.error(`❌ Error loading ${route.path}:`, error.message);
// //   }
// // });
// // console.log('=== ROUTES LOADING COMPLETE ===');

// // // Health check route
// // app.get('/api/health', (req, res) => {
// //   res.status(200).json({ 
// //     success: true,
// //     status: 'OK', 
// //     message: 'Server is running',
// //     timestamp: new Date().toISOString(),
// //     database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
// //   });
// // });

// // // Test database route
// // app.get('/api/test-db', async (req, res) => {
// //   try {
// //     const dbStatus = mongoose.connection.readyState;
    
// //     const statusMessages = {
// //       0: 'Disconnected',
// //       1: 'Connected',
// //       2: 'Connecting',
// //       3: 'Disconnecting'
// //     };

// //     res.json({
// //       success: true,
// //       message: 'Database status check',
// //       database: {
// //         status: statusMessages[dbStatus],
// //         readyState: dbStatus,
// //         host: mongoose.connection.host,
// //         name: mongoose.connection.name
// //       }
// //     });
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       message: 'Database check failed',
// //       error: error.message
// //     });
// //   }
// // });

// // // 404 handler for undefined routes
// // app.use('*', (req, res) => {
// //   res.status(404).json({
// //     success: false,
// //     message: `Route ${req.originalUrl} not found`
// //   });
// // });

// // // Global error handler
// // app.use((error, req, res, next) => {
// //   console.error('Global error handler:', error);
  
// //   res.status(error.status || 500).json({
// //     success: false,
// //     message: error.message || 'Internal Server Error',
// //     ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
// //   });
// // });

// // const PORT = process.env.PORT || 5000;

// // app.listen(PORT, () => {
// //   console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
// //   console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
// //   console.log(`📍 Database check: http://localhost:${PORT}/api/test-db`);
// // });
// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const dotenv = require('dotenv');
// const mongoose = require('mongoose');

// // Load env vars
// dotenv.config();

// // Import database connection
// const connectDB = require('./config/database');

// const app = express();

// // Security headers
// app.use(helmet());

// // CORS configuration
// app.use(cors({
//   origin: process.env.CLIENT_URL || 'http://localhost:3000',
//   credentials: true
// }));

// // Body parsing middleware
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true }));

// // ✅ FIX: Wait for database connection BEFORE loading routes
// const startServer = async () => {
//   try {
//     console.log('🔄 Connecting to database...');
//     await connectDB();
    
//     console.log('✅ Database connected, loading routes...');
    
//     // Routes with debugging
//     console.log('=== LOADING ROUTES ===');
//     const routes = [
//       { path: '/api/auth', file: './routes/auth' },
//       { path: '/api/opportunities', file: './routes/opportunities' },
//       { path: '/api/events', file: './routes/events' },
//       { path: '/api/volunteer', file: './routes/volunteer' },
//       { path: '/api/admin', file: './routes/admin' }
//     ];

//     routes.forEach(route => {
//       try {
//         const router = require(route.file);
//         console.log(`✓ ${route.path}:`, typeof router);
        
//         if (typeof router !== 'function' && typeof router !== 'object') {
//           console.error(`❌ ${route.path}: Expected function or object, got ${typeof router}`);
//         }
        
//         if (typeof router === 'object') {
//           if (router.stack) {
//             console.log(`  ↳ Router with ${router.stack.length} middleware layers`);
//           } else {
//             console.error(`❌ ${route.path}: Object without stack property (not a router)`);
//             console.log(`  ↳ Object keys:`, Object.keys(router));
//           }
//         }
        
//         app.use(route.path, router);
//         console.log(`  ✅ ${route.path} mounted successfully`);
//       } catch (error) {
//         console.error(`❌ Error loading ${route.path}:`, error.message);
//       }
//     });
//     console.log('=== ROUTES LOADING COMPLETE ===');

//     // Health check route
//     app.get('/api/health', (req, res) => {
//       res.status(200).json({ 
//         success: true,
//         status: 'OK', 
//         message: 'Server is running',
//         timestamp: new Date().toISOString(),
//         database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
//       });
//     });

//     // Test database route
//     app.get('/api/test-db', async (req, res) => {
//       try {
//         const dbStatus = mongoose.connection.readyState;
        
//         const statusMessages = {
//           0: 'Disconnected',
//           1: 'Connected',
//           2: 'Connecting',
//           3: 'Disconnecting'
//         };

//         res.json({
//           success: true,
//           message: 'Database status check',
//           database: {
//             status: statusMessages[dbStatus],
//             readyState: dbStatus,
//             host: mongoose.connection.host,
//             name: mongoose.connection.name
//           }
//         });
//       } catch (error) {
//         res.status(500).json({
//           success: false,
//           message: 'Database check failed',
//           error: error.message
//         });
//       }
//     });

//     // Add debug route to check users
//     app.get('/api/debug/users', async (req, res) => {
//       try {
//         const User = require('./models/user');
//         const userCount = await User.countDocuments();
//         const allUsers = await User.find({}).select('email name');
        
//         console.log('🔍 Debug - All users:', allUsers.map(u => u.email));
        
//         res.json({
//           database: mongoose.connection.name,
//           userCount,
//           users: allUsers
//         });
//       } catch (error) {
//         console.error('❌ Debug error:', error);
//         res.status(500).json({ error: error.message });
//       }
//     });

//     // 404 handler for undefined routes
//     app.use('*', (req, res) => {
//       res.status(404).json({
//         success: false,
//         message: `Route ${req.originalUrl} not found`
//       });
//     });

//     // Global error handler
//     app.use((error, req, res, next) => {
//       console.error('Global error handler:', error);
      
//       res.status(error.status || 500).json({
//         success: false,
//         message: error.message || 'Internal Server Error',
//         ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
//       });
//     });

//     const PORT = process.env.PORT || 5000;

//     app.listen(PORT, () => {
//       console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
//       console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
//       console.log(`📍 Database check: http://localhost:${PORT}/api/test-db`);
//       console.log(`📍 Debug users: http://localhost:${PORT}/api/debug/users`);
//     });

//   } catch (error) {
//     console.error('❌ Failed to start server:', error);
//     process.exit(1);
//   }
// };

// // Start the server
// startServer();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { protect } = require('./middleware/auth');
// Load env vars
dotenv.config();

// Import database connection
const connectDB = require('./config/database');

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ FIX: Wait for database connection BEFORE loading routes
const startServer = async () => {
  try {
    // Add this to your server.js after routes are loaded
app.get('/api/debug/auth-test', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Auth test successful!',
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Also add a public debug route to check tokens
app.post('/api/debug/check-token', (req, res) => {
  const authHeader = req.headers.authorization;
  console.log('🔍 Token check - Authorization header:', authHeader);
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    console.log('🔐 Token received:', token.substring(0, 20) + '...');
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "51e7772422fc2c3a81f7842348fdd136");
      res.json({
        tokenValid: true,
        decoded: decoded
      });
    } catch (error) {
      res.json({
        tokenValid: false,
        error: error.message
      });
    }
  } else {
    res.json({
      tokenValid: false,
      error: 'No Bearer token found'
    });
  }
});
    console.log('🔄 Connecting to database...');
    await connectDB();
    
    console.log('✅ Database connected, loading routes...');
    
    // Routes with debugging
    console.log('=== LOADING ROUTES ===');
    const routes = [
      { path: '/api/auth', file: './routes/auth' },
      { path: '/api/opportunities', file: './routes/opportunities' },
      { path: '/api/events', file: './routes/events' },
      { path: '/api/volunteer', file: './routes/volunteer' },
      { path: '/api/admin', file: './routes/admin' }
    ];

    routes.forEach(route => {
      try {
        const router = require(route.file);
        console.log(`✓ ${route.path}:`, typeof router);
        
        if (typeof router !== 'function' && typeof router !== 'object') {
          console.error(`❌ ${route.path}: Expected function or object, got ${typeof router}`);
        }
        
        if (typeof router === 'object') {
          if (router.stack) {
            console.log(`  ↳ Router with ${router.stack.length} middleware layers`);
          } else {
            console.error(`❌ ${route.path}: Object without stack property (not a router)`);
            console.log(`  ↳ Object keys:`, Object.keys(router));
          }
        }
        
        app.use(route.path, router);
        console.log(`  ✅ ${route.path} mounted successfully`);
      } catch (error) {
        console.error(`❌ Error loading ${route.path}:`, error.message);
      }
    });
    console.log('=== ROUTES LOADING COMPLETE ===');

    // Health check route
    app.get('/api/health', (req, res) => {
      res.status(200).json({ 
        success: true,
        status: 'OK', 
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
      });
    });
    app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Welcome to Sahay Microvolunteering Backend API!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      opportunities: '/api/opportunities', 
      events: '/api/events',
      health: '/api/health',
      debug: '/api/debug/users'
    },
    documentation: 'Add your API docs link here'
  });
});

// Your existing 404 handler - keep this
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});


    // Test database route
    app.get('/api/test-db', async (req, res) => {
      try {
        const dbStatus = mongoose.connection.readyState;
        
        const statusMessages = {
          0: 'Disconnected',
          1: 'Connected',
          2: 'Connecting',
          3: 'Disconnecting'
        };

        res.json({
          success: true,
          message: 'Database status check',
          database: {
            status: statusMessages[dbStatus],
            readyState: dbStatus,
            host: mongoose.connection.host,
            name: mongoose.connection.name
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Database check failed',
          error: error.message
        });
      }
    });

    // Add debug route to check users
    app.get('/api/debug/users', async (req, res) => {
      try {
        const User = require('./models/user');
        const userCount = await User.countDocuments();
        const allUsers = await User.find({}).select('email name');
        
        console.log('🔍 Debug - All users:', allUsers.map(u => u.email));
        
        res.json({
          database: mongoose.connection.name,
          userCount,
          users: allUsers
        });
      } catch (error) {
        console.error('❌ Debug error:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // 404 handler for undefined routes
    app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
      });
    });

    // Global error handler
    app.use((error, req, res, next) => {
      console.error('Global error handler:', error);
      
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      });
    });

    // ✅ FIX: Define PORT inside the function
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📍 Database check: http://localhost:${PORT}/api/test-db`);
      console.log(`📍 Debug users: http://localhost:${PORT}/api/debug/users`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();