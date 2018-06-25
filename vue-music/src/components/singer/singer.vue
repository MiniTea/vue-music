<template>
    <div class="singer" ref="singer">
        <list-view @select="selectSinger" :data="singerList" ref="list"></list-view>
        <router-view></router-view>
    </div>
</template>

<script type="text/ecmascript-6">
    import {getSingerList} from "../../api/getSinger";
    import {ERR_OK} from '../../api/urlConfig'
    import Singer from 'common/js/singer'
    import ListView from 'base/listView/listView'
    import {mapMutations} from 'vuex'
    import {playlistMixin} from "../../common/js/mixin";

    const HOT_NAME = "热门"
    const HOT_NAME_LENGTH = 10

    export default {
        mixins: [playlistMixin],
        data(){
            return {
                singerList:[]
            }
        },
        created(){
            this._getSingerList()
        },
        methods: {
            handlePlaylist(playlist){
                const bottom = playlist.length > 0 ? '60px' : ''
                this.$refs.singer.style.bottom = bottom
                this.$refs.list.refresh()
            },
            selectSinger(singer){
                this.$router.push({
                    path: `/singer/${singer.id}`
                })
                this.setSinger(singer)
            },

            // 获取歌手数据
            _getSingerList(){
                getSingerList().then(res=>{
                    if(res.code === ERR_OK){
                        // console.log(this.singerList)
                        this.singerList = this._normalizeSinger(res.data.list)
                    }
                })
            },
            // 歌手数据分类
            _normalizeSinger(list){
                let map = {
                    hot: {
                        title: HOT_NAME,
                        items: []
                    }
                }
                // 对歌手数据做归类并转化为有序的数组
                list.forEach((item, index) => {
                    // 将前10条数据push到Hot对象里
                    if(index < HOT_NAME_LENGTH){
                        map.hot.items.push(new Singer({
                            id: item.Fsinger_mid,
                            name: item.Fsinger_name
                        }))
                    }
                    // 将字母作为对象数组的key，将对应数据push到元素对象的item数组中
                    const key = item.Findex
                    if(!map[key]){
                        map[key] = {
                            title: key,
                            items: []
                        }
                    }
                    map[key].items.push(new Singer({
                        id: item.Fsinger_mid,
                        name: item.Fsinger_name
                    }))
                })

                //
                let hot = []
                let ret = []
                for (let key in map){
                    let val = map[key]
                    if(val.title.match(/[a-zA-Z]/)){
                        ret.push(val)
                    }else if(val.title === HOT_NAME){
                        hot.push(val)
                    }
                }
                // 把ret按charCode升序排列
                ret.sort((a, b) => {
                    return a.title.charCodeAt(0) - b.title.charCodeAt(0)
                })
                return hot.concat(ret)
            },
            // 作映射
            ...mapMutations({
                setSinger: 'SET_SINGER'
            })
        },
        components: {
            ListView
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    .singer
        position: fixed
        top: 88px
        bottom: 0
        width: 100%
</style>
