import { createInitJson } from "./init/index.mjs";
import { tools } from "./tools/index.mjs";
import { musicTools } from "./tools/fn.mjs";


// 监听ai应用端传来的消息
process.stdin.on("data", (data) => {
    // 将消息转换为json对象
    const json = JSON.parse(data);
    // 创建初始化json
    let initJsonStr = createInitJson(json.id)
    // 如果方法为initialize，则返回初始化json
    if (json.method === "initialize") {
        process.stdout.write(initJsonStr + "\n");
    }
    // 如果方法为tools/list，则返回工具列表
    if (json.method === "tools/list") {
        const res = {
            "jsonrpc": "2.0",
            "id": json.id,
            "result": { tools }
        }
        process.stdout.write(JSON.stringify(res) + "\n");
    }
    // 如果方法为tools/call，则调用工具
    if (json.method === "tools/call") {
        let fnName = json.params.name
        console.error("fnName", fnName)
        const result = musicTools[fnName](json.params.arguments)
        const res = {
            "jsonrpc": "2.0",
            "id": json.id,
            "result": { content: [{ type: "text", text: "这是调用结果：" + result }] }
        }
        process.stdout.write(JSON.stringify(res) + "\n");
    }
});