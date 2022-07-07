require('rootpath')();
let mysql = require('../DB/mysql_Controller');
let config = require('../Config/index');
let moment = require('moment');

const async = require( "async" );

exports.RemoveCardInToday = async function (uid, customerId) {

    let dailyCardInfo1 = await mysql.findOne('dailycard_today', {uid:uid}, 'target_uids');
    if(dailyCardInfo1 && dailyCardInfo1['target_uids'] != ''){
        let targetUidList = dailyCardInfo1['target_uids'].split(',');
        var newTargetUids = '';
        for(let key in targetUidList) {
            if(targetUidList[key] != customerId){
                if(newTargetUids == ''){
                    newTargetUids = targetUidList[key];
                }
                else{
                    newTargetUids += ',' + targetUidList[key];
                }
            }
        }
        console.log('update dailycard_today2');
        await mysql.updateOne('dailycard_today', {uid:uid}, {target_uids:newTargetUids});
    }

    let dailyCardInfo2 = await mysql.findOne('dailycard_today', {uid:customerId}, 'target_uids');
    if(dailyCardInfo2 && dailyCardInfo2['target_uids'] != ''){
        let targetUidList = dailyCardInfo2['target_uids'].split(',');
        var newTargetUids = '';
        for(let key in targetUidList) {
            if(targetUidList[key] != uid){
                if(newTargetUids == ''){
                    newTargetUids = targetUidList[key];
                }
                else{
                    newTargetUids += ',' + targetUidList[key];
                }
            }
        }
        console.log('update dailycard_today3');
        await mysql.updateOne('dailycard_today', {uid:customerId}, {target_uids:newTargetUids});
    }
};

exports.RemoveCardInLast = async function (uid, customerId) {

    let dailyCardInfo1 = await mysql.findAll('dailycard_last', {uid:uid}, 'target_uid');
    for(let key in dailyCardInfo1) {
        if(dailyCardInfo1[key]['target_uid'] == customerId){
            await mysql.delete('dailycard_last', {uid:uid, target_uid:customerId});
        }
    }
        

    let dailyCardInfo2 = await mysql.findAll('dailycard_last', {uid:customerId}, 'target_uid');
    for(let key in dailyCardInfo2) {
        if(dailyCardInfo2[key]['target_uid'] == uid){
            await mysql.delete('dailycard_last', {uid:customerId, target_uid:uid});
        }
    }
};

exports.OpenUser = async function (uid, customerId) {

    if(uid != customerId){
        var isCount = await mysql.getCount('dailycard_today', 'uid=' + uid + ' AND FIND_IN_SET("' + customerId + '", open_uids)');
        if(isCount == 0){
            let cardInfo = await mysql.findOne('dailycard_today', {uid:uid}, 'open_uids');
            var newOpenUIds = '';
            if(cardInfo && cardInfo['open_uids'] == ''){
                newOpenUIds = customerId;
            }
            else if(cardInfo){
                newOpenUIds = cardInfo['open_uids'] + ',' + customerId;
            }

            console.log('update dailycard_today1');
            await mysql.updateOne('dailycard_today', {uid:uid}, {open_uids:newOpenUIds});
        }
        
    }
};

exports.GetReceiveFavList = async function (uid) {

    let receiveList = await mysql.findWithJoin('dailycard_fav', 'dailycard_fav.target_uid=' + uid + ' AND dailycard_fav.state=0 AND (7 - DATEDIFF(NOW(), dailycard_fav.updated_at)) > 0', 'Left', 'customers', 'dailycard_fav.uid=customers.id', 'dailycard_fav.uid customer_id, customers.avatar_url, customers.nick_name, dailycard_fav.fav_content, 7 - DATEDIFF(NOW(), dailycard_fav.updated_at) as remain_day');
    
    if(!receiveList)
        receiveList = [];

    return receiveList;
};

exports.GetSendFavList = async function (uid) {

    let sendList = await mysql.findWithJoin('dailycard_fav', 'dailycard_fav.uid=' + uid + ' AND dailycard_fav.state=0 AND (7 - DATEDIFF(NOW(), dailycard_fav.updated_at)) > 0', 'Left', 'customers', 'dailycard_fav.target_uid=customers.id', 'dailycard_fav.target_uid customer_id, customers.avatar_url, customers.nick_name, dailycard_fav.fav_content, 7 - DATEDIFF(NOW(), dailycard_fav.updated_at) as remain_day');

    if(!sendList)
        sendList = [];

    return sendList;
};


