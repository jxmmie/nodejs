const express = require('express');
const app = express();
const indexRouter = require('./api/routes/index');
const CustomerRouter = require('./api/routes/customer');
const Login = require('./api/routes/auth/login');
const Product = require('./api/routes/product');
const bodyParser = require('body-parser');
const conn = require('./dbconn');
const bcrypt = require('bcrypt');


app.use(bodyParser.json());
app.use('/', indexRouter);
app.use('/customer', CustomerRouter);
app.use('/product', Product);
app.use('/auth', Login);



module.exports = app;