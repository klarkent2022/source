require('rootpath')();
let mysql = require('../DB/mysql_Controller');
let config = require('../Config/index');
let moment = require('moment');

const async = require( "async" );

exports.getTagAndHotParty = async function (uid) {

    let info = {
        tag_list: null,
        hot_party_list: null
    };
        
    //get tag list
    let tagList = await mysql.findAll('party_tag', {});
    info.tag_list = tagList;

    //get hot party list
    let hotPartyList = await mysql.findAll('party_event', {}, 'id, title, img_url');
    info.hot_party_list = hotPartyList;

    return info;

};

exports.getAllList = async function (uid, tag, isOtherGender, isLikeOrder) {

    let block_party = await mysql.findAll('declare_customer1', {uid:uid}, 'declare_id');
    
    var keys = [];
    for(var i in block_party){
        keys.push(block_party[i]['declare_id']);
    }

    var bkey = '(18)';
    //get user gender
    let userInfo = await mysql.findOne('customers', {id:uid}, 'sex');

    var whereStr = '1=1 AND status = 0';
    var orderStr = '';
    if(tag != ''){
        whereStr += ' AND FIND_IN_SET("' + tag + '", a.tags)';
    }
    if(isOtherGender == 1){
        whereStr += ' AND b.sex!="' + userInfo['sex'] + '"';
    }

    if(block_party.length > 0){
        whereStr += ' AND a.id not in (';
        for(var i in block_party){
            whereStr += block_party[i]['declare_id'] + ",";
        }

        whereStr = whereStr.substr(0,whereStr.length - 1);
        whereStr += ")"
    }
    console.log(block_party);
    console.log(keys);
    console.log(whereStr);

    if(isLikeOrder == 1){
        orderStr = 'a.like_count';
    }
    else{
        orderStr = 'a.created_at';
    }

    let partyList = await mysql.findWithJoinAndOrderBY('party a', whereStr, 'Left', 'customers b', 'a.uid=b.id', orderStr, 'DESC', 'a.*, b.sex');
    return partyList;

};

exports.getMyCreateList = async function (uid, tag, isLikeOrder) {

    var whereStr = 'a.uid=' + uid + ' AND status = 0';
    var orderStr = '';
    if(tag != ''){
        whereStr += ' AND FIND_IN_SET("' + tag + '", a.tags)';
    }

    let block_party = await mysql.findAll('declare_customer1', {uid:uid}, 'declare_id');
    
    var keys = [];
    for(var i in block_party){
        keys.push(block_party[i]['declare_id']);
    }

    if(block_party.length > 0){
        whereStr += ' AND a.id not in (';
        for(var i in block_party){
            whereStr += block_party[i]['declare_id'] + ",";
        }
    
        whereStr = whereStr.substr(0,whereStr.length - 1);
        whereStr += ")"
    }
    if(isLikeOrder == 1){
        orderStr = 'a.like_count';
    }
    else{
        orderStr = 'a.created_at';
    }

    let partyList = await mysql.findWithJoinAndOrderBY('party a', whereStr, 'Left', 'customers b', 'a.uid=b.id', orderStr, 'DESC', 'a.*, b.sex');
    return partyList;

};

exports.getMyJoinList = async function (uid, tag, isLikeOrder) {

    //참여한 파티아이디 리스트 얻기
    let joinIdList = await mysql.findAll('party_join', {uid:uid});
    var joinIdsStr = '';
    for(let key in joinIdList) {
        if(joinIdsStr == ''){
            joinIdsStr = joinIdList[key]['party_id'];
        }
        else{
            joinIdsStr += ',' + joinIdList[key]['party_id'];
        }
    }

    if(joinIdsStr == ''){
        return [];
    }

    var whereStr = 'a.id IN (' + joinIdsStr + ') AND a.status = 0';
    var orderStr = '';
    if(tag != ''){
        whereStr += ' AND FIND_IN_SET("' + tag + '", a.tags)';
    }

    let block_party = await mysql.findAll('declare_customer1', {uid:uid}, 'declare_id');
    
    var keys = [];
    for(var i in block_party){
        keys.push(block_party[i]['declare_id']);
    }

    if(block_party.length > 0){
        whereStr += ' AND a.id not in (';
        for(var i in block_party){
            whereStr += block_party[i]['declare_id'] + ",";
        }
    
        whereStr = whereStr.substr(0,whereStr.length - 1);
        whereStr += ")"
    }

    if(isLikeOrder == 1){
        orderStr = 'a.like_count';
    }
    else{
        orderStr = 'a.created_at';
    }

    let partyList = await mysql.findWithJoinAndOrderBY('party a', whereStr, 'Left', 'customers b', 'a.uid=b.id', orderStr, 'DESC', 'a.*, b.sex');
    return partyList;

};

exports.getSearchAllList = async function (key, userSex) {

    var whereStr = 'party.status = 0 AND (party.title LIKE "%' + key + '%" OR party.tags LIKE "%' + key + '%") AND customers.sex!="' + userSex + '"';
    let partyList = await mysql.findWithJoin('party', whereStr, 'Left', 'customers', 'party.uid=customers.id', 'party.*, customers.sex');
    return partyList;

};

exports.getJoinList = async function (uid, partyId) {

    let joinList = await mysql.findWithJoin('party_join', 'party_join.party_id=' + partyId + ' AND (7 - DATEDIFF(NOW(), party_join.updated_at)) > 0', 'Left', 'customers', 'party_join.uid=customers.id', 'party_join.uid, party_join.state, customers.nick_name, customers.avatar_url, 7 - DATEDIFF(NOW(), party_join.updated_at) as remain_day');
    for(let key in joinList) {
        let estimateInfo = await mysql.findOne('estimate', '(uid=' + joinList[key]['uid'] + ' AND estimate.target_uid=' + uid + ') OR (uid=' + uid + ' AND estimate.target_uid=' + joinList[key]['uid'] + ')', 'open_state');
        if(estimateInfo){
            joinList[key]['open_state'] = estimateInfo['open_state'];
        }
        else{
            joinList[key]['open_state'] = 'N';
        }
    }
    return joinList;
};

