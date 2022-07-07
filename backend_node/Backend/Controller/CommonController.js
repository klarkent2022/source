require('rootpath')();
let mysql = require('../DB/mysql_Controller');
let config = require('../Config/index');
let moment = require('moment');
let fs = require('fs-extra');

const async = require( "async" );
const admin = require('firebase-admin');
let serAccount = require('../Config/fcm-key.json');
const { json } = require('body-parser');

// admin.initializeApp({
    
//   credential: admin.credential.cert(serAccount),
// });

exports.GetNickName = async function () {

    var nickColorList = await mysql.findAll("nick_color");
    if(nickColorList.length < 1)
        return "";
    
    var rndId = Math.floor(Math.random() * (nickColorList.length - 1));
    var nickColorName = nickColorList[rndId].nick_name;

    var nickBirdList = await mysql.findAll("nick_bird");
    if(nickBirdList.length < 1)
        return "";
    
    rndId = Math.floor(Math.random() * (nickBirdList.length - 1));
    var nickBirdName = nickBirdList[rndId].nick_name;

    return nickColorName + " " + nickBirdName;
};

exports.AddActiveHistory = async function (uid, contents) {

    var customerInfo = await mysql.findOne('customers', {id:uid}, 'nick_name');

    let dataObj = {
        uid: uid,
        nick_name: customerInfo['nick_name'],
        content: contents
    };

    let result = await mysql.insertOne('active_history', dataObj);

    return result;
};

exports.GetKoreanFormatFromSec = function (sec) {

    if(sec == null)
        return '';
    if(sec <= 0){
        return '방금전';
    }
    else if(sec < 60){
        return parseInt(sec) + '초전';
    }
    else if(sec < 3600){
        min = sec / 60;
        return parseInt(min) + '분전';
    }
    else if(sec < 3600 * 24){
        hour = sec / 3600;
        return parseInt(hour) + '시간전';
    }
    else if(sec < 3600 * 24 * 30){
        hour = sec / (3600 * 24);
        return parseInt(hour) + '일전';
    }
    else if(sec < 3600 * 24 * 30 * 12){
        month = sec / (3600 * 24 * 30);
        return parseInt(month) + '달전';
    }
    else{
        year = sec / (3600 * 24 * 30 * 12);
        return parseInt(year) + '년전';
    }
};

exports.sendFcm = async function(info){

    //console.log(info.content_type);

     try{
    if(admin.apps.length == 0){
    admin.initializeApp({
        credential: admin.credential.cert(serAccount),
      });
    }

    if(info.content_type != ''){
        let pushConfigCount = await mysql.getCount('push_config', 'uid=' + info.uid + ' AND ' + info.content_type + '="Y"');
        if(pushConfigCount > 0){
            return;
        }
    }

    var unreadCount = await mysql.getCount('alarm_list', {uid:info.uid, read_state:'N'});
    if(!unreadCount)
        unreadCount = 0;

    let target_token = info.device_token;
    let title = '알림';
    let content = info.content;  
    let body = {
        type: String(info.type),
        alarm_count: String(unreadCount)
    }

    let message = {
      data: {
        title: title,
        body: title,
        type: String(info.type),
        alarm_count: String(unreadCount),
        message:content
      },
      token: target_token,
    };

    if(info.community_id){
        message.data.community_id = String(info.community_id);
    }
    if(info.party_id){
        message.data.party_id = String(info.party_id);
    }
    if(info.customer_id){
        message.data.customer_id = String(info.customer_id);
    }

    admin
      .messaging()
      .send(message)
      .then(function (response) {
        console.log(message);
        console.log('Successfully sent message: : ', response)
      })
      .catch(function (err) {
        console.log('Error Sending message!!! : ', err)
      })
     }
     catch(e){
         console.log(e);
     }
}

exports.IsKnowMan = async function (uid, customerId) {

    //매칭 이력 검사
    let estimateCount = await mysql.getCount('estimate', '(uid=' + customerId + ' AND target_uid=' + uid + ') OR (uid=' + uid + ' AND target_uid=' + customerId + ')'); 
    if(estimateCount > 0){
        return true;
    }

    //지인 검사
    let blackPhonesInfo = await mysql.findOne('black_phone_list', {uid:uid}, 'phone_num_list');
    if(blackPhonesInfo && blackPhonesInfo['phone_num_list'] != ''){
        blackCount = await mysql.getCount('customers', 'phone IN (' + blackPhonesInfo['phone_num_list'] + ') AND id=' + customerId, 'id');
        if(blackCount > 0){
            return true;
        }
    }

    return false;
};


exports.commonUploadImage = function (req, res, next) {

    var file_name= [];

    if(req.files){
        for(let i = 0 ; i < 5 ; i ++){
            let key = "img"+(i+1);
            let ele = req.files[key];
            if(ele){    
                let dest = ele[0].destination;
                dest = dest.replace("uploads/", "");
                file_name.push("http://" + req.headers.host + "/" + dest + "/" + ele[0].filename);
            }
        }
    }
    return res.json({status: 1, img_url:file_name.join(",")});
};


exports.pushTest = async function(req, res, next){
    //푸시보내기
    let userInfo = await mysql.findOne("customers", {email: req.body.email}, "device_token, device_type");

    let sendObj = {
        uid: userInfo['id'],
        device_token: userInfo['device_token'],
        content: "푸시가 왔어요."
    }

    await sendFcm(sendObj);

    return res.json({status: 1, msg:"success"});//added to alarm_list
}


exports.getNoticeList = async function(req, res, next){
    let data = await mysql.findAll("notice", {type: 0, state: 'Y'});

    return res.json({status: 1, info:data});
}

exports.sendCardReceivePush = async function(uids){
    if(uids != ''){
        let uidList = uids.split(",");
        for(let i = 0 ; i < uidList.length ; i ++)
        {

            let alarmObj = {
                uid: uidList[i],
                type: 8,
                target_id: 0,
                content: "데일리카드가 도착하였습니다."
            };    
            await mysql.insertOne('alarm_list', alarmObj);//완성check this later

            let targeterInfo = await mysql.findOne("customers", {id: uidList[i]}, "device_token, device_type");
            
            let sendObj = {
                uid: uidList[i],
                device_token: targeterInfo['device_token'],
                content: "데일리카드가 도착하였습니다.",
                content_type: "daily_receive_card",
                type: 8,
            }
            await this.sendFcm(sendObj);

            //check this later
        }
    }
}

exports.sendSocketData = async function(uid, sendType, socketData){
    let userInfo = await mysql.findOne('customers', {id:uid}, 'socket_id');
    
    if(userInfo && userInfo['socket_id'] != ''){
        var unreadCount = await mysql.getCount('alarm_list', {uid:uid, read_state:'N'});
        if(!unreadCount)
            unreadCount = 0;

        socketData.unread_alarm_count = unreadCount;

        let unReadChatCount = await mysql.getCount("chatting", {
            receiver_uid: uid,
            read_state: 'N'
        });

        socketData.unread_chat_count = unReadChatCount;

        global.socketIO.to(userInfo['socket_id']).emit(sendType, socketData);
    }
}

exports.sendCardReceiveSocketData = async function(uids){

    if(uids != ''){
        let uidList = uids.split(",");
        for(let i = 0 ; i < uidList.length ; i ++)
        {
            let userInfo = await mysql.findOne('customers', {id:uidList[i]}, 'socket_id');
            global.socketIO.to(userInfo['socket_id']).emit('dailycard_receive', {message:'데일리카드가 도착하였습니다.'});
        }
    }
}
