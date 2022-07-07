require('rootpath')();
let mysql = require('../../DB/mysql_Controller');
let moment = require('moment');
let injection = require('../../DB/data_injection');
let config = require('../../Config/index');
let CommonController = require('../CommonController');

let DBCtrl = require('../../DB/DBController');

const Global = require('../../Common/Global');

let DiamondHistoryModel = require('../../Model/DiamondHistoryModel');
let ActiveHistoryModel = require('../../Model/ActiveHistoryModel');
let CustomersModel = require('../../Model/CustomersModel');
let DailyCardTodayModel = require('../../Model/DailyCardTodayModel');
let CommunityModel = require('../../Model/CommunityModel');

//서버측 소켓클라
var socket_client_module = require('socket.io-client');
var socket_client = socket_client_module.connect(config.server_url, {reconnect: true});

exports.createCommunity = async function (req, res, next) {
    var postObj = req.body;
    console.log(postObj);
    let ret = {
        status: '0',
        msg: ""
    };

    var file_name= "";
    if(req.file){
        file_name = "http://" + req.headers.host + "/community/" + req.file.filename;
    }

    let dataObj = {
        uid: postObj.uid,
        nick_name: await CommonController.GetNickName(),
        title: postObj.title,
        content: postObj.content,
        category_type: postObj.category_type,
        like_uids: '',
        img_url: file_name
    };

    let result = await mysql.insertOne('community', dataObj);
    if(result){

        //활동이력 남기기
        let customerInfo = await mysql.findOne('customers', {id:postObj.uid}, 'nick_name, sex');
        var retAdd = await CommonController.AddActiveHistory(postObj.uid, customerInfo['nick_name'] + '님이 커뮤니티창조');

        //전체에 socket 발송
        if(retAdd){
            //창조된 커뮤니티 정보
            let communityInfo = await mysql.findOne('community', {id:result}, 'id, uid, nick_name, title, content, read_count, category_type, TIME_TO_SEC(TIMEDIFF(NOW(), created_at)) diff_sec');
            communityInfo['sex'] = customerInfo['sex'];
            communityInfo['ago_time'] = CommonController.GetKoreanFormatFromSec(communityInfo['diff_sec']);
            communityInfo['feedback_count'] = await mysql.getCount('community_feedback', {community_id:communityInfo['id']});
            
            //socket 커뮤니티 창조
            socket_client.emit('admin_socket community_create', communityInfo);//done

            ret.status = "1";
            ret.msg = "success";
            return res.json(ret);
        }
    }

    /*var customers = await DBCtrl.getCustomers(" is_allow = 1");
    let customerIds = [];
        for (let j = 0; j < customers.length; j++) {
            customerIds.push(customers[j].id);
        }
        if (customers.length == 0) {
            colorLog.Normal("유저들이 없습니다.");
        } else {
            // 회원들에게 푸시알림 보내기
            sendPush(customerIds.join(','));
        }*/

    ret.status = "0";
    ret.msg = "등록 실패되었습니다.";
    return res.json(ret);

    
};

exports.getMainList = async function (req, res, next) {
    var postObj = req.body;
    console.log(postObj);
    let ret = {
        status: '0',
        msg: "",
        info: {
            communityList : [],
            noticeList : []
        }
    };

    var whereStr = '1=1 and community.is_del="N"';

    console.log("postObj.category_type ");
    console.log(postObj.uid);
    var cat_type = postObj.category_type;
    console.log(cat_type);
    
    if(cat_type == 1){
        whereStr = 'community.category_type=1 and community.is_del="N"';
    }
    if(cat_type == 2){
        whereStr = 'community.category_type=2 and community.is_del="N"';
    }
    if(cat_type == 3){
        whereStr = 'community.category_type=3 and community.is_del="N"';
    }

    let block_party = await mysql.findAll('declare_customer2', {uid:postObj.uid}, 'declare_id');
    
    if(block_party.length > 0){
        var keys = [];
        for(var i in block_party){
            keys.push(block_party[i]['declare_id']);
        }
        whereStr += ' AND community.id not in (';
        for(var i in block_party){
            whereStr += block_party[i]['declare_id'] + ",";
        }
    
        whereStr = whereStr.substr(0,whereStr.length - 1);
        whereStr += ")"
    }
    
    let communityList = await mysql.findWithJoinAndOrderBY('community', whereStr, 'Left', 'customers', 'community.uid=customers.id', 'community.created_at', 'DESC', 'community.id, community.uid, community.nick_name, community.title, community.content, community.read_count, community.category_type, community.is_del, TIME_TO_SEC(TIMEDIFF(NOW(), community.created_at)) diff_sec, customers.sex');
    
    for(let key in communityList) {
        communityList[key]['ago_time'] = CommonController.GetKoreanFormatFromSec(communityList[key]['diff_sec']);
        communityList[key]['feedback_count'] = await mysql.getCount('community_feedback', {community_id:communityList[key]['id'],is_del:'N'});
    }

    let noticeList = await mysql.findAll('notice', {type:1, state:'Y'});

    ret.info.communityList = communityList;
    ret.info.noticeList = noticeList;

    ret.status = "1";
    ret.msg = "success";
    return res.json(ret);
    
};

