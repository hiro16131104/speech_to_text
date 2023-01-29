<!-- 汎用的に使えるコンテナを作成するコンポーネント -->
<template>
    <div :id="id" :class="['fade-in', { direction: isVertical }]" :style="[styleBgColor, styleSize, styleDisplay]">
        <!-- 子要素を挟む -->
        <slot></slot>
    </div>
</template>

<script>
export default {
    props: {
        // コンポーネントのid
        id: {
            type: String,
            required: false
        },
        // コンポーネントの背景色
        bgColor: {
            type: String,
            required: true
        },
        // ex) {height:"fit-content", width:"500px"}
        size: {
            type: Object,
            required: true
        },
        // コンポーネントの最大横幅
        maxWidth: {
            type: String,
            required: false,
            default: "inherit"
        },
        // ex) {vertical:"center", horizontal:"start"}
        display: {
            type: Object,
            required: true
        },
        // 子要素を水平に配置する場合は、false
        // 子要素を垂直に配置する場合は、true
        // trueにした場合、propsの"display"の各プロパティが逆転する点に注意
        isVertical: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    data() {
        return {
            // コンポーネントのスタイル
            styleBgColor: {
                background: this.bgColor
            },
            styleSize: {
                boxSizing: "border-box",
                height: this.size.height,
                width: this.size.width,
                maxWidth: this.maxWidth
            },
            styleDisplay: {
                display: "flex",
                alignItems: this.display.vertical,
                justifyContent: this.display.horizontal
            }
        }
    }
}
</script>

<style>
/* コンポーネントをふんわり表示 */
.fade-in {
    animation: fade-in-anime 2s ease 0s 1 normal backwards;
}

@keyframes fade-in-anime {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}

.direction {
    flex-flow: column;
}
</style>