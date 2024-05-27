// 分鐘調整使用
export function addMinutes(minutes = 0, dateTime = new Date()) {
    const date = new Date(dateTime);
    date.setMinutes(date.getMinutes() + minutes);
    return date
}

// 天數調整使用
export function addDays(days = 0, dateTime = new Date()) {
    const date = new Date(dateTime);
    date.setDate(date.getDate() + days);
    return date
}

// 月份調整使用
export function addMonths(months = 0, dateTime = new Date()) {
    const date = new Date(dateTime);
    date.setMonth(date.getMonth() + 1 + months);
    return date
}

// 年調整使用
export function addYears(year = 0) {
    const date = new Date()
    date.setFullYear(date.getFullYear() + year)
    return date
}


export function leftpad(str, len = 2, pattern = '0') {
    str += ''
    if (str.length < len)
        for (let i = 0; i < len - str.length; i++)
            str = '0' + str
    return str
}

export function getFullDate(dateTime) {
    let date = dateTime ? new Date(dateTime) : new Date()

    return {
        y: date.getFullYear(),
        m: leftpad(date.getMonth() + 1),
        d: leftpad(date.getDate()),
        h: leftpad(date.getHours()),
        mm: leftpad(date.getMinutes()),
        s: leftpad(date.getSeconds()),
        date,
    }
}

export function parseToDateString(dateTime) {
    let { y, m, d } = getFullDate(dateTime)
    return `${y}-${m}-${d}`
}


export function parseToDateTimeString(dateTime) {
    let { y, m, d, h, mm, s } = getFullDate(dateTime)
    return `${y}-${m}-${d}T${h}:${mm}:${s}`
}

export function parseToISOString(dateTime) {
    let { y, m, d, h, mm, s } = getFullDate(dateTime)
    return `${y}-${m}-${d}T${h}:${mm}`
}

export function parseToDateDisplayString(datetime) {
    const date = !!datetime ? datetime : new Date()
    let { y, m, d, h, mm, s } = getFullDate(date)
    return `${y}/${m}/${d}  ${h}:${mm}`
}

export function getCycleDays({ date, dayCount, isWeek, isMonth }) {
    if (!new Date(date).getDate()) return []
    const dayArr = []

    const fullDate = getFullDate(date)
    const y = fullDate.y
    const m = fullDate.m - 1
    const d = fullDate.d
    if (isMonth) {

        const days = (new Date(y, m + 1, 1) - new Date(y, m, 1)) / (86400 * 1000)

        // 紀錄上個月有哪幾天(如果這個月不是從星期天開始才會紀錄)
        if (new Date(y, m, 1).getDay() != 0) {
            const lastdays = (new Date(y, m, 1) - new Date(y, m - 1, 1)) / (86400 * 1000)
            for (let i = new Date(y, m, 1).getDay() - 1; i >= 0; i--) {
                const newY = new Date(y, m - 1, 1).getFullYear()
                const newM = new Date(y, m - 1, 1).getMonth()
                const newD = lastdays - i
                dayArr.push(new Date(newY, newM, newD))
            }
        }

        // 紀錄這個月有哪幾天
        for (let i = 1; i <= days; i++) {
            dayArr.push(new Date(y, m, i))
        }

        // 紀錄下個月有哪幾天(如果這個月的最後一天不是禮拜六才會紀錄)
        let i = 1
        if (new Date(y, m, days).getDay() != 6) {
            for (i; i < 7 - new Date(y, m, days).getDay(); i++) {
                const newY = new Date(y, m + 1, 1).getFullYear()
                const newM = new Date(y, m + 1, 1).getMonth()
                const newD = i
                dayArr.push(new Date(newY, newM, newD))
            }
        }
    }

    if (isWeek) {
        const prevDaysCount = new Date(date).getDay()
        let j = 1

        for (let i = 0; i <= prevDaysCount; i++) {
            const newDate = addDays(i - prevDaysCount, new Date(y, m, d))
            setStartTime(newDate)

            dayArr.push(newDate)
        }

        for (j = 1; j <= 6 - prevDaysCount; j++) {
            const newDate = addDays(j, new Date(y, m, d))
            setStartTime(newDate)

            dayArr.push(newDate)
        }

    }

    if (!isWeek && !isMonth) {
        let i = 0
        for (i = 0; i < dayCount; i++) {
            const newDate = addDays(i, date)
            setStartTime(newDate)

            dayArr.push(newDate)
        }
    }

    return dayArr
}

function setStartTime(dateTime) {
    dateTime.setHours(0)
    dateTime.setMinutes(0)
    dateTime.setSeconds(0)
    dateTime.setMilliseconds(0)
}

// 過濾不必要的日期
export function filterDate({ btime, etime, showData, dayCount, isWeek, isMonth, now }) {
    const dayList = getCycleDays({ date: showData, dayCount, isWeek, isMonth })
    const dateB = new Date(btime)
    const dateE = new Date(etime)

    const firstDate = now ? new Date(now) : new Date(dayList[0])
    const lastDate = addDays(1, new Date(dayList[dayList.length - 1]))
    lastDate.setMilliseconds(0) // 毫秒會偷跑，reset 回 0

    // 活動時間覆蓋了起始日期
    const before = dateB < firstDate && dateE >= firstDate && dateE < lastDate
    // 活動時間在起始日期和結束日期之間
    const between = dateB >= firstDate && dateB < lastDate && dateE >= firstDate && dateE < lastDate
    // 活動時間覆蓋了結束日期
    const future = dateB >= firstDate && dateB < lastDate && dateE >= lastDate
    // 活動時間覆蓋了起始日期和結束日期
    const cover = dateB < firstDate && dateE >= lastDate
    return before || between || future || cover
}


// 判斷行事曆裡面的資料是否有跨日，跨日回傳 true
export function dateDiff({ btime, etime, all_day }) {
    if (all_day) return true
    const fullDateB = getFullDate(btime)
    const fullDateE = getFullDate(etime)
    const fullDateDiff = (fullDateE.y - fullDateB.y) + (fullDateE.m - fullDateB.m) + (fullDateE.d - fullDateB.d)
    if (fullDateDiff <= 0) return false
    return true
}

// 判斷相差的時間，回傳相差的時間
export function timeDiff(dateTime) {
    const nowTime = new Date();
    const inputTime = new Date(dateTime);
    const diffTime = nowTime.getTime() - inputTime.getTime();
    const diffMin = Math.floor(diffTime / 60000);
    const diffHour = Math.floor(diffTime / 3600000)
    const diffDay = Math.floor(diffTime / (24 * 3600000))
    return { diffMin, diffHour, diffDay }
}