exports.createFeedback = async function (req, res, next) {
    var postObj = req.body;
    console.log(postObj);
    let ret = {
        status: '0',
        msg: ""
    };
    
    //커뮤니티 정보 얻기
    let communityInfo = await mysql.findOne('community', {id:postObj.community_id}, 'uid, nick_name, title');
    
    //이미 있는 닉네임 얻기
    var nickName = "";
    if(communityInfo['uid'] == postObj.uid){     //본인이 쓴 글이면
        nickName = communityInfo['nick_name'];
    }
    else{
        let feedbackInfo = await mysql.findOne('community_feedback', {community_id:postObj.community_id, uid:postObj.uid}, 'nick_name');
        
        if(feedbackInfo){
            nickName = feedbackInfo['nick_name'];
        }
        else{
            nickName = await CommonController.GetNickName();
        }
    }

    let dataObj = {
        uid: postObj.uid,
        nick_name: nickName,
        community_id: postObj.community_id,
        parent_id: postObj.parent_id,
        contents: postObj.contents,
        like_uids: ''
    };


    let result = await mysql.insertOne('community_feedback', dataObj);
    if(result){

        var content = '';
        if(postObj.parent_id == 0){
            content = communityInfo['title'] + " 글에 댓글이 달렸어요.";
        }
        else{
            content = communityInfo['title'] + " 글에 대댓글이 달렸어요.";

            //hereherehere
            let communityInfo1 = await mysql.findOne('community_feedback', {id:postObj.parent_id}, 'uid, nick_name, contents');
            let alarmObj1 = {
                uid: communityInfo1['uid'],
                type: 99,
                target_id: postObj.community_id,
                content: communityInfo1['contents'] + " 댓글에 대댓글이 달렸어요."
            };   

            if(communityInfo1['uid'] != postObj.uid){
                await mysql.insertOne('alarm_list', alarmObj1);//완성check this later
    
                let targeterInfo1 = await mysql.findOne('customers', {id:communityInfo1['uid']}, 'device_token');
                if(targeterInfo1['device_token'] != ''){
                    let sendObj1 = {
                        uid: communityInfo1['uid'],
                        device_token: targeterInfo1['device_token'],
                        type: 99,
                        content_type: 'community_receive_feedback',
                        content: communityInfo1['contents'] + " 댓글에 대댓글이 달렸어요."
                    }
                    
                    await CommonController.sendFcm(sendObj1);//added to alarm_list
                }
            }
        }

        //푸시 보내기
        let alarmObj = {
            uid: communityInfo['uid'],
            type: 13,
            target_id: postObj.community_id,
            content: content
        };    

        if(communityInfo['uid'] != postObj.uid){
            await mysql.insertOne('alarm_list', alarmObj);//완성check this later

            let targeterInfo = await mysql.findOne('customers', {id:communityInfo['uid']}, 'device_token');
            if(targeterInfo['device_token'] != ''){
                let sendObj = {
                    uid: communityInfo['uid'],
                    device_token: targeterInfo['device_token'],
                    type: 13,
                    content_type: 'community_receive_feedback',
                    content: content
                }
                
                await CommonController.sendFcm(sendObj);//added to alarm_list
            }
        }
        
        //전체에 socket 발송
        
        //새 댓글 정보        
        let communityFeedbackInfo = await mysql.findOne('community_feedback', {id:result});
        let customerInfo = await mysql.findOne('customers', {id:postObj.uid}, 'sex');
        communityFeedbackInfo['sex'] = customerInfo['sex'];
        //이 커뮤니티에 달린 댓글수
        var feedbackCount = await mysql.getCount('community_feedback', {community_id:postObj.community_id});

        let socketInfo = {
            message: content,
            community_id: postObj.community_id,
            uid: communityInfo['uid'],
            feedback_count: feedbackCount,
            feedback_info: communityFeedbackInfo
        }
        
        //socket 커뮤니티 댓글 달기
        socket_client.emit('admin_socket community_feedback_create', socketInfo);//done

        ret.status = "1";
        ret.msg = "success";
        return res.json(ret);
        
    }
    
    ret.status = "0";
    ret.msg = "댓글 달기 실패되었습니다.";
    return res.json(ret);
    
};

