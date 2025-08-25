// Direct test of the issue - run this in browser console
(async () => {
    console.log('🧪 Starting comprehensive debug test...');
    
    // Test 1: Check DOM elements
    console.log('1️⃣ Testing DOM elements:');
    const todosList = document.getElementById('todosList');
    console.log('todosList element:', todosList);
    if (!todosList) {
        console.error('❌ todosList element not found!');
        return;
    }
    
    // Test 2: Direct API call
    console.log('2️⃣ Testing direct API call:');
    try {
        const response = await fetch('/api/todos');
        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.success && data.data.length > 0) {
            console.log('✅ API has data:', data.data.length, 'todos');
            
            // Test 3: Manual rendering
            console.log('3️⃣ Testing manual rendering:');
            const todosHTML = data.data.map(todo => `
                <div class="todo-item" data-id="${todo.id}">
                    <div class="todo-text">${todo.text}</div>
                </div>
            `).join('');
            
            todosList.innerHTML = todosHTML;
            console.log('✅ Manual rendering complete, check if todos appear');
            
        } else {
            console.error('❌ API returned no data');
        }
    } catch (error) {
        console.error('❌ API call failed:', error);
    }
    
    // Test 4: Check Service Worker interference
    console.log('4️⃣ Checking Service Worker:');
    if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        console.log('Service Worker registrations:', registrations.length);
        for (let registration of registrations) {
            console.log('SW:', registration.scope, registration.active?.state);
        }
    }
    
    console.log('🧪 Debug test complete');
})();
