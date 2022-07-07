const colors = {
    Reset: "\x1b[0m",
    Bright: "\x1b[1m",
    Dim: "\x1b[2m",
    Underscore: "\x1b[4m",
    Blink: "\x1b[5m",
    Reverse: "\x1b[7m",
    Hidden: "\x1b[8m",
    fg: {
        Black: "\x1b[30m",
        Red: "\x1b[31m",
        Green: "\x1b[32m",
        Yellow: "\x1b[33m",
        Blue: "\x1b[34m",
        Magenta: "\x1b[35m",
        Cyan: "\x1b[36m",
        White: "\x1b[37m",
        Crimson: "\x1b[38m"
    },
    bg: {
        Black: "\x1b[40m",
        Red: "\x1b[41m",
        Green: "\x1b[42m",
        Yellow: "\x1b[43m",
        Blue: "\x1b[44m",
        Magenta: "\x1b[45m",
        Cyan: "\x1b[46m",
        White: "\x1b[47m",
        Crimson: "\x1b[48m"
    }
};

let getCurrentTime = function () {
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    return (year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds)
}

exports.TestColor = function () {
    console.log(colors.bg.Blue, colors.fg.White, "Blue", colors.Reset);
    console.log(colors.bg.Red, colors.fg.White, "Red", colors.Reset);
    console.log(colors.bg.Green, colors.fg.White, "Green", colors.Reset);
    console.log(colors.bg.Yellow, colors.fg.White, "Yellow", colors.Reset);
    console.log(colors.bg.Magenta, colors.fg.White, "Magenta", colors.Reset);
    console.log(colors.bg.Cyan, colors.fg.White, "Cyan", colors.Reset);
    console.log(colors.bg.White, colors.fg.Black, "white", colors.Reset);
    console.log(colors.bg.Crimson, colors.fg.White, "Crimson", colors.Reset);
}
exports.Success = function (jsonObj) {
    console.log(colors.bg.Green, colors.fg.Black, jsonObj, colors.Reset);
}
exports.Info = function (str) {
    console.log(colors.bg.Blue, colors.fg.Black, str, colors.Reset);
}
exports.Error = function (str) {
    console.log(colors.bg.Red, colors.fg.Black, "ERROR: " + getCurrentTime(), colors.Reset);
    console.log(colors.bg.Red, colors.fg.Black, str, colors.Reset);
}
exports.Warning = function (str) {
    console.log(colors.bg.Yellow, colors.fg.Black, str, colors.Reset);
}
exports.Normal = function (str) {
    console.log(colors.bg.Crimson, colors.fg.White, str, colors.Reset);
}
