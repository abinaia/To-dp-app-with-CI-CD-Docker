# DevOps To-Do App 🚀

A modern, fully-featured To-Do List web application built with Node.js, Express, and vanilla JavaScript. This project demonstrates a complete DevOps pipeline including containerization, CI/CD automation, testing, and deployment.

## 🌟 Features

- ✅ **Full CRUD Operations**: Create, read, update, and delete todos
- 🎨 **Modern UI**: Clean, responsive design with animations
- 🔄 **Real-time Updates**: Instant feedback and state management
- 📊 **Statistics Dashboard**: Track total, completed, and pending tasks
- 🏥 **Health Monitoring**: Built-in health checks and system monitoring
- 🐳 **Containerized**: Fully dockerized for consistent deployments
- 🔄 **CI/CD Pipeline**: Automated testing, building, and deployment
- 🛡️ **Security**: Input validation, CORS, Helmet.js protection
- 📱 **Responsive**: Works perfectly on desktop and mobile devices

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │────│   Backend API   │────│   Data Layer    │
│                 │    │                 │    │                 │
│ • HTML/CSS/JS   │    │ • Node.js       │    │ • In-memory     │
│ • Responsive    │    │ • Express.js    │    │ • JSON Storage  │
│ • Modern UI     │    │ • RESTful API   │    │ • UUID IDs      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid/Flexbox
- **Vanilla JavaScript** - ES6+ features, async/await
- **Font Awesome** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **UUID** - Unique ID generation
- **Helmet.js** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logging

### DevOps & Infrastructure
- **Docker** - Containerization
- **GitHub Actions** - CI/CD pipeline
- **Jest** - Testing framework
- **Supertest** - API testing
- **Render/Heroku** - Cloud hosting
- **GitHub Container Registry** - Docker image storage

## 📁 Project Structure

```
todo-app-devops/
├── 📁 .github/workflows/      # CI/CD pipeline configuration
│   └── ci-cd.yml             # GitHub Actions workflow
├── 📁 public/                # Frontend static files
│   ├── index.html           # Main HTML file
│   ├── style.css            # Styles and responsive design
│   └── script.js            # Frontend JavaScript logic
├── 📁 tests/                 # Test files
│   └── api.test.js          # API endpoint tests
├── 📄 server.js              # Main server file
├── 📄 package.json           # Dependencies and scripts
├── 📄 Dockerfile             # Container configuration
├── 📄 .dockerignore          # Docker ignore rules
├── 📄 healthcheck.js         # Container health check
├── 📄 jest.config.js         # Test configuration
└── 📄 README.md              # This file
```

## 🛠️ Local Development

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Docker** (optional, for containerization)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd todo-app-devops
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Open your browser to `http://localhost:3000`
   - API documentation available at `http://localhost:3000/health`

### Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run test suite
npm run test:watch # Run tests in watch mode
npm run docker:build # Build Docker image
npm run docker:run   # Run Docker container
```

## 🐳 Docker Usage

### Build and Run Locally

```bash
# Build the Docker image
docker build -t todo-app .

# Run the container
docker run -p 3000:3000 todo-app

# Run with environment variables
docker run -p 3000:3000 -e NODE_ENV=production todo-app
```

### Using Docker Compose (Optional)

Create a `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  todo-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

Run with: `docker-compose up -d`

## 🔄 CI/CD Pipeline

The project includes a comprehensive GitHub Actions pipeline that automatically:

### 🧪 **Testing & Quality Assurance**
- Runs unit tests and integration tests
- Generates code coverage reports
- Performs security vulnerability scanning
- Validates code quality (linting)

### 🐳 **Build & Containerization**
- Builds Docker images for multiple architectures (AMD64, ARM64)
- Pushes images to GitHub Container Registry
- Creates versioned tags for releases
- Implements layer caching for faster builds

### 🚀 **Deployment**
- Automatically deploys to production on main branch
- Performs health checks after deployment
- Supports multiple deployment targets (Render, Heroku, Railway)
- Implements blue-green deployment strategies

### 📢 **Notifications & Monitoring**
- Sends Slack notifications for deployment status
- Creates GitHub releases with changelogs
- Monitors application health post-deployment
- Tracks deployment metrics and success rates

### Pipeline Triggers
- **Push to main**: Full pipeline (test → build → deploy)
- **Push to develop**: Test and build only
- **Pull requests**: Test and security scan only

## 🌐 Deployment Options

### Option 1: Render (Recommended)
1. Connect your GitHub repository to Render
2. Set up environment variables
3. Configure the deploy hook in GitHub secrets
4. Auto-deployment on every push to main

### Option 2: Heroku
1. Install Heroku CLI
2. Create Heroku app: `heroku create your-app-name`
3. Set buildpack: `heroku buildpacks:set heroku/nodejs`
4. Deploy: `git push heroku main`

### Option 3: Railway
1. Connect GitHub repository to Railway
2. Configure build settings
3. Set environment variables
4. Deploy automatically

## 🔧 Configuration

### Environment Variables

Create a `.env` file for local development:

