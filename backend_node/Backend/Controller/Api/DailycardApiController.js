require('rootpath')();
let mysql = require('../../DB/mysql_Controller');
let moment = require('moment');
let injection = require('../../DB/data_injection');
let config = require('../../Config/index');
let CommonController = require('../CommonController');
const Global = require('../../Common/Global');

let BlackPhoneListModel = require('../../Model/BlackPhoneListModel');
let DailyCardTodayModel = require('../../Model/DailyCardTodayModel');
let ActiveHistoryModel = require('../../Model/ActiveHistoryModel');
let CustomersModel = require('../../Model/CustomersModel');
let DiamondHistoryModel = require('../../Model/DiamondHistoryModel');

//서버측 소켓클라
var socket_client_module = require('socket.io-client');
var socket_client = socket_client_module.connect(config.server_url, {reconnect: true});

exports.getTodayCard = async function (req, res, next) {
    var postObj = req.body;
    console.log(postObj);
    let ret = {
        status: '0',
        msg: "",
        info: null
    };

    //지인 리스트 얻기
    let blackUserList = BlackPhoneListModel.GetBlackUserIdList(postObj.uid);
    
    //매칭 리스트 얻기
    let matchingList = await mysql.findAll('estimate', 'uid=' + postObj.uid + ' OR target_uid=' + postObj.uid, 'IF(uid=' + postObj.uid + ', target_uid, uid) AS customer_id');
    if(!matchingList)
        matchingList = [];

    let todayCards = await mysql.findOne('dailycard_today', 'uid=' + postObj.uid + ' AND date(updated_at)=date(now())', 'target_uids, open_uids');
    let targetUIdList = [];
    if(todayCards && todayCards['target_uids'] != ''){
        targetUIdList = todayCards['target_uids'].split(',');
    }
    let openUIdList = [];
    if(todayCards && todayCards['open_uids'] != ''){
        openUIdList = todayCards['open_uids'].split(',');
    }
    let todayCardList = [];
    
    for(let key in targetUIdList) {

        //지인이면 카드에서 제거
        var isBlack = false;
        for(let key2 in blackUserList) {
            if(blackUserList[key2]['id'] == targetUIdList[key]){
                isBlack = true;
                break;
            }
        }
        if(isBlack)
            continue;

        //이미 매칭되었으면 카드에서 제거
        var isMatching = false;
        for(let key2 in matchingList){
            if(matchingList[key2]['customer_id'] == targetUIdList[key]){
                isMatching = true;
                break;
            }
        }
        if(isMatching)
            continue;

        let todayCardInfo = await mysql.findOne('customers', {id:targetUIdList[key]}, 'id, avatar_url, nick_name, area, age, job');
        var isOpenFlag = false;
        for(let key2 in openUIdList){
            if(targetUIdList[key] == openUIdList[key2]){
                isOpenFlag = true;
                break;
            }
        }
        if(isOpenFlag){
            todayCardInfo['is_open'] = 1;
        }
        else{
            todayCardInfo['is_open'] = 0;
        }
        todayCardList.push(todayCardInfo);
        
    }
    
    ret.info = todayCardList;
    ret.status = "1";
    ret.msg = "success";
    return res.json(ret);
    
};

