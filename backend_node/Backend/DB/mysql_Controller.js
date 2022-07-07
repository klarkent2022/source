const mysql = require('mysql2');
const config = require('../Config/index');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(config.db.database, config.db.user, config.db.password, {
    dialect: 'mysql',
    host: config.db.host,
    port: config.db.port,
    operatorsAliases: 0,
    logging: false,
    // timezone: 'Asia/Seoul',
    timezone: '+09:00',
});

function getWhereSqlFromObj(obj, connector = 'AND') {


    let where_sql = "1=1";
    if (typeof obj == 'string') {
        where_sql = obj;
    } else {
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (typeof obj[key] == 'string') {
                    where_sql += ` ${connector} ${key}='${obj[key]}'`;
                } else {
                    where_sql += ` ${connector} ${key}=${obj[key]}`;
                }
            }
        }
    }
    return where_sql;
}

function getJoinSqlFromObj(joinTypeObj, joinTableObj, joinConditionObj) {
    let join_sql = "";
    if (typeof joinTypeObj == 'string') {
        join_sql = " " + joinTypeObj + ' JOIN ' + joinTableObj + ' ON(' + joinConditionObj + ')';
    } else {
        for (let key in joinTypeObj) {
            if (joinTypeObj.hasOwnProperty(key)) {
                if (typeof joinTypeObj[key] == 'string') {
                    join_sql += " " + joinTypeObj[key] + ' JOIN ' + joinTableObj[key] + ' ON(' + joinConditionObj[key] + ')';
                }
            }
        }
    }
    return join_sql;
}


exports.findWhere = async function (table, wheres, selects = '*', ) {
    let where_sql = getWhereSqlFromObj(wheres);
    let strSQL = `SELECT ${selects} FROM ${table} WHERE ${where_sql}`;
    return await sequelize.query(strSQL, {
        type: Sequelize.QueryTypes.SELECT
    });
}

exports.findWhereOrderBY = async function (table, wheres, selects = '*', order_by, order_dir = "DESC") {
    let where_sql = getWhereSqlFromObj(wheres);
    let strSQL = `SELECT ${selects} FROM ${table} WHERE ${where_sql} ORDER BY ${order_by} ${order_dir}`;
    return await sequelize.query(strSQL, {
        type: Sequelize.QueryTypes.SELECT
    });
}

exports.findOrderBY = async function (table, selects = '*', order_by, order_dir = "DESC") {
    let strSQL = `SELECT ${selects} FROM ${table} ORDER BY ${order_by} ${order_dir}`;
    return await sequelize.query(strSQL, {
        type: Sequelize.QueryTypes.SELECT
    });
}

exports.findLimitOffset = async function (table, wheres, selects = '*', limit = 0, offset = 0, order_by, order_dir = "DESC") {
    let where_sql = getWhereSqlFromObj(wheres);
    let strSQL = `SELECT ${selects} FROM ${table} WHERE ${where_sql} ORDER BY ${order_by} ${order_dir} LIMIT ${limit} OFFSET ${offset}`;
    return await sequelize.query(strSQL, {
        type: Sequelize.QueryTypes.SELECT
    });
}

exports.findAll = async function (table, wheres, selects = '*', conenctor = 'AND') {
    try {
        let where_sql = typeof wheres == "string" ? wheres : getWhereSqlFromObj(wheres);
        let strSQL = `SELECT ${selects} FROM ${table} WHERE ${where_sql}`;
        
        return await sequelize.query(strSQL, {
            type: Sequelize.QueryTypes.SELECT
        });
    } catch (e) {
        console.log(e);
        return null;
    }
};

exports.findAll1 = async function (table, wheres, selects = '*', conenctor = 'AND') {
    try {
        let where_sql = typeof wheres == "string" ? wheres : getWhereSqlFromObj(wheres);
        let strSQL = `SELECT ${selects} FROM ${table} WHERE ${where_sql} ORDER BY RAND() LIMIT 10`;
        
        return await sequelize.query(strSQL, {
            type: Sequelize.QueryTypes.SELECT
        });
    } catch (e) {
        console.log(e);
        return null;
    }
};

