const request = require('supertest');
const app = require('../server');

describe('Todo API', () => {
  let server;
  let todoId;

  beforeAll((done) => {
    // Give the server time to initialize Redis connection
    server = app.listen(0, () => {
      // Wait a bit for Redis to connect
      setTimeout(done, 2000);
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('Health Check', () => {
    test('GET /health should return 200 and health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('stats');
      
      // Database should be either Redis or in-memory
      expect(['healthy', 'in-memory', 'disconnected']).toContain(response.body.database.status);
    });
  });

  describe('GET /api/todos', () => {
    test('should return todos array', async () => {
      const response = await request(app)
        .get('/api/todos')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('count');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/todos', () => {
    test('should create a new todo', async () => {
      const todoText = 'Test todo item';
      
      const response = await request(app)
        .post('/api/todos')
        .send({ text: todoText })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('text', todoText);
      expect(response.body.data).toHaveProperty('completed', false);
      expect(response.body.data).toHaveProperty('createdAt');

      todoId = response.body.data.id;
    });

    test('should reject empty todo text', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ text: '' })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Todo text is required');
    });

    test('should reject missing todo text', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Todo text is required');
    });
  });

  describe('PUT /api/todos/:id', () => {
    test('should update todo completion status', async () => {
      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ completed: true })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('completed', true);
      expect(response.body.data).toHaveProperty('updatedAt');
    });

    test('should update todo text', async () => {
      const newText = 'Updated todo text';
      
      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ text: newText })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('text', newText);
    });

    test('should return 404 for non-existent todo', async () => {
      const response = await request(app)
        .put('/api/todos/non-existent-id')
        .send({ completed: true })
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Todo not found');
    });
  });

  describe('DELETE /api/todos/:id', () => {
    test('should delete todo', async () => {
      const response = await request(app)
        .delete(`/api/todos/${todoId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', todoId);
    });

    test('should return 404 for non-existent todo', async () => {
      const response = await request(app)
        .delete('/api/todos/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Todo not found');
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Route not found');
    });
  });
});