exports.likeCommunity = async function (req, res, next) {
    var postObj = req.body;
    console.log(postObj);
    let ret = {
        status: '0',
        msg: ""
    };

    //이미 좋아요 했는지 검사
    var likeCount = await mysql.getCount('community', 'id=' + postObj.community_id + ' AND FIND_IN_SET(' + postObj.uid  + ', like_uids)');
    if(likeCount){
        ret.status = "2";
        ret.msg = "이미 좋아요 했어요.";
        return res.json(ret);
    }

    let communityInfo = await mysql.findOne('community', {id:postObj.community_id}, 'like_uids');
    var likeUIds = "";
    if(communityInfo['like_uids'] == ''){
        likeUIds = String(postObj.uid);
    }
    else{
        likeUIds = communityInfo['like_uids'] + ',' + postObj.uid;
    }
    
    await mysql.updateOne('community', {id:postObj.community_id}, {like_uids:likeUIds});

    
    //전체에 socket 발송
    
    //좋아요 갯수
    var likeCount = 0;
    if(likeUIds != ''){
        var likeUIdArr = likeUIds.split(',');
        likeCount = likeUIdArr.length;
    }

    let socketInfo = {
        id: postObj.community_id,
        amount: likeCount
    }
    
    //socket 커뮤니티 좋아요
    socket_client.emit('admin_socket community_like', socketInfo);//done

    ret.status = "1";
    ret.msg = "success";
    return res.json(ret);
    
};