exports.findOne = async function (table, wheres, selects = '*') {
    try {
        let where_sql = getWhereSqlFromObj(wheres);
        let strSQL = `SELECT ${selects} FROM ${table} WHERE ${where_sql}`;
        let results = await sequelize.query(strSQL, {
            type: Sequelize.QueryTypes.SELECT
        });
        if (results.length > 0) {
            return results[0];
        } else {
            return null;
        }
    } catch (e) {
        console.log(e);
        return null;
    }
};

exports.findLastOne = async function (table, wheres, selects = '*') {
    let where_sql = getWhereSqlFromObj(wheres);
    let strSQL = `SELECT ${selects} FROM ${table} WHERE ${where_sql}`;
    let results = await sequelize.query(strSQL, {
        type: Sequelize.QueryTypes.SELECT
    });
    if (results.length > 0) {
        return results[results.length - 1];
    } else {
        return null;
    }
};

exports.findOneOrderBY = async function (table, wheres, selects = '*', order_by, order_dir = "DESC") {
    try {
        let where_sql = typeof wheres == "string" ? wheres : getWhereSqlFromObj(wheres);
        let strSQL = `SELECT ${selects} FROM ${table} WHERE ${where_sql} ORDER BY ${order_by} ${order_dir}`;
        let results = await sequelize.query(strSQL, {
            type: Sequelize.QueryTypes.SELECT
        });
        if (results.length > 0) {
            return results[0];
        } else {
            return null;
        }
    } catch (e) {
        console.log(e);
        return null;
    }
};

exports.findWithJoin = async function (table, wheres, joinType, joinTable, joinWhere, selects = '*') {
    let where_sql = getWhereSqlFromObj(wheres);
    let join_sql = getJoinSqlFromObj(joinType, joinTable, joinWhere);
    let strSQL = `SELECT ${selects} FROM ${table} ${join_sql} WHERE ${where_sql}`;

    return await sequelize.query(strSQL, {
        type: Sequelize.QueryTypes.SELECT
    });
};

exports.findOneWithJoin = async function (table, wheres, joinType, joinTable, joinWhere, selects = '*') {
    let where_sql = getWhereSqlFromObj(wheres);
    let join_sql = getJoinSqlFromObj(joinType, joinTable, joinWhere);
    let strSQL = `SELECT ${selects} FROM ${table} ${join_sql} WHERE ${where_sql}`;

    let results = await sequelize.query(strSQL, {
        type: Sequelize.QueryTypes.SELECT
    });
    if (results.length > 0) {
        return results[0];
    } else {
        return null;
    }
};

exports.findWithJoinAndOrderBY = async function (table, wheres, joinType, joinTable, joinWhere, order_by, order_dir = "DESC", selects = '*') {
    let where_sql = getWhereSqlFromObj(wheres);
    let join_sql = getJoinSqlFromObj(joinType, joinTable, joinWhere);
    let strSQL = `SELECT ${selects} FROM ${table} ${join_sql} WHERE ${where_sql} ORDER BY ${order_by} ${order_dir}`;

    return await sequelize.query(strSQL, {
        type: Sequelize.QueryTypes.SELECT
    });
};


