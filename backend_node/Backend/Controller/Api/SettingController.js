require('rootpath')();
let mysql = require('../../DB/mysql_Controller');
let moment = require("moment");
let CommonController = require('../CommonController');
let DiamondHistoryModel = require("../../Model/DiamondHistoryModel");
let Global = require('../../Common/Global');
let bcrypt = require('bcryptjs');

exports.submitProfileImage = async function(req, res, next){
    let isAllowInfo = await mysql.findOne("customers", {id: req.body.uid}, "is_profile_img_allow");
    if(parseInt(isAllowInfo['is_profile_img_allow']) < 2){
        return res.json({status:0, msg:'이미 신청 상태입니다.'});
    }
    await mysql.delete("cert_profile_img", {uid: req.body.uid});

    let info = {};
    info['uid'] = req.body.uid;
    info['state'] = 0;
    info['is_register'] = 'N';

    for(let i = 1 ; i < 6 ; i ++){
        let key = 'img'+(i);
        let imgUrl = req.body[key];
        if(imgUrl != ''){
            let infoKey = 'cert_img' + i;
            info[infoKey] = imgUrl;
        }
    }

    await mysql.insertOne("cert_profile_img", info);
    await mysql.updateOne("customers", {id: req.body.uid}, {is_profile_img_allow: 1, profile_img_change_date: moment().format("YYYY-MM-DD HH:mm:ss")});

    return res.json({status: 1, msg:"success"});
}

exports.submitMainInfo = async function(req, res, next){
    let reqObj = {...req.body};
    delete reqObj['uid'];
    delete reqObj['remember_token'];
    
    await mysql.updateOne("customers", {id:req.body.uid}, reqObj);
    
    return res.json({status: 1, msg:"success"});
}


exports.submitDocumentInfo = async function(req, res, next){
    
    let isAllowInfo = await mysql.findOne("customers", {id: req.body.uid}, "is_document_allow");
    if(parseInt(isAllowInfo['is_document_allow']) < 2){
        return res.json({status:0, msg:'이미 신청 상태입니다.'});
    }
    await mysql.delete("cert_document", "uid="+req.body.uid + " AND type < 16 " );

    //put cert images in cert_document table
    let nameList = Global.docCertKindNameList;
    for(let typeIndex = 0 ; typeIndex < nameList.length ; typeIndex ++){
        let nameInfo = nameList[typeIndex];
        
        let key = nameInfo + "_img";
        let imgUrl = req.body[key] ? req.body[key]: "";
        let imgArr = imgUrl.split(",");
        let certDocInfo = {};
        certDocInfo['uid'] = req.body.uid;
        certDocInfo['type'] = typeIndex + 1;
        certDocInfo['state'] = 0;
        certDocInfo['is_register'] = 'N';

        if (imgUrl == '')
            continue;

        for(let i = 0 ; i < imgArr.length ; i ++){
            let cKey = 'cert_img' + (i + 1);
            certDocInfo[cKey] = imgArr[i];
        }

        await mysql.insertOne('cert_document', certDocInfo);
    }    

    await mysql.updateOne("customers", {id: req.body.uid}, {is_document_allow: 1, document_change_date: moment().format("YYYY-MM-DD HH:mm:ss")});

    return res.json({status: 1, msg:"success"});
}

exports.submitSoInfo = async function(req, res, next){
    
    let isAllowInfo = await mysql.findOne("customers", {id: req.body.uid}, "is_so_allow");
    if(parseInt(isAllowInfo['is_so_allow']) < 2){
        return res.json({status:0, msg:'이미 신청 상태입니다.'});
    }

    await mysql.delete("cert_document", "uid="+req.body.uid + " AND type = 16 " );

    //put cert images in cert_document table
    let certDocInfo = {};
    certDocInfo['uid'] = req.body.uid;
    certDocInfo['type'] = 16;
    certDocInfo['state'] = 0;
    certDocInfo['is_register'] = 'N';
    for(let i=1; i<4; i++){
        let key = "img"+i;
        let imgUrl = req.body[key] ? req.body[key] : "";
        if(imgUrl == '')
            break;
        
        let certKey = 'cert_img' + i; 
        certDocInfo[certKey] = imgUrl;
    }

    await mysql.insertOne("cert_document", certDocInfo);
    await mysql.updateOne("customers", {id: req.body.uid}, {is_so_allow: 1, so_change_date: moment().format("YYYY-MM-DD HH:mm:ss")});

    return res.json({status: 1, msg:"success"});
}

exports.getPushInfo = async function(req, res, next){
    let pushInfo = await mysql.findOne("push_config", {uid: req.body.uid});

    if(!pushInfo){
        return res.json({status : 0, msg : '회원님에 해당한 푸시설정정보가 없습니다.'});
    }
    return res.json({status: 1, info: pushInfo});
}

exports.setPushInfo = async function(req, res, next){

    let reqObj = {...req.body};
    delete reqObj['uid'];
    delete reqObj['remember_token'];

    await mysql.updateOne("push_config", {uid: req.body.uid}, reqObj);

    return res.json({status: 1, msg:"success"});
}

