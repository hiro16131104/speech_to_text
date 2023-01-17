<!-- 動くタイトルを作成するコンポーネント -->
<template>
    <h1 :id="id" class="title" :style="fadeUp">
        <!-- スペース区切りで5単語まで対応 -->
        <span class="fade-in-1" v-if="titleParts[0]">{{ titleParts[0] }}</span>
        <span class="fade-in-2" v-if="titleParts[1]">{{ `&nbsp;${titleParts[1]}` }}</span>
        <span class="fade-in-3" v-if="titleParts[2]">{{ `&nbsp;${titleParts[2]}` }}</span>
        <span class="fade-in-4" v-if="titleParts[3]">{{ `&nbsp;${titleParts[3]}` }}</span>
        <span class="fade-in-5" v-if="titleParts[4]">{{ `&nbsp;${titleParts[4]}` }}</span>
    </h1>
</template>

<script>
import { ref } from "@vue/reactivity"

export default {
    props: {
        // コンポーネントのid
        id: {
            type: String,
            required: false
        },
        // タイトルに表示する文字列
        titleParts: {
            type: Array,
            required: true
        }
    },
    data() {
        // 単語数に応じて、アニメーション起動のタイミングを遅らせる
        const secWait = `${0.5 + 1.5 * this.titleParts.length}s`

        return {
            // スタイル
            fadeUp: {
                animation: `fade-up-anime 2s ease-in-out ${secWait} 1 normal backwards`
            },
            // タイトルの初期位置
            titlePositionInitY: ref("")
        }
    },
    mounted() {
        // 画面の高さに応じて、タイトルの初期位置を計算（画面中央）
        this.titlePositionInitY = ref(`translateY(calc(${window.innerHeight / 2}px - 15px - (32px / 2)))`)
    }
}
</script>

<style>
.title {
    font-size: 32px;
    font-weight: 600;
    color: #FFFFFF;
    margin: 15px 0 15px 0;
}

/* 1単語ずつ表示（ふんわり） */
.fade-in-1 {
    animation: fade-in-anime 1.5s ease 0.5s 1 normal backwards;
}

.fade-in-2 {
    animation: fade-in-anime 1.5s ease 2.0s 1 normal backwards;
}

.fade-in-3 {
    animation: fade-in-anime 1.5s ease 3.5s 1 normal backwards;
}

.fade-in-4 {
    animation: fade-in-anime 1.5s ease 5.0s 1 normal backwards;
}

.fade-in-5 {
    animation: fade-in-anime 1.5s ease 6.5s 1 normal backwards;
}

@keyframes fade-in-anime {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}

/* 全ての単語が表示された後、タイトルを本来の場所へ移動 */
.fade-up {
    animation: fade-up-anime 2s ease-in-out 5s 1 normal backwards;
}

@keyframes fade-up-anime {
    0% {
        /* jsの変数をバインド */
        transform: v-bind(titlePositionInitY);
    }

    100% {
        transform: translateY(0);
    }
}
</style>