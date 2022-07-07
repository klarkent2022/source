require('rootpath')();
let mysql = require('../../DB/mysql_Controller');
let moment = require('moment');
let injection = require('../../DB/data_injection');
let config = require('../../Config/index');
let CommonController = require('../CommonController');
const Global = require('../../Common/Global');

let PartyModel = require('../../Model/PartyModel');
let DiamondHistoryModel = require('../../Model/DiamondHistoryModel');
let ActiveHistoryModel = require('../../Model/ActiveHistoryModel');
let DailyCardTodayModel = require('../../Model/DailyCardTodayModel');
let CustomersModel = require('../../Model/CustomersModel');

//서버측 소켓클라
var socket_client_module = require('socket.io-client');
var socket_client = socket_client_module.connect(config.server_url, {reconnect: true});

exports.createParty = async function (req, res, next) {
    var postObj = req.body;
    console.log(postObj);
    let ret = {
        status: '0',
        msg: ""
    };

    var file_name= "";
    if(req.file){
        file_name = "http://" + req.headers.host + "/party/" + req.file.filename;
    }

    let dataObj = {
        uid: postObj.uid,
        nick_name: await CommonController.GetNickName(),
        title: postObj.title,
        content: postObj.content,
        tags: postObj.tags,
        img_url: file_name
    };

    let result = await mysql.insertOne('party', dataObj);

    if(result){

        //활동이력 남기기
        var customerInfo = await mysql.findOne('customers', {id:postObj.uid}, 'nick_name');
        var retAdd = await CommonController.AddActiveHistory(postObj.uid, customerInfo['nick_name'] + '님이 파티창조');

        //전체에 socket 발송
        if(retAdd){
            //창조된 파티 정보
            let partyInfo = await mysql.findOneWithJoin('party a', 'a.id=' + result, 'Left', 'customers b', 'a.uid=b.id', 'a.*, b.sex');
            
            //socket 파티 창조
            socket_client.emit('admin_socket party_create', partyInfo);

            ret.status = "1";
            ret.msg = "success";
            return res.json(ret);
        }
    }

    ret.status = "0";
    ret.msg = "등록 실패되었습니다.";
    return res.json(ret);
    
};

exports.getAllList = async function (req, res, next) {
    var postObj = req.body;
    console.log(postObj);
    let ret = {
        status: '0',
        msg: "",
        info: {
            tag_list : [],
            hot_party_list : [],
            party_list : []
        }
    };

    let tagAndHotPartyList = await PartyModel.getTagAndHotParty();

    ret.info.tag_list = tagAndHotPartyList.tag_list;
    ret.info.hot_party_list = tagAndHotPartyList.hot_party_list;




    //get main list
    let partyList = await PartyModel.getAllList(postObj.uid, postObj.tag, postObj.is_other_gender, postObj.is_like_order);
    
    ret.info.party_list = partyList;
    ret.status = "1";
    ret.msg = "success";
    return res.json(ret);
    
};

exports.getListByCreate = async function (req, res, next) {
    var postObj = req.body;
    console.log(postObj);
    let ret = {
        status: '0',
        msg: "",
        info: {
            tag_list : [],
            hot_party_list : [],
            party_list : []
        }
    };

    let tagAndHotPartyList = await PartyModel.getTagAndHotParty();

    ret.info.tag_list = tagAndHotPartyList.tag_list;
    ret.info.hot_party_list = tagAndHotPartyList.hot_party_list;

    //get main list
    let partyList = await PartyModel.getMyCreateList(postObj.uid, postObj.tag, postObj.is_like_order);
    
    ret.info.party_list = partyList;
    ret.status = "1";
    ret.msg = "success";
    return res.json(ret);
    
};

exports.getListByJoin = async function (req, res, next) {
    var postObj = req.body;
    console.log(postObj);
    let ret = {
        status: '0',
        msg: "",
        info: {
            tag_list : [],
            hot_party_list : [],
            party_list : []
        }
    };

    let tagAndHotPartyList = await PartyModel.getTagAndHotParty();

    ret.info.tag_list = tagAndHotPartyList.tag_list;
    ret.info.hot_party_list = tagAndHotPartyList.hot_party_list;

    //get main list
    let partyList = await PartyModel.getMyJoinList(postObj.uid, postObj.tag, postObj.is_like_order);
    
    ret.info.party_list = partyList;
    ret.status = "1";
    ret.msg = "success";
    return res.json(ret);
    
};

exports.getSearchList = async function (req, res, next) {
    var postObj = req.body;
    console.log(postObj);
    let ret = {
        status: '0',
        msg: "",
        info: []
    };

    let partyList = await PartyModel.getSearchAllList(postObj.key, postObj.userSex);
    
    ret.info = partyList;
    ret.status = "1";
    ret.msg = "success";
    return res.json(ret);
    
};

