function getRandomInt(max, min) {
    // 返回max和min中间的一个数，包括max,min
    return Math.floor(Math.random() * (max - min + 1) + min)
}

// 实现洗牌函数
export function shuffle(arr) {
    // 创建一个副本，防止对arr本身改变
    let _arr = arr.slice()
    for (let i = 0; i < _arr.length; i++){
        let j = getRandomInt(0, i)
        let t = _arr[i]
        _arr[i] = _arr[j]
        _arr[j] = t
    }
    return _arr
}
