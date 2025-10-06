class MusicTools {
    constructor() { }
    // 随机获取一首歌名称
    getRandomSong() {
        return "春婷雪";
    }
    // 根据歌名获取歌词
    getLyrics({ songName }) {
        return songName + "的歌词";
    }
}
export let musicTools = new MusicTools();
