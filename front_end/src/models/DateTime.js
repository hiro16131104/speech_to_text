export class DateTime {
    constructor() {
        // 初期値は現在日時
        this.dateTime = new Date()
    }

    // 文字列に変換した日付を取得
    getStringFromDate(delimiter) {
        // getMonth()の戻り値だけ0始まりであるため、プラス1が必要
        let str = {
            year: this.dateTime.getFullYear().toString(),
            month: (this.dateTime.getMonth() + 1).toString(),
            day: this.dateTime.getDate().toString(),
        }

        str.month = `0${str.month}`.slice(-2)
        str.day = `0${str.day}`.slice(-2)

        return str.year + delimiter + str.month + delimiter + str.day
    }
}