exports.joinParty = async function (req, res, next) {
    var postObj = req.body;
    console.log(postObj);
    let ret = {
        status: '0',
        msg: ""
    };

    let partyInfo = await mysql.findOne('party', {id:postObj.party_id}, 'uid, title');

    //매칭, 지인 이력 검사
    let isKnowMan = await CommonController.IsKnowMan(postObj.uid, partyInfo['uid']);
    if(isKnowMan){
        ret.status = "0";
        ret.msg = "지인 혹은 이미 매칭 이력이 있는 회원입니다.";
        return res.json(ret);
    }

    //다이아 보유갯수 확인
    let canAmountChange = await CustomersModel.GetCanAmountChange(postObj.uid, Global.AMOUNT_PARTY_FAV);
    if(!canAmountChange){
        ret.status = "3";
        ret.msg = "다이아보유갯수가 부족합니다.";
        return res.json(ret);
    }

    var retCount = await mysql.getCount('party_join', {party_id:postObj.party_id, uid:postObj.uid});
    if(retCount > 0){
        ret.status = "2";
        ret.msg = "이미 참여한 파티입니다.";
        return res.json(ret);
    }

    let dataObj = {
        party_id: postObj.party_id,
        uid: postObj.uid,
        state: 0
    };

    let result = await mysql.insertOne('party_join', dataObj);

    
    let createrInfo = await mysql.findOne('customers', {id:partyInfo['uid']}, 'nick_name, device_token');
    
    //다이아 결제

    let historyRet = await DiamondHistoryModel.InsertHistory(postObj.uid, Global.AMOUNT_PARTY_FAV, 1, '파티참여');
    if(!historyRet){
        ret.status = "0";
        ret.msg = "다이아결제가 실패하였습니다.";
        return res.json(ret);
    }

    //활동이력 남기기
    let userInfo = await mysql.findOne('customers', {id:postObj.uid}, 'nick_name');
    await ActiveHistoryModel.InsertHistory(postObj.uid, userInfo['nick_name'] + '님이 파티에 참여');

    //푸시보내기
    let alarmObj = {
        uid: partyInfo['uid'],
        type: 3,
        target_id: postObj.party_id,
        content: partyInfo['title'] + ' 파티에 ' + createrInfo['nick_name'] + '님이 참여했어요.'
    };    
    await mysql.insertOne('alarm_list', alarmObj);//완성check this later

    if(createrInfo['device_token'] != ''){
        let sendObj = {
            uid: partyInfo['uid'],
            device_token: createrInfo['device_token'],
            type: 3,
            content_type: '',
            content: partyInfo['title'] + ' 파티에 ' + createrInfo['nick_name'] + '님이 참여했어요.'
        }

        await CommonController.sendFcm(sendObj);//added to alarm_list
    }

    //전체에 socket 발송
        
    let socketInfo = {
        message: partyInfo['title'] + ' 파티에 ' + createrInfo['nick_name'] + '님이 참여했어요.',
        uid: parseInt(partyInfo['uid']),
        party_id: parseInt(postObj.party_id)
    }
    
    //socket 파티 참여
    // socket_client.emit('admin_socket party_join', socketInfo);
    await CommonController.sendSocketData(partyInfo['uid'], 'user_socket party_join', socketInfo);

    ret.status = "1";
    ret.msg = "success";
    return res.json(ret);
    
};

exports.openProfile = async function (req, res, next) {
    var postObj = req.body;
    console.log(postObj);
    let ret = {
        status: '0',
        msg: ""
    };

    //다이아 보유갯수 확인
    let canAmountChange = await CustomersModel.GetCanAmountChange(postObj.uid, Global.AMOUNT_SIMPLE_PROFILE_OPEN);
    if(!canAmountChange){
        ret.status = "3";
        ret.msg = "다이아보유갯수가 부족합니다.";
        return res.json(ret);
    }

    var retCount = await mysql.getCount('party_join', {party_id:postObj.party_id, uid:postObj.customer_id, state:1});
    if(retCount > 0){
        ret.status = "2";
        ret.msg = "이미 프로필 오픈하였습니다.";
        return res.json(ret);
    }

    await mysql.updateOne('party_join', {party_id:postObj.party_id, uid:postObj.customer_id}, {state:1});

    let partyInfo = await mysql.findOne('party', {id:postObj.party_id}, 'uid, title');
    let createrInfo = await mysql.findOne('customers', {id:partyInfo['uid']}, 'nick_name, device_token');
    
    //다이아 결제

    let historyRet = await DiamondHistoryModel.InsertHistory(postObj.uid, Global.AMOUNT_SIMPLE_PROFILE_OPEN, 1, '프로필단순오픈');
    if(!historyRet){
        ret.status = "0";
        ret.msg = "다이아결제가 실패하였습니다.";
        return res.json(ret);
    }

    ret.status = "1";
    ret.msg = "success";
    return res.json(ret);
    
};

