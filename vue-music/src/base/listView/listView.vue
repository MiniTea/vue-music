<template>
    <scroll class="listview" :data="data" ref="listView" :listenScroll="listenScroll" @scroll="scroll" :probeType="probeType">
        <!-- 歌手列表 -->
        <ul>
            <li v-for="group in data" class="list-group" ref="listGroup">
                <h2 class="list-group-title">{{group.title}}</h2>
                <ul>
                    <li v-for="item in group.items" class="list-group-item" @click="selectItem(item)">
                        <img class="listImage" v-lazy="item.imageSrc" alt="">
                        <span class="name">{{item.name}}</span>
                    </li>
                </ul>
            </li>
        </ul>
        <!-- 右侧导航 -->
        <div class="list-shortcut" @touchstart="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove">
            <ul>
                <li v-for="(item, index) in shortcutList" :data-index="index" class="item" :class="{'current': currentIndex === index}">{{item}}</li>
            </ul>
        </div>
        <!-- 固定标题 -->
        <div ref="listFixed" class="list-fixed" v-show="fixedTitle">
            <h1 class="fixed-title">{{fixedTitle}}</h1>
        </div>
        <div class="loading-container" v-show="!data.length">
            <loading></loading>
        </div>
    </scroll>
</template>

<script type="text/ecmascript-6">
    import Scroll from 'base/scroll/scroll'
    import Loading from 'base/loading/loading'
    import {getData} from "../../common/js/dom";

    const ITEM_HIGTH = 18
    const TITLE_HEIGHT = 30

    export default {
        created(){
            // touch存放滑屏位移数据，listenScroll设置右侧快速入口，listHeight存放27个不同分组的高度
            this.touch = {}
            this.listenScroll = true
            this.listHeight = []
            this.probeType = 3
        },
        data(){
            return{
                // 控制右侧选中高亮
                scrollY: -1,
                currentIndex: 0,
                diff: -1
            }
        },
        props:{
            data: {
                type: Array,
                default: []
            }
        },
        computed: {
            shortcutList(){
                return this.data.map((group) => {
                    return group.title.substr(0, 1)
                })
            },
            fixedTitle(){
                if (this.scrollY > 0){
                    return ''
                }
                return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
            }
        },
        methods: {
            refresh(){
                this.$refs.listView.refresh()
            },
            selectItem(item){
                this.$emit('select', item)
            },
            onShortcutTouchStart(e){
                let anchorIndex = getData(e.target, 'index')
                let touchStart = e.touches[0]
                this.touch.y1 = touchStart.pageY
                this.touch.anchorIndex = anchorIndex
                this._scrollTo(anchorIndex)
            },
            onShortcutTouchMove(e){
                let touchStart = e.touches[0]
                this.touch.y2 = touchStart.pageY
                //计算滑过了几条数据，向下取整
                let delta = (this.y2 - this.y1) / ITEM_HIGTH | 0
                let anchorIndex = parseInt(this.touch.anchorIndex) + delta
                this._scrollTo(anchorIndex)
            },
            scroll(pos){
                  this.scrollY = pos.y
            },
            // 点击时派发
            _scrollTo(index){
                // 禁止右侧导航顶端底部样式块响应点击
                if(!index && index!==0){
                    return
                }
                this.scrollY = -this.listHeight[index]
                this.$refs.listView.scrollToElement(this.$refs.listGroup[index], 0)
            },
            // 计算每个group高度
            _calculateGroupHight(){
                this.listHeight =[]
                const list = this.$refs.listGroup
                let height = 0
                this.listHeight.push(height)
                for(let i=0; i<list.length; i++){
                    let item = list[i]
                    height += item.clientHeight
                    this.listHeight.push(height)
                }
            }
        },
        watch: {
            data(){
                setTimeout(() => {
                    this._calculateGroupHight()
                }, 20)
            },
            // 判定当前位置对应字母
            scrollY(newY){
                const listHeight = this.listHeight
                // 滚动到最顶部
                if (newY > 0){
                    this.currentIndex = 0
                    return
                }
                // 在中间
                for(let i=0; i<listHeight.length-1; i++){
                    let height1 = listHeight[i]
                    let height2 = listHeight[i+1]
                    if (!height2 || (-newY>=height1 && -newY<height2)){
                        this.currentIndex = i
                        this.diff = height2 + newY
                        return
                    }
                }
                // 滚动到最后一个
                this.currentIndex = listHeight.length-2
            },
            diff(newVal){
                let fixedTop = (newVal>0 && newVal<TITLE_HEIGHT) ? newVal-TITLE_HEIGHT : 0
                if(this.fixedTop === fixedTop){
                    return
                }
                this.fixedTop = fixedTop
                this.$refs.listFixed.style.transform = `translate3d(0, ${fixedTop}px, 0)`
            }
        },
        components:{
            Scroll,
            Loading
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~common/stylus/variable"

    .listview
        position: relative
        width: 100%
        height: 100%
        overflow: hidden
        background: $color-background
        .list-group
            padding-bottom: 30px
            .list-group-title
                height: 30px
                line-height: 30px
                padding-left: 20px
                font-size: $font-size-small
                color: $color-text-l
                background: $color-highlight-background
            .list-group-item
                display: flex
                align-items: center
                padding: 20px 0 0 30px
                .listImage
                    width: 50px
                    height: 50px
                    border-radius: 50%
                .name
                    margin-left: 20px
                    color: $color-text-l
                    font-size: $font-size-medium
        .list-shortcut
            position: absolute
            z-index: 30
            right: 0
            top: 50%
            transform: translateY(-50%)
            width: 30px
            padding: 20px 0
            border-radius: 10px
            text-align: center
            background: $color-background-d
            font-family: Helvetica
            .item
                padding: 4px
                line-height: 1
                color: $color-text-l
                font-size: $font-size-small
                &.current
                    color: $color-theme
        .list-fixed
            position: absolute
            top: 0
            left: 0
            width: 100%
            .fixed-title
                height: 30px
                line-height: 30px
                padding-left: 20px
                font-size: $font-size-small
                color: $color-text-l
                background: $color-highlight-background
        .loading-container
            position: absolute
            width: 100%
            top: 50%
            transform: translateY(-50%)
</style>
