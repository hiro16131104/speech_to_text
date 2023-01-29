<!-- 音声データを再生するためのコンポーネント -->
<template>
    <!-- 子要素は水平に配置 -->
    <FlexContainer bg-color="rgba(0, 0, 0, 0)" :size="container.size" :display="container.display">
        <!-- Audioインスタンスを保持 -->
        <audio :id="id" :src="fileUrl" ref="audioPlayer" @ended="handleEndAudio"></audio>
        <!-- 再生ボタン -->
        <v-btn :id="idPlayButton" class="fade-in" v-if="!isPlaying" @click="handleClickPlayButton" :size="button.size"
            :variant="button.type" :color="button.color" icon>
            <v-icon :size="icon.size" :color="icon.color">mdi-play</v-icon>
        </v-btn>
        <!-- 一時停止ボタン -->
        <v-btn :id="idPauseButton" class="fade-in" v-else @click="handleClickPauseButton" :size="button.size"
            :variant="button.type" :color="button.color" icon>
            <v-icon :size="icon.size" :color="icon.color">mdi-pause</v-icon>
        </v-btn>
        <!-- 停止ボタン -->
        <v-btn :id="idStopButton" :style="styleMargin" @click="handleClickStopButton" :size="button.size"
            :variant="button.type" :color="button.color" icon>
            <v-icon :size="icon.size" :color="icon.color">mdi-stop</v-icon>
        </v-btn>
        <!-- 再生時間 -->
        <time :id="idCurrentTime">{{ currentTime }}</time>
        <!-- 進捗ゲージ（プログレスバー） -->
        <input :id="idProgressBar" ref="progressBar" type="range" class="progress-bar" :value="progress.value" min="0"
            :max="progress.max" step="1" :disabled="!hasAudioFile" @input="handleGrabSlider"
            @change="handleReleaseSlider" />
        <!-- 終了時間 -->
        <time :id="idEndTime">{{ endTime }}</time>
    </FlexContainer>
</template>

<script>
import FlexContainer from "./FlexContainer.vue"

export default {
    components: {
        FlexContainer
    },
    props: {
        // コンポーネントのid
        id: {
            type: String,
            required: false
        },
        // 音声ファイルのURL
        fileUrl: {
            type: String,
            required: true,
        },
        // ex) {size:"40px", color:this.themeColor.solidPurple2, type:"outlined"}
        button: {
            type: Object,
            required: true
        },
        // ex) {size:"30px", color:this.themeColor.solidPurple2}
        icon: {
            type: Object,
            required: true
        },
        // 再生ボタン、停止ボタン、進捗ゲージ間の距離
        spacing: {
            type: String,
            required: true,
        },
        // 外枠の横幅
        width: {
            type: String,
            required: true,
        },
        // 録音した場合の音声データの終了時間
        // webm形式のファイルには、"duration"が記録されていないため
        endTimeSec: {
            type: Number,
            required: false,
            default: 0
        }
    },
    computed: {
        // 各要素のidを作成
        idPlayButton() { return this.id ? `${this.id}PlayButton` : undefined },
        idPauseButton() { return this.id ? `${this.id}PauseButton` : undefined },
        idStopButton() { return this.id ? `${this.id}StopButton` : undefined },
        idCurrentTime() { return this.id ? `${this.id}CurrentTime` : undefined },
        idEndTime() { return this.id ? `${this.id}EndTime` : undefined },
        idProgressBar() { return this.id ? `${this.id}ProgressBar` : undefined },
        // 音声データの有無
        hasAudioFile() {
            return this.fileUrl ? true : false
        },
    },
    data() {
        return {
            // 再生中はtrue
            isPlaying: false,
            // 停止ボタンのスタイル
            styleMargin: {
                margin: `0 ${this.spacing} 0 ${this.spacing}`
            },
            // 外枠のスタイル
            container: {
                size: { height: "fit-content", width: this.width },
                display: { vertical: "center", horizontal: "center" },
            },
            currentTime: "0:00",
            endTime: "0:00",
            // 進捗ゲージの現在値と最大値
            progress: {
                value: 0,
                max: 0
            },
            // 再生中に使用するタイマー
            playTimer: undefined
        }
    },
    watch: {
        // 音声ファイルのURLが変更されたとき
        fileUrl() {
            // 明示的に音声データを読み込み
            this.$refs.audioPlayer.load()
            // 再生時間と進捗ゲージをリセット
            this.currentTime = this.convertSecToMinSec(this.$refs.audioPlayer.currentTime)
            this.progress.value = this.$refs.audioPlayer.currentTime
            this.isPlaying = false
            // 終了時間と進捗ゲージの最大値を設定
            // 音声データの読み込みに時間がかかるため、0.5秒のインターバルを設ける
            setTimeout(() => {
                // webm形式のファイルには"duration"が記録されていない
                // Infinityが代入されているため、propsで渡した"endTimeSec"で代用する
                const isInfinite = !isFinite(this.$refs.audioPlayer.duration)

                this.endTime = this.convertSecToMinSec(
                    isInfinite ? this.endTimeSec : this.$refs.audioPlayer.duration
                )
                this.progress.max = isInfinite ? this.endTimeSec : this.$refs.audioPlayer.duration
            }, 500)
        }
    },
    methods: {
        // 秒を分秒へ変換（90 ⇒ 1:30）
        convertSecToMinSec(argSec) {
            const sec = Math.floor(argSec)
            let minSec = sec >= 60 ? `${Math.floor(sec / 60)}:` : "0:"

            minSec += Math.floor(sec % 60).toString().padStart(2, "0")
            return minSec
        },
        // 0.5秒おきに再生時間と進捗ゲージを更新するタイマーを作成
        startTimer() {
            this.playTimer = setInterval(() => {
                this.currentTime = this.convertSecToMinSec(this.$refs.audioPlayer.currentTime)
                this.progress.value = Math.floor(this.$refs.audioPlayer.currentTime)
            }, 500)
        },
        // タイマーを破棄し、再生時間と進捗ゲージをリセット
        stopTimer() {
            clearInterval(this.playTimer)
            this.currentTime = this.convertSecToMinSec(this.$refs.audioPlayer.currentTime)
            this.progress.value = this.$refs.audioPlayer.currentTime
        },
        // 再生ボタンのクリック
        handleClickPlayButton() {
            if (!this.fileUrl) { return }
            this.$refs.audioPlayer.play()
            this.isPlaying = true
            this.startTimer()
        },
        // 一時停止ボタンのクリック
        handleClickPauseButton() {
            this.$refs.audioPlayer.pause()
            this.isPlaying = false
            this.stopTimer()
        },
        // 停止ボタンのクリック
        handleClickStopButton() {
            this.$refs.audioPlayer.pause()
            this.$refs.audioPlayer.currentTime = 0
            this.isPlaying = false
            this.stopTimer()
        },
        // 最後まで再生したとき
        handleEndAudio() {
            this.$refs.audioPlayer.currentTime = 0
            this.isPlaying = false
            this.stopTimer()
        },
        // 進捗ゲージを動かしているとき
        handleGrabSlider() {
            this.stopTimer()
            // 進捗ゲージの値（再生時間）をプレイヤーに反映
            this.$refs.audioPlayer.currentTime = this.$refs.progressBar.value
        },
        // 進捗ゲージを離したとき
        handleReleaseSlider() {
            this.startTimer()
        }
    },
}
</script>

<style>
/* 再生ボタン、一時停止ボタンの切替時 */
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

.progress-bar[type="range"] {
    cursor: grab;
    margin: 0 10px 0 10px;
    width: 40%;
}
</style>