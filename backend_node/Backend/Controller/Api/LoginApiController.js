//changed by cyh

require('rootpath')();
let mysql = require('../../DB/mysql_Controller');
let moment = require('moment');
let bcrypt = require('bcryptjs');
let DiamondHistoryModel = require('../../Model/DiamondHistoryModel');
const Global = require('../../Common/Global');

function getToken(strLength) {
    // You’ll need to start with a string containing all the letters in the alphabet: 

    var alphabet = "abcdefghijklmnopqrstuvwxyz1234567890";

    //  To create the random string, start with an empty string

    var randomString = "";

    // Then, create a while loop that will continually add new random letters to this string, as long as the string length is less than 6 (or any length you choose). 

    while (randomString.length < strLength) {

        // To pick a random letter from this string, you can update the code we used for the random insult generator in Chapter 3

        var randomIndex = Math.floor(Math.random() * alphabet.length);

        // You can then use square brackets to get the character at that index. 

        var randomChar = alphabet[randomIndex];

        // You could use the += operator to add a new letter to the end of the string. 

        randomString += randomChar;

    }

    //  After the loop has finished, log it to the console to see your creation!

    return randomString;
}


async function cryptPassword(password) {
    let salt = await bcrypt.genSalt(10);
    let hash = await bcrypt.hash(password, salt);
    return hash;
}

//  async function comparePassword (password, userPassword, callback) {
//     bcrypt.compare(password, userPassword, function(err, isPasswordMatch) {
//        if (err) 
//          return callback(err);
//        return callback(null, isPasswordMatch);
//     });
//  }

async function comparePassword(password, userPassword) {
    return await bcrypt.compare(password, userPassword);
}

