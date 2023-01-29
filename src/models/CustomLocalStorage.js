// ローカルストレージ（ブラウザ内の記憶領域）に値を保存するためのクラス
export class CustomLocalStorage {
    constructor(key) {
        this.key = key
    }

    // オブジェクトをjson文字列に変換した上でローカルストレージに保存
    setItem(obj) {
        localStorage.setItem(this.key, JSON.stringify(obj))
    }

    // ローカルストレージから値を取り出し、オブジェクトに変換
    getItem() {
        return JSON.parse(localStorage.getItem(this.key))
    }

    // ローカルストレージ内で、指定したキーに値が保存（存在）している場合はtrue
    checkExistItem() {
        return localStorage.getItem(this.key) !== null ? true : false
    }

    // ローカルストレージから値を除去
    removeItem() {
        localStorage.removeItem(this.key)
    }
}