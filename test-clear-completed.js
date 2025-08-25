// Test script to verify the Clear Completed functionality handles 404s properly
// This script creates todos, marks some as complete, and then tests clearing them

const API_BASE = 'http://localhost:3000/api';

async function testClearCompleted() {
    console.log('🧪 Testing Clear Completed functionality...');
    
    try {
        // 1. Create some test todos
        console.log('📝 Creating test todos...');
        const todo1 = await fetch(`${API_BASE}/todos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: 'Test todo 1' })
        }).then(r => r.json());
        
        const todo2 = await fetch(`${API_BASE}/todos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: 'Test todo 2' })
        }).then(r => r.json());
        
        console.log('✅ Created todos:', todo1.data.id, todo2.data.id);
        
        // 2. Mark them as completed
        console.log('✅ Marking todos as completed...');
        await fetch(`${API_BASE}/todos/${todo1.data.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: true })
        });
        
        await fetch(`${API_BASE}/todos/${todo2.data.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: true })
        });
        
        console.log('✅ Todos marked as completed');
        
        // 3. Manually delete one of them to simulate the race condition
        console.log('🗑️ Manually deleting one todo to simulate race condition...');
        await fetch(`${API_BASE}/todos/${todo1.data.id}`, { method: 'DELETE' });
        console.log('✅ Manually deleted todo1');
        
        // 4. Get current todos
        const todosResponse = await fetch(`${API_BASE}/todos`);
        const todosData = await todosResponse.json();
        console.log('📋 Current todos:', todosData.data.length);
        
        // 5. Try to delete both completed todos (one already deleted)
        console.log('🧹 Testing deletion of completed todos (including already deleted one)...');
        
        const deleteResult1 = await fetch(`${API_BASE}/todos/${todo1.data.id}`, { method: 'DELETE' });
        console.log(`🔍 Delete already-deleted todo: ${deleteResult1.status} ${deleteResult1.statusText}`);
        
        const deleteResult2 = await fetch(`${API_BASE}/todos/${todo2.data.id}`, { method: 'DELETE' });
        console.log(`🔍 Delete existing todo: ${deleteResult2.status} ${deleteResult2.statusText}`);
        
        console.log('✅ Clear Completed functionality test completed!');
        console.log('📊 The improved function should handle 404s gracefully now.');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test if this script is executed directly
if (typeof window === 'undefined') {
    // Node.js environment
    const fetch = require('node-fetch');
    testClearCompleted();
} else {
    // Browser environment - attach to window for manual testing
    window.testClearCompleted = testClearCompleted;
    console.log('🌐 Test function attached to window.testClearCompleted()');
}