exports.likeFeedback = async function (req, res, next) {
    var postObj = req.body;
    console.log(postObj);
    let ret = {
        status: '0',
        msg: ""
    };

    //이미 좋아요 했는지 검사
    var likeCount = await mysql.getCount('community_feedback', 'id=' + postObj.feedback_id + ' AND FIND_IN_SET(' + postObj.uid  + ', like_uids)');
    if(likeCount){
        ret.status = "2";
        ret.msg = "이미 좋아요 했어요.";
        return res.json(ret);
    }

    let feedbackInfo = await mysql.findOne('community_feedback', {id:postObj.feedback_id}, 'community_id, like_uids');
    var likeUIds = "";
    if(feedbackInfo['like_uids'] == ''){
        likeUIds = String(postObj.uid);
    }
    else{
        likeUIds = feedbackInfo['like_uids'] + ',' + postObj.uid;
    }
    
    await mysql.updateOne('community_feedback', {id:postObj.feedback_id}, {like_uids:likeUIds});

    
    //전체에 socket 발송
    
    //좋아요 갯수
    var likeCount = 0;
    if(likeUIds != ''){
        var likeUIdArr = likeUIds.split(',');
        likeCount = likeUIdArr.length;
    }

    let socketInfo = {
        community_id: feedbackInfo['community_id'],
        id: postObj.feedback_id,
        amount: likeCount
    }
    
    //socket 커뮤니티 댓글 좋아요
    socket_client.emit('admin_socket community_feedback_like', socketInfo);//done

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

    let info = await mysql.findOneWithJoin('community', 'community.id=' + postObj.community_id, 'Left', 'customers', 'community.uid=customers.id', 'community.*, customers.sex, customers.avatar_url');

    var likeCount = 0;
    if(info['like_uids'] != ''){
        let likeArr = info['like_uids'].split(',');
        likeCount = likeArr.length;
    }
    info['like_count'] = likeCount;

    //댓글 리스트 얻기
    let feedbackList = await mysql.findWithJoin('community_feedback', 'community_feedback.community_id=' + postObj.community_id + ' AND community_feedback.parent_id=0', 'Left', 'customers', 'community_feedback.uid=customers.id', 'community_feedback.*, customers.sex');
    for(let key in feedbackList) {

        //대댓글 얻기
        let subFeedbackList = await mysql.findWithJoin('community_feedback', 'community_feedback.parent_id=' + feedbackList[key]['id'], 'Left', 'customers', 'community_feedback.uid=customers.id', 'community_feedback.*, customers.sex');
        if(!subFeedbackList)
            subFeedbackList = [];

        feedbackList[key]['sub_feedback_list'] = subFeedbackList;

        //대댓글에 좋아요 한 갯수 얻기
        for(let key in subFeedbackList) {
            
            var subLikeCount = 0;
            if(subFeedbackList[key]['like_uids'] != ''){
                let likeUIdArr = subFeedbackList[key]['like_uids'].split(',');
                subLikeCount = likeUIdArr.length;
            }
            subFeedbackList[key]['like_count'] = subLikeCount;
        }

        //댓글에 좋아요 한 갯수 얻기
        likeCount = 0;
        if(feedbackList[key]['like_uids'] != ''){
            let likeUIdArr = feedbackList[key]['like_uids'].split(',');
            likeCount = likeUIdArr.length;
        }
        feedbackList[key]['like_count'] = likeCount;
    }

    info['feedback_list'] = feedbackList;

    //내가 쓴 커뮤니티인가
    var isMine = 0;
    if(info['uid'] == postObj.uid){
        isMine = 1;
    }
    info['is_mine'] = isMine;

    //다른 회원님의 커뮤니티에 호감을 보낸 상태
    info['join_state'] = -1;
    
    if(isMine == 0){   //내가 창조한 커뮤니티가 아닌 경우
        let joinInfo = await mysql.findOne('community_fav', {community_id:postObj.community_id, uid:postObj.uid, target_uid:info['uid']}, 'state');
        if(joinInfo){
            info['join_state'] = joinInfo['state'];
        }
    }

    //호감 보낸 카드 리스트 얻기
    let sendFavcardList = await mysql.findWithJoin('community_fav', 'community_fav.community_id=' + postObj.community_id + ' AND community_fav.uid=' + postObj.uid + ' AND (7 - DATEDIFF(NOW(), community_fav.updated_at)) > 0', 'Left', 'customers', 'community_fav.target_uid=customers.id', 'community_fav.target_uid as uid, customers.nick_name, customers.avatar_url, community_fav.state, 7 - DATEDIFF(NOW(), community_fav.updated_at) as remain_day');

    for(let key in sendFavcardList) {
        var favcardInfo = sendFavcardList[key];
        let estimateInfo = await mysql.findOne('estimate', '(uid=' + favcardInfo['uid'] + ' AND estimate.target_uid=' + postObj.uid + ') OR (uid=' + postObj.uid + ' AND estimate.target_uid=' + favcardInfo['uid'] + ')', 'open_state');
        if(estimateInfo){
            sendFavcardList[key]['open_state'] = estimateInfo['open_state'];
        }
        else{
            sendFavcardList[key]['open_state'] = 'N';
        }
    }

    info['send_favcard_list'] = sendFavcardList;

    //호감 받은 카드 리스트 얻기

    let receiveFavcardList = await mysql.findWithJoin('community_fav', 'community_fav.community_id=' + postObj.community_id + ' AND community_fav.target_uid=' + postObj.uid + ' AND (7 - DATEDIFF(NOW(), community_fav.updated_at)) > 0', 'Left', 'customers', 'community_fav.uid=customers.id', 'community_fav.uid, customers.nick_name, customers.avatar_url, community_fav.state, 7 - DATEDIFF(NOW(), community_fav.updated_at) as remain_day');

    for(let key in receiveFavcardList) {
        var favcardInfo = receiveFavcardList[key];
        let estimateInfo = await mysql.findOne('estimate', '(uid=' + favcardInfo['uid'] + ' AND estimate.target_uid=' + postObj.uid + ') OR (uid=' + postObj.uid + ' AND estimate.target_uid=' + favcardInfo['uid'] + ')', 'open_state');
        if(estimateInfo){
            receiveFavcardList[key]['open_state'] = estimateInfo['open_state'];
        }
        else{
            receiveFavcardList[key]['open_state'] = 'N';
        }
    }
    
    info['receive_favcard_list'] = receiveFavcardList;

    
    if(postObj.status == 1){
        //plus read count
        var readCount = parseInt(info['read_count']) + 1;
        await mysql.updateOne('community', {id:postObj.community_id}, {read_count:readCount});

        //전체에 socket 발송

        let socketInfo = {
            id: postObj.community_id,
            amount: readCount
        }
        
        //socket 커뮤니티 열기
        socket_client.emit('admin_socket community_read', socketInfo);//done
    }

    ret.status = "1";
    ret.msg = "success";
    ret.info = info;
    return res.json(ret);
    
};

