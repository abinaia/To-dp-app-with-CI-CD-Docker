const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const redisService = require('./redis-service');

const app = express();
const PORT = process.env.PORT || 3000;

// Data storage - Redis with in-memory fallback
let inMemoryTodos = [
  {
    id: uuidv4(),
    text: 'Welcome to your DevOps To-Do App!',
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    text: 'Set up CI/CD pipeline',
    completed: true,
    createdAt: new Date().toISOString()
  }
];

let useRedis = false;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      connectSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      workerSrc: ["'self'"],
      manifestSrc: ["'self'"]
    }
  }
}));
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database abstraction layer
class TodoService {
  async getAllTodos() {
    if (useRedis) {
      return await redisService.getAllTodos();
    }
    return inMemoryTodos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getTodoById(id) {
    if (useRedis) {
      return await redisService.getTodoById(id);
    }
    return inMemoryTodos.find(todo => todo.id === id) || null;
  }

  async createTodo(todo) {
    if (useRedis) {
      return await redisService.createTodo(todo);
    }
    inMemoryTodos.push(todo);
    return todo;
  }

  async updateTodo(id, updates) {
    if (useRedis) {
      return await redisService.updateTodo(id, updates);
    }
    
    const todoIndex = inMemoryTodos.findIndex(todo => todo.id === id);
    if (todoIndex === -1) return null;

    if (updates.text !== undefined) {
      inMemoryTodos[todoIndex].text = updates.text;
    }
    if (updates.completed !== undefined) {
      inMemoryTodos[todoIndex].completed = updates.completed;
    }
    inMemoryTodos[todoIndex].updatedAt = new Date().toISOString();

    return inMemoryTodos[todoIndex];
  }

  async deleteTodo(id) {
    if (useRedis) {
      return await redisService.deleteTodo(id);
    }
    
    const todoIndex = inMemoryTodos.findIndex(todo => todo.id === id);
    if (todoIndex === -1) return null;

    return inMemoryTodos.splice(todoIndex, 1)[0];
  }

  async getStats() {
    if (useRedis) {
      return await redisService.getStats();
    }
    
    return {
      total: inMemoryTodos.length,
      completed: inMemoryTodos.filter(todo => todo.completed).length,
      pending: inMemoryTodos.filter(todo => !todo.completed).length
    };
  }

  async healthCheck() {
    if (useRedis) {
      return await redisService.healthCheck();
    }
    return {
      status: 'in-memory',
      message: 'Using in-memory storage'
    };
  }
}

const todoService = new TodoService();

// Routes

// Health check endpoint (important for deployment monitoring)
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await todoService.healthCheck();
    const stats = await todoService.getStats();
    
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: dbHealth,
      stats: stats
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      database: { status: 'error', message: error.message }
    });
  }
});

// Get all todos
app.get('/api/todos', async (req, res) => {
  try {
    // Add cache-busting headers for real-time data
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const todos = await todoService.getAllTodos();
    res.json({
      success: true,
      data: todos,
      count: todos.length
    });
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch todos'
    });
  }
});

// Create a new todo
app.post('/api/todos', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Todo text is required'
      });
    }

    const newTodo = {
      id: uuidv4(),
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };

    const createdTodo = await todoService.createTodo(newTodo);

    res.status(201).json({
      success: true,
      data: createdTodo
    });
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create todo'
    });
  }
});

// Update todo (toggle completion)
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { text, completed } = req.body;

    const updatedTodo = await todoService.updateTodo(id, { text, completed });
    
    if (!updatedTodo) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found'
      });
    }

    res.json({
      success: true,
      data: updatedTodo
    });
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update todo'
    });
  }
});

// Delete todo
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedTodo = await todoService.deleteTodo(id);
    
    if (!deletedTodo) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found'
      });
    }

    res.json({
      success: true,
      data: deletedTodo
    });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete todo'
    });
  }
});

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Todo App running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 App URL: http://localhost:${PORT}`);
  
  // Try to connect to Redis
  console.log('🔄 Attempting to connect to Redis...');
  const redisConnected = await redisService.connect();
  
  if (redisConnected) {
    useRedis = true;
    console.log('✅ Using Redis for data persistence');
  } else {
    useRedis = false;
    console.log('⚠️  Using in-memory storage (data will not persist)');
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  
  // Close Redis connection
  if (useRedis) {
    await redisService.disconnect();
  }
  
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT received. Shutting down gracefully...');
  
  // Close Redis connection
  if (useRedis) {
    await redisService.disconnect();
  }
  
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

module.exports = app;
