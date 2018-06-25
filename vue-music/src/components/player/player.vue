<template>
    <div class="player" v-show="playlist.length">
        <transition name="normal"
                    @enter="enter" @after-enter="afterEnter"
                    @leave="leave" @after-leave="afterLeave">
            <div class="normal-player" v-show="fullScreen">
                <div class="background">
                    <img :src="currentSong.image" alt="" width="100%" height="100%">
                </div>
                <div class="top">
                    <div class="back" @click="back">
                        <i class="icon-back"></i>
                    </div>
                    <h1 class="title" v-html="currentSong.name"></h1>
                    <h2 class="subtitle" v-html="currentSong.singer"></h2>
                </div>
                <div class="middle"
                     @touchstart.prevent="middleTouchStart" @touchmove.prevent="middleTouchMove" @touchend.prevent="middleTouchEnd">
                    <div class="middle-l" ref="cdImage">
                        <div class="cd-wrapper" ref="cdWrapper">
                            <div class="cd" :class="cdRotate">
                                <img :src="currentSong.image" alt="" class="image">
                            </div>
                        </div>
                        <div @click.prevent="openLyric" class="playing-lyric-wrapper">
                            <div class="playing-lyric">{{playingLyric}}</div>
                        </div>
                    </div>
                    <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
                        <div class="lyric-wrapper">
                            <div v-if="currentLyric">
                                <p class="text" :class="{'current': lineNum === index}" ref="lyricLine"
                                   v-for="(line, index) in currentLyric.lines"
                                   v-html="line.txt"></p>
                            </div>
                            <!--<div v-if="!currentLyric.length">-->
                                <!--<p class="text">该歌曲无歌词</p>-->
                            <!--</div>-->
                        </div>
                    </scroll>
                </div>
                <div class="bottom">
                    <div class="dot-wrapper">
                        <span class="dot" :class="{'active':currentShow==='cd'}"></span>
                        <span class="dot" :class="{'active':currentShow==='lyric'}"></span>
                    </div>
                    <div class="progress-wrapper">
                        <span class="time time-l">{{format(currentTime)}}</span>
                        <div class="progress-bar-wrapper">
                            <progress-bar :barPrecent="barPrecent" @percentChange="progressBarChange"></progress-bar>
                        </div>
                        <span class="time time-r">{{format(currentSong.duration)}}</span>
                    </div>
                    <div class="operators">
                        <div @click="changeMode" class="icon i-left">
                            <i :class="iconMode"></i>
                        </div>
                        <div class="icon i-left" :class="disableClass">
                            <i @click="prevSong" class="icon-prev"></i>
                        </div>
                        <div class="icon i-center" :class="disableClass">
                            <i @click="togglePlaying" :class="playIcon"></i>
                        </div>
                        <div class="icon i-right" :class="disableClass">
                            <i @click="nextSong" class="icon-next"></i>
                        </div>
                        <!--<div class="icon i-right">-->
                            <!--<i class="icon-not-favorite"></i>-->
                        <!--</div>-->
                    </div>
                </div>
            </div>
        </transition>
        <transition name="mini">
            <div class="mini-player" v-show="!fullScreen" @click="open">
                <div class="icon">
                    <div class="imgWrapper" ref="imgWrapper">
                        <img :class="cdRotate" :src="currentSong.image" alt="" width="40" height="40">
                    </div>
                </div>
                <div class="text">
                    <h2 class="name" v-html="currentSong.name"></h2>
                    <p class="desc" v-html="currentSong.singer"></p>
                </div>
                <div class="text">
                    <div class="lyricMini">{{playingLyric}}</div>
                </div>
                <div class="control"></div>
                <div class="control">
                    <progress-circle :radius="radius" :percent="barPrecent">
                        <i class="icon-mini" @click.stop="togglePlaying" :class="miniPlayIcon"></i>
                    </progress-circle>
                </div>
            </div>
        </transition>
        <audio :src="currentSong.url" ref="audio" @canplay="audioReady" @error="audioError"
               @timeupdate="audioTimeupdate" @ended="endPlay"></audio>
    </div>
