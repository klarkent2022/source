require('rootpath')();
let mysql = require('../DB/mysql_Controller');
let config = require('../Config/index');
let moment = require('moment');

const async = require( "async" );

exports.InsertHistory = async function (uid, amount, type, content) {

    var oldAmount = 0;
    let oldInfo = await mysql.findOneOrderBY('diamond_history', {uid:uid}, 'sum_amount', 'id', 'DESC');
    if(!oldInfo){
        let customerInfo = await mysql.findOne('customers', {id:uid}, 'diamond');oldAmount = customerInfo['diamond'];
    }
    else{
        oldAmount = oldInfo['sum_amount'];
    }

    var newDiamond = parseInt(oldAmount) + amount;

    let dataObj = {
        uid: uid,
        amount: amount,
        sum_amount: newDiamond,
        type: type,
        content: content
    };

    let result = await mysql.insertOne('diamond_history', dataObj);

    if(result){
        await mysql.updateOne('customers', {id:uid}, {diamond:newDiamond});
    }
    else{
        return false;
    }

    return true;

};


