const request = require('request');
let moment = require('moment');
let DBCtrl = require('./Backend/DB/DBController');
let CommonCtrl = require('./Backend/Controller/CommonController');

var colorLog = require("./Backend/Log/color_log");
colorLog.Info("데일리카드발급 서버가 기동되었습니다.");

let counter = 0;

async function start() {
    let d = new Date();
    let settings = await DBCtrl.getDailyCardSettings();
    for (let i = 0; i < settings.length; i++) {
        colorLog.Success("======= 발급 START =======  " + d.toLocaleString());
        var customers = await DBCtrl.getCustomers(" is_allow = 1 AND area LIKE '" + settings[i].region + "%' AND sex = '" + (settings[i].gender == "male" ? '0' : '1') + "'");
        let customerIds = [];
        for (let j = 0; j < customers.length; j++) {
            customerIds.push(customers[j].id);
            await DBCtrl.updateDailyCardToday(customers[j], settings[i].region, settings[i].card_count);
        }
        if (customers.length == 0) {
            colorLog.Normal("유저들이 없습니다.");
        } else {
            // 회원들에게 푸시알림 보내기
            sendPush(customerIds.join(','));
        }
        colorLog.Success("======= 발급 END =======  " + d.toLocaleString());
    }
}
// start();
let isSending = [];
setInterval(async function() {
    // 데일리카드 발급
    let d = moment(new Date()).format("HH:mm");
    let settings = await DBCtrl.getDailyCardSettings();
    for (let i = 0; i < settings.length; i++) {
        if (d == settings[i].send_time.substring(0, 5) && (!isSending[i] || isSending[i] == false)) {
            isSending[i] = true;
            await DBCtrl.updateDailyCardSettings({
                id: settings[i].id
            }, {
                is_send: 1
            });
            colorLog.Success("======= 발급 START =======  " + moment(new Date()).format("YYYY-MM-DD HH:mm"));
            var customers = await DBCtrl.getCustomers(" is_allow = 1 AND area LIKE '" + settings[i].region + "%' AND sex = '" + (settings[i].gender == "male" ? '0' : '1') + "'");
            let customerIds = [];
            for (let j = 0; j < customers.length; j++) {
                customerIds.push(customers[j].id);
                await DBCtrl.updateDailyCardToday(customers[j], settings[i].region, settings[i].card_count);
            }
            if (customers.length == 0) {
                colorLog.Normal("유저들이 없습니다.");
            } else {
                // 회원들에게 푸시알림 보내기
                sendPush(customerIds.join(','));
            }
            colorLog.Success("======= 발급 END =======  " + moment(new Date()).format("YYYY-MM-DD HH:mm"));
        } else if (d != settings[i].send_time.substring(0, 5) && isSending[i]) {
            isSending[i] = false;
            await DBCtrl.updateDailyCardSettings({
                id: settings[i].id
            }, {
                is_send: 0
            });
        }
    }

    console.log("============running============" + counter);
    counter++;
    if(counter > 60)
        counter = 0;

}, 1000);

// 탈퇴목록에서 3일 지난 회원 삭제 및 탈퇴
setInterval(async function() {
    let exitCustomers = await DBCtrl.getExitCustomers();
    for (let i = 0; i < exitCustomers.length; i++) {
        await DBCtrl.setExitCustomer(exitCustomers[i].uid);
    }
}, 1000);

// 지난카드 추가 및 삭제
setInterval(async function() {
    let dailyCards = await DBCtrl.getDailyCard();
    // 추가
    for (let i = 0; i < dailyCards.length; i++) {
        await DBCtrl.addDailyCardLast(dailyCards[i]);
    }

    // 삭제
    await DBCtrl.deleteDailyCardLast();
}, 1000);

// 프로필평가카드 발송
let isProfileSending = false;
setInterval(async function() {
    let d = moment().format("HH:mm");
    if (d == "11:00") {
        if (!isProfileSending) {
            isProfileSending = true;
            await DBCtrl.sendUidProfileCheck();
        }
    } else {
        isProfileSending = false;
    }
}, 1000);

function sendPush(customersIds) {
    CommonCtrl.sendCardReceivePush(customersIds);
    CommonCtrl.sendCardReceiveSocketData(customersIds);
}