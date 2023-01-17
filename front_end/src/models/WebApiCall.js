import axios from "axios"

// サーバーに配置しているWebAPIのメソッドを呼び出すためのクラス
export class WebApiCall {
    constructor(requestUrl) {
        this.requestUrl = requestUrl
        // httpのボディに埋め込む正味のデータ
        this.payload = {}
        this.httpHeaders = {}
        this.responseData = {}
        this.blob = undefined
    }

    // FormDataを新たに作成
    setFormData(arrayNameValue) {
        this.httpHeaders.headers = { "content-type": "multipart/form-data" }
        this.payload = new FormData()

        arrayNameValue.forEach(item => {
            this.payload.append(item.name, item.value)
        })
    }

    // getメソッドでapiを呼ぶ
    async callApiGet() {
        const response = axios.get(this.requestUrl)
        this.responseData = (await response).data
    }

    // postメソッドでapiを呼ぶ
    async callApiPost() {
        const response = axios.post(this.requestUrl, this.payload, this.httpHeaders)
        this.responseData = (await response).data
    }

    // deleteメソッドでapiを呼ぶ
    async callApiDelete() {
        const isEmpty = Object.keys(this.payload).length === 0
        const response = (
            isEmpty ?
                axios.delete(this.requestUrl) :
                axios.delete(this.requestUrl, { data: this.payload })
        )

        this.responseData = (await response).data
    }

    // apiを呼んで、csvファイルをダウンロード
    async downloadCsv() {
        const response = await axios.get(this.requestUrl, { responseType: "blob" })
        const mimeType = response.headers["content-type"]

        this.blob = new Blob([response.data], { type: mimeType })
    }
}