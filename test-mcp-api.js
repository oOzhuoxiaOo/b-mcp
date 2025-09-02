#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// 简单的 MCP 服务器测试
async function main() {
    console.log('Testing MCP Server API...');

    const server = new Server({
        name: 'test-server',
        version: '1.0.0',
    });

    // 测试不同的 API 调用方式
    try {
        // 方法1：直接字符串
        server.setRequestHandler('tools/list', async () => {
            return { tools: [] };
        });
        console.log('✅ Method 1: Direct string - OK');
    } catch (error) {
        console.log('❌ Method 1: Direct string - Failed:', error.message);
    }

    try {
        // 方法2：使用对象
        server.setRequestHandler({ method: 'tools/list' }, async () => {
            return { tools: [] };
        });
        console.log('✅ Method 2: Object with method - OK');
    } catch (error) {
        console.log('❌ Method 2: Object with method - Failed:', error.message);
    }

    try {
        // 方法3：使用 Zod schema
        const { z } = await import('zod');
        const toolsListSchema = z.object({
            method: z.literal('tools/list')
        });
        server.setRequestHandler(toolsListSchema, async () => {
            return { tools: [] };
        });
        console.log('✅ Method 3: Zod schema - OK');
    } catch (error) {
        console.log('❌ Method 3: Zod schema - Failed:', error.message);
    }

    console.log('MCP Server API test completed');
}

main().catch(console.error);
