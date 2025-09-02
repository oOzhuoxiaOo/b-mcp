#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('Testing MCP Server connection...');

// 启动 MCP 服务器
const mcpProcess = spawn('pnpm', ['exec', 'node', 'mcp-chrome.js'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: 'D:\\Mcp\\b-mcp'
});

// 监听输出
mcpProcess.stdout.on('data', (data) => {
    console.log('MCP Output:', data.toString());
});

mcpProcess.stderr.on('data', (data) => {
    console.log('MCP Error:', data.toString());
});

// 等待服务器启动
setTimeout(() => {
    console.log('MCP Server should be ready now');
    console.log('Please check Cursor for connection status');

    // 发送测试消息
    const testMessage = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {}
    };

    mcpProcess.stdin.write(JSON.stringify(testMessage) + '\n');

    // 5秒后关闭
    setTimeout(() => {
        mcpProcess.kill();
        console.log('Test completed');
    }, 5000);
}, 2000);
