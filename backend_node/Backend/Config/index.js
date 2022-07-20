let config = {
    port: 3000,
    server_url: 'http://10.0.2.2:3000',
    db: {
        "host": "localhost",
        "user": "root",
        "password": "",
        "database": "pettime1",
        "connectionLimit": 30,
        "multipleStatements": true
    }
};
module.exports = config;