```env
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3000
```

### GitHub Secrets (for CI/CD)

Required secrets for full pipeline functionality:

```
RENDER_DEPLOY_HOOK=https://api.render.com/deploy/srv-xxx
RENDER_APP_URL=https://your-app.onrender.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx
GITHUB_TOKEN=ghp_xxx (automatically provided)
```

## 🧪 Testing

The project includes comprehensive test coverage:

### Test Categories
- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **Health Check Tests**: System monitoring validation
- **Error Handling Tests**: Edge case coverage

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test tests/api.test.js
```

### Test Coverage
- **API Endpoints**: 100% coverage
- **Error Handling**: All error scenarios tested
- **Health Checks**: System monitoring validated
- **CRUD Operations**: Complete functionality tested

## 📊 API Documentation

### Base URL
- **Local**: `http://localhost:3000`
- **Production**: `https://your-app.onrender.com`

### Endpoints

#### Health Check
```http
GET /health
Response: {
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

#### Get All Todos
```http
GET /api/todos
Response: {
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "text": "Sample todo",
      "completed": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

#### Create Todo
```http
POST /api/todos
Body: {
  "text": "New todo item"
}
Response: {
  "success": true,
  "data": {
    "id": "uuid-string",
    "text": "New todo item",
    "completed": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Update Todo
```http
PUT /api/todos/:id
Body: {
  "text": "Updated text",
  "completed": true
}
Response: {
  "success": true,
  "data": {
    "id": "uuid-string",
    "text": "Updated text",
    "completed": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T01:00:00.000Z"
  }
}
```

#### Delete Todo
```http
DELETE /api/todos/:id
Response: {
  "success": true,
  "data": {
    "id": "uuid-string",
    "text": "Deleted todo",
    "completed": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🛡️ Security Features

- **Input Validation**: All user inputs are validated and sanitized
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet.js**: Security headers and protection middleware
- **Rate Limiting**: API rate limiting (can be configured)
- **Error Handling**: Secure error messages without information leakage
- **Container Security**: Non-root user in Docker container
- **Dependency Scanning**: Automated vulnerability scanning in CI/CD

## 🔍 Monitoring & Observability

### Health Monitoring
- **Health Endpoint**: `/health` for application status
- **Docker Health Check**: Container-level health monitoring
- **Uptime Tracking**: System uptime and performance metrics
- **Error Logging**: Comprehensive error logging and tracking

### Performance Metrics
- **Response Times**: API endpoint performance monitoring
- **Memory Usage**: Application memory consumption tracking
- **Error Rates**: Error frequency and pattern analysis
- **Deployment Success**: CI/CD pipeline success rates

## 🚀 DevOps Best Practices Demonstrated

### 1. **Infrastructure as Code**
- Dockerfile for consistent environments
- Docker Compose for local development
- GitHub Actions for automated workflows

### 2. **Continuous Integration**
- Automated testing on every commit
- Code quality and security scanning
- Multi-architecture Docker builds
- Dependency vulnerability checking

### 3. **Continuous Deployment**
- Automated deployment to production
- Health checks and rollback capabilities
- Blue-green deployment strategies
- Environment-specific configurations

### 4. **Monitoring & Alerting**
- Application health monitoring
- Deployment status notifications
- Error tracking and alerting
- Performance metrics collection

### 5. **Security**
- Container security best practices
- Dependency vulnerability scanning
- Secure secret management
- Input validation and sanitization

### 6. **Documentation**
- Comprehensive README documentation
- API documentation
- Deployment guides
- Troubleshooting information

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all CI/CD checks pass

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Learning Objectives Achieved

This project demonstrates the following DevOps concepts and skills:

### **Core DevOps Skills**
- ✅ **Version Control**: Git workflow and branching strategies
- ✅ **Containerization**: Docker best practices and multi-stage builds
- ✅ **CI/CD Pipelines**: Automated testing, building, and deployment
- ✅ **Infrastructure as Code**: Dockerfiles and deployment configurations
- ✅ **Monitoring**: Health checks and application monitoring
- ✅ **Security**: Container and application security practices

### **Technical Skills**
- ✅ **Backend Development**: RESTful API design and implementation
- ✅ **Frontend Development**: Modern JavaScript and responsive design
- ✅ **Testing**: Unit testing and integration testing strategies
- ✅ **Documentation**: Comprehensive project documentation
- ✅ **Cloud Deployment**: Platform-as-a-Service deployment strategies

### **Professional Skills**
- ✅ **Project Organization**: Clean code structure and organization
- ✅ **Best Practices**: Industry-standard development practices
- ✅ **Automation**: Reducing manual processes through automation
- ✅ **Reliability**: Building resilient and reliable applications

## 📞 Support

If you encounter any issues or have questions:

1. Check the [GitHub Issues](../../issues) page
2. Review the documentation above
3. Check the application logs for error details
4. Verify all environment variables are set correctly

---

**Built with ❤️ for DevOps Learning**

This project serves as a comprehensive example of modern DevOps practices and can be used as a template for similar applications.
