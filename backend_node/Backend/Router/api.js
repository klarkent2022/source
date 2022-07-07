//change by cyh

require('rootpath')();

const request = require('request');
let mysql = require('../DB/mysql_Controller');
var multer = require('multer')
let moment = require('moment');
var fs = require('fs');

let LoginApiController = require('../Controller/Api/LoginApiController');
let CommunityApiController = require('../Controller/Api/CommunityApiController');
let PartyApiController = require('../Controller/Api/PartyApiController');
let DailycardApiController = require('../Controller/Api/DailycardApiController');
let MatchHistoryApiController = require('../Controller/Api/MatchHistoryApiController');
let CommonController = require('../Controller/CommonController');
let ChatController = require('../Controller/Api/ChattingController');
let SettingController = require('../Controller/Api/SettingController');
let ProfileEstimateController = require('../Controller/Api/ProfileEstimateApiController');



let checkRememberToken = async function(req, res, next) {

    let user = await mysql.findOne('customers', { id: req.body.uid, remember_token: req.body.remember_token });

    if (!user) {
        var ret = {
            status: '0',
            msg: "Auth error"
        };
        return res.json(ret);
    }
    let stateInfoList = await mysql.findAll('declare_customer', 'target_uid=' + req.body.uid + ' AND expire_date>=NOW()', 'punish_type');
    for (let key in stateInfoList) {
        if (stateInfoList[key]['punish_type'] == 1) {
            var ret = {
                status: '9',
                msg: "이용 정지 상태입니다."
            };
            return res.json(ret);
        } else if (stateInfoList[key]['punish_type'] == 2) {
            var pos = req.url.indexOf('daily/');
            if (pos != -1) {
                var posProfile = req.url.indexOf('daily/getProfile');
                if (posProfile === false) {
                    var ret = {
                        status: '0',
                        msg: "회원님은 데일리카드이용 정지 상태입니다."
                    };
                    return res.json(ret);
                }
            }
        } else if (stateInfoList[key]['punish_type'] == 3) {
            var pos = req.url.indexOf('community/');
            if (pos != -1) {
                var ret = {
                    status: '0',
                    msg: "회원님은 커뮤니티이용 정지 상태입니다."
                };
                return res.json(ret);
            }
        } else if (stateInfoList[key]['punish_type'] == 4) {
            var pos = req.url.indexOf('party/');
            if (pos != -1) {
                var ret = {
                    status: '0',
                    msg: "회원님은 파티이용 정지 상태입니다."
                };
                return res.json(ret);
            }
        }
    }

    next();
}

var upload = multer({ dest: 'uploads/' });

var communityImgStorage = multer.diskStorage({
    destination: 'uploads/community/',
    filename: function(req, file, cb) {
        cb(null, Date.now() + "_" + file.originalname)
    }
});

var partyImgStorage = multer.diskStorage({
    destination: 'uploads/party/',
    filename: function(req, file, cb) {
        cb(null, Date.now() + "_" + file.originalname)
    }
});

var communityImgUpload = multer({ storage: communityImgStorage });
var partyImgUpload = multer({ storage: partyImgStorage });


var commonImgUpload = function(dir = "") {
    return multer({
        storage: multer.diskStorage({
            destination: 'uploads/' + dir,
            filename: function(req, file, cb) {
                cb(null, Date.now() + "_" + file.originalname)
            }
        })
    });
}

