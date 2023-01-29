<!-- Vueアプリのメインコンポーネント -->
<template>
  <FlexContainer id="outerFrame" class="outer-frame" :bg-color="themeColor.gradation" :size="outerFrame.size"
    :display="outerFrame.display" :is-vertical="true">
    <!-- タイトルエリア -->
    <FlexContainer id="titleArea" :bg-color="transparent" :size="outerContainer.size" :display="outerContainer.display"
      :max-width="outerContainer.maxWidth">
      <AnimeTitle id="title" :title-parts="['Talk', 'To', 'Me!']"></AnimeTitle>
    </FlexContainer>

    <!-- コンテンツエリア -->
    <FlexContainer id="contentArea" class="content-area fade-up-content-area" :bg-color="white"
      :size="outerContainer.size" :display="outerContainer.display" :max-width="outerContainer.maxWidth"
      :is-vertical="true">
      <p :style="description.style">
        {{ description.text }}
      </p>

      <!-- 音声ファイルの入力 -->
      <FlexContainer :bg-color="transparent" :size="innerContainer.size" :display="innerContainer.display"
        :is-vertical="true">
        <!-- ファイルを直接アップロードする場合 -->
        <p class="margin-top-2">
          音声データを持っている方はこちら
        </p>
        <FileUploader id="fileUploader" ref="fileUploader" class="margin-top-2" @change-file="createFileUrl"
          :mimeTypes="fileUploader.mimeTypes" :color="fileUploader.color" width="100%"
          :file-size-limit-byte="fileUploader.fileSizeLimitByte">
        </FileUploader>
        <p class="margin-top-2">
          OR
        </p>
        <!-- 録音してアップロードする場合 -->
        <p class="margin-top-2">
          これから録音する方はこちら
        </p>
        <AudioRecorder id="audioRecorder" ref="audioRecorder" class="margin-top-2" width="100%"
          :button="recorder.button" :blob-info-color="recorder.blobInfoColor" @recording-end="handleRecordingEnd"
          @click-record-button="handleClickRecordButton" @click-stop-button="handleClickStopButton">
        </AudioRecorder>
        <!-- 音声ファイルの再生 -->
        <AudioPlayer id="audioPlayer" class="margin-top-4" :file-url="fileUrl" :button="audioPlayer.button"
          :icon="audioPlayer.icon" spacing="15px" width="100%" :end-time-sec="audioPlayer.endTimeSec">
        </AudioPlayer>
      </FlexContainer>

      <!-- 処理の状態を表示 -->
      <span class="margin-top-3" :style="stateMsg.style">
        {{ stateMsg.text }}
      </span>

      <!-- アップロード -->
      <FlexContainer v-if="!isTranscribed" :bg-color="transparent" :size="innerContainer.size"
        :display="innerContainer.display" :is-vertical="true">
        <!-- サーバーへのアップロードボタン -->
        <CustomIconButton id="uploadButton" class="margin-top-3" :font="uploadButton.font"
          :bg-color="uploadButton.bgColor" :icon="uploadButton.icon" :padding="uploadButton.padding"
          :width="uploadButton.width" :round="uploadButton.round" :is-disabled="uploadButton.isDisabled"
          :is-loading="uploadButton.isLoading" @click="handleClickUploadButton">
          アップロード
        </CustomIconButton>
        <!-- 初期化ボタン -->
        <CustomIconButton v-show="!isUploaded" id="clearButton" class="margin-top-2" :font="clearButton.font"
          :bg-color="clearButton.bgColor" :icon="clearButton.icon" :padding="clearButton.padding"
          :width="clearButton.width" :round="clearButton.round" :type="clearButton.type"
          @click="handleClickClearButton">
          クリア
        </CustomIconButton>
        <!-- キャンセルボタン -->
        <CustomIconButton v-show="isUploaded" id="cancelButton" class="margin-top-2" :font="cancelButton.font"
          :bg-color="cancelButton.bgColor" :icon="cancelButton.icon" :padding="cancelButton.padding"
          :width="cancelButton.width" :round="cancelButton.round" :type="cancelButton.type"
          :is-disabled="cancelButton.isDisabled" :is-loading="cancelButton.isLoading" @click="handleClickCancelButton">
          キャンセル
        </CustomIconButton>
      </FlexContainer>

      <!-- ダウンロード -->
      <FlexContainer v-else :bg-color="transparent" :size="innerContainer.size" :display="innerContainer.display"
        :is-vertical="true">
        <!-- 表示ボタン -->
        <CustomIconButton id="displayButton" class="margin-top-2" :font="displayButton.font"
          :bg-color="displayButton.bgColor" :icon="displayButton.icon" :padding="displayButton.padding"
          :width="displayButton.width" :round="displayButton.round" :is-disabled="displayButton.isDisabled"
          :is-loading="displayButton.isLoading" @click="handleClickDisplayButton">
          表示
        </CustomIconButton>
        <!-- ダウンロードボタン -->
        <CustomIconButton id="downloadButton" class="margin-top-2" :font="downloadButton.font"
          :bg-color="downloadButton.bgColor" :icon="downloadButton.icon" :padding="downloadButton.padding"
          :width="downloadButton.width" :round="downloadButton.round" :is-disabled="downloadButton.isDisabled"
          :is-loading="downloadButton.isLoading" @click="handleClickDownloadButton">
          ダウンロード
        </CustomIconButton>
        <!-- csvファイルを保存する際に使用 -->
        <a id="downloadLink" ref="downloadLink" class="download-link" target="_blank">
          DOWNLOAD_LINK
        </a>
        <!-- リセットボタン -->
        <CustomIconButton id="resetButton" class="margin-top-2" :font="resetButton.font" :bg-color="resetButton.bgColor"
          :icon="resetButton.icon" :padding="resetButton.padding" :width="resetButton.width" :round="resetButton.round"
          :type="resetButton.type" :is-disabled="resetButton.isDisabled" :is-loading="resetButton.isLoading"
          @click="handleClickResetButton">
          リセット
        </CustomIconButton>
      </FlexContainer>
      <!-- 文字起こしの結果を表示 -->
      <FlexContainer v-if="isDisplayTable" :bg-color="transparent" :size="innerContainer.size"
        :display="innerContainer.display" :is-vertical="true">
        <p class="margin-top-3">
          解析結果
        </p>
        <!-- 結果を表示するためのテーブル -->
        <TableNoFrame id="resultTable" class="margin-top-1 margin-bottom-1" :header-values="resultTable.headerValues"
          :body-values="resultTable.bodyValues" :align="resultTable.align">
        </TableNoFrame>
      </FlexContainer>
    </FlexContainer>
  </FlexContainer>
