<!-- ファイルをアップロードするためのコンポーネント -->
<!-- 音声ファイル、画像ファイル、文書ファイルなど、汎用的に使用できる -->
<template>
    <div class="label-font div-layout" :style="styleWidth">
        <v-file-input :id="id" :style="styleWidth" v-model="fileObjects" @change="handleChangeFiles" :accept="mimeType"
            :label="labelText" :color="color.border" variant="underlined" :clearable="true" show-size
            :multiple="isMulti" :disabled="isDisabled">
            <!-- セットされたファイルの表示 -->
            <template #selection="{ fileNames }">
                <div v-for="(fileName, idx) in fileNames" :key="idx">
                    <v-chip size="small" label class="mr-2" :color="color.chip">
                        {{ fileName }}
                    </v-chip>
                </div>
            </template>
        </v-file-input>
        <!-- エラーメッセージ -->
        <span v-show="isError" class="error-msg">{{ errorMsg }}</span>
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
        // アップロードできるファイルの種類
        // ex) ["audio/mpeg", "audio/x-m4a"]
        mimeTypes: {
            type: Array,
            required: true
        },
        // ex) {border:"#D94E7C", chip:"#D94E7C"}
        color: {
            type: Object,
            required: true
        },
        // 外枠の横幅
        width: {
            type: String,
            required: true
        },
        // アップロードできるファイルの最大容量（メガバイト単位）
        fileSizeLimitByte: {
            type: Number,
            required: true
        },
        // ファイルアップローダーに表示する説明文
        labelText: {
            type: String,
            required: false,
            default: "ファイルを選択してください。"
        },
        // ファイルの複数選択を許可する場合は、true
        isMulti: {
            type: Boolean,
            required: false,
            default: false
        },
        // trueにするとグレーアウトする
        isDisabled: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    computed: {
        // 文字列結合（カンマ区切り）
        mimeType() {
            return this.mimeTypes.join(",")
        },
        // ユーザーに表示する際、mimeTypeを一般的な名詞に変換（mpeg ⇒ mp3等）
        fileType() {
            const fileType = this.mimeTypes.map(value => value.split("/")[1]).join(", ")
            return fileType
                .replace("mpeg", "mp3")
                .replace("x-m4a", "m4a")
                .replace("x-ms-wma", "wma")
        }
    },
    data() {
        return {
            // セットされたファイル
            fileObjects: [],
            // 外枠のスタイル
            styleWidth: {
                width: this.width
            },
            isError: false,
            errorMsg: ""
        }
    },
    methods: {
        // ユーザーの選択したファイルが、指定した条件に反していないか検証
        validateFileObjects() {
            // 未選択の場合、処理を抜ける
            if (this.fileObjects.length === 0) { return }

            // エラーをリセット
            this.isError = false
            this.errorMsg = ""

            // 各ファイルの種類とサイズが条件に反していないか確認
            this.fileObjects.forEach((fileObj) => {
                if (!fileObj.type || !this.mimeTypes.includes(fileObj.type)) {
                    this.isError = true
                    this.errorMsg = (
                        `アップロードできるファイルは、${this.fileType}のいずれかです。`
                    )
                }
                else if (fileObj.size > this.fileSizeLimitByte) {
                    const fileSizeLimitKb = Math.round(this.fileSizeLimitByte / 1024 * 10) / 10
                    this.isError = true
                    this.errorMsg = (
                        `アップロードできるファイルサイズは、${fileSizeLimitKb}kB以下です。`
                    )
                }
            })
            // 1件でも違反がある場合、ファイルアップローダーをクリア
            if (this.isError) { this.fileObjects = [] }
        },
        // 親コンポーネントにファイルを渡す（"change-file"イベントの引数で受取り可）
        passFileObjects() {
            // エラーかファイル未選択の場合は、処理を抜ける
            if (this.isError || this.fileObjects.length === 0) { return }
            this.$emit("change-file", this.fileObjects)
        },
        // ファイルアップローダーのchangeイベント
        handleChangeFiles() {
            this.validateFileObjects()
            this.passFileObjects()
        }
    }
}
</script>

<style>
/* ファイルアップローダーに表示する説明文のサイズ */
.label-font label {
    font-size: 0.8em;
}

/* 子要素を垂直に配置 */
.div-layout {
    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: center;
}

.div-layout div:nth-child(1) div:nth-child(2) {
    cursor: pointer;
}

.div-layout div:nth-child(1) div:nth-child(3) {
    min-height: 0;
    height: fit-content;
}

.div-layout div:nth-child(1) div:nth-child(3) div:nth-child(1) {
    min-height: 0;
    height: fit-content;
}

.error-msg {
    font-size: 0.8em;
    font-weight: 600;
    color: #FF5252;
    margin: 0 0 0 0;
}
</style>