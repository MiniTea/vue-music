<template>
    <div class="progress-circle">
        <svg :width="radius" :height="radius" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <circle class="progress-background" r="50" cx="50" cy="50" fill="transparent"></circle>
            <circle class="progress-bar" r="50" cx="50" cy="50" fill="transparent" :stroke-dasharray="dashArray"
                    :stroke-dashoffset="dashArrayPrecent"></circle>
        </svg>
        <slot></slot>
    </div>
</template>

<script type="text/ecmascript-6">
    export default {
        props: {
            radius: {
                type: Number,
                default: 0
            },
            percent: {
                type: Number,
                default: 0
            }
        },
        data() {
            return {
                dashArray: Math.PI * 100
            }
        },
        computed: {
            dashArrayPrecent(){
                return this.dashArray * (1-this.percent)
            }
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~common/stylus/variable"

    .progress-circle
        position: relative
        circle
            stroke-width: 8px // 描边宽度
            transform-origin: center
            // 内层圆
            &.progress-background
                transform: scale(0.9) // 缩放0.9
                stroke: $color-theme-d
            // 外层圆
            &.progress-bar
                transform: scale(0.9) rotate(-90deg) //  起始位置
                stroke: $color-theme
</style>
