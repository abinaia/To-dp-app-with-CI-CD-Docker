// API Base URL
const API_BASE = '/api';

// DOM Elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todosList = document.getElementById('todosList');
const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');
const pendingCount = document.getElementById('pendingCount');
const clearCompleted = document.getElementById('clearCompleted');
const healthIndicator = document.getElementById('health-indicator');
const healthText = document.getElementById('health-text');
const deploymentTime = document.getElementById('deploymentTime');
const toast = document.getElementById('toast');

// State
let todos = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌐 DOM loaded, checking elements...');
    console.log('📝 todoInput:', todoInput);
    console.log('🔘 addBtn:', addBtn);
    console.log('📋 todosList:', todosList);
    console.log('📊 totalCount:', totalCount);
    
    if (!todosList) {
        console.error('❌ todosList element not found!');
        return;
    }
    
    initializeApp();
    setupEventListeners();
    setDeploymentInfo();
});

// Initialize application
async function initializeApp() {
    console.log('🚀 Initializing application...');
    await checkHealth();
    await loadTodos();
    setInterval(checkHealth, 30000); // Check health every 30 seconds
    console.log('✅ Application initialized');
}

// Setup event listeners
function setupEventListeners() {
    addBtn.addEventListener('click', handleAddTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAddTodo();
        }
    });
    clearCompleted.addEventListener('click', handleClearCompleted);
}

// Setup event listeners for todo items (using event delegation)
function setupTodoEventListeners() {
    // Remove existing listeners to avoid duplicates
    const existingHandler = todosList._todoEventHandler;
    if (existingHandler) {
        todosList.removeEventListener('click', existingHandler);
    }
    
    // Create new event handler
    const todoEventHandler = (e) => {
        const target = e.target;
        const actionElement = target.closest('[data-action]');
        
        if (!actionElement) return;
        
        const action = actionElement.dataset.action;
        const todoId = actionElement.dataset.todoId;
        
        if (!todoId) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        switch (action) {
            case 'toggle':
                toggleTodo(todoId);
                break;
            case 'edit':
                editTodo(todoId);
                break;
            case 'delete':
                deleteTodo(todoId);
                break;
        }
    };
    
    // Store reference to handler for cleanup
    todosList._todoEventHandler = todoEventHandler;
    
    // Add event listener
    todosList.addEventListener('click', todoEventHandler);
}

// Health check
async function checkHealth() {
    try {
        const response = await fetch('/health');
        const data = await response.json();
        
        if (data.status === 'OK') {
            healthIndicator.className = 'health-dot healthy';
            healthText.textContent = `Healthy • Uptime: ${formatUptime(data.uptime)}`;
        } else {
            throw new Error('Health check failed');
        }
    } catch (error) {
        healthIndicator.className = 'health-dot error';
        healthText.textContent = 'Service unavailable';
        console.error('Health check failed:', error);
    }
}

// Format uptime
function formatUptime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
}

// Load todos from API
async function loadTodos() {
    try {
        console.log('🔄 Loading todos from API...');
        showLoading();
        const response = await fetch(`${API_BASE}/todos`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📨 API Response:', data);
        
        if (data.success) {
            todos = data.data;
            console.log('✅ Todos loaded:', todos.length, 'items');
            console.log('📋 Todos data:', todos);
            renderTodos();
            updateStats();
        } else {
            throw new Error(data.error || 'Failed to load todos');
        }
    } catch (error) {
        console.error('❌ Failed to load todos:', error);
        showToast('Failed to load todos', 'error');
        showEmptyState('Failed to load todos. Please refresh the page.');
    }
}

// Show loading state
function showLoading() {
    todosList.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            Loading todos...
        </div>
    `;
}

// Show empty state
function showEmptyState(message = "No todos yet. Add one above!") {
    todosList.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-clipboard-list"></i>
            <p>${message}</p>
        </div>
    `;
}

// Render todos
function renderTodos() {
    console.log('🎨 renderTodos called with todos:', todos.length, 'items');
    console.log('📋 Todos array:', todos);
    
    if (todos.length === 0) {
        console.log('⚠️ No todos found, showing empty state');
        showEmptyState();
        return;
    }

    console.log('✅ Rendering', todos.length, 'todos');
    const todosHTML = todos.map(todo => `
        <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
            <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" data-todo-id="${todo.id}" data-action="toggle">
                ${todo.completed ? '<i class="fas fa-check"></i>' : ''}
            </div>
            <div class="todo-text ${todo.completed ? 'completed' : ''}">${escapeHtml(todo.text)}</div>
            <div class="todo-meta">${formatDate(todo.createdAt)}</div>
            <div class="todo-actions">
                <button class="action-btn edit-btn" data-todo-id="${todo.id}" data-action="edit" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" data-todo-id="${todo.id}" data-action="delete" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    todosList.innerHTML = todosHTML;
    console.log('🎨 HTML rendered to todosList element');
    
    // Add event delegation for todo actions
    setupTodoEventListeners();
}

// Update statistics
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const pending = total - completed;

    totalCount.textContent = total;
    completedCount.textContent = completed;
    pendingCount.textContent = pending;
}

// Handle add todo
async function handleAddTodo() {
    const text = todoInput.value.trim();
    
    if (!text) {
        showToast('Please enter a todo item', 'warning');
        todoInput.focus();
        return;
    }

    if (text.length > 200) {
        showToast('Todo text is too long (max 200 characters)', 'warning');
        return;
    }

    try {
        addBtn.disabled = true;
        addBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';

        const response = await fetch(`${API_BASE}/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });

        const data = await response.json();

        if (data.success) {
            todos.push(data.data);
            todoInput.value = '';
            renderTodos();
            updateStats();
            showToast('Todo added successfully!', 'success');
        } else {
            throw new Error(data.error || 'Failed to add todo');
        }
    } catch (error) {
        console.error('Failed to add todo:', error);
        showToast('Failed to add todo', 'error');
    } finally {
        addBtn.disabled = false;
        addBtn.innerHTML = '<i class="fas fa-plus"></i> Add';
        todoInput.focus();
    }
}