exports.sendFav = async function (req, res, next) {
    var postObj = req.body;
    console.log(postObj);
    let ret = {
        status: '0',
        msg: ""
    };

    //같은 성별일 경우
    let userInfo = await mysql.findOne('customers', {id:postObj.uid}, 'nick_name, sex');
    let targeterInfo = await mysql.findOne('customers', {id:postObj.customer_id}, 'device_token, device_type, sex');
    if(userInfo['sex'] == targeterInfo['sex']){
        ret.status = "0";
        ret.msg = "동성에게는 호감을 보낼 수 없어요.";
        return res.json(ret);
    }

    //매칭, 지인 이력 검사
    let isKnowMan = await CommonController.IsKnowMan(postObj.uid, postObj.customer_id);
    if(isKnowMan){
        ret.status = "0";
        ret.msg = "지인 혹은 이미 매칭 이력이 있는 회원입니다.";
        return res.json(ret);
    }

    //다이아 보유갯수 확인
    let canAmountChange = await CustomersModel.GetCanAmountChange(postObj.uid, Global.AMOUNT_COMMUNITY_FAV);
    if(!canAmountChange){
        ret.status = "3";
        ret.msg = "다이아보유갯수가 부족합니다.";
        return res.json(ret);
    }

    //커뮤니티에 호감 추가하기
    var favCount = await mysql.getCount('community_fav', {uid:postObj.uid, community_id:postObj.community_id, target_uid:postObj.customer_id});
    if(favCount > 0){
        ret.status = "2";
        ret.msg = "이미 호감을 보냈어요.";
        return res.json(ret);
    }

    let dataObj = {
        community_id: postObj.community_id,
        uid: postObj.uid,
        target_uid: postObj.customer_id,
        state: 0
    };

    let result = await mysql.insertOne('community_fav', dataObj);
    

    //다이아 결제

    let historyRet = await DiamondHistoryModel.InsertHistory(postObj.uid, Global.AMOUNT_COMMUNITY_FAV, 1, '커뮤니티호감');
    if(!historyRet){
        ret.status = "0";
        ret.msg = "다이아결제가 실패하였습니다.";
        return res.json(ret);
    }


    //활동이력 남기기
    await ActiveHistoryModel.InsertHistory(postObj.uid, userInfo['nick_name'] + '님이 커뮤니티에 호감');

    //푸시 보내기
    let communityInfo = await mysql.findOne('community', {id:postObj.community_id}, 'title');
    let alarmObj = {
        uid: postObj.customer_id,
        type: 5,
        target_id: postObj.community_id,
        content: communityInfo['title'] + " 글에서 호감을 받았어요."
    };    

    //await mysql.delete("alarm_list", {uid: postObj.customer_id,target_id: postObj.community_id});
    await mysql.insertOne('alarm_list', alarmObj);//완성check this later

    if(targeterInfo['device_token'] != ''){
        let sendObj = {
            uid: postObj.customer_id,
            device_token: targeterInfo['device_token'],
            type: 5,
            content_type: '',
            content: communityInfo['title'] + " 글에서 호감을 받았어요."
        }

        await CommonController.sendFcm(sendObj);//added to alarm_list
    }

    //socket 발송
        
    let socketInfo = {
        message: communityInfo['title'] + " 글에서 호감을 받았어요.",
        uid: parseInt(postObj.customer_id),
        community_id: parseInt(postObj.community_id)
    }
    
    //socket 커뮤니티 호감보내기
    // socket_client.emit('admin_socket community_send_fav', socketInfo);
    await CommonController.sendSocketData(postObj.customer_id, 'user_socket community_send_fav', socketInfo);


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

    var retCount = await mysql.getCount('community_fav', {community_id:postObj.community_id, uid:postObj.customer_id, target_uid:postObj.uid, state:1});
    if(retCount > 0){
        ret.status = "2";
        ret.msg = "이미 프로필 오픈하였습니다.";
        return res.json(ret);
    }

    await mysql.updateOne('community_fav', {community_id:postObj.community_id, uid:postObj.customer_id, target_uid:postObj.uid}, {state:1});
    
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

    await mysql.updateOne('community_fav', {community_id:postObj.community_id, uid:postObj.customer_id, target_uid:postObj.uid}, {state:2, contents:postObj.contents});

    //매칭되면 데일리카드리스트에서 없애기
    await DailyCardTodayModel.RemoveCardInToday(postObj.uid, postObj.customer_id);
    await DailyCardTodayModel.RemoveCardInLast(postObj.uid, postObj.customer_id);

    //푸시 보내기

    //커뮤니티 정보 얻기
    let communityInfo = await mysql.findOne('community', {id:postObj.community_id}, 'title');
    let alarmObj = {
        uid: postObj.customer_id,
        type: 20,
        target_id: postObj.community_id,
        content: communityInfo['title'] + " 글에서 호감이 수락되었어요. 매칭완료 되었어요."
    };    
    
    //await mysql.delete("alarm_list", {uid: postObj.customer_id,target_id: postObj.community_id});
    await mysql.insertOne('alarm_list', alarmObj);//완성check this later

    let targeterInfo = await mysql.findOne('customers', {id:postObj.customer_id}, 'device_token');
    if(targeterInfo['device_token'] != ''){
        let sendObj = {
            uid: postObj.customer_id,
            device_token: targeterInfo['device_token'],
            type: 2,
            content_type: 'community_matching',
            content: communityInfo['title'] + " 글에서 호감이 수락되었어요. 매칭완료 되었어요.",
            community_id: postObj.community_id
        }
        
        await CommonController.sendFcm(sendObj);//added to alarm_list
    }

    //전체에 socket 발송
    
    let socketInfo = {
        message: communityInfo['title'] + " 글에서 호감이 수락되었어요. 매칭완료 되었어요.",
        uid: parseInt(postObj.customer_id),
        community_id: parseInt(postObj.community_id)
    }
    
    //socket 커뮤니티 호감 수락하기
    // socket_client.emit('admin_socket community_receive_fav', socketInfo);
    await CommonController.sendSocketData(postObj.customer_id, 'user_socket community_receive_fav', socketInfo);


    ret.status = "1";
    ret.msg = "success";
    return res.json(ret);
    
};

