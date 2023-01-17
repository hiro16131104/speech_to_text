<!-- アイコン付きのボタンを作成するコンポーネント -->
<template>
    <v-btn :id="id" :loading="isLoading" :disabled="isDisabled" :color="bgColor" :prepend-icon="icon"
        :style="[styleFont, styleLayout]" class="button-size" :variant="type">
        <!-- ボタンに表示するテキスト -->
        <slot></slot>
    </v-btn>
</template>

<script>
export default {
    props: {
        // コンポーネントのid
        id: {
            type: String,
            required: false
        },
        // ex) {size:"16px", weight:"600", color:"#FFFFFF"}
        font: {
            type: Object,
            required: true
        },
        // ボタンの背景色
        bgColor: {
            type: String,
            required: true
        },
        // ボタンに表示するアイコン
        icon: {
            type: String,
            required: false,
            default: ""
        },
        // ボタン内の余白
        padding: {
            type: Array,
            required: false,
            default: () => ["0", "0", "0", "0"]
        },
        // ボタンの横幅
        width: {
            type: String,
            required: false,
            default: "fit-content"
        },
        // ボタンの角をどのくらい丸くするか
        round: {
            type: String,
            required: false,
            default: "10px"
        },
        // ボタンの表示形式（"elevated","outlined"）
        type: {
            type: String,
            required: false,
            default: "elevated"
        },
        // trueにするとボタン上にスピナーが表示される
        isLoading: {
            type: Boolean,
            required: false,
            default: false
        },
        // trueにするとボタンがグレーアウトする
        isDisabled: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    data() {
        return {
            // ボタンのスタイル
            styleFont: {
                fontSize: this.font.size,
                fontWeight: this.font.weight,
                color: this.font.color
            },
            styleLayout: {
                padding: this.padding.join(" "),
                width: this.width,
                borderRadius: `${this.round}`
            },
        }
    },
}
</script>

<style>
.button-size {
    text-align: center;
    height: fit-content !important;
    width: fit-content;
}
</style>