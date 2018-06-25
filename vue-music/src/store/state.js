import {playMode} from "../common/js/config";

const state = {
    singer: {},
    disc: {},
    playing: false,
    fullScreen: false,
    playlist: [],
    sequenceList: [],
    mode: playMode.sequence,
    currentIndex: -1,  // 当前播放索引
    disc:{}
}

export default state
