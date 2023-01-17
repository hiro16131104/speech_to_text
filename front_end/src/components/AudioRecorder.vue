<!-- 音声を録音するためのコンポーネント -->
<template>
    <FlexContainer :id="id" bg-color="rgba(0, 0, 0, 0)" :size="container.size" :display="container.display">
        <!-- 録音ボタン -->
        <CustomIconButton :id="idRecordButton" class="fade-in" v-if="!isRecording" icon="mdi-microphone"
            :font="button.font" :bg-color="button.bgColor" :padding="button.padding" :round="button.round"
            :width="button.width" :type="button.type" @click="handleClickRecordButton">
            RECORD
        </CustomIconButton>
        <!-- 停止ボタン -->
        <CustomIconButton :id="idStopButton" class="fade-in" v-else icon="mdi-microphone-off" :font="stopButton.font"
            :bg-color="stopButton.bgColor" :padding="stopButton.padding" :round="stopButton.round"
            :width="stopButton.width" :type="stopButton.type" @click="handleClickStopButton">
            STOP
        </CustomIconButton>
        <!-- エラーメッセージ -->
        <span v-show="isError" class="msg-base msg-warn">
            {{ errorMsg }}
        </span>
        <!-- 録音中であることを表示 -->
        <span v-show="isRecording" class="msg-base msg-warn">
            {{ stateMsg }}
        </span>
        <!-- 録音した音声ファイルの情報を表示 -->
        <span v-show="isRecorded" class="msg-base" :style="blobInfo.style">
            {{ blobInfo.text }}
        </span>
    </FlexContainer>
</template>

<script>
import FlexContainer from "./FlexContainer.vue"
import CustomIconButton from "./CustomIconButton.vue"

export default {
    components: {
        FlexContainer, CustomIconButton
    },
    props: {
        // コンポーネントのid
        id: {
            type: String,
            required: false
        },
        // 外枠の横幅
        width: {
            type: String,
            required: true
        },
        // ex) {
        //   font:{
        //     size:"16px", 
        //     weight:"600", 
        //     color:"#9249AB"
        //   }, 
        //   padding:["8px", "16px", "8px", "16px"], 
        //   bgColor:"#9249AB", 
        //   round:"30px", 
        //   width:"150px", 
        //   type:"outlined"
        // }
        button: {
            type: Object,
            required: true
        },
        // 停止ボタンの色
        stopButtonColor: {
            type: String,
            required: false,
            default: "#D32F2F"
        },
        // 音声ファイルの情報を表示する際の文字色
        blobInfoColor: {
            type: String,
            required: false,
            default: "inherit"
        }
    },
    computed: {
        // 子要素のidを作成
        idRecordButton() { return this.id ? `${this.id}RecordButton` : undefined },
        idStopButton() { return this.id ? `${this.id}StopButton` : undefined },
        // propsの"button"を基に、停止ボタンのプロパティを作成
        stopButton() {
            return {
                font: {
                    size: this.button.font.size,
                    weight: this.button.font.weight,
                    color: this.button.type === "outlined" ? this.stopButtonColor : "#FFFFFF"
                },
                padding: this.button.padding,
                bgColor: this.stopButtonColor,
                round: this.button.round,
                width: this.button.width,
                type: this.button.type
            }
        },
    },
    data() {
        return {
            // 外枠のサイズ等
            container: {
                size: { height: "fit-content", width: this.width },
                display: { vertical: "center", horizontal: "center" },
            },
            // 録音する際に使用する変数（MediaRecorderクラスのインスタンスを代入）
            mediaRecorder: undefined,
            // 一定の間隔で区切られた音声データ（チャンク）を順次格納するための変数
            audioData: [],
            // 録音中は、true
            isRecording: false,
            errorMsg: "",
            isError: false,
            stateMsg: "録音中...",
            audioEndTimeSec: 0,
            playTimer: undefined,
            isRecorded: false,
            blobInfo: {
                text: "",
                style: {
                    color: this.blobInfoColor
                }
            },
        }
    },
    methods: {
        // 録音ボタンのクリック
        handleClickRecordButton() {
            // エラーが発生している又は、録音中である場合、処理を抜ける
            if (this.isError || this.isRecording) { return }

            this.isRecording = true
            // 音声データを一旦初期化
            this.audioData = []
            // 録音開始
            this.mediaRecorder.start()
            // 親コンポーネントにイベントを渡す
            this.$emit("click-record-button")
        },
        // 停止ボタンのクリック
        handleClickStopButton() {
            // 録音停止状態である場合、処理を抜ける
            if (!this.isRecording) { return }

            // 録音停止
            this.mediaRecorder.stop()
            this.isRecording = false
            // 親コンポーネントにイベントを渡す
            this.$emit("click-stop-button")
        },
        // タイマーを設定
        startTimer() {
            // 1秒毎にカウントアップ
            this.playTimer = setInterval(() => {
                this.audioEndTimeSec += 1
            }, 1000)
        },
        // タイマーを除去
        stopTimer() {
            clearInterval(this.playTimer)
        },
    },
    watch: {
        // "isRecording"が変更された場合
        isRecording() {
            if (this.isRecording) {
                // 変数をリセット後、タイマーを開始
                this.audioEndTimeSec = 0
                this.startTimer()
                this.isRecorded = false
            }
            else {
                this.stopTimer()
                this.isRecorded = true
            }
        }
    },
    async mounted() {
        try {
            // ブラウザからPCマイクへアクセス
            // 許可を求めるポップアップが表示される
            const stream = navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            let event = {}
            let mimeType = ""
            let fileType = ""
            let fileSizeKb = 0

            // 録音する際に使用するインスタンスを作成
            this.mediaRecorder = new MediaRecorder((await stream))
            this.mediaRecorder.addEventListener("dataavailable", (event) => {
                // chromeベースのブラウザの場合は、"audio/webm"
                mimeType = event.data.type
                // チャンクを順次変数へ追加（格納）
                this.audioData.push(event.data)
            })
            this.mediaRecorder.addEventListener("stop", () => {
                // 音声データと終了時間を格納
                // webm形式の音声ファイルは、"duration"に値がないため。
                event = {
                    blob: new Blob(this.audioData, { type: mimeType }),
                    endTimeSec: this.audioEndTimeSec
                }
                // 音声ファイルの情報を表示
                fileType = event.blob.type.split("/")[1].split(";")[0]
                fileSizeKb = Math.round(event.blob.size / 1024 * 10) / 10
                this.blobInfo.text = `録音完了 (${fileType}, ${fileSizeKb}kB)`
                // 親コンポーネントへ音声データを渡す（"recording-end"イベントの引数で受取り可）
                this.$emit("recording-end", event)
            })
        }
        catch (error) {
            // PCマイクの仕様が許可されなかった場合、エラーメッセージを表示
            this.isError = true
            this.errorMsg = "マイクの使用が許可されていません。"
            // 先に録音ボタンを押してしまったとき対策
            this.isRecording = false
        }
    }
}
</script>

<style>
.fade-in {
    animation: fade-in-anime 1.5s ease 0s 1 normal backwards;
}

@keyframes fade-in-anime {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}

.msg-base {
    font-size: 0.8em;
    margin: 0 0 0 20px;
}

.msg-warn {
    font-weight: 600;
    color: #FF5252;
}
</style>