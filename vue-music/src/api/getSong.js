import {commonParams} from "./urlConfig";
import {getUid} from "../common/js/uid";
import {ERR_OK} from "./urlConfig";
import axios from 'axios'

// const debug = process.env.NODE_ENV !== 'production'

// 获取播放地址
export function getSongsUrl(songs) {
    const url = '/api/getPurlUrl'

    let mids = []
    let types = []

    songs.forEach(song => {
        mids.push(song.mid)
        types.push(0)
    })

    const urlMid = getUrlMid(mids, types)

    const data = Object.assign({}, commonParams, {
        g_tk: 5381,
        format: 'json',
        platform: 'h5',
        needNewCode: 1,
        uin: 0
    })

    return new Promise((resolve, reject) => {
        let tryTime = 3

        function request() {
            return axios.post(url, {
                comm: data,
                url_mid: urlMid
            }).then(response => {
                const res = response.data
                if (res.code === ERR_OK) {
                    let urlMid = res.url_mid
                    if (urlMid && urlMid.code === ERR_OK) {
                        const info = urlMid.data.midurlinfo[0]
                        if (info && info.purl) {
                            resolve(res)
                        } else {
                            retry()
                        }
                    } else {
                        retry()
                    }
                } else {
                    retry()
                }
            })
        }

        function retry() {
            if (--tryTime >= 0) {
                request()
            } else {
                reject(new Error('Can not get the songs url'))
            }
        }

        request()
    })
}

function getUrlMid(mids, types) {
    const guid = getUid()
    return {
        module: 'vkey.GetVkeyServer',
        method: 'CgiGetVkey',
        param: {
            guid,
            songmid: mids,
            songtype: types,
            uin: '0',
            loginflag: 0,
            platform: '23'
        }
    }
}

export function getLyric(mid) {
    const url = '/api/getLyric'

    const data = Object.assign({}, commonParams, {
        songmid: mid,
        pcachetime: +new Date(),
        platform: 'yqq',
        hostUin: 0,
        needNewCode: 0,
        g_tk: 67232076,
        format: 'json'
    })

    return axios.get(url, {
        params: data
    }).then(res => {
        return Promise.resolve(res.data)
    })
}