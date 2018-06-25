<template>
    <transition name="slide">
        <music-list :songs="songs" :title="title" :bg-image="bgImage"></music-list>
    </transition>
</template>

<script type="text/ecmascript-6">
    // 歌手详情
    import {mapGetters} from 'vuex'
    import {getSingerDetail} from "../../api/getSinger";
    import {ERR_OK} from "../../api/urlConfig";
    import {createSong, isValidMusic, processSongUrl} from "../../common/js/song";

    import MusicList from "../music-list/music-list";

    export default {
        data() {
            return {
                songs: []
            }
        },
        computed: {
            title(){
                return this.singer.name
            },
            bgImage(){
                return this.singer.imageSrc
            },
            ...mapGetters([
                'singer'
            ])
        },
        created(){
            this._getDetail()
            // console.log(`singer-detail songs:${this.songs}`)
        },
        methods: {
            _getDetail(){
                if(!this.singer.id){
                    this.$router.push('/singer')
                    // console.log(`getSingerId null`)
                    return
                }
                getSingerDetail(this.singer.id).then(res => {
                    if (res.code === ERR_OK){
                        processSongUrl(this._normalizeSongs(res.data.list)).then(songs => {
                            this.songs = songs
                            // console.log(this.songs)
                        })
                    }
                })
            },
            _normalizeSongs(list){
                let ret = []
                list.forEach(item => {
                    let {musicData} = item
                    if(isValidMusic(musicData)) {
                        ret.push(createSong(musicData))
                    }
                })
                // console.log(ret)
                return ret
            }
        },
        components: {
            MusicList
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~common/stylus/variable"

    .detail
        position : fixed
        top : 0
        left : 0
        bottom : 0
        right : 0
        background : $color-background
        z-index : 100

    .slide-enter-active, .slide-leave-active
        transition: all 0.3s

    .slide-enter, .slide-leave-to
        transform: translate3d(100%, 0, 0)
</style>
