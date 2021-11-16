module.exports = {
    
    /**
     * 具体某个时间执行
     * @param h 时
     * @param m 分
     * @param s 秒
     * @param task 任务
     * @param interval 执行间隔(day)
     */
    executeDayTask(h, m, s, task, interval) {
        let timerId = setInterval(function () {
            let date = new Date();
            if (date.getHours() === h && date.getMinutes() === m && date.getSeconds() === s) {
                clearInterval(timerId);
                task();
                console.log('-------定时更新中')
                //每隔一天执行
                setInterval(task, interval);
            }
        }, 1000)
    },

    /**
     * 间隔执行定时停止
     * @param h 时
     * @param m 分
     * @param s 秒
     * @param task 任务
     * @param interval 执行间隔(day)
     */
    autoStopTask(h, m, s, task, interval) {
        let timerId = setInterval(function () {
            let date = new Date();
            task();
            if (date.getHours() === h && date.getMinutes() === m && date.getSeconds() === s) {
                clearInterval(timerId);
                console.log('stop');
            }
        }, interval * 24 * 60 * 60 * 1000)
    },

    /**
     * 每隔一定时间执行一次
     * @param task 任务
     * @param interval 执行间隔(minute)
     */
    executeNowTask(task, interval) {
        let timerID = setInterval(function() {
            task();
        }, interval * 60 * 1000)
    },

    /**
     * 当前时间执行一次
     * @param task 任务
     */
    OnceTask(task) {
        let timerID = setInterval(function() {
            task();
            clearInterval(timerID);
        }, 1000)
    },

    /**
     * @param task 任务
     */
    afterDayStopTask(task) {
        let now_date = new Date();
        let d = now_date.getDate();
        let h = now_date.getHours();
        let m = now_date.getMinutes();
        let s = now_date.getSeconds();
        let timerId = setInterval(function() {
            let date = new Date();
            task();
            if(date.getDate() === (d + 1) && date.getHours() === h && date.getMinutes() === m && date.getSeconds() === s ) {
                clearInterval(timerId);
            }
        }, 5000)
    }
}