exports.getMyList = async function (req, res, next) {
    var postObj = req.body;
    console.log(postObj);
    let ret = {
        status: '0',
        msg: "",
        info: null
    };

    let infoList = [];
    if(postObj.type == 0){
        infoList = await CommunityModel.GetMyListByFav(postObj.uid);
    }
    else if(postObj.type == 1){
        infoList = await CommunityModel.GetMyListByCreate(postObj.uid);
    }
    else if(postObj.type == 2){
        infoList = await CommunityModel.GetMyListByFeedback(postObj.uid);
    }
    else if(postObj.type == 3){
    }
    for(let key in infoList) {
        
        infoList[key]['ago_time'] = CommonController.GetKoreanFormatFromSec(infoList[key]['diff_sec']);
        var feedbackCount = await mysql.getCount('community_feedback', {community_id:infoList[key]['id'], is_del:'N'});
        infoList[key]['feedback_count'] = feedbackCount;
    }
    
    ret.status = "1";
    ret.msg = "success";
    ret.info = infoList;
    return res.json(ret);
    
};

exports.declareCommunity = async function (req, res, next) {
    var postObj = req.body;
    console.log(postObj);
    let ret = {
        status: '0',
        msg: ""
    };

    let communityInfo = await mysql.findOne('community', {id:postObj.community_id}, 'uid, title');

    let dataObj = {
        uid: postObj.uid,
        target_uid: communityInfo['uid'],
        declare_id: postObj.community_id,
        type: 1
    };
    await mysql.insertOne('declare_customer', dataObj);

    //활동이력 남기기
    let userInfo = await mysql.findOne('customers', {id:postObj.uid}, 'nick_name');
    let targeterInfo = await mysql.findOne('customers', {id:communityInfo['uid']}, 'nick_name');
    await ActiveHistoryModel.InsertHistory(postObj.uid, userInfo['nick_name'] + '님이 ' + targeterInfo['nick_name'] + '님의 커뮤니티[' + communityInfo['title'] + ']에 신고');

    ret.status = "1";
    ret.msg = "success";
    return res.json(ret);
    
};

