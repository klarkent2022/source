require("rootpath")();
var colorLog = require("../Log/color_log.js");

let Mysql = require('./mysql_Controller');

exports.getCustomers = async function(obj) {
    let result = await Mysql.findAll("customers", obj);
    return result;
}

exports.getBlackPhoneList = async function(obj) {
    let result = await Mysql.findOne("black_phone_list", obj);
    if (result)
        return result.phone_num_list;
    return "";
}

exports.getDailyCardSettings = async function() {
    let result = await Mysql.findAll("dailycard_setting", {});
    return result;
}

exports.updateDailyCardSettings = async function(where, obj) {
    await Mysql.updateOne("dailycard_setting", where, obj);
}

var getCustomerIds = async function(g, id, reg, cnt, ph, ruids, ruids1) {


    

    let gender = g == "0" ? "1" : "0";
    let ids = await Mysql.queryWithSelect("select id, phone from customers where is_allow = 1 and area like '" + reg + "%' and sex = '" + gender + "' and id != " + id);
    
    let idArray = [];
    for (let i = 0; i < ids.length; i++) {
        let isContainPhone = containValue(ph.split(","), ids[i].phone);
        let isContainReceiveUids = containValue(ruids, ids[i].id);
        
        let isMatchingId = await isMatching(ids[i].id, id);
        if (!isContainPhone && !isMatchingId && !isContainReceiveUids)
            if(idArray.length < cnt)
                idArray.push(ids[i].id);
    }

    if(id == 36)
        console.log('36회원 ' + idArray);

    if (idArray.length < cnt) {
        colorLog.Normal("다른 지역 카드 발급");
        let fReg = reg.split(" ")[0];
        ids = await Mysql.queryWithSelect("select id, phone from customers where is_allow = 1 and sex = '" + gender + "' and id != " + id);

        for (let i = 0; i < ids.length; i++) {
            let isContainPhone = containValue(ph.split(","), ids[i].phone);
            let isContainReceiveUids = containValue(ruids, ids[i].id);
            let isMatchingId = await isMatching(ids[i].id, id);
            
            if (!isContainPhone && !isMatchingId && !isContainReceiveUids)
                if(idArray.length < cnt)
                    idArray.push(ids[i].id);
        }
    }

    if(id == 36)
        console.log('36회원 ' + idArray);

    for (let i = 0; i < ruids1.length; i++) {
        idArray.push(ruids[i]);
    }

    if(id == 36)
        console.log('36회원 ' + idArray);

    return idArray.join(',');
}

var isMatching = async function(u, t) {
    let data = await Mysql.queryWithSelect("SELECT * FROM estimate WHERE ( uid = " + u + " AND target_uid = " + t + " ) OR ( uid = " + t + " AND target_uid = " + u + " )");

    if (data.length > 0) return true;
    return false;
}

exports.updateDailyCardToday = async function(customer, region, card_count) {
    let id = customer.id;

    let gender = customer.sex;

    let blackPhoneList = await this.getBlackPhoneList({
        uid: id
    });

    colorLog.Normal("**** " + id + " 회원에게 발송 START ****");
    let todayCard = {
        uid: id,
        target_uids: ""
    };

    let receiveUids = await receiveIdList(id);
    let receiveUids1 = await receiveIdList1(id);
    todayCard['target_uids'] = await getCustomerIds(gender, id, region, card_count, blackPhoneList, receiveUids, receiveUids1);
    colorLog.Normal("ids: " + todayCard['target_uids']);

    let result = await Mysql.findOne("dailycard_today", { uid: id });
    if (result) {
        let todayUpdate = await Mysql.updateOne("dailycard_today", { uid: id }, todayCard);
        colorLog.Normal("오늘 카드갱신 성공");

    } else {
        let todayInsert = await Mysql.insertOne("dailycard_today", todayCard);

        colorLog.Normal("오늘 카드추가 성공");
    }
    colorLog.Normal("**** " + id + " 회원에게 발송  END  ****");
}

var containValue = function(arr, id) {
    let res = false;
    for (let i = 0; i < arr.length; i++)
        if (arr[i] == id) res = true;
    return res;
}
var mergeIds = function(c, n) {
    let curIds = c.split(',');
    let newIds = n.split(',');

    if (c == "" || c == null) curIds = [];
    if (n == "" || c == null) newIds = [];

    let resIds = [];
    for (let i = 0; i < curIds.length; i++) {
        resIds.push(curIds[i]);
    }

    for (let i = 0; i < newIds.length; i++) {
        if (!containValue(curIds, newIds[i]))
            resIds.push(newIds[i]);
    }
    return resIds;
}

var receiveIdList = async function(id) {
    let targetUids = await Mysql.findOne("dailycard_today", {
        uid: id
    }, "target_uids");
    let uidArray = [];
    if (targetUids && targetUids['target_uids'] != '') {
        let tArray = targetUids['target_uids'].split(",");
        tArray.forEach(element => {
            uidArray.push(parseInt(element));
        });
    }
    let lastUids = await Mysql.findAll("dailycard_last", {
        uid: id
    });
    for (let i = 0; i < lastUids.length; i++) {
        uidArray.push(lastUids[i].target_uid);
    }

    return uidArray;
}

