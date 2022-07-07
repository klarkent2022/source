require('rootpath')();
let mysql = require('../../DB/mysql_Controller');
let moment = require('moment');
let injection = require('../../DB/data_injection');
let config = require('../../Config/index');
let CommonController = require('../CommonController');
const Global = require('../../Common/Global');
let DiamondHistoryModel = require('../../Model/DiamondHistoryModel');
let DailyCardTodayModel = require('../../Model/DailyCardTodayModel');

exports.getUser = async function (req, res, next) {
    var postObj = req.body;
    console.log(postObj);
    let ret = {
        status: '0',
        msg: "",
        info: null
    };

    //따져볼 날짜 계산
    let nowHour = moment().format('HH');
    let nowDate = moment().format('YYYY-MM-DD HH:mm:ss');
    var intHour = parseInt(nowHour);
    let startDateTime = "";
    if(intHour < 11){
        startDateTime = moment().subtract(1, 'days').format('YYYY-MM-DD 11:00:00');
    }
    else{
        startDateTime = moment().format('YYYY-MM-DD 11:00:00');
    }

    //평가한 유저 갯수
    let estimatedCount = await mysql.getCount('profile_estimate', 'uid=' + postObj.uid + ' AND created_at>"' + startDateTime + '"');
    if(estimatedCount >= 5)
    {
        ret.status = "2";
        ret.msg = "이미 5명을 평가하였습니다.";
        return res.json(ret);
    }

    //평가할 유저 아이디 얻기
    let willEstimateUser = await mysql.findOneOrderBY('profile_estimate_wait', {uid:postObj.uid}, 'target_uid', 'created_at', 'ASC');
    
    if(willEstimateUser == null)
    {
        ret.status = "0";
        ret.msg = "평가할 회원님이 없습니다.";
        return res.json(ret);
    }

    // ret.info = await mysql.findOneWithJoin('customers', 'customers.id=' + willEstimateUser['target_uid'], 'Left', 'cert_profile_img', 'customers.id=cert_profile_img.uid', 'customers.id, customers.nick_name, cert_profile_img.cert_img1, customers.has_import_car, customers.has_super_car, customers.has_gangnum_apart, customers.has_upperclass_apart, customers.has_special, customers.has_business, customers.has_official, customers.has_large_enterprise, customers.has_brand_college, customers.has_large_income, customers.has_very_large_income, customers.has_large_assets, customers.has_very_large_assets, customers.has_elite_home, customers.has_gold_home, customers.age, customers.area, customers.job, customers.scholarship');

    //블라인드 어픈 처리
    DailyCardTodayModel.OpenUser(postObj.uid, willEstimateUser['target_uid']);

    let customerProfile = await mysql.findOne('customers', {id:willEstimateUser['target_uid']});
    
    //get cert_document info
    let documentInfo = await mysql.findAll('cert_document', {uid:willEstimateUser['target_uid']}, 'type, cert_img1, cert_img2, cert_img3');
    customerProfile["document_info"] = documentInfo;

    console.log(customerProfile);
    
    ret.info = customerProfile;
    
    ret.status = "1";
    ret.msg = "success";
    return res.json(ret);
    
};