module.exports = function(app) {

    //Community
    app.post('/api/community/create', communityImgUpload.single('img'), checkRememberToken, CommunityApiController.createCommunity);
    app.post('/api/community/getMainList', checkRememberToken, CommunityApiController.getMainList);
    app.post('/api/community/createFeedback', checkRememberToken, CommunityApiController.createFeedback);
    app.post('/api/community/likeCommunity', checkRememberToken, CommunityApiController.likeCommunity);
    app.post('/api/community/likeFeedback', checkRememberToken, CommunityApiController.likeFeedback);
    app.post('/api/community/getInfo', checkRememberToken, CommunityApiController.getInfo);
    app.post('/api/community/sendFav', checkRememberToken, CommunityApiController.sendFav);
    app.post('/api/community/openProfile', checkRememberToken, CommunityApiController.openProfile);
    app.post('/api/community/receiveFav', checkRememberToken, CommunityApiController.receiveFav);
    app.post('/api/community/getMyList', checkRememberToken, CommunityApiController.getMyList);
    app.post('/api/community/declareCommunity', checkRememberToken, CommunityApiController.declareCommunity);
    app.post('/api/community/declareCommunity1', checkRememberToken, CommunityApiController.declareCommunity1);
    app.post('/api/community/declareFeedback', checkRememberToken, CommunityApiController.declareFeedback);
    app.post('/api/community/deleteCommunity', checkRememberToken, CommunityApiController.deleteCommunity);
    app.post('/api/community/deleteFeedback', checkRememberToken, CommunityApiController.deleteFeedback);

    //Party
    app.post('/api/party/create', partyImgUpload.single('img'), checkRememberToken, PartyApiController.createParty);
    app.post('/api/party/getAllList', checkRememberToken, PartyApiController.getAllList);
    app.post('/api/party/getListByCreate', checkRememberToken, PartyApiController.getListByCreate);
    app.post('/api/party/getListByJoin', checkRememberToken, PartyApiController.getListByJoin);
    app.post('/api/party/getSearchList', checkRememberToken, PartyApiController.getSearchList);
    app.post('/api/party/joinParty', checkRememberToken, PartyApiController.joinParty);
    app.post('/api/party/openProfile', checkRememberToken, PartyApiController.openProfile);
    app.post('/api/party/getInfo', checkRememberToken, PartyApiController.getInfo);
    app.post('/api/party/allowPartyJoin', checkRememberToken, PartyApiController.allowPartyJoin);
    app.post('/api/party/declareParty', checkRememberToken, PartyApiController.declareParty);
    app.post('/api/party/declareParty1', checkRememberToken, PartyApiController.declareParty1);
    app.post('/api/party/likeParty', checkRememberToken, PartyApiController.likeParty);
    app.post('/api/party/getEventInfo', checkRememberToken, PartyApiController.getEventInfo);
    

    //Dailycard
    app.post('/api/daily/getTodayCard', checkRememberToken, DailycardApiController.getTodayCard);
    app.post('/api/daily/getLastCard', checkRememberToken, DailycardApiController.getLastCard);
    app.post('/api/daily/getProfile', checkRememberToken, DailycardApiController.getProfile);
    app.post('/api/daily/declareCustomer', checkRememberToken, DailycardApiController.declareCustomer);
    app.post('/api/daily/removeCustomer', checkRememberToken, DailycardApiController.removeCustomer);
    app.post('/api/daily/sendStars', checkRememberToken, DailycardApiController.sendStars);
    app.post('/api/daily/sendFav', checkRememberToken, DailycardApiController.sendFav);
    app.post('/api/daily/receiveFav', checkRememberToken, DailycardApiController.receiveFav);
    app.post('/api/daily/openAddress', checkRememberToken, DailycardApiController.openAddress);

    //MatchHistory
    app.post('/api/match/getProfileEstimateList', checkRememberToken, MatchHistoryApiController.getProfileEstimateList);
    app.post('/api/match/getFavList', checkRememberToken, MatchHistoryApiController.getFavList);
    app.post('/api/match/getMatchList', checkRememberToken, MatchHistoryApiController.getMatchList);


    //Common
    app.post('/api/login', LoginApiController.postLogin);
    app.post('/api/signup', LoginApiController.postRegister);
    app.post('/api/checkNickName', LoginApiController.checkNickName);
    app.post('/api/reSignup', LoginApiController.reSignup);
    app.post('/api/uploadProfileImage', commonImgUpload("avatar").fields([{ name: 'img1', maxCount: 1 }, { name: 'img2', maxCount: 1 }, { name: 'img3', maxCount: 1 }, { name: 'img4', maxCount: 1 }, { name: 'img5', maxCount: 1 }]), CommonController.commonUploadImage);
    app.post('/api/uploadDocumentImage', commonImgUpload("document").fields([{ name: 'img1', maxCount: 1 }, { name: 'img2', maxCount: 1 }, { name: 'img3', maxCount: 1 }]), CommonController.commonUploadImage);
    app.post('/api/uploadChattingImage', commonImgUpload("chat").fields([{ name: 'img1', maxCount: 1 }]), CommonController.commonUploadImage);
    app.post('/api/getDocumentExample', LoginApiController.getDocumentExample);
    app.post('/api/checkInviteCode', LoginApiController.checkInviteCode);
    app.post('/api/getAreaList', LoginApiController.getAreaList);
    app.post('/api/pushTest', CommonController.pushTest);
    app.post('/api/getNoticeList', CommonController.getNoticeList);

    //Chatting
    app.post('/api/chat/getManagerList', checkRememberToken, ChatController.getChatManagerList);

    app.post('/api/chat/getPetPlaces',  ChatController.getPetPlaces);
    app.post('/api/chat/getPetPlaces1',  ChatController.getPetPlaces1);
    app.post('/api/chat/checkLogin',  ChatController.checkLogin);
    app.post('/api/chat/regUser',  ChatController.regUser);

    app.post('/api/chat/AddPetActivities',  partyImgUpload.single('fileData'), ChatController.AddPetActivities);
    app.post('/api/chat/AddPetMeets', partyImgUpload.single('fileData'),  ChatController.AddPetMeets);
    app.post('/api/chat/AddPetFeeds', partyImgUpload.single('fileData'),  ChatController.AddPetFeeds);
    app.post('/api/chat/AddChatting1',  ChatController.AddChatting1);
    app.post('/api/chat/AddChatting2',  ChatController.AddChatting2);

    app.post('/api/chat/getPetChatting1',  ChatController.getPetChatting1);
    app.post('/api/chat/getPetChatting2',  ChatController.getPetChatting2);

    app.post('/api/chat/getPetActivities',  ChatController.getPetActivities);
    app.post('/api/chat/getPetMeets',  ChatController.getPetMeets);
    app.post('/api/chat/getPetUser',  ChatController.getPetUser);
    app.post('/api/chat/getPetUserBank',  ChatController.getPetUserBank);
    app.post('/api/chat/AddPetBank',  ChatController.AddPetBank);
    app.post('/api/chat/updatePetUser',  ChatController.updatePetUser);
    app.post('/api/chat/getPetFeeds',  ChatController.getPetFeeds);
    app.post('/api/chat/updatePetUser',  ChatController.updatePetUser);

    app.post('/api/chat/getChatList', checkRememberToken, ChatController.getChatListWithManager);
    app.post('/api/chat/getMyManagerId', checkRememberToken, ChatController.getMyManagerId);
    app.post('/api/chat/sendChat', checkRememberToken, ChatController.sendChatToAdmin);
    app.post('/api/chat/sendChatToUser', ChatController.sendChatToUser);
    app.post('/api/chat/getUnreadChatList', checkRememberToken, ChatController.getUnreadChatList);
    app.post('/api/chat/getCoupleManager', checkRememberToken, ChatController.getCoupleManager);

    //Setting
    app.post('/api/setting/submitProfileImage', checkRememberToken, SettingController.submitProfileImage);
    app.post('/api/setting/submitMainInfo', checkRememberToken, SettingController.submitMainInfo);
    app.post('/api/setting/submitDocumentInfo', checkRememberToken, SettingController.submitDocumentInfo);
    app.post('/api/setting/submitSoInfo', checkRememberToken, SettingController.submitSoInfo);
    app.post('/api/setting/getPushInfo', checkRememberToken, SettingController.getPushInfo);
    app.post('/api/setting/setPushInfo', checkRememberToken, SettingController.setPushInfo);
    app.post('/api/setting/setPassInfo', checkRememberToken, SettingController.setPassInfo);
    app.post('/api/setting/setFreeState', checkRememberToken, SettingController.setFreeState);
    app.post('/api/setting/setExitState', checkRememberToken, SettingController.setExitState);
    app.post('/api/setting/getInviteCodeInfo', checkRememberToken, SettingController.getInviteCodeInfo);
    app.post('/api/setting/setBlackPhoneList', checkRememberToken, SettingController.setBlackPhoneList);
    app.post('/api/setting/chargeDiamond', checkRememberToken, SettingController.chargeDiamond);
    app.post('/api/setting/getAlarmList', checkRememberToken, SettingController.getAlarmList);
    app.post('/api/setting/getDiamondInfo', checkRememberToken, SettingController.getDiamondInfo);
    app.post('/api/setting/setSocketId', checkRememberToken, SettingController.setSocketId);
    app.post('/api/setting/sendPunishInfo', SettingController.sendPunishInfo);

    //ProfileEstimate
    app.post('/api/profile/getUser', checkRememberToken, ProfileEstimateController.getUser);
    app.post('/api/profile/setStars', checkRememberToken, ProfileEstimateController.setStars);




    app.post('/upload',upload.single('fileData'), (req, res,next) => {
        console.log(req.file);//this will be automatically set by multer
        console.log(req.body);
        //below code will read the data from the upload folder. Multer     will automatically upload the file in that folder with an  autogenerated name
        fs.readFile(req.file.path,(err, contents)=> {
         if (err) {
         console.log('Error: ', err);
        }else{
         console.log('File contents ',contents);
        }
       });
      });
}