exports.getLastCard = async function (req, res, next) {
    var postObj = req.body;
    console.log(postObj);
    let ret = {
        status: '0',
        msg: "",
        info: null
    };

    //지인 리스트 얻기
    let blackUserList = BlackPhoneListModel.GetBlackUserIdList(postObj.uid);
    
    //매칭 리스트 얻기
    let matchingList = await mysql.findAll('estimate', 'uid=' + postObj.uid + ' OR target_uid=' + postObj.uid, 'IF(uid=' + postObj.uid + ', target_uid, uid) AS customer_id');
    if(!matchingList)
        matchingList = [];

    let lastCards = await mysql.findAll('dailycard_last', {uid:postObj.uid}, 'target_uid');
    let lastCardList = [];
    for(let key in lastCards){
        let lastCardInfo = await mysql.findOne('customers', {id:lastCards[key]['target_uid']}, 'id, avatar_url, nick_name, area, age, job');

        //지인이면 카드에서 제거
        var isBlack = false;
        for(let key2 in blackUserList) {
            if(blackUserList[key2]['id'] == lastCardInfo['id']){
                isBlack = true;
                break;
            }
        }
        if(isBlack)
            continue;

        //이미 매칭되었으면 카드에서 제거
        var isMatching = false;
        for(let key2 in matchingList){
            if(matchingList[key2]['customer_id'] == lastCardInfo['id']){
                isMatching = true;
                break;
            }
        }
        if(isMatching)
            continue;


        lastCardList.push(lastCardInfo);
    }
    
    ret.info = lastCardList;
    ret.status = "1";
    ret.msg = "success";
    return res.json(ret);
    
};

