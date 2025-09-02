# Chrome Logger MCP Server

一个基于 `chrome-remote-interface` 的 MCP 服务器，用于获取 Chrome 浏览器的网络日志和控制台日志。

## 🚀 快速开始

### 1. 启动 Chrome 带调试端口

```bash
chrome --remote-debugging-port=9222
```

**注意：保持 Chrome 不要关闭**

### 2. 安装依赖

```bash
pnpm install
```

### 3. 启动 MCP 服务器

```bash
pnpm start
```

### 4. 配置 Cursor

在 `~/.cursor/mcp.json` 中添加：

```json
{
  "mcpServers": {
    "chrome-logger": {
      "command": "pnpm",
      "args": ["exec", "node", "D:\\Mcp\\b-mcp\\mcp-chrome.js"],
      "env": {
        "NODE_ENV": "development"
      },
      "description": "Chrome browser logging tools"
    }
  }
}
```

## 🛠️ 可用工具

### 1. getNetworkLogs

获取网络请求和响应日志

**参数：**
- `urlContains` (string): 过滤包含指定URL的日志
- `status` (number): 过滤指定状态码的响应
- `type` (string): 过滤请求或响应类型 ('request' | 'response')
- `limit` (number): 返回日志数量限制，默认100

**示例：**
```
@chrome-logger.getNetworkLogs { "urlContains": "api", "limit": 50 }
```

### 2. getConsoleLogs

获取控制台日志

**参数：**
- `type` (string): 过滤日志类型 ('console' | 'exception')
- `level` (string): 过滤日志级别 ('log' | 'warn' | 'error' | 'info' | 'debug')
- `limit` (number): 返回日志数量限制，默认100

**示例：**
```
@chrome-logger.getConsoleLogs { "level": "error", "limit": 20 }
```

## 📊 返回数据格式

### 网络日志
```json
{
  "count": 10,
  "logs": [
    {
      "type": "request",
      "timestamp": 1703123456789,
      "requestId": "123.1",
      "url": "https://api.example.com/data",
      "method": "GET",
      "headers": {...}
    },
    {
      "type": "response",
      "timestamp": 1703123457000,
      "requestId": "123.1",
      "url": "https://api.example.com/data",
      "status": 200,
      "statusText": "OK",
      "headers": {...}
    }
  ],
  "summary": {
    "requests": 5,
    "responses": 5,
    "errors": 1
  }
}
```

### 控制台日志
```json
{
  "count": 5,
  "logs": [
    {
      "type": "console",
      "timestamp": 1703123456789,
      "level": "error",
      "message": "Failed to load resource",
      "stackTrace": {...}
    }
  ],
  "summary": {
    "console": 4,
    "exceptions": 1,
    "errors": 2,
    "warnings": 1
  }
}
```

## 🔧 技术架构

- **chrome-remote-interface**: 连接 Chrome DevTools Protocol
- **@modelcontextprotocol/sdk**: MCP 协议实现
- **zod**: 数据验证
- **ES Modules**: 现代 JavaScript 模块系统

## 🎯 使用场景

1. **Web 开发调试**: 实时监控网络请求和响应
2. **错误排查**: 收集控制台错误和异常
3. **性能监控**: 分析网络请求性能
4. **API 测试**: 验证 API 调用和响应

## 🚨 注意事项

1. 确保 Chrome 以 `--remote-debugging-port=9222` 启动
2. 保持 Chrome 浏览器打开
3. 网络日志和控制台日志存储在内存中，重启服务器会清空
4. 建议在生产环境中添加日志持久化功能
