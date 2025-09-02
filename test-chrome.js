#!/usr/bin/env node

// 简单的测试脚本
console.log('Testing Chrome connection...');

try {
    // 测试 Chrome DevTools Protocol 是否可访问
    const response = await fetch('http://localhost:9222/json/version');
    if (response.ok) {
        const data = await response.json();
        console.log('✅ Chrome DevTools Protocol is accessible');
        console.log('Chrome version:', data.Browser);
        console.log('WebSocket URL:', data.webSocketDebuggerUrl);
    } else {
        console.log('❌ Chrome DevTools Protocol returned error:', response.status);
    }
} catch (error) {
    console.log('❌ Chrome DevTools Protocol is not accessible');
    console.log('Error:', error.message);
    console.log('Make sure Chrome is running with --remote-debugging-port=9222');
}

console.log('\nMCP Server should be running in background...');
console.log('You can now configure it in Cursor!');
