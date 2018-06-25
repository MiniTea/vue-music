<template>
    <div class="progress-bar" ref="progressBar" @click="clickBar">
        <div class="bar-inner">
            <div class="progress" ref="progress"></div>
            <div class="progress-btn-wrapper" ref="progressBtn"
            @touchstart.prevent="barTouchstart"
            @touchmove.prevent="barTouchmove"
            @touchend.prevent="barTouchend">
                <div class="progress-btn"></div>
            </div>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
    import {prefixStyle} from 'common/js/dom'

    const BTN_WIDTH = 16
    const transform = prefixStyle('transform')

    export default {
        props: {
            barPrecent:{
                type: Number,
                default: 0
            }
        },
        created(){
            // 在barTouchstart，barTouchmove，barTouchend之间共享数据
            this.touch = {}
        },
        methods:{
            clickBar(e){
                // this._offsetWidth(e.offsetX)
                const rect = this.$refs.progressBar.getBoundingClientRect()
                const offsetWidth = e.pageX - rect.left
                this._offsetWidth(offsetWidth)
                this.progressChange()
            },
            barTouchstart(e){
                // 是否初始化标志位
                this.touch.initiated = true
                // 第一个手指位置的x坐标
                this.touch.startX = e.touches[0].pageX
                // 点击时进度条的宽度
                this.touch.left = this.$refs.progress.clientWidth
            } ,
            barTouchmove(e){
                if (!this.touch.initiated) {
                    return
                }
                const deltaX = e.touches[0].pageX - this.touch.startX
                const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - BTN_WIDTH, Math.max(0,this.touch.left + deltaX))
                this._offsetWidth(offsetWidth)
            },
            barTouchend(){
                this.touch.initiated = false
                this.progressChange()
            },
            progressChange(){
                const barWidth = this.$refs.progressBar.clientWidth - BTN_WIDTH
                const percent = this.$refs.progress.clientWidth / barWidth
                this.$emit('percentChange', percent)
            },
            _offsetWidth(offsetWidth){
                this.$refs.progress.style.width = `${offsetWidth}px`
                this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`
            }
        },
        watch:{
            barPrecent(newBarPrecent){
                if (newBarPrecent >= 0 && !this.touch.initiated){
                    const barWidth = this.$refs.progressBar.clientWidth - BTN_WIDTH
                    const offsetWidth = newBarPrecent * barWidth
                    this._offsetWidth(offsetWidth)
                }
            }
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~common/stylus/variable"

    .progress-bar
        height: 30px
        .bar-inner
            position: relative
            top: 13px
            height: 4px
            background: rgba(0, 0, 0, 0.3)
            .progress
                position: absolute
                height: 100%
                background: $color-theme
            .progress-btn-wrapper
                position: absolute
                left: -8px
                top: -13px
                width: 30px
                height: 30px
                .progress-btn
                    position: relative
                    top: 7px
                    left: 7px
                    box-sizing: border-box
                    width: 16px
                    height: 16px
                    border: 3px solid $color-text
                    border-radius: 50%
                    background: $color-theme
</style>
