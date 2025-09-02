#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 测试 MCP 服务器
async function testMCPServer() {
    console.log('Testing Chrome Logger MCP Server...');

    const mcpProcess = spawn('node', [join(__dirname, 'mcp-chrome.js')], {
        stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errorOutput = '';

    mcpProcess.stdout.on('data', (data) => {
        output += data.toString();
        console.log('STDOUT:', data.toString());
    });

    mcpProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.log('STDERR:', data.toString());
    });

    mcpProcess.on('close', (code) => {
        console.log(`MCP process exited with code ${code}`);
        if (code === 0) {
            console.log('✅ MCP Server started successfully');
        } else {
            console.log('❌ MCP Server failed to start');
            console.log('Error output:', errorOutput);
        }
    });

    // 等待一段时间后关闭
    setTimeout(() => {
        console.log('Stopping MCP server...');
        mcpProcess.kill();
    }, 5000);
}

// 测试 Chrome 连接
async function testChromeConnection() {
    console.log('\nTesting Chrome connection...');

    try {
        const response = await fetch('http://localhost:9222/json/version');
        const data = await response.json();
        console.log('✅ Chrome DevTools Protocol is accessible');
        console.log('Chrome version:', data.Browser);
    } catch (error) {
        console.log('❌ Chrome DevTools Protocol is not accessible');
        console.log('Make sure Chrome is running with --remote-debugging-port=9222');
    }
}

// 主函数
async function main() {
    console.log('=== Chrome Logger MCP Server Test ===\n');

    await testChromeConnection();
    await testMCPServer();
}

main().catch(console.error);
