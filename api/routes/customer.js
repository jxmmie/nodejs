const express = require('express');
const router = express.Router();
const pool = require('../../dbconn');
const mysql      = require('mysql');
const bcrypt = require('bcrypt');


router.post('/', (req, res) => {
    const { first_name, last_name, email, phone_number, address, password } = req.body;

   
    bcrypt.hash(password, 10, function(err, hashedPassword) { 
        if (err) {
            console.error("Error hashing password:", err);
            return res.status(500).json({ message: "Error hashing password" }); 
        }

        const query = 'INSERT INTO customer (first_name, last_name, email, phone_number, address, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())';
        pool.query(query, [first_name, last_name, email, phone_number, address, hashedPassword], function (error, results, fields) {
            if (error) {
                console.error("Error inserting data:", error);
                return res.status(500).json({ message: "Error inserting data" });
            }
            if (results.affectedRows === 1) {
                res.status(201).json({ message: 'Insert success' });
            } else {
                res.status(400).json({ message: 'Insert failed' });
            }
        });
    });
});
router.post('/updatepassword', (req, res) => {
  const { cusid, oldPassword, newPassword } = req.body;

  pool.query('SELECT password FROM customer WHERE customer_id = ?', [cusid], (err, results) => {
    if (err) {
       res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล' });
    }

    if (results.length === 0) {
      res.status(404).json({ message: 'ไม่พบบัญชีผู้ใช้' });
    }

    const storedPassword = results[0].password;

    
    bcrypt.compare(oldPassword, storedPassword, (err, isMatch) => {
      if (err) {
       res.status(500).json({ message: 'เกิดข้อผิดพลาดในการตรวจสอบรหัสผ่าน' });
      }

      if (!isMatch) {
        res.status(401).json({ message: 'รหัสผ่านเดิมไม่ถูกต้อง' });
      }

    
      bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
        if (err) {
          res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้ารหัสรหัสผ่านใหม่' });
        }

       
        pool.query('UPDATE customer SET password = ? WHERE customer_id = ?', [hashedPassword, cusid], (err, updateResult) => {
          if (err) {
            res.status(500).json({ message: 'ไม่สามารถอัปเดตรหัสผ่านได้' });
          }

          res.status(200).json({ message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
        });
      });
    });
  });
});




module.exports = router;