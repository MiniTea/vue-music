<template>
    <div class="recommend" ref="recommend">
        <!--<h3>推荐页</h3>-->
        <scroll ref="scroll" class="recommend-content" :data="disclist">
            <div>
                <!-- 确保recommends里有数据这个DOM才渲染 -->
                <div v-if="recommendData.length" class="slider-wrapper">
                    <div class="slider-content">
                        <slider>
                            <!-- 插槽DOM -->
                            <div v-for="item in recommendData">
                                <a :href="item.linkUrl">
                                    <!-- fastClick 监听 needsclick，防止click被fastClick阻止 -->
                                    <img class="needsclick" @load="loadImage" :src="item.picUrl" alt="图片失效">
                                </a>
                            </div>
                        </slider>
                    </div>
                </div>

                <div class="recommend-list">
                    <h1 class="list-title">歌单推荐</h1>
                    <ul>
                        <li @click="selectItem(item)" v-for="item in disclist" class="item">
                            <div class="icon">
                                <img width="60" height="60" v-lazy="item.imgurl" alt="image error">
                            </div>
                            <div class="text">
                                <h2 class="name" v-html="item.dissname"></h2>
                                <p class="desc" v-html="item.creator.name"></p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="loading-container" v-show="!disclist.length">
                <loading></loading>
            </div>
        </scroll>
        <router-view></router-view>
    </div>
</template>

<script type="text/ecmascript-6">
    import {getRecommend, getPlaylist} from '../../api/getRecommend'
    import {ERR_OK} from '../../api/urlConfig'
    import Slider from 'base/slider/slider'
    import Scroll from 'base/scroll/scroll'
    import Loading from 'base/loading/loading'
    import {playlistMixin} from "../../common/js/mixin";
    import {mapMutations} from 'vuex'
    import {SET_DISC} from "../../store/mutation-type";

    export default {
        mixins: [playlistMixin],
        data() {
            return {
                recommendData: [],
                disclist: []
            }
        },
        created() {
            // 获取数据
            this._getRecommend()
            this._getPlaylist()
        },
        methods: {
            selectItem(item){
                this.$router.push({
                    path: `recommend/${item.dissid}`
                })
                this.setDisc(item)
            },
            handlePlaylist(playlist){
                const bottom = playlist.length > 0 ? '60px' : ''
                this.$refs.recommend.style.bottom = bottom
                this.$refs.scroll.refresh()
            },
            // 轮播图数据
            _getRecommend() {
                getRecommend().then(res => {
                    if (res.code === ERR_OK) {
                        this.recommendData = res.data.slider
                        // console.log(this.recommendData)
                    }
                })
            },
            // 歌单数据
            _getPlaylist(){
                getPlaylist().then(res => {
                    if (res.code === ERR_OK) {
                        this.disclist = res.data.list
                        // console.log(this.disclist)
                    }
                })
            },
            // 图片加载时refresh Scroll确保滚动高度计算正确
            loadImage(){
                if(!this.checkLoaded){
                    this.$refs.scroll.refresh()
                    this.checkLoaded = true
                }
            },
            ...mapMutations({
                setDisc: 'SET_DISC'
            })
        },
        components: {
            Slider,
            Scroll,
            Loading
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~common/stylus/variable"

    .recommend
        position: fixed
        width: 100%
        top: 88px
        bottom: 0
        .recommend-content
            height: 100%
            overflow: hidden
            .slider-wrapper
                position: relative
                width: 100%
                height: 0
                padding-top: 40%
                overflow: hidden
                .slider-content
                    position: absolute
                    top: 0
                    left: 0
                    width: 100%
                    height: 100%
            // flex布局，左侧图片固定宽度，右侧自适应
            .recommend-list
                .list-title
                    height: 65px
                    line-height: 65px
                    text-align: center
                    font-size: $font-size-medium
                    color: $color-theme
                .item
                    display: flex
                    box-sizing: border-box
                    align-items: center
                    padding: 0 20px 20px 20px
                    .icon
                        flex: 0 0 60px
                        width: 60px
                        padding-right: 20px
                    // 这里上下text也是flex布局
                    .text
                        display: flex
                        flex-direction: column
                        justify-content: center
                        flex: 1
                        line-height: 20px
                        overflow: hidden
                        font-size: $font-size-medium
                        .name
                            margin-bottom: 10px
                            color: $color-text
                        .desc
                            color: $color-text-d
            .loading-container
                position: absolute
                width: 100%
                top: 50%
                transform: translateY(-50%)

</style>
