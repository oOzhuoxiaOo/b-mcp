#!/usr/bin/env node

import CDP from 'chrome-remote-interface';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// 日志存储
const networkLogs = [];
const consoleLogs = [];

// 连接到Chrome CDP
let client = null;

async function connectToChrome() {
    try {
        console.log('Connecting to Chrome DevTools Protocol...');
        client = await CDP({ port: 9222 });

        // 启用必要的域
        await client.Network.enable();
        await client.Runtime.enable();
        await client.Log.enable();
        await client.Page.enable();

        console.log('Connected to Chrome successfully');

        // 监听网络事件
        client.Network.requestWillBeSent((params) => {
            const url = params.request.url;

            // 只记录 localhost 相关的请求
            if (isLocalhostUrl(url)) {
                networkLogs.push({
                    type: 'request',
                    timestamp: Date.now(),
                    requestId: params.requestId,
                    url: url,
                    method: params.request.method,
                    headers: params.request.headers,
                    postData: params.request.postData
                });
            }
        });

        client.Network.responseReceived((params) => {
            const url = params.response.url;

            // 只记录 localhost 相关的响应
            if (isLocalhostUrl(url)) {
                networkLogs.push({
                    type: 'response',
                    timestamp: Date.now(),
                    requestId: params.requestId,
                    url: url,
                    status: params.response.status,
                    statusText: params.response.statusText,
                    headers: params.response.headers,
                    mimeType: params.response.mimeType
                });
            }
        });

        // 监听控制台事件
        client.Runtime.consoleAPICalled((params) => {
            consoleLogs.push({
                type: 'console',
                timestamp: Date.now(),
                level: params.type,
                message: params.args.map(arg => arg.value || arg.description).join(' '),
                stackTrace: params.stackTrace
            });
        });

        client.Runtime.exceptionThrown((params) => {
            consoleLogs.push({
                type: 'exception',
                timestamp: Date.now(),
                level: 'error',
                message: params.exceptionDetails.text,
                stackTrace: params.exceptionDetails.stackTrace
            });
        });

        console.log('Event listeners setup completed');

    } catch (error) {
        console.error('Failed to connect to Chrome:', error.message);
        console.log('Please make sure Chrome is running with --remote-debugging-port=9222');
        process.exit(1);
    }
}

// 判断是否为 localhost URL
function isLocalhostUrl(url) {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase();

        // 检查是否为 localhost 相关域名
        return hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname.startsWith('localhost:') ||
            hostname.startsWith('127.0.0.1:') ||
            hostname.includes('localhost') ||
            hostname.includes('127.0.0.1');
    } catch (error) {
        // 如果 URL 解析失败，检查是否包含 localhost 关键词
        return url.toLowerCase().includes('localhost') ||
            url.toLowerCase().includes('127.0.0.1');
    }
}

// 过滤网络日志
function filterNetworkLogs(filters = {}) {
    let filtered = [...networkLogs];

    // 默认过滤掉大型文件模块
    if (!filters.includeLargeFiles) {
        filtered = filtered.filter(log => {
            const url = log.url || '';

            // 过滤掉大型文件类型
            const largeFileExtensions = [
                '.js', '.css', '.map', '.woff', '.woff2', '.ttf', '.eot',
                '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp',
                '.mp4', '.webm', '.mp3', '.wav', '.pdf', '.zip', '.tar.gz'
            ];

            // 过滤掉包含这些关键词的URL
            const largeFileKeywords = [
                'bundle', 'chunk', 'vendor', 'polyfill', 'runtime',
                'devtools', 'extension', 'plugin', 'module', 'framework',
                'library', 'sdk', 'api', 'cdn', 'static', 'assets',
                'images', 'fonts', 'media', 'downloads', 'uploads'
            ];

            // 检查是否是大型文件
            const hasLargeExtension = largeFileExtensions.some(ext =>
                url.toLowerCase().includes(ext)
            );

            const hasLargeKeyword = largeFileKeywords.some(keyword =>
                url.toLowerCase().includes(keyword)
            );

            // 过滤掉大型文件
            return !hasLargeExtension && !hasLargeKeyword;
        });
    }

    if (filters.urlContains) {
        filtered = filtered.filter(log =>
            log.url && log.url.includes(filters.urlContains)
        );
    }

    if (filters.status) {
        filtered = filtered.filter(log =>
            log.type === 'response' && log.status === filters.status
        );
    }

    if (filters.type) {
        filtered = filtered.filter(log => log.type === filters.type);
    }

    return filtered;
}

// 过滤控制台日志
function filterConsoleLogs(filters = {}) {
    let filtered = [...consoleLogs];

    if (filters.type) {
        filtered = filtered.filter(log => log.type === filters.type);
    }

    if (filters.level) {
        filtered = filtered.filter(log => log.level === filters.level);
    }

    return filtered;
}

// 创建MCP服务器
async function createMCPServer() {
    const server = new McpServer({
        name: 'chrome-logger',
        version: '1.0.0',
    });

    // 添加 getNetworkLogs 工具
    server.tool(
        'getNetworkLogs',
        z.object({
            urlContains: z.string().optional(),
            status: z.number().optional(),
            type: z.enum(['request', 'response']).optional(),
            limit: z.number().default(100),
            includeLargeFiles: z.boolean().default(false)
        }),
        async ({ urlContains, status, type, limit, includeLargeFiles }) => {
            const networkFilters = { urlContains, status, type, includeLargeFiles };
            const networkResults = filterNetworkLogs(networkFilters);

            const result = {
                count: networkResults.length,
                logs: networkResults.slice(-limit),
                summary: {
                    requests: networkResults.filter(log => log.type === 'request').length,
                    responses: networkResults.filter(log => log.type === 'response').length,
                    errors: networkResults.filter(log =>
                        log.type === 'response' && log.status >= 400
                    ).length
                }
            };

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(result, null, 2)
                    }
                ]
            };
        }
    );

    // 添加 getConsoleLogs 工具
    server.tool(
        'getConsoleLogs',
        z.object({
            type: z.enum(['console', 'exception']).optional(),
            level: z.enum(['log', 'warn', 'error', 'info', 'debug']).optional(),
            limit: z.number().default(100)
        }),
        async ({ type, level, limit }) => {
            const consoleFilters = { type, level };
            const consoleResults = filterConsoleLogs(consoleFilters);

            const result = {
                count: consoleResults.length,
                logs: consoleResults.slice(-limit),
                summary: {
                    console: consoleResults.filter(log => log.type === 'console').length,
                    exceptions: consoleResults.filter(log => log.type === 'exception').length,
                    errors: consoleResults.filter(log => log.level === 'error').length,
                    warnings: consoleResults.filter(log => log.level === 'warn').length
                }
            };

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(result, null, 2)
                    }
                ]
            };
        }
    );

    return server;
}

// 主函数
async function main() {
    console.log('Starting Chrome Logger MCP Server...');

    // 连接到Chrome
    await connectToChrome();

    // 创建MCP服务器
    const server = await createMCPServer();

    // 启动服务器
    const transport = new StdioServerTransport();

    try {
        await server.connect(transport);
        console.log('Chrome Logger MCP Server connected successfully');
    } catch (error) {
        console.error('Failed to connect MCP server:', error);
        process.exit(1);
    }

    // 处理进程退出
    process.on('SIGINT', async () => {
        console.log('Received SIGINT, shutting down...');
        if (client) {
            await client.close();
        }
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        console.log('Received SIGTERM, shutting down...');
        if (client) {
            await client.close();
        }
        process.exit(0);
    });
}

// 启动服务器
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
