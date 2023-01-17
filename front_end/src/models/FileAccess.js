import axios from "axios"

// 外部ファイルにアクセスするためのクラス
export class FileAccess {
    constructor(filePath) {
        this.filePath = filePath
        this.jsonData = {}
    }

    // jsonファイルを読み込み、そのデータをプロパティにセット
    async readJsonFile() {
        const response = axios.get(this.filePath)
        this.jsonData = (await response).data
    }
}