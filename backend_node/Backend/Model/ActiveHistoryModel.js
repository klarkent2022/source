require('rootpath')();
let mysql = require('../DB/mysql_Controller');
let config = require('../Config/index');
let moment = require('moment');

const async = require( "async" );

exports.InsertHistory = async function (uid, content) {

    let customerInfo = await mysql.findOne('customers', {id:uid}, 'nick_name');

    let dataObj = {
        uid: uid,
        nick_name: customerInfo['nick_name'],
        content: content
    };

    let result = await mysql.insertOne('active_history', dataObj);

    if(!result)
        return false;
    return true;
};


