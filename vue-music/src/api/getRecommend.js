import jsonp from 'common/js/jsonp'
import {commonParams, options} from './urlConfig'
import axios from 'axios'

// 应用getPlaylist，getDisclist
const debug = process.env.NODE_ENV !== 'production'

export function getRecommend() {
    const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'

    const data = Object.assign({}, commonParams, {
        platform: 'h5',
        uin: 0,
        needNewCode: 1,
        format: 'jsonp'
    })

    return jsonp(url, data, options)
}

export function getPlaylist() {
    // 代理服务地址
    const url = debug ? '/api/getPlaylist' : 'http://musicforme/music/api/getPlaylist'

    const data = Object.assign({}, commonParams, {
        platform: 'yqq',
        hostUin: 0,
        sin: 0,
        ein: 29,
        sortId: 5,
        needNewCode: 0,
        categoryId: 10000000,
        rnd: Math.random(),
        format: 'json'
    })

    return axios.get(url, {
        params: data
    }).then(res => {
        return Promise.resolve(res.data)
    }).catch(err => {
        console.log("getPlaylist error: "+err)
    })
}

export function getSongList(disstid) {
    const url = '/api/getCdInfo'

    const data = Object.assign({}, commonParams, {
        disstid,
        type: 1,
        json: 1,
        utf8: 1,
        onlysong: 0,
        platform: 'yqq',
        hostUin: 0,
        needNewCode: 0
    })

    return axios.get(url, {
        params: data
    }).then(res => {
        return Promise.resolve(res.data)
    })
}

export function getDisclist(dissid) {
    const url = debug ? '/api/getDisclist' : 'http://musicforme/music/api/getDisclist'

    const data = Object.assign({}, commonParams, {
        disstid: dissid,
        type: 1,
        json: 1,
        utf8: 1,
        onlysong: 0,
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