exports.getProfile = async function (req, res, next) {
    var postObj = req.body;
    console.log(postObj);
    let ret = {
        status: '0',
        msg: "",
        info: null
    };

    //블라인드 어픈 처리
    DailyCardTodayModel.OpenUser(postObj.uid, postObj.customer_id);

    let customerProfile = await mysql.findOne('customers', {id:postObj.customer_id});
    if(postObj.uid == postObj.customer_id){ //본인의 프로필인 경우
        customerProfile['stars'] = 0;
        customerProfile['daily_state'] = -1;
        customerProfile['daily_receive_state'] = -1;
        customerProfile['community_receive_state'] = -1;
        customerProfile['party_receive_state'] = -1;
        customerProfile["open_state"] = 'N';
    }
    else{
        //별점 정보
        let starsInfo = await mysql.findOne('stars', {uid:postObj.uid, target_uid:postObj.customer_id}, 'stars');
        if(starsInfo)
            customerProfile['stars'] = starsInfo['stars'];
        else
            customerProfile['stars'] = 0;

        //내가 데일리카드호감을 보낸 정보
        let dailycardFavInfo = await mysql.findOne('dailycard_fav', {uid:postObj.uid, target_uid:postObj.customer_id}, 'state,fav_content');
        if(dailycardFavInfo){
            customerProfile['daily_state'] = dailycardFavInfo['state'];
            customerProfile['daily_contents'] = dailycardFavInfo['fav_content'];
        }
        else{
            customerProfile['daily_state'] = -1;
            customerProfile['daily_contents'] = '';
        }

        //내가 데일리카드호감을 받은 정보
        let receiveDailycardFavInfo = await mysql.findOne('dailycard_fav', {uid:postObj.customer_id, target_uid:postObj.uid}, 'state,fav_content');
        if(receiveDailycardFavInfo){
            customerProfile['daily_receive_state'] = receiveDailycardFavInfo['state'];
            customerProfile['daily_contents'] = receiveDailycardFavInfo['fav_content'];
        }
        else{
            customerProfile['daily_receive_state'] = -1;
            customerProfile['daily_contents'] = '';
        }

        //제가 받은 커뮤니티호감을 수락한 정보
        if(postObj.community_id){
            let receiveCommunityFavInfo = await mysql.findOne('community_fav', {community_id:postObj.community_id, uid:postObj.customer_id, target_uid:postObj.uid}, 'state, contents');
            customerProfile['community_receive_state'] = -1;
            customerProfile['community_receive_contents'] = '';
            console.log('receiveCommunityFavInfo ' + receiveCommunityFavInfo);
            console.log(postObj.community_id + '    ' + postObj.customer_id + '     ' + postObj.uid);
            if(receiveCommunityFavInfo){
                customerProfile['community_receive_state'] = receiveCommunityFavInfo['state'];
                customerProfile['community_receive_contents'] = receiveCommunityFavInfo['contents'];
            }
        }

        //제가 보낸 커뮤니티호감을 상대방이 수락한 정보
        if(postObj.community_id){
            let sendCommunityFavInfo = await mysql.findOne('community_fav', {community_id:postObj.community_id, uid:postObj.uid, target_uid:postObj.customer_id}, 'state, contents');
            customerProfile['community_send_state'] = -1;
            customerProfile['community_send_contents'] = '';
            if(sendCommunityFavInfo){
                customerProfile['community_send_state'] = sendCommunityFavInfo['state'];
                customerProfile['community_send_contents'] = sendCommunityFavInfo['contents'];
            }
        }

        //제가 창조한 파티에서 참여 받은 정보
        if(postObj.party_id){
            let receivePartyJoinInfo = await mysql.findOne('party_join', {party_id:postObj.party_id, uid:postObj.customer_id}, 'state, contents');
            customerProfile['party_receive_state'] = -1;
            customerProfile['party_receive_contents'] = '';
            console.log(postObj.party_id);
            console.log(postObj.customer_id);
            if(receivePartyJoinInfo){
                console.log('found1');
                customerProfile['party_receive_state'] = receivePartyJoinInfo['state'];
                customerProfile['party_receive_contents'] = receivePartyJoinInfo['contents'];
            }
        }

        //제가 참여한 파티에서 수락 받은 정보
        if(postObj.party_id){
            let sendPartyJoinInfo = await mysql.findOne('party_join', {party_id:postObj.party_id, uid:postObj.uid}, 'state, contents');
            customerProfile['party_send_state'] = -1;
            customerProfile['party_send_contents'] = '';
            console.log(postObj.party_id);
            console.log(postObj.uid);
            if(sendPartyJoinInfo){
                console.log('found2');
                customerProfile['party_send_state'] = sendPartyJoinInfo['state'];
                customerProfile['party_send_contents'] = sendPartyJoinInfo['contents'];
            }
        }

        let estimateInfo = await mysql.findOne('estimate', {uid:postObj.uid, target_uid:postObj.customer_id});
        let receiveEstimateInfo = await mysql.findOne('estimate', {uid:postObj.customer_id, target_uid:postObj.uid});
        var openState = "N";
        customerProfile["is_match"] = "N";
        if(estimateInfo || receiveEstimateInfo){
            customerProfile["is_match"] = "Y";
        }
        if(estimateInfo && estimateInfo['open_state'] == "Y")
            openState = "Y";
        else if(receiveEstimateInfo && receiveEstimateInfo['open_state'] == "Y")
            openState = "Y";
        customerProfile["open_state"] = openState;
    }

    //get cert_document info
    let documentInfo = await mysql.findAll('cert_document', {uid:postObj.customer_id}, 'type, cert_img1, cert_img2, cert_img3');
    customerProfile["document_info"] = documentInfo;

    ret.info = customerProfile;
    ret.status = "1";
    ret.msg = "success";
    return res.json(ret);
    
};

exports.declareCustomer = async function (req, res, next) {
    var postObj = req.body;
    console.log(postObj);
    let ret = {
        status: '0',
        msg: ""
    };

    let dataObj = {
        uid: postObj.uid,
        target_uid: postObj.customer_id,
        type: 0
    };

    let result = await mysql.insertOne('declare_customer', dataObj);

    //활동이력 남기기
    if(result){
        let userInfo = await mysql.findOne('customers', {id:postObj.uid}, 'nick_name');
        let targeterInfo = await mysql.findOne('customers', {id:postObj.customer_id}, 'nick_name');
        var retAdd = await CommonController.AddActiveHistory(postObj.uid, userInfo['nick_name'] + '님이 ' + targeterInfo['nick_name'] + '님을 신고');
    }

    ret.status = "1";
    ret.msg = "success";
    return res.json(ret);
    
};