</template>

<script>
import { ref } from "@vue/reactivity"

import { FileAccess } from "./models/FileAccess"
import { WebApiCall } from "./models/WebApiCall"
import { DateTime } from "./models/DateTime"
import { CustomLocalStorage } from "./models/CustomLocalStorage"
import { Utility } from "./models/Utility"
import FlexContainer from "./components/FlexContainer.vue"
import FileUploader from "./components/FileUploader.vue"
import CustomIconButton from "./components/CustomIconButton.vue"
import AnimeTitle from "./components/AnimeTitle.vue"
import AudioPlayer from "./components/AudioPlayer.vue"
import AudioRecorder from "./components/AudioRecorder.vue"
import TableNoFrame from "./components/TableNoFrame.vue"

export default {
  components: {
    FlexContainer,
    FileUploader,
    CustomIconButton,
    AnimeTitle,
    AudioPlayer,
    AudioRecorder,
    TableNoFrame
  },
  computed: {
    // 音声プレイヤーのprops
    audioPlayer() {
      return {
        button: {
          size: "40px",
          color: this.themeColor.solidPurple2,
          type: "outlined"
        },
        icon: {
          size: "30px",
          color: this.themeColor.solidPurple2
        },
        endTimeSec: this.audioEndTimeSec
      }
    },
    // キャンセルボタンのprops
    cancelButton() {
      return {
        font: { size: "16px", weight: "600", color: this.themeColor.solidPurple2 },
        padding: ["9px", "20px", "9px", "20px"],
        bgColor: this.themeColor.solidPurple2,
        icon: "mdi-delete-forever-outline",
        width: "100%",
        round: "30px",
        type: "outlined",
        isDisabled: this.cancelButtonState.isDisabled,
        isLoading: this.cancelButtonState.isLoading
      }
    },
    // 初期化ボタンのprops
    clearButton() {
      return {
        font: { size: "16px", weight: "600", color: this.themeColor.solidPurple2 },
        padding: ["9px", "20px", "9px", "20px"],
        bgColor: this.themeColor.solidPurple2,
        icon: "mdi-close-circle-outline",
        width: "100%",
        round: "30px",
        type: "outlined"
      }
    },
    // 表示ボタンのprops
    displayButton() {
      return {
        font: { size: "16px", weight: "600", color: "#FFFFFF" },
        padding: ["10px", "20px", "10px", "20px"],
        bgColor: this.themeColor.solidPurple2,
        icon: "mdi-eye",
        width: "100%",
        round: "30px",
        isDisabled: this.displayButtonState.isDisabled,
        isLoading: this.displayButtonState.isLoading
      }
    },
    // ダウンロードボタンのprops
    downloadButton() {
      return {
        font: { size: "16px", weight: "600", color: "#FFFFFF" },
        padding: ["10px", "20px", "10px", "20px"],
        bgColor: this.themeColor.solidPink2,
        icon: "mdi-cloud-download",
        width: "100%",
        round: "30px",
        isDisabled: this.downloadButtonState.isDisabled,
        isLoading: this.downloadButtonState.isLoading
      }
    },
    // ファイルアップローダーのprops
    fileUploader() {
      return {
        color: {
          border: this.themeColor.solidPink2,
          chip: this.themeColor.solidPink2
        },
        // アップロードできるファイルの拡張子を制限
        mimeTypes: this.appConfig.mimeType,
        fileSizeLimitByte: this.appConfig.fileSize
      }
    },
    // 音声レコーダーのprops
    recorder() {
      return {
        button: {
          font: { size: "16px", weight: "600", color: this.themeColor.solidPurple2 },
          padding: ["9px", "20px", "9px", "20px"],
          bgColor: this.themeColor.solidPurple2,
          round: "30px",
          width: "40%",
          type: "outlined"
        },
        blobInfoColor: this.themeColor.solidPink2
      }
    },
    // リセットボタンのprops
    resetButton() {
      return {
        font: { size: "16px", weight: "600", color: this.themeColor.solidPurple2 },
        padding: ["9px", "20px", "9px", "20px"],
        bgColor: this.themeColor.solidPurple2,
        icon: "mdi-delete-forever-outline",
        width: "100%",
        round: "30px",
        type: "outlined",
        isDisabled: this.resetButtonState.isDisabled,
        isLoading: this.resetButtonState.isLoading
      }
    },
    // 処理の状態を表示
    stateMsg() {
      return {
        text: this.stateMsgText,
        style: {
          fontSize: "0.8em",
          color: this.themeColor.solidPink2,
        },
      }
    },
    description() {
      return {
        text: "音声を解析してテキストを作成します。",
        style: {
          fontSize: "0.8em",
          color: this.themeColor.solidPink2,
        }
      }
    },
    // アップロードボタンのprops
    uploadButton() {
      return {
        font: { size: "16px", weight: "600", color: "#FFFFFF" },
        padding: ["10px", "20px", "10px", "20px"],
        bgColor: this.themeColor.solidPurple2,
        icon: "mdi-cloud-upload",
        width: "100%",
        round: "30px",
        isDisabled: this.uploadButtonState.isDisabled,
        isLoading: this.uploadButtonState.isLoading
      }
    },
  },
  data() {
    return {
      // 設定ファイルの内容
      appConfig: { environment: "", backEndApiUrl: "", fileSize: 0, mimeType: [] },
      // 録音した音声ファイルの終了時間
      audioEndTimeSec: 0,
      // 音声ファイル（Blob）
      audioFile: undefined,
      // キャンセルボタンの状態
      cancelButtonState: { isDisabled: false, isLoading: false },
      // コンテンツエリアの初期位置
      contentAreaPositionInitY: ref(""),
      customLocalStorage: new CustomLocalStorage("speechToText"),
      // 表示ボタンの状態
      displayButtonState: { isDisabled: false, isLoading: false },
      // ダウンロードボタンの状態
      downloadButtonState: { isDisabled: false, isLoading: false },
      // 音声ファイルのURL
      fileUrl: "",
      // 内枠のprops
      innerContainer: {
        size: { height: "fit-content", width: "100%" },
        display: { vertical: "center", horizontal: "center" },
      },
      // 文字起こしの結果を格納するテーブルを表示する場合はtrue
      isDisplayTable: false,
      // 文字起こしが完了した場合はtrue
      isTranscribed: false,
      // アップロードが完了した場合はtrue
      isUploaded: false,
      // 大外の枠のprops
      outerFrame: {
        size: { height: "fit-content", width: "100vw" },
        display: { vertical: "center", horizontal: "start" }
      },
      // 外枠のprops
      outerContainer: {
        size: { height: "fit-content", width: "100%" },
        display: { vertical: "center", horizontal: "center" },
        maxWidth: "1200px"
      },
      // タイマーオブジェクト
      playTimer: undefined,
      // リセットロードボタンの状態
      resetButtonState: { isDisabled: false, isLoading: false },
      // 文字起こしの結果を表示するテーブルにバインドする値（配列）
      resultTable: {
        headerValues: ["時間", "テキスト"],
        bodyValues: [],
        align: { header: "center", body: "left" }
      },
      // サーバーに保存したファイルの名前
      serverFileName: {
        audio: "",
        csv: ""
      },
      state: {
        UPLOADED: "uploaded",
        TRANSCRIBING: "transcribing",
        TRANSCRIBED: "transcribed",
        DOWNLOADED: "downloaded",
        DELETED: "deleted",
        ERROR: "error"
      },
      // 処理の状態を表示
      stateMsgText: "サーバーとの接続を確認しています。",
      // テーマカラーを集約
      themeColor: {
        solidPurple1: "#753a88",
        solidPurple2: "#9249AB",
        solidPink1: "#cc2b5e",
        solidPink2: "#D94E7C",
        gradation: "linear-gradient(to right, #753a88, #cc2b5e)"
      },
      // 透明色
      transparent: "rgba(0, 0, 0, 0)",
      // アップロードボタンの状態
      uploadButtonState: { isDisabled: false, isLoading: false },
      // 白色
      white: "#FFFFFF",
      // 画面の高さ
      windowHeight: ref(""),
    }
  },
  methods: {
    // コンポーネントから渡されたFileオブジェクトからURLを作成
    createFileUrl(fileObjects) {
      // audioFileは、サーバーへアップロードする際に必要となる
      this.audioFile = fileObjects[0]
      // fileUrlがAudioPlayerに読み込まれる
      this.fileUrl = URL.createObjectURL(this.audioFile)
    },
    // コンポーネントから渡されたBlobオブジェクトからURLを作成
    createBlobUrl(blob) {
      this.audioFile = blob
      this.fileUrl = URL.createObjectURL(this.audioFile)
    },
    // 文字起こしの処理状況をサーバーに問い合わせる
    getStateTranscription() {
      // 音声ファイルの名称をパラメーターにセットし、getメソッドでリクエスト
      const webApiCall = new WebApiCall(
        `${this.appConfig.backEndApiUrl}/getStateTranscription` +
        `?fileNameAudio=${this.serverFileName.audio}`
      )
      webApiCall.callApiGet()
        .then(() => {
          // 返却されたメッセージを画面に表示
          this.stateMsgText = webApiCall.responseData["msg"]
          // フラグを一旦リセット
          this.isUploaded = false
          this.isTranscribed = false
          this.cancelButtonState.isDisabled = false
          this.cancelButtonState.isLoading = false

          // 録音中でなければ、アップロードボタンのフラグもリセット
          if (!this.$refs.audioRecorder.isRecording) {
            this.uploadButtonState.isDisabled = false
            this.uploadButtonState.isLoading = false
          }

          // 処理状況に応じてフラグを変更
          switch (webApiCall.responseData["state"]) {
            case this.state.UPLOADED:
              this.isUploaded = true
              // アップロードボタンを使用不可に
              this.uploadButtonState.isDisabled = true
              this.uploadButtonState.isLoading = true
              break
            case this.state.TRANSCRIBING:
              this.isUploaded = true
              // アップロードボタンを使用不可に
              this.uploadButtonState.isDisabled = true
              this.uploadButtonState.isLoading = true
              // キャンセルボタンを使用不可に
              this.cancelButtonState.isDisabled = true
              this.cancelButtonState.isLoading = true
              break
            case this.state.TRANSCRIBED:
              this.isTranscribed = true
              this.serverFileName.csv = `${this.serverFileName.audio.split(".")[0]}.csv`
              // ブラウザにcsvファイルの名称を保存
              this.customLocalStorage.setItem(this.serverFileName)
              break
            case this.state.DOWNLOADED:
              this.isTranscribed = true
              break
          }
          if (this.stateMsgText.includes("まもなく")) {
            // キャンセルボタンを使用不可に
            this.cancelButtonState.isDisabled = true
            this.cancelButtonState.isLoading = true
          }
        })
        .catch((error) => {
          console.log(error.message)
          this.stateMsgText = "サーバーとの接続に失敗しました。"
        })
    },
    // タイマーを設定
    startTimer() {
      // 10秒ごとに処理状況を問い合わせる
      this.playTimer = setInterval(() => {
        this.getStateTranscription()
      }, 10000)
    },
    // タイマーを除去
    stopTimer() {
      clearInterval(this.playTimer)
    },
    // タイマーをリセット
    resetTimer() {
      if (this.playTimer) { this.stopTimer() }
      this.getStateTranscription()
      this.startTimer()
    },
    // 録音終了
    handleRecordingEnd(event) {
      this.createBlobUrl(event.blob)
      // webm形式の音声ファイルは、終了時間の情報を保持していないため、
      // 別にプロパティを用意している
      this.audioEndTimeSec = event.endTimeSec
    },
    // 録音開始ボタンをクリック
    handleClickRecordButton() {
      this.uploadButtonState.isDisabled = true
    },
    // 録音終了ボタンをクリック
    handleClickStopButton() {
      // ローディング中でなければ、アップロードボタンを使用可に
      if (this.uploadButtonState.isLoading) { return }
      this.uploadButtonState.isDisabled = false
    },
    // アップロードボタンをクリック
    async handleClickUploadButton() {
      const dateTime = new DateTime()
      let savingFileName = ""
      let extension = ""
      let webApiCall = undefined

      // 音声データがセットされていない場合は処理を抜ける
      if (!this.audioFile) {
        alert("音声ファイルがセットされていません。")
        return
      }
      // アップロードボタンを使用不可に
      this.uploadButtonState.isDisabled = true
      this.uploadButtonState.isLoading = true

      // 音声ファイルの拡張子を作成
      extension = this.audioFile.type.split("/")[1]
      if (extension.includes(";")) {
        extension = extension.split(";")[0]
      }
      extension = extension
        .replace("mpeg", "mp3")
        .replace("x-m4a", "m4a")
        .replace("x-ms-wma", "wma")

      // サーバーに保存する際のファイル名は、日付+半角英数字で12桁以下のランダムな文字列
      // ex) 2023-01-15_aksjavnmnaweoijg.mp3
      savingFileName = (
        `${dateTime.getStringFromDate("-")}_` +
        Utility.getRandomString(16) +
        `.${extension}`
      )

      // サーバーに音声ファイルを保存
      try {
        // FormDataに音声ファイルと保存ファイル名をセットし、postメソッドでリクエスト
        webApiCall = new WebApiCall(`${this.appConfig.backEndApiUrl}/saveFile`)
        webApiCall.setFormData([
          { name: "audioFile", value: this.audioFile },
          { name: "savingFileName", value: savingFileName }
        ])
        await webApiCall.callApiPost()
        this.serverFileName.audio = savingFileName
        // 音声ファイルの名称をローカルストレージに保存
        this.customLocalStorage.setItem(this.serverFileName)
      }
      catch (error) {
        console.log(error.message)
        alert("音声ファイルの保存中にエラーが発生しました。")
      }
      finally {
        // サーバーに処理状況を問い合わせ
        this.resetTimer()
      }

      // 文字起こしを実行
      // 音声ファイルの名称をパラメーターにセットし、getメソッドでリクエスト
      webApiCall = new WebApiCall(
        `${this.appConfig.backEndApiUrl}/transcribe?fileNameAudio=${savingFileName}`
      )
      webApiCall.callApiGet()
        .catch((error) => {
          console.log(error.message)
          alert("音声からテキストへ変換する際にエラーが発生しました。")
        })
        .finally(() => {
          // サーバーに処理状況を問い合わせ（変換完了）
          this.resetTimer()
        })
      // サーバーに処理状況を問い合わせ（変換中）
      this.resetTimer()
    },
    // 初期化ボタンのクリック
    handleClickClearButton() {
      // 音声ファイルをクリア
      this.audioFile = undefined
      this.fileUrl = ""
      // 音声ファイルの再生時間もクリア
      this.audioEndTimeSec = 0
      // ファイルアップローダーをクリア
      this.$refs.fileUploader.fileObjects = []
      // レコーダーを初期化
      this.$refs.audioRecorder.isRecording = false
      this.$refs.audioRecorder.isRecorded = false
      // ローディング中でなければ、アップロードボタンを使用可に
      this.uploadButtonState.isDisabled = this.uploadButtonState.isLoading ? true : false
    },
    // キャンセルボタンのクリック
    handleClickCancelButton() {
      let webApiCall = undefined

      // キャンセルボタンを使用不可に
      this.cancelButtonState.isDisabled = true
      this.cancelButtonState.isLoading = true

      // キャンセル処理（音声ファイルの削除）
      // 音声ファイルの名称をパラメーターにセットし、deleteメソッドでリクエスト
      webApiCall = new WebApiCall(
        `${this.appConfig.backEndApiUrl}/cancelTranscribing` +
        `/${this.serverFileName.audio}`
      )
      webApiCall.callApiDelete()
        .then(() => {
          // サーバーに保存した際のファイル名をクリア
          this.serverFileName.audio = ""
          this.serverFileName.csv = ""
          // ブラウザに保存していた音声、csvファイルの名称を削除
          this.customLocalStorage.removeItem()
        })
        .catch((error) => {
          console.log(error.message)
          alert("キャンセル処理中（音声ファイルの削除中）にエラーが発生しました。")
        })
        .finally(() => {
          // サーバーに処理状況を問い合わせ
          this.resetTimer()
        })
    },
    // 表示ボタンのクリック
    handleClickDisplayButton() {
      let webApiCall = undefined

      // 表示ボタンを使用不可に
      this.displayButtonState.isDisabled = true
      this.displayButtonState.isLoading = true

      // 文字起こしの結果をjsonファイルで取得
      // ファイル名をパラメーターにセットし、getメソッドでリクエスト
      webApiCall = new WebApiCall(
        `${this.appConfig.backEndApiUrl}/downloadJson` +
        `?fileNameAudio=${this.serverFileName.audio}` +
        `&fileNameCsv=${this.serverFileName.csv}`
      )
      webApiCall.callApiGet()
        .then(() => {
          // レスポンスデータを配列に変換
          const segments = Array.from(webApiCall.responseData["segments"])

          // 初期化
          this.resultTable.bodyValues = []
          // 2次元配列を作成
          // [{"X":"a", "Y":"b"}, {"X":"c", "Y":"d"}] ⇒ [["a", "b"]["c", "d"]]
          segments.map((x) => {
            const array = []

            array.push(`${x["start"]}〜${x["end"]}`, x["text"])
            this.resultTable.bodyValues.push(array)
          })
          // 文字起こしの結果を格納するテーブルを表示
          this.isDisplayTable = true
        })
        .catch((error) => {
          console.log(error.message)
          alert("jsonファイルのダウンロード中にエラーが発生しました。")
        })
        .finally(() => {
          // 表示ボタンを使用可に
          this.displayButtonState.isDisabled = false
          this.displayButtonState.isLoading = false
          // サーバーに処理状況を問い合わせ
          this.resetTimer()
        })
    },
    // ダウンロードボタンをクリック
    handleClickDownloadButton() {
      const dateTime = new DateTime()
      let webApiCall = undefined

      // ダウンロードボタンを使用不可に
      this.downloadButtonState.isDisabled = true
      this.downloadButtonState.isLoading = true

      // 文字起こしの結果をcsvファイルで取得
      // ファイル名をパラメーターにセットし、getメソッドでリクエスト
      webApiCall = new WebApiCall(
        `${this.appConfig.backEndApiUrl}/downloadCsv` +
        `?fileNameAudio=${this.serverFileName.audio}` +
        `&fileNameCsv=${this.serverFileName.csv}`
      )
      webApiCall.downloadCsv()
        .then(() => {
          // 取得したcsvファイルをblob化して、aタグにバインド
          this.$refs.downloadLink.href = URL.createObjectURL(webApiCall.blob)
          this.$refs.downloadLink.download = (
            `${dateTime.getStringFromDate("-")}_result_speech_to_text.csv`
          )
          // aタグをクリック（ダウンロード実行）
          this.$refs.downloadLink.click()
          // aタグを初期化
          this.$refs.downloadLink.href = undefined
        })
        .catch((error) => {
          console.log(error.message)
          alert("csvファイルのダウンロード中にエラーが発生しました。")
        })
        .finally(() => {
          // ダウンロードボタンを使用可に
          this.downloadButtonState.isDisabled = false
          this.downloadButtonState.isLoading = false
          // サーバーに処理状況を問い合わせ
          this.resetTimer()
        })
    },
    // リセットボタンをクリック
    handleClickResetButton() {
      let webApiCall = undefined

      // リセットボタンを使用不可に
      this.resetButtonState.isDisabled = true
      this.resetButtonState.isLoading = true

      // 音声ファイルを削除
      // 音声ファイルの名称をパラメーターにセットし、deleteメソッドでリクエスト
      webApiCall = new WebApiCall(
        `${this.appConfig.backEndApiUrl}/deleteAudioAndCsv` +
        `/${this.serverFileName.audio}`
      )
      webApiCall.callApiDelete()
        .then(() => {
          // サーバーに保存した際のファイル名をクリア
          this.serverFileName.audio = ""
          this.serverFileName.csv = ""
          // ブラウザに保存していた音声、csvファイルの名称を削除
          this.customLocalStorage.removeItem()
          // 文字起こしの結果を格納するテーブルを非表示にし、値を初期化
          this.isDisplayTable = false
          this.resultTable.bodyValues = []
        })
        .catch((error) => {
          console.log(error.message)
          alert("音声ファイルとcsvファイルの削除中にエラーが発生しました。")
        })
        .finally(() => {
          // リセットボタンを使用可に
          this.resetButtonState.isDisabled = false
          this.resetButtonState.isLoading = false
          // サーバーに処理状況を問い合わせ
          this.resetTimer()
        })
    },
  },
  async created() {
    const fileAccess = new FileAccess("./appconfig.json")

    // 外部の設定ファイルを読み込み、プロパティに代入
    await fileAccess.readJsonFile()
    this.appConfig.environment = fileAccess.jsonData["environment"]["value"]
    this.appConfig.backEndApiUrl = fileAccess.jsonData["backEndApiUrl"][this.appConfig.environment]
    this.appConfig.fileSize = fileAccess.jsonData["fileSize"]["audio"]
    this.appConfig.mimeType = fileAccess.jsonData["mimeType"]["audio"]
  },
  mounted() {
    const setWindowHeight = () => { this.windowHeight = ref(`${window.innerHeight}px`) }
    const noScroll = (event) => { event.preventDefault() }

    // コンテンツエリアの初期位置は画面外（画面下）
    this.contentAreaPositionInitY = ref(`translateY(calc(${window.innerHeight}px - 15px - 32px - 15px))`)

    // 画面サイズ（高さ）を取得し、プロパティに格納（CSSに埋め込む用）
    setWindowHeight()
    window.addEventListener("resize", () => {
      setWindowHeight()
    })

    // 最初のアニメーションが終了するまで、スクロールを制限
    document.addEventListener("touchmove", noScroll, { passive: false })
    document.addEventListener("wheel", noScroll, { passive: false })
    setTimeout(() => {
      document.removeEventListener("touchmove", noScroll, { passive: false })
      document.removeEventListener("wheel", noScroll, { passive: false })
    }, 6000)

    // ブラウザに保存していたcsvファイルの名称を取得（前回アクセス時、途中離脱した場合）
    // 同時接続の検証（テスト）をする場合は、以下の3行をコメントアウトする
    if (this.customLocalStorage.checkExistItem()) {
      this.serverFileName = this.customLocalStorage.getItem()
    }

    // 0.5秒の間をおいた後、処理状況をサーバーに問い合わせ（10秒間隔）
    setTimeout(() => {
      this.resetTimer()
    }, 500)
  }
}
</script>

