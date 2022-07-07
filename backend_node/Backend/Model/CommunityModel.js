require('rootpath')();
let mysql = require('../DB/mysql_Controller');
let config = require('../Config/index');
let moment = require('moment');

const async = require( "async" );

exports.GetMyListByFav = async function (uid) {

    var sql = 'SELECT a.id, a.uid, a.title, a.content, a.read_count, a.category_type, c.sex, a.is_del, TIME_TO_SEC(TIMEDIFF(NOW(), a.created_at)) diff_sec FROM community a LEFT JOIN community_fav b ON(a.id=b.community_id) LEFT JOIN customers c ON(a.uid=c.id) WHERE (b.uid=' + uid + ' OR b.target_uid=' + uid + ') AND b.id>0 GROUP BY a.id ORDER BY a.created_at DESC';
    let communityList = await mysql.queryWithSelect(sql);
    
    if(!communityList){
        return [];
    }
    else{
        return communityList;
    }

};

exports.GetMyListByCreate = async function (uid) {

    var sql = 'SELECT a.id, a.uid, a.title, a.content, a.read_count, a.category_type, c.sex, a.is_del, TIME_TO_SEC(TIMEDIFF(NOW(), a.created_at)) diff_sec FROM community a LEFT JOIN customers c ON(a.uid=c.id) WHERE a.uid=' + uid + ' ORDER BY a.created_at DESC';
    let communityList = await mysql.queryWithSelect(sql);

    if(!communityList){
        return [];
    }
    else{
        return communityList;
    }

};

exports.GetMyListByFeedback = async function (uid) {

    var sql = 'SELECT a.id, a.uid, a.title, a.content, a.read_count, a.category_type, c.sex, a.is_del, TIME_TO_SEC(TIMEDIFF(NOW(), a.created_at)) diff_sec FROM community a LEFT JOIN community_feedback b ON(a.id=b.community_id AND b.uid=' + uid + ') LEFT JOIN customers c ON(a.uid=c.id) WHERE a.uid!=' + uid + ' AND b.id>0 GROUP BY a.id ORDER BY a.created_at DESC';
    let communityList = await mysql.queryWithSelect(sql);

    if(!communityList){
        return [];
    }
    else{
        return communityList;
    }

};

