export class Utility {
    // 引数に渡した桁数分、ランダムな文字列を作成
    static getRandomString(digit) {
        const MATERIAL = (
            "abcdefghijklmnopqrstuvwxyz" +
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
            "0123456789"
        )
        // 0〜255のランダムな数値の配列を作成
        const randomNumArray = Array.from(crypto.getRandomValues(new Uint8Array(digit)))
        
        // 上記数値をMATERIALの文字数で割り、その余りをインデックスとする
        // MATERIALから、上記インデックスの文字を取り出す
        // 最後に取り出した文字列を結合
        return randomNumArray.map((x) => MATERIAL[x % MATERIAL.length]).join('')
    }
}