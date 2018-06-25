import Vue from 'vue'
import Router from 'vue-router'
import Rank from 'components/rank/rank'
import Recommend from 'components/recommend/recommend'
import Search from 'components/search/search'
import Singer from 'components/singer/singer'
import Tab from 'components/tab/tab'
import SingerDetail from 'components/singer-detail/singer-detail'
import Disc from 'components/disc/disc'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/',
            // 默认展示推荐页面
            redirect: '/recommend'
        }, {
            // 推荐
            path: '/recommend',
            name: 'Recommend',
            component: Recommend,
            children: [
                {
                    path: ':id',
                    component: Disc
                }
            ]
        }, {
            // 歌手
            path: '/singer',
            name: 'Singer',
            component: Singer,
            children: [
                {
                    path: ':id',
                    component: SingerDetail
                }
            ]
        },
        // {
        //     // 排行
        //     path: '/rank',
        //     name: 'Rank',
        //     component: Rank
        // }, {
        //     // 搜索
        //     path: '/search',
        //     name: 'Search',
        //     component: Search
        // },
        {
            path: '/tab',
            name: 'Tab',
            component: Tab
        }
    ]
})
