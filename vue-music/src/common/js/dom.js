// 给DOM元素添加样式
export function addClass(el, className) {
    // console.log("ADD CLASS:   " + className)
    if (hasClass(el, className)) {
        return
    }
    // 把字符串className用空格拆开成字符串数组
    let newClass = el.className.split(' ')
    newClass.push(className)
    // 字符串数组还原成字符串
    el.className = newClass.join(' ')
}

// 判断DOM元素是否有class
export function hasClass(el, className) {
    let reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
    return reg.test(el.className)
}

// 取值设值一致封装
export function getData(el, name, val) {
    const prefix = 'data-'
    name = prefix + name
    if (val) {
        // 将name属性值设为val
        return el.setAttribute(name, val)
    } else {
        // 通过name获取name属性对应的值
        return el.getAttribute(name)
    }
}

let elementStyle = document.createElement('div').style

// 判断浏览器供应商，以便做兼容
let vendor = (() => {
    let transformNames = {
        webkit: 'webkitTransform',  //谷歌
        Moz: 'MozTransform',  // 火狐
        O: 'OTransform',  //欧朋
        ms: 'msTransform',  // IE
        standard: 'transform'  // 标准
    }

    for (let key in transformNames) {
        if (elementStyle[transformNames[key]] !== undefined) {
            return key
        }
    }
    return false
})()

// style加前缀做浏览器兼容
export function prefixStyle(style) {
    if (vendor === false) {
        return false
    }

    if (vendor === 'standard') {
        return style
    }

    // 前缀拼接原style首字母大写
    return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}
