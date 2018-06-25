<template>
    <transition name="slide">
        <music-list :title="title" :bgImage="bgImage" :songs="songs"></music-list>
    </transition>
</template>

<script type="text/ecmascript-6">
    import MusicList from 'components/music-list/music-list'
    import {mapGetters} from 'vuex'
    import {getDisclist} from "../../api/getRecommend";
    import {ERR_OK} from "../../api/urlConfig";
    import {createSong, isValidMusic, processSongUrl} from "../../common/js/song";

    export default {
        created(){
            this._getDisclist()
        },
        data(){
            return {
                songs: []
            }
        },
        computed: {
            title(){
                return this.disc.dissname
            },
            bgImage(){
                return this.disc.imgurl
            },
            ...mapGetters([
                'disc'
            ])
        },
        methods:{
            _getDisclist(){
                if (!this.disc.dissid){
                    this.$router.push('/recommend')
                    return
                }
                getDisclist(this.disc.dissid).then(res => {
                   if (res.code === ERR_OK){
                       // console.log(res.cdlist[0].songlist)
                       processSongUrl(this._normalizeSongs(res.cdlist[0].songlist)).then(songs => {
                           this.songs = songs
                           // console.log(this.songs)
                       })
                       // this.songs = this._normalizeSongs(res.cdlist[0].songlist)
                   }
                })
            },
            _normalizeSongs(list){
                let ret = []
                list.forEach(musicData => {
                    if (musicData.songid && musicData.albumid){
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
    .slide-enter-active, .slide-leave-active
        transition: all 0.3s

    .slide-enter, .slide-leave-to
        transform: translate3d(100%, 0, 0)
</style>
