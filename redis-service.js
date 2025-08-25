const redis = require('redis');

class RedisService {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.TODOS_KEY = 'todos:all';
        this.TODO_PREFIX = 'todo:';
    }

    async connect() {
        try {
            // Redis connection configuration
            const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
            
            this.client = redis.createClient({
                url: redisUrl,
                retry_strategy: (options) => {
                    if (options.error && options.error.code === 'ECONNREFUSED') {
                        // End reconnecting on a specific error and flush all commands with
                        // a individual error
                        return new Error('The Redis server refused the connection');
                    }
                    if (options.total_retry_time > 1000 * 60 * 60) {
                        // End reconnecting after a specific timeout and flush all commands
                        // with a individual error
                        return new Error('Retry time exhausted');
                    }
                    if (options.attempt > 10) {
                        // End reconnecting with built in error
                        return undefined;
                    }
                    // reconnect after
                    return Math.min(options.attempt * 100, 3000);
                }
            });

            this.client.on('error', (err) => {
                console.error('Redis Client Error:', err);
                this.isConnected = false;
            });

            this.client.on('connect', () => {
                console.log('✅ Connected to Redis');
                this.isConnected = true;
            });

            this.client.on('ready', () => {
                console.log('🚀 Redis client ready');
            });

            this.client.on('end', () => {
                console.log('❌ Redis connection ended');
                this.isConnected = false;
            });

            await this.client.connect();
            
            // Initialize with default todos if database is empty
            await this.initializeDefaultTodos();
            
            return true;
        } catch (error) {
            console.error('Failed to connect to Redis:', error.message);
            console.log('⚠️  Falling back to in-memory storage');
            this.isConnected = false;
            return false;
        }
    }

    async disconnect() {
        if (this.client) {
            await this.client.disconnect();
            this.isConnected = false;
            console.log('📴 Disconnected from Redis');
        }
    }

    async initializeDefaultTodos() {
        try {
            const existingTodos = await this.getAllTodos();
            if (existingTodos.length === 0) {
                console.log('🔄 Initializing default todos in Redis...');
                
                const defaultTodos = [
                    {
                        id: require('uuid').v4(),
                        text: 'Welcome to your DevOps To-Do App with Redis!',
                        completed: false,
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: require('uuid').v4(),
                        text: 'Set up CI/CD pipeline with Redis database',
                        completed: true,
                        createdAt: new Date().toISOString()
                    }
                ];

                for (const todo of defaultTodos) {
                    await this.createTodo(todo);
                }
                
                console.log('✅ Default todos initialized');
            }
        } catch (error) {
            console.error('Error initializing default todos:', error);
        }
    }

    async getAllTodos() {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }

        try {
            console.log('🔍 Getting all todo IDs from Redis...');
            const todoIds = await this.client.sMembers(this.TODOS_KEY);
            console.log('📋 Found todo IDs:', todoIds.length, todoIds);
            
            if (todoIds.length === 0) {
                console.log('⚠️ No todo IDs found in SET');
                return [];
            }

            const todos = [];
            for (const id of todoIds) {
                console.log(`🔍 Fetching todo data for ID: ${id}`);
                const todoData = await this.client.hGetAll(`${this.TODO_PREFIX}${id}`);
                console.log(`📄 Todo data for ${id}:`, todoData);
                
                if (todoData && todoData.id) {
                    const todo = {
                        id: todoData.id,
                        text: todoData.text,
                        completed: todoData.completed === 'true',
                        createdAt: todoData.createdAt,
                        updatedAt: todoData.updatedAt || todoData.createdAt
                    };
                    console.log(`✅ Adding todo to list:`, todo);
                    todos.push(todo);
                } else {
                    console.log(`⚠️ Skipping todo ${id} - invalid data:`, todoData);
                }
            }

            console.log(`📊 Final todos list: ${todos.length} items`);
            // Sort by creation date (newest first)
            return todos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } catch (error) {
            console.error('Error getting todos from Redis:', error);
            throw error;
        }
    }

    async getTodoById(id) {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }

        try {
            const todoData = await this.client.hGetAll(`${this.TODO_PREFIX}${id}`);
            if (!todoData || !todoData.id) {
                return null;
            }

            return {
                id: todoData.id,
                text: todoData.text,
                completed: todoData.completed === 'true',
                createdAt: todoData.createdAt,
                updatedAt: todoData.updatedAt || todoData.createdAt
            };
        } catch (error) {
            console.error('Error getting todo by ID from Redis:', error);
            throw error;
        }
    }

    async createTodo(todo) {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }

        try {
            const todoKey = `${this.TODO_PREFIX}${todo.id}`;
            
            // Store todo data as hash
            await this.client.hSet(todoKey, {
                id: todo.id,
                text: todo.text,
                completed: todo.completed.toString(),
                createdAt: todo.createdAt
            });

            // Add todo ID to the set of all todos
            await this.client.sAdd(this.TODOS_KEY, todo.id);

            return todo;
        } catch (error) {
            console.error('Error creating todo in Redis:', error);
            throw error;
        }
    }

    async updateTodo(id, updates) {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }

        try {
            const todoKey = `${this.TODO_PREFIX}${id}`;
            
            // Check if todo exists
            const exists = await this.client.exists(todoKey);
            if (!exists) {
                return null;
            }

            // Get current todo data
            const currentTodo = await this.getTodoById(id);
            
            // Prepare update data
            const updateData = {
                updatedAt: new Date().toISOString()
            };

            if (updates.text !== undefined) {
                updateData.text = updates.text;
            }
            
            if (updates.completed !== undefined) {
                updateData.completed = updates.completed.toString();
            }

            // Update the todo
            await this.client.hSet(todoKey, updateData);

            // Return updated todo
            return await this.getTodoById(id);
        } catch (error) {
            console.error('Error updating todo in Redis:', error);
            throw error;
        }
    }

    async deleteTodo(id) {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }

        try {
            const todoKey = `${this.TODO_PREFIX}${id}`;
            
            // Get todo before deletion
            const todo = await this.getTodoById(id);
            if (!todo) {
                return null;
            }

            // Delete todo hash
            await this.client.del(todoKey);
            
            // Remove todo ID from the set
            await this.client.sRem(this.TODOS_KEY, id);

            return todo;
        } catch (error) {
            console.error('Error deleting todo from Redis:', error);
            throw error;
        }
    }

    async getStats() {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }

        try {
            const todos = await this.getAllTodos();
            return {
                total: todos.length,
                completed: todos.filter(todo => todo.completed).length,
                pending: todos.filter(todo => !todo.completed).length
            };
        } catch (error) {
            console.error('Error getting stats from Redis:', error);
            throw error;
        }
    }

    async clearCompleted() {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }

        try {
            const todos = await this.getAllTodos();
            const completedTodos = todos.filter(todo => todo.completed);
            
            for (const todo of completedTodos) {
                await this.deleteTodo(todo.id);
            }

            return completedTodos;
        } catch (error) {
            console.error('Error clearing completed todos from Redis:', error);
            throw error;
        }
    }

    // Health check method
    async healthCheck() {
        if (!this.isConnected) {
            return {
                status: 'disconnected',
                message: 'Redis not connected'
            };
        }

        try {
            await this.client.ping();
            return {
                status: 'healthy',
                message: 'Redis connection is healthy'
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }
}

// Create singleton instance
const redisService = new RedisService();

module.exports = redisService;