exports.getInfo = async function (req, res, next) {
    var postObj = req.body;
    console.log(postObj);
    let ret = {
        status: '0',
        msg: "",
        info: null
    };

    let partyInfo = await mysql.findOne('party', {id:postObj.party_id}, '*, TIME_TO_SEC(TIMEDIFF(NOW(), created_at)) as diff_sec');
    
    //get party creater info
    let userInfo = await mysql.findOne('customers', {id:partyInfo['uid']}, 'avatar_url, sex');
    partyInfo['creater_name'] = partyInfo['nick_name'];
    partyInfo['creater_sex'] = userInfo['sex'];
    partyInfo['creater_avatar'] = userInfo['avatar_url'];

    //get ago time
    partyInfo['ago_time'] = CommonController.GetKoreanFormatFromSec(partyInfo['diff_sec']);

    delete partyInfo['diff_sec'];

    //if this party is mine
    var isMine = 0;
    if(partyInfo['uid'] == postObj.uid){
        isMine = 1;
    }
    partyInfo['is_mine'] = isMine;

    //get join info for other member's party
    partyInfo['join_state'] = -1;
    partyInfo['join_remain_day'] = 0;
    if(isMine == 0){   //내가 창조한 파티가 아닌 경우
        let joinInfo = await mysql.findOne('party_join', {party_id:postObj.party_id, uid:postObj.uid}, 'state, contents, 7 - DATEDIFF(NOW(), updated_at) as remain_day');
        if(joinInfo){
            partyInfo['join_state'] = joinInfo['state'];
            partyInfo['join_remain_day'] = joinInfo['remain_day'];

            try{
                let estimateInfo = await mysql.findOne('estimate', '(uid=' + postObj.uid + ' AND estimate.target_uid=' + partyInfo['uid'] + ') OR (uid=' + partyInfo['uid'] + ' AND estimate.target_uid=' + postObj.uid + ')', 'open_state');
                partyInfo['open_state'] = estimateInfo['open_state'];
            }catch(Ex)
            {
                partyInfo['open_state'] = 'N';
            }
        }
    }
    
    //get join info for other member's party
    if(isMine == 1){
        let partyJoinArr = await PartyModel.getJoinList(postObj.uid, postObj.party_id);
        partyInfo['join_list'] = partyJoinArr;
    }
    else{
        partyInfo['join_list'] = [];
    } 

    //get similar parties
    if(partyInfo['tags'] != ''){
        let tagList = partyInfo['tags'].split(',');
        
        let similarList = [];
        for(let key1 in tagList) {
            let similarPartyList = await mysql.findWithJoin('party', 'party.id!=' + postObj.party_id + ' AND FIND_IN_SET("' + tagList[key1] + '", party.tags) AND customers.sex!="' + userInfo['sex'] + '"', 'Left', 'customers', 'party.uid=customers.id', 'party.id, party.title, party.img_url, party.tags');
            for(let key2 in similarPartyList) {
                similarList.push(similarPartyList[key2]);
            }
        }

        partyInfo['similar_list'] = similarList;
    }
    else{
        partyInfo['similar_list'] = [];
    }
    
    ret.info = partyInfo;
    ret.status = "1";
    ret.msg = "success";
    return res.json(ret);
    
};