</template>

<script type="text/ecmascript-6">
    import {mapGetters, mapMutations} from 'vuex'
    import animations from 'create-keyframe-animation'
    import {profixStyle} from 'common/js/dom'
    import {prefixStyle} from "../../common/js/dom";
    import {currentIndex} from "../../store/getters";
    import ProgressBar from 'base/progress-bar/progress-bar'
    import ProgressCircle from 'base/progress-circle/progress-circle'
    import {createSong} from "../../common/js/song";
    import Lyric from 'lyric-parser'
    import Scroll from 'base/scroll/scroll'
    import {playMode} from "../../common/js/config";
    import {shuffle} from "../../common/js/util";

    const transform = prefixStyle('transform')
    const transitionDuration = prefixStyle('transitionDuration')

    export default {
        created() {
            this.touch = {}
        },
        data() {
            return {
                songReady: false,
                currentTime: 0,
                radius: 32,
                currentLyric: null,
                lineNum: 0,
                currentShow: 'cd',
                playingLyric: ''
            }
        },
        computed: {
            iconMode(){
                return this.mode === 0 ? 'icon-sequence' : this.mode === 1 ? 'icon-loop' : 'icon-random'
            },
            barPrecent() {
                return this.currentTime / this.currentSong.duration
            },
            playIcon() {
                return this.playing ? 'icon-pause' : 'icon-play'
            },
            miniPlayIcon() {
                return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
            },
            cdRotate() {
                return this.playing ? 'play' : 'play pause'
            },
            disableClass() {
                return this.songReady ? '' : 'disable'
            },
            ...mapGetters([
                'fullScreen',
                'playlist',
                'currentSong',
                'playing',
                'currentIndex',
                'mode',
                'sequenceList'
            ])
        },
        methods: {
            endPlay(){
                this.loop()
            },
            loop(){
                this.$refs.audio.currentTime = 0
                this.$refs.audio.play()
                if (this.currentLyric){
                    this.currentLyric.seek(0)
                }
            },
            openLyric(){
                this.$refs.lyricList.$el.style[transform] = `translate3d(${-window.innerWidth}px, 0, 0)`
                this.$refs.lyricList.$el.style[transitionDuration] = `300ms`
                this.$refs.cdImage.style.opacity = 0
            },
            middleTouchStart(e) {
                this.touch.initiated = true
                const touch = e.touches[0]
                this.touch.startX = touch.pageX
                this.touch.startX = touch.pageY
            },
            middleTouchMove(e) {
                if (!this.touch.initiated) {
                    return
                }
                const touch = e.touches[0]
                const deltaX = touch.pageX - this.touch.startX
                const deltaY = touch.pageY - this.touch.startY
                if (Math.abs(deltaY) > Math.abs(deltaX)) {
                    // 此时是纵向滚动，不支持
                    return
                }
                const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
                const width = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
                this.touch.percent = Math.abs(width / window.innerWidth)
                // lyricList是vue组件，无法直接操作其dom
                this.$refs.lyricList.$el.style[transform] = `translate3d(${width}px, 0, 0)`
                this.$refs.lyricList.$el.style[transitionDuration] = 0
                this.$refs.cdImage.style.opacity = 1 - this.touch.percent
            },
            middleTouchEnd() {
                this.touch.initiated = false
                let endWidth = 0
                let opacity = 1
                if (this.currentShow === 'cd'){
                    if (this.touch.percent > 0.1){
                        endWidth = -window.innerWidth
                        opacity = 0
                        this.currentShow = 'lyric'
                    } else {
                        endWidth = 0
                        opacity = 1
                    }
                }else {
                    if (this.touch.percent < 0.9){
                        endWidth = 0
                        opacity = 1
                        this.currentShow = 'cd'
                    } else {
                        endWidth = -window.innerWidth
                        opacity = 0
                    }
                }
                this.$refs.lyricList.$el.style[transform] = `translate3d(${endWidth}px, 0, 0)`
                this.$refs.lyricList.$el.style[transitionDuration] = `300ms`
                this.$refs.cdImage.style.opacity = opacity
            },
            progressBarChange(precent) {
                const currentTime = this.currentSong.duration * precent
                this.$refs.audio.currentTime = currentTime
                if (this.currentLyric){
                    this.currentLyric.seek(currentTime * 1000)
                }
            },
            audioTimeupdate(e) {
                this.currentTime = e.target.currentTime
            },
            changeMode(){
                console.log(this.sequenceList)
                console.log(this.playlist)
                const mode = (this.mode+1) % 3
                this.setPlayMode(mode)
                let list = null
                if (mode === playMode.random){
                    list = shuffle(this.sequenceList)
                }else {
                    list = this.sequenceList
                }
                this.resetCurrentIndex(list)
                this.setPlayList(list)
            },
            resetCurrentIndex(list){
                let index = list.findIndex(item => {
                    return item.id === this.currentSong.id
                })
                this.setCurrentIndex(index)
            },
            // 播放时间格式化
            format(interval) {
                // this.barPrecent = this.currentTime / this.currentSong.duration
                interval = interval | 0  // 向下取整
                const minute = interval / 60 | 0
                const second = this._pad(interval % 60)
                return `${minute}:${second}`
            },
            _pad(num, n = 2) {

                for (let len = num.toString().length; len < n; len++) {
                    num = '0' + num
                }
                return num
            },
            audioReady() {
                this.songReady = true
            },
            audioError() {
                this.songReady = true
            },
            back() {
                this.setFullScreen(false)
            },
            open() {
                this.setFullScreen(true)
            },
            togglePlaying() {
                if (!this.songReady) {
                    return
                }
                this.setPlayingState(!this.playing)
                // 歌曲暂停时也暂停歌词
                if (this.currentLyric) {
                    this.currentLyric.togglePlay()
                }
            },
            nextSong() {
                if (!this.songReady) {
                    return
                }
                if (this.currentIndex + 1 === this.playlist.length) {
                    this.setCurrentIndex(-1)
                }
                this.setCurrentIndex(this.currentIndex + 1)
                if (!this.playing) {
                    this.togglePlaying()
                }
                this.songReady = false
            },
            prevSong() {
                if (!this.songReady) {
                    return
                }
                if (this.currentIndex - 1 === -1) {
                    this.setCurrentIndex(this.playlist.length)
                }
                this.setCurrentIndex(this.currentIndex - 1)
                if (!this.playing) {
                    this.togglePlaying()
                }
                this.songReady = false
            },
            // vue的css3动画钩子，done调用之后调用after
            enter(el, done) {
                const {x, y, scale} = this._getPosAndScale()

                let animation = {
                    // 设置初始，60%，100%效果
                    0: {
                        transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
                    },
                    60: {
                        transform: `translate3d(0,0,0) scale(1.1)`
                    },
                    100: {
                        transform: `translate3d(0,0,0) scale(1)`
                    }
                }

                // 设置animation
                animations.registerAnimation({
                    name: 'move',
                    animation,
                    presets: {
                        duration: 400,
                        easing: 'linear'
                    }
                })

                // 使用animation
                animations.runAnimation(this.$refs.cdWrapper, 'move', done)
            },
            afterEnter() {
                // 清除animation
                animations.unregisterAnimation('move')
                // animation对象置空
                this.$refs.cdWrapper.style.animation = ''
            },
            leave(el, done) {
                this.$refs.cdWrapper.style.transition = `all 0.4s`
                const {x, y, scale} = this._getPosAndScale()
                this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
                this.$refs.cdWrapper.addEventListener('transitionend', done)
            },
            afterLeave() {
                this.$refs.cdWrapper.style.transition = ''
                this.$refs.cdWrapper.style[transform] = ''
            },
            _getPosAndScale() {
                const targetWidth = 40
                const paddingLeft = 40
                const paddingBottom = 30
                const paddingTop = 80
                const width = window.innerWidth * 0.8
                const scale = targetWidth / width
                const x = -(window.innerWidth / 2 - paddingLeft)
                const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
                return {
                    x,
                    y,
                    scale
                }
            },
            _getLyric() {
                this.currentSong.getLyric().then(lyric => {
                    // 初始化
                    this.currentLyric = new Lyric(lyric, this.handleLyric)
                    // console.log(this.currentLyric)
                    if (this.playing) {
                        this.currentLyric.play()
                    }
                }).catch(() => {
                    // 获取歌词失败时清除设置
                    this.currentLyric = null
                    this.playingLyric = ''
                    this.lineNum = 0
                })
            },
            handleLyric({lineNum, txt}) {
                this.lineNum = lineNum
                if (lineNum > 5) {
                    let lineEl = this.$refs.lyricLine[lineNum - 5]
                    this.$refs.lyricList.scrollToElement(lineEl, 1000)
                } else {
                    this.$refs.lyricList.scrollTo(0, 0, 1000)
                }
                this.playingLyric = txt
            },
            ...mapMutations({
                setFullScreen: 'SET_FULL_SCREEN',
                setPlayingState: 'SET_PLAYING',
                setCurrentIndex: 'SET_CURRENT_INDEX',
                setPlayMode: 'SET_MODE',
                setPlayList: 'SET_PLAYLIST',
                setSequenceList: 'SET_SEQUENCE_LIST'
            })
        },
        watch: {
            currentSong(newSong, oldSong) {
                if (newSong.id === oldSong.id){
                    return
                }
                // 清理上一首歌的currentLyric对象
                if (this.currentLyric) {
                    this.currentLyric.stop()
                }
                // 设置延时确保DOM已生成
                setTimeout(() => {
                    this.$refs.audio.play()
                    this._getLyric()
                }, 1000)
            },
            // 监听播放器状态，以此决定播放按钮行为
            playing(newPlaying) {
                const audio = this.$refs.audio
                this.$nextTick(() => {
                    newPlaying ? audio.play() : audio.pause()
                })
            }
        },
        components: {
            ProgressBar,
            ProgressCircle,
            Scroll
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~common/stylus/variable"
    @import "~common/stylus/mixin"

    .player
        .normal-player
            position: fixed
            left: 0
            right: 0
            top: 0
            bottom: 0
            z-index: 150
            background: $color-background
            .background
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                z-index: -1
                opacity: 0.6
                filter: blur(20px)
            .top
                position: relative
                margin-bottom: 25px
                .back
                    position absolute
                    top: 0
                    left: 6px
                    z-index: 50
                    .icon-back
                        display: block
                        padding: 9px
                        font-size: $font-size-large-x
                        color: $color-theme
                        transform: rotate(-90deg)
                .title
                    width: 70%
                    margin: 0 auto
                    line-height: 40px
                    text-align: center
                    no-wrap()
                    font-size: $font-size-large
                    color: $color-text
                .subtitle
                    line-height: 20px
                    text-align: center
                    font-size: $font-size-medium
                    color: $color-text
            .middle
                position: fixed
                width: 100%
                top: 80px
                bottom: 170px
                white-space: nowrap
                font-size: 0
                .middle-l
                    display: inline-block
                    vertical-align: top
                    position: relative
                    width: 100%
                    height: 0
                    padding-top: 80%
                    .cd-wrapper
                        position: absolute
                        left: 10%
                        top: 0
                        width: 80%
                        box-sizing: border-box
                        height: 100%
                        .cd
                            width: 100%
                            height: 100%
                            border-radius: 50%
                            &.play
                                animation: rotate 20s linear infinite
                            &.pause
                                animation-play-state: paused
                            .image
                                position: absolute
                                left: 0
                                top: 0
                                width: 100%
                                height: 100%
                                box-sizing: border-box
                                border-radius: 50%
                                border: 10px solid rgba(255, 255, 255, 0.1)

                    .playing-lyric-wrapper
                        width: 80%
                        margin: 30px auto 0 auto
                        overflow: hidden
                        text-align: center
                        .playing-lyric
                            height: 20px
                            line-height: 20px
                            font-size: $font-size-medium
                            color: $color-text-l
                .middle-r
                    display: inline-block
                    vertical-align: top
                    width: 100%
                    height: 100%
                    overflow: hidden
                    .lyric-wrapper
                        width: 80%
                        margin: 0 auto
                        overflow: hidden
                        text-align: center
                        .text
                            line-height: 32px
                            color: $color-text-l
                            font-size: $font-size-medium
                            &.current
                                color: $color-text
                        .pure-music
                            padding-top: 50%
                            line-height: 32px
                            color: $color-text-l
                            font-size: $font-size-medium
            .bottom
                position: absolute
                bottom: 50px
                width: 100%
                .dot-wrapper
                    text-align: center
                    font-size: 0
                    .dot
                        display: inline-block
                        vertical-align: middle
                        margin: 0 4px
                        width: 8px
                        height: 8px
                        border-radius: 50%
                        background: $color-text-l
                        &.active
                            width: 20px
                            border-radius: 5px
                            background: $color-text-ll
                .progress-wrapper
                    display: flex
                    align-items: center
                    width: 80%
                    margin: 0px auto
                    padding: 10px 0
                    .time
                        color: $color-text
                        font-size: $font-size-small
                        flex: 0 0 30px
                        line-height: 30px
                        width: 30px
                        &.time-l
                            text-align: left
                        &.time-r
                            text-align: right
                    .progress-bar-wrapper
                        flex: 1
                .operators
                    display: flex
                    align-items: center
                    .icon
                        flex: 1
                        color: $color-theme
                        &.disable
                            color: $color-theme-d
                        i
                            font-size: 30px
                    .i-left
                        text-align: right
                    .i-center
                        padding: 0 20px
                        text-align: center
                        i
                            font-size: 40px
                    .i-right
                        text-align: left
                    .icon-favorite
                        color: $color-sub-theme
            // 动画
            &.normal-enter-active, &.normal-leave-active
                transition: all 0.4s
                .top, .bottom
                    // 缓动函数，贝塞尔曲线，模拟弹性效果
                    transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
            // 淡入淡出
            &.normal-enter, &.normal-leave-to
                opacity: 0
                .top
                    transform: translate3d(0, -100px, 0)
                .bottom
                    transform: translate3d(0, 100px, 0)
        .mini-player
            display: flex
            align-items: center
            position: fixed
            left: 0
            bottom: 0
            z-index: 180
            width: 100%
            height: 60px
            background: $color-highlight-background
            // 渐隐渐现
            &.mini-enter-active, &.mini-leave-active
                transition: all 0.4s
            &.mini-enter, &.mini-leave-to
                opacity: 0
            .icon
                flex: 0 0 40px
                width: 40px
                height: 40px
                padding: 0 10px 0 20px
                .imgWrapper
                    height: 100%
                    width: 100%
                    img
                        border-radius: 50%
                        &.play
                            animation: rotate 10s linear infinite
                        &.pause
                            animation-play-state: paused
            .text
                display: flex
                flex-direction: column
                justify-content: center
                flex: 1
                line-height: 20px
                overflow: hidden
                .name
                    margin-bottom: 2px
                    no-wrap()
                    font-size: $font-size-medium
                    color: $color-text
                .desc
                    no-wrap()
                    font-size: $font-size-small
                    color: $color-text-d
                .lyricMini
                    //no-wrap()
                    font-size: $font-size-small
                    color: $color-text-d
            .control
                flex: 0 0 30px
                width: 30px
                padding: 0 10px
                .icon-play-mini, .icon-pause-mini, .icon-playlist
                    font-size: 30px
                    color: $color-theme-d
                .icon-mini
                    font-size: 32px
                    position: absolute
                    left: 0
                    top: 0

    @keyframes rotate
        0%
            transform: rotate(0)
        100%
            transform: rotate(360deg)
</style>
