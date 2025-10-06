export const createInitJson = (id) => {
    const jsonObj = {
        "jsonrpc": "2.0",
        "id": id,
        "result": {
            "protocolVersion": "2024-11-05",
            "capabilities": {
                "tools": {
                    "listChanged": true
                }
            },
            "serverInfo": {
                "name": "weather",
                "version": "1.0.0",
            },
            "instructions": "Test instructions for the client"

        }
    }
    const jsonStr = JSON.stringify(jsonObj)
    return jsonStr
}