let pool = mysql.createPool(config.db);
exports.selectWithPagination = function (table, params, callback) {

    let where_sql = getWhereSqlFromObj(params.wheres);

    let base_wheres = params.base_wheres,
        base_sql = '1=1';

    if (typeof base_wheres == 'string') { //총개수와 검색개수가 잘얻어 지지 않는 문제 때문에....
        if (base_wheres != "") {
            base_sql += ` AND ${base_wheres}`;
        }
    } else {
        for (let key in base_wheres) {
            if (base_wheres.hasOwnProperty(key)) {
                if (typeof base_wheres[key] == 'string') {
                    base_sql += ` AND ${key}='${base_wheres[key]}'`;
                } else {
                    base_sql += ` AND ${key}=${base_wheres[key]}`;
                }
            }
        }
    }

    let likes = params.likes;

    if (typeof likes == 'string') {
        where_sql += ` and ${likes}`;
    } else {
        if (Object.keys(likes).length > 0) {
            where_sql += " and (1=2";
            for (let key in likes) {
                if (likes.hasOwnProperty(key)) {
                    where_sql += ` OR ${key} LIKE '%${likes[key]}%'`;
                }
            }
            where_sql += ")";
        }
    }

    var limit_sql = '';
    let page_size = (params.hasOwnProperty('pageSize')) ? params.pageSize : 10;
    if (!params.isAll) { //페이지사이즈와 시작값을 고려해야한다.
        limit_sql += `LIMIT ${(params.start - 1) * page_size},${page_size}`;
    }

    //todo; add JOIN parameters
    let joins = params.joins;
    let join_sql = '';
    if (typeof joins == 'string') {
        join_sql = joins;
    } else {
        for (let key in joins) {
            if (joins.hasOwnProperty(key)) {
                //table: {op: '', cond:''}, op: [inner, left, inner, right, full]
                join_sql += ` ${joins[key].op} JOIN ${key} ON ${joins[key].cond} `;
            }
        }
    }

    let selects = (params.hasOwnProperty('selects')) ? params.selects : '*';
    let order_field = (params.hasOwnProperty('order_field')) ? params.order_field : 'id';
    let order_dir = (params.hasOwnProperty('order_dir')) ? params.order_dir : 'ASC';

    let data_sql = `SELECT ${selects} FROM ${table} ${join_sql} WHERE ${where_sql} AND ${base_sql} ORDER BY ${order_field} ${order_dir} ${limit_sql}`;


    data_sql += `;SELECT COUNT(*) data_count FROM ${table} ${join_sql} WHERE ${where_sql} AND ${base_sql}`;
    data_sql += `;SELECT COUNT(*) all_count FROM ${table} ${join_sql} WHERE ${base_sql}`;

    pool.getConnection(function (err, conn) {
        if (!err) {
            var query = conn.query(data_sql, function (err, res) {
                if (err) {
                    console.log("2 " + err);
                } else {
                    callback(null, res);
                }
            });
        }
        conn.release();
    });
};



exports.insertOne = async function (table, params) {
    let sql = `INSERT INTO ${table}(`;
    let keys = Object.keys(params);
    if (keys.length == 0) return;
    sql += keys.join(',');
    sql += ') VALUES(';
    for (let i = 0; i < keys.length; i++) {
        if (i != 0) {
            sql += `, `;
        }

        //타입이 스트링이거나 데이트형일때
        if (typeof params[keys[i]] == 'string' || typeof params[keys[i]] == 'object') {
            sql += `'${params[keys[i]]}'`;
        } else {
            sql += `${params[keys[i]]}`;
        }
    }
    sql += ')';
    try {
        return (await sequelize.query(sql))[0];
    } catch (e) {
        console.log("6 Error: " + sql + "\n" + e);
        return false;
    }
};


exports.delete = async function (table, wheres) {
    let where_sql = typeof wheres == "string" ? wheres : getWhereSqlFromObj(wheres);
    let strSQL = `DELETE FROM ${table} WHERE ${where_sql}`;
    return await sequelize.query(strSQL, {
        type: Sequelize.QueryTypes.DELETE
    });
}



exports.updateOne = async function (table, wheres, data) {
    try {
        let where_sql = getWhereSqlFromObj(wheres);
        let sql = `UPDATE ${table} SET `;
        let keys = Object.keys(data),
            i;
        if (keys.length == 0) return;
        for (i = 0; i < keys.length; i++) {
            if (i != 0) {
                sql += `, `;
            }
            if (typeof data[keys[i]] == 'string') {
                sql += `${keys[i]}='${data[keys[i]]}'`;
            } else {
                sql += `${keys[i]}=${data[keys[i]]}`;
            }
        }
        sql += ` WHERE ${where_sql}`;
        await sequelize.query(sql);
    } catch (e) {
        console.log(e);
        return null;
    }
}


exports.query = async function (sql) {
    let res = await sequelize.query(sql);
    return res;
}

exports.queryWithSelect = async function (sql) {
    return await sequelize.query(sql, {
        type: Sequelize.QueryTypes.SELECT
    });
}

exports.getCount = async function (table, wheres) {
    try {
        let where_sql = getWhereSqlFromObj(wheres);
        let strSQL = `SELECT COUNT(*) cn FROM ${table} WHERE ${where_sql}`;
        let results = await sequelize.query(strSQL, {
            type: Sequelize.QueryTypes.SELECT
        });
        if (results.length > 0) {
            return parseInt(results[0]['cn']);
        } else {
            return 0;
        }
    } catch (err) {
        console.log(err);
        return 0;
    }
};