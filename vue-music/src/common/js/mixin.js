import {mapGetters} from 'vuex'

export const playlistMixin = {
    computed: {
        ...mapGetters([
            'playlist'
        ])
    },
    methods:{
        // 如果组件实现了handlePlaylist函数，就会覆盖掉mixin中的handlePlaylist函数
        handlePlaylist(){
            throw new Error('component must implement handlePlaylist')
        }
    },
    mounted(){
        this.handlePlaylist(this.playlist)
    },
    activated(){
        this.handlePlaylist(this.playlist)
    },
    watch: {
        playlist(newVal){
            this.handlePlaylist(newVal)
        }
    }
}
