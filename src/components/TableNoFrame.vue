<!-- 罫線の無いテーブルを作成するコンポーネント -->
<template>
    <table :id="id" :style="tableStyle">
        <tr>
            <th :style="headerStyle" v-for="headerValue in headerValues" :key="headerValue.index">
                {{ headerValue }}
            </th>
        </tr>
        <tr v-for="row in bodyValues" :key="row.index">
            <td :style="bodyStyle" v-for="cell in row" :key="cell.index">
                {{ cell }}
            </td>
        </tr>
    </table>
</template>

<script>
export default {
    props: {
        // コンポーネントのid
        id: {
            type: String,
            required: false
        },
        // ヘッダーに代入する値（文字列の配列）
        headerValues: {
            type: Array,
            required: true
        },
        // ボディに代入する値（文字列の2次元配列）
        bodyValues: {
            type: Array,
            required: true
        },
        // ヘッダーとボディに引く線の色
        lineColor: {
            type: String,
            required: false,
            default: "#555555"
        },
        // 水平方向のテキスト配置
        align: {
            type: Object,
            required: false,
            default: () => { return { header: "center", body: "center" } }
        },
        // テーブルの横幅
        tableWidth: {
            type: String,
            required: false,
            default: "auto"
        }
    },
    computed: {
        // 動的にスタイルを作成
        tableStyle() {
            return { width: this.tableWidth }
        },
        headerStyle() {
            return {
                borderBottom: `1px solid ${this.lineColor}`,
                textAlign: this.align.header
            }
        },
        bodyStyle() {
            return {
                borderTop: `0.5px solid ${this.lineColor}`,
                textAlign: this.align.body
            }
        }
    },
}
</script>

<style>
table {
    border-collapse: collapse;
}

/* 文字があふれる場合は、折返しを許可 */
th,
td {
    padding: 2px 10px 2px 10px;
    word-wrap: break-word;
    font-weight: 300;
}
</style>