let loginController = {
    postLogin: async function (req, res, next) {
        let postObj = req.body;
        let ret = {
            status: "0",
            msg: "",
            info: null
        };

        let userInfo = await mysql.findOne('customers', {
            email: postObj.email
        });

        if (!userInfo) {
            ret.status = '0';
            ret.msg = "이메일에 해당한 회원이 없습니다.";
            return res.json(ret);
        }

        if (userInfo.is_allow == '0') {
            ret.status = '2';
            ret.msg = "승인되지 않은 회원입니다.";
            return res.json(ret);
        } else if (userInfo.is_allow == '2') {
            let documentInfo = await mysql.findOne('cert_document', {
                uid: userInfo.id
            });
            userInfo.document_info = documentInfo;

            ret.status = '-1';
            ret.msg = "가입요청이 거부되었습니다.";
            ret.info = userInfo;
            return res.json(ret);
        } else if (userInfo.is_allow == '4') {
            ret.status = '0';
            ret.msg = "탈퇴된 회원입니다.";
            return res.json(ret);
        }

        let stateInfoList = await mysql.findAll('declare_customer', 'target_uid=' + userInfo['id'] + ' AND expire_date>=NOW()', 'punish_type');
        for(let key in stateInfoList){
            if(stateInfoList[key]['punish_type'] == 1){
                let retVal = {
                    status: '9',
                    msg: "이용 정지 상태입니다."
                };
                return res.json(retVal);
            }
        }


        let psdValidation = await comparePassword(postObj.password, userInfo.password);

        if (!psdValidation) {
            ret.status = '0';
            ret.msg = "비밀번호가 정확하지 않습니다.";
            return res.json(ret);
        }

        let token = getToken(64);

        //유저테이블에 토큰, 디바이스 토큰, 디바이스 타입 갱신
        let dataObj = {
            remember_token: token,
            device_token: postObj.device_token,
            device_type: postObj.device_type,
            socket_id: postObj.socket_id
        };
        await mysql.updateOne('customers', {
            id: userInfo.id
        }, dataObj);
        userInfo.remember_token = token;
        userInfo.device_token = postObj.device_token;
        userInfo.device_type = postObj.device_type;

        //읽지 않은 챠팅갯수, 알람갯수 얻기
        let unReadChatCount = await mysql.getCount("chatting", {
            receiver_uid: userInfo.id,
            read_state: 'N'
        });
        let unReadAlarmCount = await mysql.getCount("alarm_list", {
            uid: userInfo.id,
            read_state: 'N'
        });
        userInfo.unread_chat_count = unReadChatCount;
        userInfo.unread_alarm_count = unReadAlarmCount;

        if (userInfo.is_first == 'Y') {
            await mysql.updateOne('customers', {
                id: userInfo.id
            }, {
                is_first: 'N'
            });
        }

        //서류 인증 정보 얻기
        let documentInfo = await mysql.findAll("cert_document", {
            uid: userInfo.id
        }, 'type, cert_img1, cert_img2, cert_img3');
        userInfo.document_info = documentInfo;

        //푸시 설정 정보 얻기
        let pushInfo = await mysql.findOne("push_config", {uid: userInfo.id});
        userInfo.push_info = pushInfo;

        ret.status = "1";
        ret.msg = "success";
        ret.info = userInfo;
        return res.json(ret);
    },

    postRegister: async function (req, res, next) {
        let reqObj = req.body;

        var ret = {
            status: 0,
            msg: "비밀번호를 정확히 입력하세요.",
            info: null
        };


        let customer_exist_check = await mysql.findAll('customers', {
            'email': reqObj.email,
            'is_allow': 4
        });
        if (customer_exist_check.length > 0) {
            ret.status = -1;
            ret.msg = "이미 탈퇴된 회원입니다."
            return res.json(ret);
        }

        // 승인거부됬을때
        await mysql.delete('customers', {
            'email': reqObj.email,
            'is_allow': 2
        });

        let customer_email_check = await mysql.findAll('customers', {
            'email': reqObj.email
        });
        if (customer_email_check.length > 0) {
            ret.status = 0;
            ret.msg = "이미 가입된 회원입니다."
            return res.json(ret);
        }

        let nowDate = moment().format('YYYY-MM-DD HH:mm:ss');
        let mBirthday = moment(reqObj.birthday);
        let birthday = mBirthday.format("YYYY-MM-DD");
        let birthYear = mBirthday.format("YYYY");
        let age = parseInt(moment().format("YYYY")) - parseInt(birthYear);

        let customerObj = req.body;
        let token = getToken(64);
        let inputInviteCode = reqObj.invite_code ? reqObj.invite_code : '';

        customerObj['pwd'] = await cryptPassword(reqObj.password);
        delete reqObj.password;
        customerObj['remember_token'] = token;
        customerObj['age'] = age;
        customerObj['invite_code'] = getToken(6).toUpperCase();
        customerObj['fav_style'] = reqObj.fav_style ? reqObj.fav_style : '';
        customerObj['fav_what'] = reqObj.fav_what ? reqObj.fav_what : '';
        customerObj['receive_character'] = reqObj.receive_character ? reqObj.receive_character : '';
        customerObj['introduce'] = reqObj.introduce ? reqObj.introduce : '';

        customerObj['is_profile_img_allow'] = 1;
        customerObj['profile_img_change_date'] = nowDate;

        customerObj['is_document_allow'] = 1;
        customerObj['document_change_date'] = nowDate;
        customerObj['so_change_date'] = nowDate;

        customerObj['avatar_url'] = 'uploads/avatar/no_avatar.jpg'; //test

        let certProfileImageList = [];
        for (let i = 1; i <= 5; i++) {
            let imgUrl = reqObj['profile_img' + i] ? reqObj['profile_img' + i] : '';
            if (imgUrl != '') {
                certProfileImageList.push(imgUrl);
            }
            delete customerObj['profile_img' + i];
        }

        let certImageList = {};
        let nameList = Global.docCertKindNameList;

        nameList.forEach(nameInfo => {
            let nameInfoImg = customerObj[nameInfo + '_img'] ? customerObj[nameInfo + '_img'] : '';
            if (nameInfoImg != '')
                customerObj['has_' + nameInfo] = 1;
            certImageList[nameInfo + '_img'] = nameInfoImg;
            delete customerObj[nameInfo + '_img'];
        });

        let blackPhoneList = reqObj['black_phone_list'] ? reqObj['black_phone_list'] : '';
        delete customerObj['black_phone_list'];

        let newId = (await mysql.insertOne('customers', customerObj));

        //푸시테이블에 추가
        await mysql.insertOne('push_config', {
            uid: newId
        });

        //서류심사 등록
        for(let typeIndex = 0 ; typeIndex < nameList.length ; typeIndex ++){
            let nameInfo = nameList[typeIndex];
            
            let key = nameInfo + "_img";
            let imgArr = certImageList[key].split(",");
            let certDocInfo = {};
            certDocInfo['uid'] = newId;
            certDocInfo['type'] = typeIndex + 1;
            certDocInfo['state'] = 0;
            certDocInfo['is_register'] = 'Y';

            if (certImageList[key] == '')
                continue;

            for(let i = 0 ; i < imgArr.length ; i ++){
                let cKey = 'cert_img' + (i + 1);
                certDocInfo[cKey] = imgArr[i];
            }

            await mysql.insertOne('cert_document', certDocInfo);
        }


        //프로필 이미지 등록
        let certProfileImgInfo = {};
        certProfileImgInfo['uid'] = newId;
        certProfileImgInfo['state'] = 0;
        certProfileImgInfo['is_register'] = 'Y';

        let i = 1;
        for(let i = 0 ; i < certProfileImageList.length ; i ++){
            let key = 'cert_img' + (i+1);
            certProfileImgInfo[key] = certProfileImageList[i];
        }

        await mysql.insertOne('cert_profile_img', certProfileImgInfo);

        //put black phone address in address_list
        if (blackPhoneList != '') {
            let blackPhoneInfo = {
                uid: newId,
                phone_num_list: blackPhoneList
            };

            await mysql.insertOne('black_phone_list', blackPhoneInfo);
        }


        //초대코드
        if (inputInviteCode != '') {

            //find user that input invite_code

            let inviterInfo = await mysql.findOne('customers', {
                invite_code: inputInviteCode
            }, "id, nick_name");
            if (!inviterInfo) {
                return res.json({
                    'status': '0',
                    'msg': '초대코드가 옳바르지 않습니다.'
                });
            }

            let inviteCodeData = {};
            inviteCodeData['uid'] = inviterInfo['id'];
            inviteCodeData['target_uid'] = newId;
            inviteCodeData['invite_code'] = inputInviteCode;
            await mysql.insertOne('invite_code_history', inviteCodeData);

            //다이아 결제
            let historyRet = await DiamondHistoryModel.InsertHistory(inviterInfo['id'], Global.AMOUNT_INVITE_CODE, 1, '초대자적립');
            if (!historyRet) {
                return res.json({
                    'status': '0',
                    'msg': '다이아결제가 실패하였습니다.'
                });
            }

            historyRet = await DiamondHistoryModel.InsertHistory(newId, Global.AMOUNT_INVITE_CODE, 1, inviterInfo['nick_name'] + '님에 의한 신규회원초대코드적립');
            if (!historyRet) {
                return res.json({
                    'status': '0',
                    'msg': '다이아결제가 실패하였습니다.'
                });
            }
        }

        return res.json({
            'status': '1',
            'msg': 'success',
            'uid': newId
        });
    },

    logout: function (req, res, next) {
        delete req.session.logined_user;
        console.log(req.session);
        res.redirect('/');
    },

    checkNickName: async function(req, res, next){
        let nameInfo = await mysql.findOne('customers', {nick_name: req.body.nick_name});
        if(nameInfo){
            return res.json({status: 2, msg: 'the nickname exist.'});
        }

        return res.json({status: 1, msg: 'success'});
    },

    reSignup: async function(req,res, next){
        let customerInfo = await mysql.findOne('customers', {email: req.body.email}, 'id');

        if(!customerInfo){
            return res.json({status: 0, msg: '이메일에 해당한 회원님이 존재하지 않습니다.'});
        }

        let customer_declare_check = await mysql.query('SELECT * FROM declare_customer WHERE target_uid='+customerInfo['id']+"  AND punish_type=1 AND expire_date>=NOW() ");
        if(customer_declare_check.length > 0){
            return res.json({status: 0, msg: '죄송합니다. 회원님은 지금 제재를 받고 있습니다. 재가입하실수 없습니다.'});
        }

        await mysql.updateOne("customers", {id: customerInfo['id']}, {is_allow: 0})

        return res.json({status: 1, msg:"success"});
    },

    getDocumentExample: async function(req,res,next){
        let data = await mysql.findAll("document_example", {});
        return res.json({status: 1, info_list: data});
    },

    checkInviteCode: async function(req, res, next){
        let retCount = await mysql.getCount("customers", {invite_code: req.body.invite_code});
        if(retCount > 0){
            return res.json({status: 1, msg: '초대코드가 존재합니다.'});
        }

        return res.json({status: 0, msg: '초대코드가 존재하지 않습니다.'});
    },

    getAreaList: async function (req, res, next){
        let areaList = await mysql.findAll("region", {parent_id: req.body.parent_id});
        return res.json({status: 1, info: areaList});
    }, 
}


module.exports = loginController;