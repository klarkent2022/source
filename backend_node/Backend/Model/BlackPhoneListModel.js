require('rootpath')();
let mysql = require('../DB/mysql_Controller');
let config = require('../Config/index');
let moment = require('moment');

const async = require( "async" );

exports.GetBlackUserIdList = async function (uid) {

    let blackUserIdList = [];
    let blackPhonesInfo = await mysql.findOne('black_phone_list', {uid:uid});
    if(blackPhonesInfo && blackPhonesInfo['phone_num_list'] != ''){
        blackUserIdList = await mysql.findAll('customers', 'phone IN (' + blackPhonesInfo['phone_num_list'] + ')', 'id');
    }
    return blackUserIdList;

};