exports.allowPartyJoin = async function (req, res, next) {
    var postObj = req.body;
    console.log(postObj);
    let ret = {
        status: '0',
        msg: ""
    };

    //매칭, 지인 이력 검사
    let isKnowMan = await CommonController.IsKnowMan(postObj.uid, postObj.customer_id);
    if(isKnowMan){
        ret.status = "0";
        ret.msg = "지인 혹은 이미 매칭 이력이 있는 회원입니다.";
        return res.json(ret);
    }

    //매칭이력 추가
    let dataObj = {
        uid: postObj.uid,
        target_uid: postObj.customer_id,
        open_state: 'N',
    };

    await mysql.insertOne('estimate', dataObj);//move this later

    await mysql.updateOne('party_join', {party_id:postObj.party_id, uid:postObj.customer_id}, {state:2, contents:postObj.contents});

    //매칭되면 데일리카드리스트에서 없애기
    await DailyCardTodayModel.RemoveCardInToday(postObj.uid, postObj.customer_id);  
    await DailyCardTodayModel.RemoveCardInLast(postObj.uid, postObj.customer_id);

    //푸시보내기

    //커뮤니티 정보 얻기
    let userInfo = await mysql.findOne('customers', {id:postObj.uid}, 'nick_name');
    let targeterInfo = await mysql.findOne('customers', {id:postObj.customer_id}, 'device_token');
    let partyInfo = await mysql.findOne('party', {id:postObj.party_id}, 'title');
    let alarmObj = {
        uid: postObj.customer_id,
        type: 4,
        target_id: postObj.party_id,
        content: partyInfo['title'] + " 파티에서 호감이 수락되었어요. 매칭완료 되었어요."
    };    

    //await mysql.delete("alarm_list", {uid: postObj.customer_id,target_id: postObj.party_id});
    await mysql.insertOne('alarm_list', alarmObj);

    
    if(targeterInfo['device_token'] != ''){
        let sendObj = {
            uid: postObj.customer_id,
            device_token: targeterInfo['device_token'],
            type: 4,
            content_type: '',
            content: partyInfo['title'] + " 파티에서 호감이 수락되었어요. 매칭완료 되었어요.",
            party_id: postObj.party_id
        }
        
        await CommonController.sendFcm(sendObj);//added to alarm_list
    }

    //전체에 socket 발송
        
    let socketInfo = {
        message: partyInfo['title'] + " 파티에서 호감이 수락되었어요. 매칭완료 되었어요.",
        uid: parseInt(postObj.customer_id),
        party_id: parseInt(postObj.party_id)
    }
    
    //socket 파티 참여 수락
    // socket_client.emit('admin_socket party_join_allow', socketInfo);
    await CommonController.sendSocketData(postObj.customer_id, 'user_socket party_join_allow', socketInfo);

    ret.status = "1";
    ret.msg = "success";
    return res.json(ret);
    
};

exports.declareParty = async function (req, res, next) {
    var postObj = req.body;
    console.log(postObj);
    let ret = {
        status: '0',
        msg: ""
    };

    let partyInfo = await mysql.findOne('party', {id:postObj.party_id}, 'uid, title');

    let dataObj = {
        uid: postObj.uid,
        target_uid: partyInfo['uid'],
        declare_id: postObj.party_id,
        type: 2
    };
    await mysql.insertOne('declare_customer', dataObj);

    //활동이력 남기기
    let userInfo = await mysql.findOne('customers', {id:postObj.uid}, 'nick_name');
    let targeterInfo = await mysql.findOne('customers', {id:partyInfo['uid']}, 'nick_name');
    await ActiveHistoryModel.InsertHistory(postObj.uid, userInfo['nick_name'] + '님이 ' + targeterInfo['nick_name'] + '님의 파티[' + partyInfo['title'] + ']에 신고');

    ret.status = "1";
    ret.msg = "success";
    return res.json(ret);
    
};

exports.declareParty1 = async function (req, res, next) {
    var postObj = req.body;
    console.log("block party")
    console.log(postObj);
    let ret = {
        status: '0',
        msg: ""
    };

    let partyInfo = await mysql.findOne('party', {id:postObj.party_id}, 'uid, title');

    let dataObj = {
        uid: postObj.uid,
        target_uid: partyInfo['uid'],
        declare_id: postObj.party_id,
        type: 2
    };
    await mysql.insertOne('declare_customer1', dataObj);

    ret.status = "1";
    ret.msg = "success";
    return res.json(ret);
    
};

exports.likeParty = async function (req, res, next) {
    var postObj = req.body;
    console.log(postObj);
    let ret = {
        status: '0',
        msg: ""
    };

    var likeCount = await mysql.getCount('party', 'id=' + postObj.party_id + ' AND FIND_IN_SET(' + postObj.uid + ', like_uids)');
    
    if(likeCount > 0){
        ret.status = "2";
        ret.msg = "이미 좋아요 했어요.";
        return res.json(ret);
    }

    let partyInfo = await mysql.findOne('party', {id:postObj.party_id}, 'like_uids, like_count');
    var likeUIds = "";
    if(partyInfo['like_uids'] == ''){
        likeUIds = postObj.uid;
    }
    else{
        likeUIds = partyInfo['like_uids'] + ',' + postObj.uid;
    }

    var likeCount = parseInt(partyInfo['like_count']) + 1;
    await mysql.updateOne('party', {id:postObj.party_id}, {like_uids:likeUIds, like_count:likeCount});

    ret.status = "1";
    ret.msg = "success";
    return res.json(ret);
    
};

exports.getEventInfo = async function (req, res, next) {
    var postObj = req.body;
    console.log(postObj);
    let ret = {
        status: '0',
        msg: "",
        info: null
    };

    let eventInfo = await mysql.findOne('party_event', {id:postObj.event_id});

    ret.info = eventInfo;
    ret.status = "1";
    ret.msg = "success";
    return res.json(ret);
    
};



