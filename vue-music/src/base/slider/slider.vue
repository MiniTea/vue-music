<template>
    <div class="slider" ref="slider">
        <div class="slider-group" ref="sliderGroup">
            <slot></slot>
        </div>
        <div class="dots">
            <span class="dot" v-for="(dot, index) in dots" :class="{active: imageIndex === index}"></span>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
    import BScroll from 'better-scroll'
    import {addClass} from "../../common/js/dom";

    export default {
        data() {
            return {
                dots: [],
                imageIndex: 0
            }
        },
        props: {
            // 循环轮播
            loop: {
                type: Boolean,
                default: true
            },
            // 自动轮播
            autoPlay: {
                type: Boolean,
                default: true
            },
            // 自动轮播间隔3s
            interval: {
                type: Number,
                default: 3000
            }
        },
        mounted() {
            // 为确保DOM完成渲染加20ms延时，浏览器刷新间隔为17ms
            setTimeout(() => {
                this._setSliderWidth()
                // 因为在使用__initSlider()之后会在原DOM左右各克隆一个DOM，所有小圆点要在这之前init
                this._initDots()
                this._initSlider()

                if(this.autoPlay) {
                    this._autoPlay()
                }
            }, 20)
        },
        destroyed(){
            // 组件销毁时清理定时器等资源，利于内存释放
            clearTimeout(this.timer)
        },
        methods: {
            // 自动轮播控制
            _autoPlay(){
                let imageIndex = this.slider.getCurrentPage().pageX
                // console.log(imageIndex)
                if (this.loop){
                    imageIndex += 1
                }
                // console.log(imageIndex)
                this.timer = setTimeout(() => {
                    // better-scrool提供goToPage(indexX, indexY, time)
                    this.slider.goToPage(imageIndex, 0, 400)
                }, this.interval)

                // 监听窗口大小是否改变，以判定是否重新计算宽度
                window.addEventListener('resize', () => {
                    if(!this.slider){
                        return
                    }
                    this._setSliderWidth(true)
                    // 计算完宽度之后刷新，BScroll接口
                    this.slider.refresh()
                })
            },
            // 初始化小圆点dots
            _initDots(){
                this.dots = new Array(this.children.length)
            },
            // 初始化宽度
            _setSliderWidth(isResize) {
                this.children = this.$refs.sliderGroup.children

                // 总宽度
                let width = 0
                // 获取父容器可视区宽度
                let sliderWidth = this.$refs.slider.clientWidth
                // console.log(sliderWidth)

                for (let i = 0; i < this.children.length; i++) {
                    let child = this.children[i]
                    //给每个child添加样式并设置宽度为父容器宽度
                    addClass(child, 'slider-item')
                    child.style.width = sliderWidth + 'px'
                    width += sliderWidth
                }

                // 如果使用循环切换，应左右克隆两个DOM保证循环切换效果，此时宽度为3个sliderWidth
                // 注意只能设一次，窗口大小重设width时用标志位isResize检测
                if (this.loop && !isResize) {
                    width += 2 * sliderWidth
                }
                // console.log(width)

                this.$refs.sliderGroup.style.width = width + 'px'
            },
            // 初始化Slider，配置BScroll
            _initSlider() {
                // console.log(this.$refs.slider)
                this.slider = new BScroll(this.$refs.slider, {
                    scrollX: true,
                    scrollY: false,
                    momentum: false,
                    snap: true,
                    snapLoop: this.loop,
                    snapThreshold: 0.3,
                    snapSpeed: 400
                })
                // 滚动结束派发，关联小圆点
                this.slider.on('scrollEnd', () => {
                    let imageIndex = this.slider.getCurrentPage().pageX
                    if (this.loop){
                        // 实际开头会多一个DOM，所以要-1
                        imageIndex -= 1
                    }
                    this.imageIndex = imageIndex

                    // 关联自动播放
                    if(this.autoPlay){
                        clearTimeout(this.timer)
                        this._autoPlay()
                    }
                })
            }
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~common/stylus/variable"

    .slider
        min-height: 1px
        .slider-group
            position: relative
            overflow: hidden
            white-space: nowrap
            // 子元素的通用样式，添加到child里
            .slider-item
                float: left
                box-sizing: border-box
                overflow: hidden
                text-align: center
                a
                    display: block
                    width: 100%
                    overflow: hidden
                    text-decoration: none
                img
                    display: block
                    width: 100%
        .dots
            position: absolute
            right: 0
            left: 0
            bottom: 12px
            transform: translateZ(1px)
            text-align: center
            font-size: 0
            .dot
                display: inline-block
                margin: 0 4px
                width: 8px
                height: 8px
                border-radius: 50%
                background: $color-text-l
                &.active
                    width: 20px
                    border-radius: 5px
                    background: $color-text-ll
</style>
