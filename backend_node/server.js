var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var session = require('express-session');
var fs = require('fs');
var path = require('path');
var config = require('./Backend/Config/index');
var parseFile = function (file, req) {
    var parsedFile = path.parse(file),
        fullUrl = req.protocol + '://' + req.get('host') + '/uploads/';

    return {
        name: parsedFile.name,
        base: parsedFile.base,
        extension: parsedFile.ext.substring(1),
        url: fullUrl + parsedFile.base,
        size: bytes(fs.statSync(file).size)
    };
};

require('rootpath')();

app.set('views', __dirname + '/frontend');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

var server = app.listen(config.port, function () {
    console.log("######################################################");
    console.log("##  Express Server has started on port " + config.port + ".   ##");
    console.log("######################################################");
});

app.use(express.static("frontend/client"));
app.use(express.static("frontend/admin"));
app.use(express.static("uploads"));

app.use(bodyParser.json({
    limit: '50mb'
}));
app.use(bodyParser.urlencoded({extended: false}));

app.use(session({
    secret: '@#@$MYSIGN#@$#$',
    resave: true,
    saveUninitialized: true
}));

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', '*');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

require('./Backend/Router/api')(app, fs);
require('./Backend/Router/socket_api')(server);
require('./card_trans');

// let mysql = require('./backend/DB/mysql_Controller');
// mysql.query("update tbl_rooms set cur_user_count = 1,cur_user_id = 0;");
// mysql.query("DELETE FROM tbl_current_users;");