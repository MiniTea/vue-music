<template>
    <div ref="wrapper">
        <slot></slot>
    </div>
</template>

<script>
    // 负责所有butter-scroll组件的初始化
    import BScroll from 'better-scroll'

    export default {
        props: {
            probeType: {
                // 监听滚动事件触发类型
                type: Number,
                default: 1
            },
            click: {
                // 是否派发点击事件
                type: Boolean,
                default: true
            },
            data: {
                // 数据变化时refreshScroll
                type: Array,
                default: null
            },
            listenScroll:{
                type: Boolean,
                default: false
            }
        },
        mounted(){
            setTimeout(() => {
                this._initScroll()
            }, 20)
        },
        methods: {
            _initScroll(){
                if(!this.$refs.wrapper){
                    return
                }

                this.scroll =  new BScroll(this.$refs.wrapper, {
                    probeType: this.probeType,
                    click: this.click
                })

                // pos位置，有x,y
                if(this.listenScroll){
                    // 内层this指向scroll，用me保存指向vue实例的this
                    let me = this
                    this.scroll.on('scroll', pos=>{
                        this.$emit('scroll', pos)
                    })
                }
            },
            // 一些butter-scroll方法代理,this.scroll指向better-scroll实例
            enable(){
                // 如果this.scroll存在就调用this.scroll.enable()
                this.scroll && this.scroll.enable()
            },
            disable(){
                this.scroll && this.scroll.disable()
            },
            refresh(){
                this.scroll && this.scroll.refresh()
            },
            //列表滚动到相应位置，apply接收传入的arguments
            scrollTo(){
                this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
            },
            scrollToElement(){
                this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
            }
        },
        watch: {
            // watch data 的变化
            data(){
                setTimeout(()=>{
                    this.refresh()
                }, 20)
            }
        }
    }
</script>

<style scoped>

</style>