var receiveIdList1 = async function(id) {
    let targetUids = await Mysql.findOne("dailycard_today", {
        uid: id
    }, "target_uids");
    let uidArray = [];
    if (targetUids && targetUids['target_uids'] != '') {
        let tArray = targetUids['target_uids'].split(",");
        tArray.forEach(element => {
            uidArray.push(parseInt(element));
        });
    }

    return uidArray;
}

exports.getExitCustomers = async function() {
    let sql = "SELECT uid FROM exit_customers WHERE NOW() >= ADDDATE(created_at,3)";
    let result = await Mysql.queryWithSelect(sql);
    return result;
}

exports.setExitCustomer = async function(id) {
    let result = await Mysql.updateOne("customers", {
        id: id
    }, {
        is_allow: 4
    });
    if (result) {
        colorLog.Normal(id + "번 회원 탈퇴 성공");
        await Mysql.delete("exit_customers", {
            uid: id
        });
    } else {
        colorLog.Normal(id + "번 회원 탈퇴 실패");
    }
}

exports.getDailyCard = async function() {
    let result = await Mysql.findAll("dailycard_today", {});
    return result;
}

exports.addDailyCardLast = async function(card) {
    let resDate = new Date(card['updated_at']);
    let result = card;

    let nowDate = new Date();
    if ((nowDate.getFullYear() == resDate.getFullYear()) && (nowDate.getMonth() == resDate.getMonth()) && (nowDate.getDate() == resDate.getDate())) {} else {
        // 추가
        let openUIdsArray = result['open_uids'].split(',');
        for (let j = 0; j < openUIdsArray.length && result['open_uids'] != ""; j++) {
            let lastUid = await Mysql.findOne("dailycard_last", {
                uid: result['uid'],
                target_uid: openUIdsArray[j]
            });
            if (!lastUid) {
                let lastInsert = await Mysql.insertOne("dailycard_last", {
                    uid: result['uid'],
                    target_uid: openUIdsArray[j]
                });

                let lastMsg = result['uid'] + "-" + openUIdsArray[j] + " 지난 카드추가";
                colorLog.Normal(lastMsg + " 성공");
            }
        }
        let todayUpdate = await Mysql.updateOne("dailycard_today", {
            uid: result['uid']
        }, {
            target_uids: "",
            open_uids: ""
        });
        // let todayMsg = result['uid'] + " 오늘 카드 초기화";
        // if (todayUpdate) colorLog.Normal(todayMsg + " 성공");
        // else colorLog.Error(todayMsg + " 실패");
    }
}

exports.deleteDailyCardLast = async function() {
    let sql = "SELECT * FROM dailycard_last WHERE NOW() >= ADDDATE(created_at,7)";
    let result = await Mysql.queryWithSelect(sql);
    for (let i = 0; i < result.length; i++) {
        await Mysql.delete("dailycard_last", {
            uid: result[i].uid,
            target_uid: result[i].target_uid
        });
        colorLog.Normal(result[i].uid + "-" + result[i].target_uid + "지난 카드 삭제");
    }
}

// 프로필평가-> 유저아이디 추가
exports.sendUidProfileCheck = async function() {
    colorLog.Normal("**** 프로필평가카드 발송 START ****");
    // let count = await Mysql.getCount("profile_estimate_wait", {});
    // if (count != 0) {
    //     await Mysql.delete("profile_estimate_wait", {});
    // }

    let customers = await Mysql.findAll("customers", {
        is_allow: 1
    });

    for (let i = 0; i < customers.length; i++) {
        let profileCnt = await Mysql.getCount("profile_estimate_wait", { uid: customers[i].id});
        let whereSql = " 1=1 ";
        if (customers[i].sex == '0'){
            whereSql += " AND sex = '1' ";
        }
        else {
            whereSql += " AND is_allow = 1 AND sex = '0' ";
        }

        let estimateList = await Mysql.findAll("profile_estimate", { uid: customers[i].id });
        let estimateWaitList = await Mysql.findAll("profile_estimate_wait", { uid: customers[i].id });
        let estimateIds = [];
        for (let item of estimateList){
            estimateIds.push(item["target_uid"]);
        }
        for (let item of estimateWaitList) {
            if (!containValue(estimateIds, item["target_uid"]))
                estimateIds.push(item["target_uid"]);
        }
        let favList = await Mysql.findAll("estimate", { uid: customers[i].id });
        for (let item of favList) {
            if (!containValue(estimateIds, item["target_uid"]))
                estimateIds.push(item["target_uid"]);
        }
        favList = await Mysql.findAll("estimate", { target_uid: customers[i].id });
        for (let item of favList) {
            if (!containValue(estimateIds, item["uid"]))
                estimateIds.push(item["uid"]);
        }

        if (estimateIds.length > 0) {
            whereSql += " AND id NOT IN (" + estimateIds.join() + ")";
        }

        let profileCheckUids = await Mysql.queryWithSelect("SELECT * FROM customers WHERE " + whereSql + " ORDER BY RAND() LIMIT " + (5 - profileCnt));

        let ids = [];
        for (let j = 0; j < profileCheckUids.length; j++) {
            ids.push(profileCheckUids[j].id);
            await Mysql.insertOne("profile_estimate_wait", {
                uid: customers[i].id,
                target_uid: profileCheckUids[j].id
            });
        }

        colorLog.Normal(customers[i].id + "회원님 프로필평가카드 발송 성공(" + ids.join(",") + ")");
    }
    colorLog.Normal("**** 프로필평가카드 발송 END ****");
}