// Toggle todo completion
async function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
        const response = await fetch(`${API_BASE}/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ completed: !todo.completed }),
        });

        const data = await response.json();

        if (data.success) {
            const todoIndex = todos.findIndex(t => t.id === id);
            todos[todoIndex] = data.data;
            renderTodos();
            updateStats();
            
            const action = data.data.completed ? 'completed' : 'uncompleted';
            showToast(`Todo ${action}!`, 'success');
        } else {
            throw new Error(data.error || 'Failed to update todo');
        }
    } catch (error) {
        console.error('Failed to toggle todo:', error);
        showToast('Failed to update todo', 'error');
    }
}

// Edit todo
async function editTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const newText = prompt('Edit todo:', todo.text);
    if (newText === null || newText.trim() === todo.text) return;

    if (!newText.trim()) {
        showToast('Todo text cannot be empty', 'warning');
        return;
    }

    if (newText.length > 200) {
        showToast('Todo text is too long (max 200 characters)', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: newText.trim() }),
        });

        const data = await response.json();

        if (data.success) {
            const todoIndex = todos.findIndex(t => t.id === id);
            todos[todoIndex] = data.data;
            renderTodos();
            showToast('Todo updated successfully!', 'success');
        } else {
            throw new Error(data.error || 'Failed to update todo');
        }
    } catch (error) {
        console.error('Failed to edit todo:', error);
        showToast('Failed to update todo', 'error');
    }
}

// Delete todo
async function deleteTodo(id) {
    if (!confirm('Are you sure you want to delete this todo?')) return;

    try {
        const response = await fetch(`${API_BASE}/todos/${id}`, {
            method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
            todos = todos.filter(t => t.id !== id);
            renderTodos();
            updateStats();
            showToast('Todo deleted successfully!', 'success');
        } else {
            throw new Error(data.error || 'Failed to delete todo');
        }
    } catch (error) {
        console.error('Failed to delete todo:', error);
        showToast('Failed to delete todo', 'error');
    }
}

// Clear completed todos
async function handleClearCompleted() {
    // First, refresh the todo list to get current state
    try {
        await loadTodos();
    } catch (error) {
        console.error('Failed to refresh todos before clearing:', error);
        showToast('Failed to refresh todo list', 'error');
        return;
    }

    const completedTodos = todos.filter(todo => todo.completed);
    
    if (completedTodos.length === 0) {
        showToast('No completed todos to clear', 'warning');
        return;
    }

    if (!confirm(`Are you sure you want to delete ${completedTodos.length} completed todo(s)?`)) return;

    try {
        // Delete completed todos one by one with better error handling
        let deletedCount = 0;
        let failedCount = 0;
        
        for (const todo of completedTodos) {
            try {
                const response = await fetch(`${API_BASE}/todos/${todo.id}`, { 
                    method: 'DELETE' 
                });
                
                if (response.ok) {
                    deletedCount++;
                } else if (response.status === 404) {
                    // Todo already deleted - count as success
                    deletedCount++;
                    console.log(`Todo ${todo.id} was already deleted`);
                } else {
                    failedCount++;
                    console.error(`Failed to delete todo ${todo.id}: ${response.status}`);
                }
            } catch (error) {
                failedCount++;
                console.error(`Error deleting todo ${todo.id}:`, error);
            }
        }

        // Update the UI based on results
        if (failedCount === 0) {
            showToast(`${deletedCount} completed todo(s) cleared successfully!`, 'success');
        } else if (deletedCount > 0) {
            showToast(`${deletedCount} todos cleared, ${failedCount} failed`, 'warning');
        } else {
            showToast(`Failed to clear todos`, 'error');
        }

        // Refresh the todo list to show current state
        await loadTodos();

    } catch (error) {
        console.error('Failed to clear completed todos:', error);
        showToast('Failed to clear completed todos', 'error');
        // Reload to ensure consistency
        await loadTodos();
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    
    // Trigger reflow to ensure the class is applied
    toast.offsetHeight;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
}

function setDeploymentInfo() {
    const buildTime = new Date().toLocaleString();
    deploymentTime.textContent = `Deployed: ${buildTime}`;
}

// Error handling for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showToast('An unexpected error occurred', 'error');
});

// Service worker registration (for PWA capabilities)
// Fixed to not cache API calls for real-time data
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
                
                // Force update to new version
                registration.addEventListener('updatefound', () => {
                    console.log('SW update found, activating...');
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'activated') {
                            console.log('SW updated and activated');
                            // Optionally reload page for new SW
                            // window.location.reload();
                        }
                    });
                });
                
                // Listen for Service Worker errors to handle CSP issues
                navigator.serviceWorker.addEventListener('error', (event) => {
                    console.log('Service Worker error (may be CSP related):', event);
                });
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
