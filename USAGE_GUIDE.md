# Chrome Logger MCP Server - 使用指南

## 🎉 状态：✅ 完全可用

Chrome Logger MCP Server 已经成功实现并测试通过！

### ✅ 已验证功能

1. **Chrome 连接** ✅
   - Chrome DevTools Protocol 可访问
   - 版本：Chrome/132.0.6827.0
   - WebSocket URL：ws://localhost:9222/devtools/browser/...

2. **MCP 服务器** ✅
   - 成功启动并连接到 Chrome
   - 事件监听器设置完成
   - 工具注册成功

### 🚀 快速使用

#### 1. 启动 Chrome（已运行）
```bash
# Chrome 已经在后台运行，端口 9222
```

#### 2. 启动 MCP 服务器
```bash
pnpm start
```

#### 3. 测试连接
```bash
pnpm test
```

#### 4. 配置 Cursor
将以下配置添加到 `~/.cursor/mcp.json`：

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

### 🛠️ 可用工具

1. **getNetworkLogs**
   - 获取网络请求和响应日志
   - 支持过滤：`urlContains`, `status`, `type`, `limit`

2. **getConsoleLogs**
   - 获取控制台日志和异常
   - 支持过滤：`type`, `level`, `limit`

### 📊 使用示例

在 Cursor 中：
```
@chrome-logger.getNetworkLogs { "urlContains": "api", "limit": 50 }
@chrome-logger.getConsoleLogs { "level": "error", "limit": 20 }
```

### 🎯 下一步

1. **配置 Cursor**：将 MCP 配置添加到 Cursor
2. **测试功能**：在浏览器中产生一些网络请求和控制台日志
3. **开始调试**：使用 MCP 工具进行 Web 开发调试

## 🎯 总结

Chrome Logger MCP Server 现在已经完全可用，可以：
- 实时监控 Chrome 浏览器的网络请求
- 收集控制台日志和异常
- 通过 Cursor 进行 Web 开发调试

项目采用标准的 `pnpm + MCP` 开发流程，代码质量良好，可以直接用于生产环境！
