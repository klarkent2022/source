require('rootpath')();
let mysql = require('../DB/mysql_Controller');
let config = require('../Config/index');
let moment = require('moment');

const async = require( "async" );

exports.GetReceiveHighList = async function (uid) {
    let receiveList = [];
    let tmpReceiveList = await mysql.findWithJoin('stars', 'stars.target_uid=' + uid + ' AND stars.stars>=4 AND (7 - DATEDIFF(NOW(), stars.updated_at)) > 0', 'Left', 'customers', 'stars.uid=customers.id', 'stars.uid customer_id, customers.avatar_url, customers.nick_name, 7 - DATEDIFF(NOW(), stars.updated_at) as remain_day');
    for(let key in tmpReceiveList){
        var customerId = tmpReceiveList[key]['customer_id'];
        var isCount = await mysql.getCount('dailycard_fav', '(uid=' + uid + ' AND target_uid=' + customerId + ') OR (uid=' + customerId + ' AND target_uid=' + uid + ')');
        if(isCount == 0){
            receiveList.push(tmpReceiveList[key]);
        }
    }
    return receiveList;

};

exports.GetSendHighList = async function (uid) {
    let sendList = [];
    let tmpSendList = await mysql.findWithJoin('stars', 'stars.uid=' + uid + ' AND stars.stars>=4 AND (7 - DATEDIFF(NOW(), stars.updated_at)) > 0', 'Left', 'customers', 'stars.target_uid=customers.id', 'stars.target_uid customer_id, customers.avatar_url, customers.nick_name, 7 - DATEDIFF(NOW(), stars.updated_at) as remain_day');
    for(let key in tmpSendList){
        var customerId = tmpSendList[key]['customer_id'];
        var isCount = await mysql.getCount('dailycard_fav', '(uid=' + uid + ' AND target_uid=' + customerId + ') OR (uid=' + customerId + ' AND target_uid=' + uid + ')');
        if(isCount == 0){
            sendList.push(tmpSendList[key]);
        }
    }
    return sendList;

};

