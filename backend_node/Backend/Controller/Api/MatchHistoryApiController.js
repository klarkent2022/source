require('rootpath')();
let mysql = require('../../DB/mysql_Controller');
let moment = require('moment');
let injection = require('../../DB/data_injection');
let config = require('../../Config/index');
let CommonController = require('../CommonController');
const Global = require('../../Common/Global');

let StarsModel = require('../../Model/StarsModel');
let DailyCardTodayModel = require('../../Model/DailyCardTodayModel');

exports.getProfileEstimateList = async function (req, res, next) {
    var postObj = req.body;
    console.log(postObj);
    let ret = {
        status: '0',
        msg: "",
        info: {
            receive_list: [],
            send_list: [],
            two_list: []
        }
    };

    let tmpReceiveList = await StarsModel.GetReceiveHighList(postObj.uid);
    let tmpSendList = await StarsModel.GetSendHighList(postObj.uid);
    let twoList =[];
    for(let key1 in tmpReceiveList){
        for(let key2 in tmpSendList){
            if(tmpReceiveList[key1]['customer_id'] == tmpSendList[key2]['customer_id']){
                twoList.push(tmpSendList[key2]);
                break;
            }
        }
    }
    
    let receiveList = [];
    for(let key1 in tmpReceiveList){
        var isExit = false;
        for(let key2 in twoList){
            if(tmpReceiveList[key1]['customer_id'] == twoList[key2]['customer_id']){
                isExit = true;
                break;
            }
        }
        if(!isExit)
            receiveList.push(tmpReceiveList[key1]);
    }

    let sendList = [];
    for(let key1 in tmpSendList){
        var isExit = false;
        for(let key2 in twoList){
            if(tmpSendList[key1]['customer_id'] == twoList[key2]['customer_id']){
                isExit = true;
                break;
            }
        }
        if(!isExit)
            sendList.push(tmpSendList[key1]);
    }
    
    ret.info.receive_list = receiveList;
    ret.info.send_list = sendList;
    ret.info.two_list = twoList;
    ret.status = "1";
    ret.msg = "success";
    return res.json(ret);
    
};

exports.getFavList = async function (req, res, next) {
    var postObj = req.body;
    console.log(postObj);
    let ret = {
        status: '0',
        msg: "",
        info: {
            receive_list: [],
            send_list: []
        }
    };

    let receiveList = await DailyCardTodayModel.GetReceiveFavList(postObj.uid);
    let sendList = await DailyCardTodayModel.GetSendFavList(postObj.uid);
    
    ret.info.receive_list = receiveList;
    ret.info.send_list = sendList;
    ret.status = "1";
    ret.msg = "success";
    return res.json(ret);
    
};

exports.getMatchList = async function (req, res, next) {
    var postObj = req.body;
    console.log(postObj);
    let ret = {
        status: '0',
        msg: "",
        info: []
    };
    

    // let matchList = await mysql.findAll('estimate', '(uid=' + postObj.uid + ' OR target_uid=' + postObj.uid + ') AND (7 - DATEDIFF(NOW(), updated_at)) > 0', 'IF(uid=' + postObj.uid + ',target_uid,uid) customer_id, created_at, 7 - DATEDIFF(NOW(), updated_at) as remain_day');
    let matchList = await mysql.findAll('dailycard_fav', '(uid=' + postObj.uid + ' OR target_uid=' + postObj.uid + ') AND (7 - DATEDIFF(NOW(), updated_at)) > 0 AND state=1', 'IF(uid=' + postObj.uid + ',target_uid,uid) customer_id, created_at, 7 - DATEDIFF(NOW(), updated_at) as remain_day');
    for(let key in matchList){
        let matchInfo = await mysql.findOne('customers', {id:matchList[key]['customer_id']}, 'nick_name, avatar_url');
        matchList[key]['nick_name'] = matchInfo['nick_name'];
        matchList[key]['avatar_url'] = matchInfo['avatar_url'];
    }

    ret.info = matchList;
    ret.status = "1";
    ret.msg = "success";
    return res.json(ret);
    
};



