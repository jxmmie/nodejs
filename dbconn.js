const mysql      = require('mysql');

const pool = mysql.createPool({
    connectionLimit : 10,
    host     : '202.28.34.197',
    user     : 'ts_66011212178',
    password : '66011212178@csmsu',
    database : 'ts_66011212178'
  });

  module.exports = pool;