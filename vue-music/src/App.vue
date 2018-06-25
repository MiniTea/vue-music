npm <template>
    <div id="app">
        <my-header></my-header>
        <tab></tab>
        <!-- <keep-alive>标签使<router-view>存储在缓存里，切换时不去重复请求数据 -->
        <keep-alive>
            <router-view></router-view>
        </keep-alive>
        <player></player>
    </div>
</template>

<script type="text/ecmascript-6">
    import MyHeader from 'components/my-header/my-header'
    import Tab from 'components/tab/tab'
    import Player from "./components/player/player";

    export default {
        name: 'App',
        components: {
            Player,
            MyHeader,
            Tab
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "common/stylus/variable.styl"
    #app
        color: $color-theme
</style>