exports.setStars = async function (req, res, next) {
    var postObj = req.body;
    console.log(postObj);
    let ret = {
        status: '0',
        is_end: '0',
        msg: ""
    };

    var estimateCount = await mysql.getCount('profile_estimate', {uid:postObj.uid, target_uid:postObj.customer_id});
    if(estimateCount > 0){      //이미 평가하였으면
        ret.status = "0";
        ret.msg = "이미 평가하였습니다.";
        return res.json(ret);
    }

    let dataObj = {
        uid: postObj.uid,
        target_uid: postObj.customer_id,
        stars: postObj.stars
    };

    let result = await mysql.insertOne('profile_estimate', dataObj);

    await mysql.delete('profile_estimate_wait', {uid: postObj.uid, target_uid: postObj.customer_id});

    let nowHour = moment().format('HH');
    var intHour = parseInt(nowHour);
    let startDateTime = "";
    if(intHour < 11){
        startDateTime = moment().subtract(1, 'days').format('YYYY-MM-DD 11:00:00');
    }
    else{
        startDateTime = moment().format('YYYY-MM-DD 11:00:00');
    }

    //평가한 유저 갯수
    let estimatedCount = await mysql.getCount('profile_estimate', 'uid=' + postObj.uid + ' AND created_at>"' + startDateTime + '"');
    if(estimatedCount >= 5)
    {
        //다이아 결제
        let historyRet = await DiamondHistoryModel.InsertHistory(postObj.uid, Global.AMOUNT_PROFILE_ESTIMATE, 1, '프로필 평가');
        if(!historyRet){
            ret.is_end = '1';
            ret.status = "0";
            ret.msg = "다이아결제가 실패하였습니다.";
            return res.json(ret);
        }
        ret.is_end = '1';
    }

    ret.status = "1";
    ret.msg = "success";
    return res.json(ret);
    
};

// exports.getUser = async function (req, res, next) {
//     var postObj = req.body;
//     console.log(postObj);
//     let ret = {
//         status: '0',
//         msg: "",
//         info: null
//     };

//     //평가할 유저 리스트
//     let willEstimateList = await mysql.findAll('profile_estimate_wait', {uid:postObj.uid}, 'target_uid');
    

//     //이미 평가한 유저 리스트
//     let estimatedList = await mysql.findAll('profile_estimate', {uid:postObj.uid}, 'target_uid');
//     if(estimatedList && estimatedList.length >= 5)
//     {
//         ret.status = "2";
//         ret.msg = "이미 5명을 평가하였습니다.";
//         return res.json(ret);
//     }
//     if(!willEstimateList || willEstimateList.length == 0)
//     {
//         ret.status = "0";
//         ret.msg = "평가할 회원님이 없습니다.";
//         return res.json(ret);
//     }

//     //새로 평가할 유저 얻기
//     for(let key1 in willEstimateList){
//         var isExist = false;
//         for(let key2 in estimatedList){
//             if(willEstimateList[key1]['target_uid'] == estimatedList[key2]['target_uid']){
//                 isExist = true;
//                 break;
//             }
//         }
//         if(!isExist){
//             ret.info = await mysql.findOneWithJoin('customers', 'customers.id=' + willEstimateList[key1]['target_uid'], 'Left', 'cert_profile_img', 'customers.id=cert_profile_img.uid', 'customers.id, customers.nick_name, cert_profile_img.cert_img1, customers.has_import_car, customers.has_super_car, customers.has_gangnum_apart, customers.has_upperclass_apart, customers.has_special, customers.has_business, customers.has_official, customers.has_large_enterprise, customers.has_brand_college, customers.has_large_income, customers.has_very_large_income, customers.has_large_assets, customers.has_very_large_assets, customers.has_elite_home, customers.has_gold_home, customers.age, customers.area, customers.job, customers.scholarship');
//             break;
//         }
//     }
    
//     ret.status = "1";
//     ret.msg = "success";
//     return res.json(ret);
    
// };

// exports.setStars = async function (req, res, next) {
//     var postObj = req.body;
//     console.log(postObj);
//     let ret = {
//         status: '0',
//         msg: ""
//     };

//     var estimateCount = await mysql.getCount('profile_estimate', {uid:postObj.uid, target_uid:postObj.customer_id});
//     if(estimateCount > 0){      //이미 평가하였으면
//         ret.status = "0";
//         ret.msg = "이미 평가하였습니다.";
//         return res.json(ret);
//     }

//     let dataObj = {
//         uid: postObj.uid,
//         target_uid: postObj.customer_id,
//         stars: postObj.stars
//     };

//     let result = await mysql.insertOne('profile_estimate', dataObj);

//     ret.status = "1";
//     ret.msg = "success";
//     return res.json(ret);
    
// };



