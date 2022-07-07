require('rootpath')();
let mysql = require('../DB/mysql_Controller');
let config = require('../Config/index');
let moment = require('moment');

const async = require( "async" );

exports.GetCanAmountChange = async function (uid, newAmount) {

    if(newAmount > 0)
        return true;
    let diamondInfo = await mysql.findOne('customers', {id:uid}, 'diamond');
    var oldAmount = parseInt(diamondInfo['diamond']);
    if(oldAmount < Math.abs(newAmount)){
        return false;
    }

    return true;
};


