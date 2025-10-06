
export const tools = [
    {
        "name": "getLyrics",
        "title": "获取歌词",

        "description": "获取歌词",
        "inputSchema": {
            "type": "object",
            "properties": {
                "songName": {
                    "type": "string",
                    "description": "歌曲名称"
                }
            },
            "required": ["songName"]
        }

    },
    {
        "name": "getRandomSong",
        "title": "获取随机歌曲",
        "description": "获取随机歌曲",
        "inputSchema": {
            "type": "object",
            "properties": {},
            "required": []
        }
    }
]