exports.removeCustomer = async function (req, res, next) {
    var postObj = req.body;
    console.log(postObj);
    let ret = {
        status: '0',
        msg: ""
    };

    var removeCount = await mysql.getCount('remove_customer', {uid:postObj.uid, target_uid:postObj.customer_id});
    if(removeCount > 0){
        ret.status = "2";
        ret.msg = "이미 삭제되었어요.";
        return res.json(ret);
    }

    let dataObj = {
        uid: postObj.uid,
        target_uid: postObj.customer_id
    };

    let result = await mysql.insertOne('remove_customer', dataObj);

    //활동이력 남기기
    if(result){
        let userInfo = await mysql.findOne('customers', {id:postObj.uid}, 'nick_name');
        let targeterInfo = await mysql.findOne('customers', {id:postObj.customer_id}, 'nick_name');
        var retAdd = await CommonController.AddActiveHistory(postObj.uid, userInfo['nick_name'] + '님이 ' + targeterInfo['nick_name'] + '님을 삭제');
    }

    ret.status = "1";
    ret.msg = "success";
    return res.json(ret);
    
};

exports.sendStars = async function (req, res, next) {
    var postObj = req.body;
    console.log(postObj);
    let ret = {
        status: '0',
        msg: ""
    };

    var starsCount = await mysql.getCount('stars', {uid:postObj.uid, target_uid:postObj.customer_id});
    if(starsCount > 0){     //이미 별점을 하였으면
        await mysql.updateOne('stars', {uid:postObj.uid, target_uid:postObj.customer_id}, {stars:postObj.stars});
    }
    else{
        let dataObj = {
            uid: postObj.uid,
            target_uid: postObj.customer_id,
            stars: postObj.stars
        };
    
        let result = await mysql.insertOne('stars', dataObj);
    }

    //높은 평가를 하였으면
    if(parseInt(postObj.stars) >= 4){

        //데일리카드리스트에서 없애기
        await DailyCardTodayModel.RemoveCardInToday(postObj.uid, postObj.customer_id);
        await DailyCardTodayModel.RemoveCardInLast(postObj.uid, postObj.customer_id);


        let userInfo = await mysql.findOne('customers', {id:postObj.uid}, 'nick_name');
        var content = userInfo['nick_name'] + '님이 높은 평가를 보냈어요.';
        //푸시 보내기
        let alarmObj = {
            uid: postObj.customer_id,
            type: 11,
            target_id: postObj.uid,
            content: content
        };    

        //await mysql.delete("alarm_list", {uid: postObj.customer_id,target_id: postObj.uid});
        await mysql.insertOne('alarm_list', alarmObj);//완성check this later

        let targeterInfo = await mysql.findOne('customers', {id:postObj.customer_id}, 'device_token');
        if(targeterInfo['device_token'] != ''){
            let sendObj = {
                uid: postObj.customer_id,
                device_token: targeterInfo['device_token'],
                type: 11,
                content_type: 'daily_receive_estimate',
                content: content
            }
            
            await CommonController.sendFcm(sendObj);//added to alarm_list
        }

        //전체에 socket 발송
        
        let socketInfo = {
            message: content,
            uid: parseInt(postObj.uid)
        }
        
        //socket 데일리카드 별점평가
        // socket_client.emit('admin_socket dailycard_send_stars', socketInfo);
        await CommonController.sendSocketData(postObj.customer_id, 'user_socket dailycard_send_stars', socketInfo);

    }

    ret.status = "1";
    ret.msg = "success";
    return res.json(ret);
    
};