exports.declareCommunity1 = async function (req, res, next) {
    var postObj = req.body;
    console.log("declareCommunity1");
    console.log(postObj);
    let ret = {
        status: '0',
        msg: ""
    };

    let communityInfo = await mysql.findOne('community', {id:postObj.community_id}, 'uid, title');

    let dataObj = {
        uid: postObj.uid,
        target_uid: communityInfo['uid'],
        declare_id: postObj.community_id,
        type: 1
    };
    await mysql.insertOne('declare_customer2', dataObj);

    //활동이력 남기기
    let userInfo = await mysql.findOne('customers', {id:postObj.uid}, 'nick_name');
    let targeterInfo = await mysql.findOne('customers', {id:communityInfo['uid']}, 'nick_name');
    await ActiveHistoryModel.InsertHistory(postObj.uid, userInfo['nick_name'] + '님이 ' + targeterInfo['nick_name'] + '님의 커뮤니티[' + communityInfo['title'] + ']에 신고');

    ret.status = "1";
    ret.msg = "success";
    return res.json(ret);
    
};

exports.declareFeedback = async function (req, res, next) {
    var postObj = req.body;
    console.log(postObj);
    let ret = {
        status: '0',
        msg: ""
    };

    let dataObj = {
        uid: postObj.uid,
        target_uid: postObj.feedback_uid,
        declare_id: postObj.feedback_id,
        type: 3
    };
    await mysql.insertOne('declare_customer', dataObj);

    //활동이력 남기기
    let userInfo = await mysql.findOne('customers', {id:postObj.uid}, 'nick_name');
    let targeterInfo = await mysql.findOne('customers', {id:postObj.feedback_uid}, 'nick_name');
    await ActiveHistoryModel.InsertHistory(postObj.uid, userInfo['nick_name'] + '님이 ' + targeterInfo['nick_name'] + '님의 커뮤니티댓글에 신고');

    ret.status = "1";
    ret.msg = "success";
    return res.json(ret);
    
};

exports.deleteCommunity = async function (req, res, next) {
    var postObj = req.body;
    console.log(postObj);
    let ret = {
        status: '0',
        msg: ""
    };

    await mysql.updateOne('community', {id:postObj.community_id}, {is_del:'Y'});

    //전체에 socket 발송

    let socketInfo = {
        id: postObj.community_id,
        amount: 0
    }
    
    //socket 커뮤니티 삭제
    socket_client.emit('admin_socket community_delete', socketInfo);//done

    ret.status = "1";
    ret.msg = "success";
    return res.json(ret);
    
};

exports.deleteFeedback = async function (req, res, next) {
    var postObj = req.body;
    console.log(postObj);
    let ret = {
        status: '0',
        msg: ""
    };
    let feedbackInfo = await mysql.findOne('community_feedback', {id:postObj.feedback_id}, 'parent_id');
    await mysql.updateOne('community_feedback', {id:postObj.feedback_id}, {is_del:'Y'});

    //전체에 socket 발송

    let socketInfo = {
        id: postObj.community_id,
        parent_id: feedbackInfo['parent_id'],
        feedback_id: postObj.feedback_id
    }
    
    //socket 커뮤니티 댓글 삭제
    socket_client.emit('admin_socket community_feedback_delete', socketInfo);//done

    ret.status = "1";
    ret.msg = "success";
    return res.json(ret);
    
};