exports.setPassInfo = async function(req, res, next){
    let customer_check = await mysql.findOne("customers", {id: req.body.uid});
    let cmpPwd = await bcrypt.compare(req.body.old_password, customer_check['pwd']);
    if(!cmpPwd){
        return res.json({'status' : '0', 'msg' : '기존 비밀번호를 정확히 입력해주세요.'});
    }

    let salt = await bcrypt.genSalt(10);
    let hash = await bcrypt.hash(req.body.password, salt);
    await mysql.updateOne("customers", {id: req.body.uid}, {pwd: hash})

    return res.json({status: 1, msg:"success"});
}

exports.setFreeState = async function(req, res, next){
    await mysql.updateOne("customers", {id: req.body.uid}, {is_allow: req.body.is_free == 'Y' ? 3 : 1});

    return res.json({status: 1, msg:"success"});
}

exports.setExitState = async function(req, res, next){
    await mysql.insertOne("exit_customers", {uid: req.body.uid});
    return res.json({status: 1, msg:"success"});
}

exports.getInviteCodeInfo = async function(req, res, next){
    
    let inviteCodeInfo = await mysql.findOne("customers", {id: req.body.uid}, "invite_code");
    let targeterCount = await mysql.getCount("invite_code_history", {uid: req.body.uid});

    return res.json({status: 1, invite_code:inviteCodeInfo['invite_code'], targeter_count: targeterCount});
}

exports.setBlackPhoneList = async function(req, res, next){
    await mysql.delete("black_phone_list", {uid: req.body.uid});
    await mysql.insertOne("black_phone_list", {uid: req.body.uid, phone_num_list: req.body.black_phone_list});

    return res.json({status: 1, msg:"success"});
}

exports.chargeDiamond = async function(req, res, next){
    let historyRet = await DiamondHistoryModel.InsertHistory(req.body.uid, req.body.diamond_amount, 1, '다이아충전');
    if (!historyRet) {
        return res.json({
            'status': '0',
            'msg': '다이아결제가 실패하였습니다.'
        });
    }

    return res.json({status: 1, msg:"success"});
}

exports.getAlarmList = async function(req, res, next){

    let data = await mysql.findWhereOrderBY("alarm_list", {uid: req.body.uid}, "*", "created_at", "DESC" );

    if(data.length > 0){
        await mysql.updateOne("alarm_list", {uid: req.body.uid}, {read_state:"Y"});
        return res.json({'status' : 1, 'list' : data});
    }
    return res.json({'status' : 0, 'msg' : '알람데이터가 없습니다.'});
}

exports.getDiamondInfo = async function(req, res, next){
    let userInfo = await mysql.findOne("customers", {id: req.body.uid}, "diamond");

    return res.json({'status':'1', 'info':{diamond: userInfo['diamond']}});
}

exports.setSocketId = async function(req, res, next){
    
    if(req.body.socket_id != ''){
        await mysql.updateOne('customers', {id: req.body.uid}, {socket_id: req.body.socket_id});
    }

    //읽지 않은 챠팅갯수, 알람갯수 얻기
    let unReadChatCount = await mysql.getCount("chatting", {
        receiver_uid: req.body.uid,
        read_state: 'N'
    });
    let unReadAlarmCount = await mysql.getCount("alarm_list", {
        uid: req.body.uid,
        read_state: 'N'
    });

    let alarmInfo = {
        unread_chat_count : unReadChatCount,
        unread_alarm_count : unReadAlarmCount
    }
    
    return res.json({'status':'1', 'msg':'success', 'info':alarmInfo});
}

exports.sendPunishInfo = async function(req, res, next){
    var postObj = req.body;
    console.log(postObj);
    let ret = {
        status: '0',
        msg: ""
    };
    
    let punishInfo = await mysql.findOne('declare_customer', {id:postObj.declare_id});
    if(punishInfo){
        var content = '';
        if(punishInfo['type'] == 0){
            content = '데일리카드';
        }
        else if(punishInfo['type'] == 1){
            content = '커뮤니티';
        }
        else if(punishInfo['type'] == 2){
            content = '파티';
        }
        else if(punishInfo['type'] == 3){
            content = '커뮤니티댓글';
        }
        
        content += ' 신고로 인해 ' + postObj.time_str + ' 이용 정지처리 되었습니다.';

        if(punishInfo['type'] == 4){
            content = '관리자님에 인해 ' + postObj.time_str + ' 이용 정지처리 되었습니다.';
        }

        //푸시 보내기
        let alarmObj = {
            uid: punishInfo['target_uid'],
            type: 24,
            target_id: 0,
            content: content
        };    
        await mysql.insertOne('alarm_list', alarmObj);

        let targeterInfo = await mysql.findOne('customers', {id:punishInfo['target_uid']}, 'device_token');
        if(targeterInfo['device_token'] != ''){
            let sendObj = {
                uid: punishInfo['target_uid'],
                device_token: targeterInfo['device_token'],
                type: 24,
                content_type: '',
                content: content
            }
            
            await CommonController.sendFcm(sendObj);//added to alarm_list
        }

        //socket 발송
        
        let socketInfo = {
            message: content,
            content: content
        }
        
        //유저에게 제제처리 socket 발송
        await CommonController.sendSocketData(punishInfo['target_uid'], 'punish_info', socketInfo);
    }
    
    return res.json({'status':'1', 'msg':'success'});
}