exports.sendFav = async function (req, res, next) {
    var postObj = req.body;
    console.log(postObj);
    let ret = {
        status: '0',
        msg: ""
    };

    //다이아 보유갯수 확인
    let canAmountChange = await CustomersModel.GetCanAmountChange(postObj.uid, Global.AMOUNT_PROFILE_FAV);
    if(!canAmountChange){
        ret.status = "3";
        ret.msg = "다이아보유갯수가 부족합니다.";
        return res.json(ret);
    }

    //커뮤니티에 호감 추가하기
    var favCount = await mysql.getCount('dailycard_fav', {uid:postObj.uid, target_uid:postObj.customer_id});
    if(favCount > 0){
        ret.status = "2";
        ret.msg = "이미 호감을 보냈어요.";
        return res.json(ret);
    }

    favCount = await mysql.getCount('dailycard_fav', {uid:postObj.customer_id, target_uid:postObj.uid});
    if(favCount > 0){
        ret.status = "2";
        ret.msg = "상대방이 이미 호감을 보냈어요.";
        return res.json(ret);
    }

    //매칭, 지인 이력 검사
    let isKnowMan = await CommonController.IsKnowMan(postObj.uid, postObj.customer_id);
    if(isKnowMan){
        ret.status = "0";
        ret.msg = "지인 혹은 이미 매칭 이력이 있는 회원입니다.";
        return res.json(ret);
    }

    let dataObj = {
        uid: postObj.uid,
        target_uid: postObj.customer_id,
        fav_content: postObj.fav_content,
        state: 0
    };

    let result = await mysql.insertOne('dailycard_fav', dataObj);

    //데일리카드리스트에서 없애기
    await DailyCardTodayModel.RemoveCardInToday(postObj.uid, postObj.customer_id);
    await DailyCardTodayModel.RemoveCardInLast(postObj.uid, postObj.customer_id);

    //다이아 결제       
    
    let historyRet = await DiamondHistoryModel.InsertHistory(postObj.uid, Global.AMOUNT_PROFILE_FAV, 1, '프로필호감');
    if(!historyRet){
        ret.status = "0";
        ret.msg = "다이아결제가 실패하였습니다.";
        return res.json(ret);
    }

    //활동이력 남기기
    let userInfo = await mysql.findOne('customers', {id:postObj.uid}, 'nick_name');
    let targeterInfo = await mysql.findOne('customers', {id:postObj.customer_id}, 'nick_name, device_token');
    await ActiveHistoryModel.InsertHistory(postObj.uid, userInfo['nick_name'] + '님이 ' + targeterInfo['nick_name'] + '님에게 호감.');

    //푸시 보내기
    var content = userInfo['nick_name'] + '님이 호감을 보냈어요. "' + postObj.fav_content + '"';
    let alarmObj = {
        uid: postObj.customer_id,
        type: 1,
        target_id: postObj.uid,
        content: content
    };    

    //await mysql.delete("alarm_list", {uid: postObj.customer_id,target_id: postObj.uid});
    await mysql.insertOne('alarm_list', alarmObj);//완성check this later

    if(targeterInfo['device_token'] != ''){
        let sendObj = {
            uid: postObj.customer_id,
            device_token: targeterInfo['device_token'],
            type: 1,
            content_type: 'daily_receive_fav',
            content: content,
            customer_id: postObj.uid
        }

        await CommonController.sendFcm(sendObj);//added to alarm_list
    }

    //전체에 socket 발송
    
    let socketInfo = {
        message: content,
        uid: parseInt(postObj.uid)
    }
    
    //socket 데일리카드에서 호감보내기
    // socket_client.emit('admin_socket dailycard_send_fav', socketInfo);
    await CommonController.sendSocketData(postObj.customer_id, 'user_socket dailycard_send_fav', socketInfo);

    ret.status = "1";
    ret.msg = "success";
    return res.json(ret);
    
};