<style>
.content-area {
  border-radius: 10px;
  padding: 20px 20px 20px 20px;
}

/* javascriptのプロパティを埋め込み（v-bind） */
.outer-frame {
  position: relative;
  min-height: v-bind(windowHeight);
  height: fit-content;
  padding-bottom: 20px;
}

.title {
  font-size: 32px;
  font-weight: 600;
  color: #FFFFFF;
  margin: 15px 0 15px 0;
}

.margin-top-1 {
  margin-top: 10px;
}

.margin-top-2 {
  margin-top: 20px;
}

.margin-top-3 {
  margin-top: 30px;
}

.margin-top-4 {
  margin-top: 40px;
}

.margin-bottom-1 {
  margin-bottom: 10px;
}

.margin-bottom-2 {
  margin-bottom: 20px;
}

.margin-bottom-3 {
  margin-bottom: 30px;
}

.margin-bottom-4 {
  margin-bottom: 40px;
}

/* コンテンツエリアは画面外（画面下）から出現させる */
.fade-up-content-area {
  animation: fade-up-anime-content-area 2s ease-in-out 5s 1 normal backwards;
}

@keyframes fade-up-anime-content-area {
  0% {
    opacity: 0;
    transform: v-bind(contentAreaPositionInitY);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.download-link {
  display: none;
}
</style>
