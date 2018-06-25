// 对jsonp做一个promise封装
import originJSONP from 'jsonp'

// data:实际url中的参数
export default function jsonp(url, data, option) {
    // data前面没有？拼接一个？，否则拼接&
    url += (url.indexOf('?') < 0 ? '?' : '&') + param(data)

    return new Promise((resolve, reject) => {
        originJSONP(url, option, (err, data) => {
            if (!err) {
                // 成功
                resolve(data)
            } else {
                // 失败
                reject(err)
            }
        })
    })
}

// url拼接
function param(data) {
    let url = ''
    for (let i in data) {
        // 不能直接传undefined给后台
        let value = data[i] !== undefined ? data[i] : ''
        url += `&${i}=${encodeURIComponent(value)}`
    }
    // 如果有data删掉第一个&
    return url ? url.substring(1) : ''
}