exports.receiveFav = async function (req, res, next) {
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

    await mysql.insertOne('estimate', dataObj);

    await mysql.updateOne('dailycard_fav', {uid:postObj.customer_id, target_uid:postObj.uid}, {state:1});

    //매칭되면 데일리카드리스트에서 없애기
    await DailyCardTodayModel.RemoveCardInToday(postObj.uid, postObj.customer_id);  
    await DailyCardTodayModel.RemoveCardInLast(postObj.uid, postObj.customer_id); 
    
    
    //푸시 보내기
    let userInfo = await mysql.findOne('customers', {id:postObj.uid}, 'nick_name');
    let targeterInfo = await mysql.findOne('customers', {id:postObj.customer_id}, 'nick_name, device_token');
    var content = userInfo['nick_name'] + '님이 호감을 수락했어요. 매칭완료 되었어요.';
    let alarmObj = {
        uid: postObj.customer_id,
        type: 2,
        target_id: postObj.uid,
        content: content
    };    

    //await mysql.delete("alarm_list", {uid: postObj.customer_id,target_id: postObj.uid});
    await mysql.insertOne('alarm_list', alarmObj);//완성check this later

    if(targeterInfo['device_token'] != ''){
        let sendObj = {
            uid: postObj.customer_id,
            device_token: targeterInfo['device_token'],
            type: 2,
            content_type: 'daily_matching',
            content: content,
            customer_id: postObj.uid
        }
        
        await CommonController.sendFcm(sendObj);//added to alarm_list
    }

    //전체에 socket 발송
    
    let socketInfo = {
        message: content,
        uid: parseInt(postObj.uid)
    }
    
    //socket 데일리카드 호감수락
    // socket_client.emit('admin_socket dailycard_receive_fav', socketInfo);
    await CommonController.sendSocketData(postObj.customer_id, 'user_socket dailycard_receive_fav', socketInfo);

    ret.status = "1";
    ret.msg = "success";
    return res.json(ret);
    
};

exports.openAddress = async function (req, res, next) {
    var postObj = req.body;
    console.log(postObj);
    let ret = {
        status: '0',
        msg: ""
    };

    //다이아 보유갯수 확인
    let canAmountChange = await CustomersModel.GetCanAmountChange(postObj.uid, Global.AMOUNT_ADDRESS_OPEN);
    if(!canAmountChange){
        ret.status = "3";
        ret.msg = "다이아보유갯수가 부족합니다.";
        return res.json(ret);
    }

    await mysql.updateOne('estimate', {uid:postObj.customer_id, target_uid:postObj.uid}, {open_state:'Y'});
    await mysql.updateOne('estimate', {uid:postObj.uid, target_uid:postObj.customer_id}, {open_state:'Y'});

    //다이아 결제
    let historyRet = await DiamondHistoryModel.InsertHistory(postObj.uid, Global.AMOUNT_ADDRESS_OPEN, 1, '연락처 오픈');
    if(!historyRet){
        ret.status = "0";
        ret.msg = "다이아결제가 실패하였습니다.";
        return res.json(ret);
    }

    //푸시 보내기
    let userInfo = await mysql.findOne('customers', {id:postObj.uid}, 'nick_name');
    let targeterInfo = await mysql.findOne('customers', {id:postObj.customer_id}, 'nick_name, device_token');
    var content = userInfo['nick_name'] + '님이 연락처를 오픈했어요.';
    let alarmObj = {
        uid: postObj.customer_id,
        type: 14,
        target_id: postObj.uid,
        content: content
    };    
    await mysql.insertOne('alarm_list', alarmObj);//완성check this later

    if(targeterInfo['device_token'] != ''){
        let sendObj = {
            uid: postObj.customer_id,
            device_token: targeterInfo['device_token'],
            type: 14,
            content_type: '',
            content: content,
            customer_id: postObj.uid
        }
        
        await CommonController.sendFcm(sendObj);//added to alarm_list
    }

    //전체에 socket 발송
    
    let socketInfo = {
        message: content,
        uid: parseInt(postObj.uid)
    }
    
    //socket 연락처 오픈
    // socket_client.emit('admin_socket open_address', socketInfo);
    await CommonController.sendSocketData(postObj.customer_id, 'user_socket open_address', socketInfo);

    ret.status = "1";
    ret.msg = "success";
    return res.json(ret);
    
};

