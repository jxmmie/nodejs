const express = require('express');
const router = express.Router();
const pool = require('../../../dbconn');
const bcrypt = require('bcrypt');
const mysql      = require('mysql');
router.post('/login', (req, res) => {
    let { email, password } = req.body;
    let sql = 'SELECT * FROM customer WHERE email = ?';
        sql = mysql.format(sql, [email])
    pool.query(sql, (error, results) => {
        if (error) {
            res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            res.status(401).json({ message: 'Email not found' });
        }

        let user = results[0];
      
       bcrypt.compare(  password, user.password,  (error, rus) => {
        if (error) {
            res.status(500).json({ message: 'Error verifying password' });
        }
        if (rus) {
      
            let {password, ...userData} = user
            res.status(200).json(userData);
        } else {
            res.status(401).json({
                message: 'Invalid email or password'
            });
        }
       } )
    });
});

module.exports = router;