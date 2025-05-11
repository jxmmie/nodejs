const express = require('express');
const router = express.Router();
const pool = require('../../dbconn');
const mysql      = require('mysql');
const bcrypt = require('bcrypt');


router.post("/search", (req, res) => {
  let bodyData = req.body;
  let name = "%" + bodyData.search_term + "%";
  let sql ="SELECT * FROM product WHERE product_name LIKE ? AND price BETWEEN ? AND ?";
  sql = mysql.format(sql, [name, bodyData.min_price, bodyData.max_price]);

  pool.query(sql, (error, results, fields) => {
    if (error) {
      res.status(500).json({ message: "Database error" });
    }

    if (results.length > 0) {
      let product_st = [];
      for (let i = 0; i < results.length; i++) {
        let { created_at, updated_at, ...rest } = results[i];
        product_st[i] = rest;
      }
      res.status(200).json(product_st);
    } else {
      res.status(404).json({ message: "No product found" });
    }
  });
});

router.post("/addproduct", (req, res) => {
  let bodydata = req.body;
  let sql ="select * from cart_item where cart_id = ? and product_id = ?";
  sql = mysql.format(sql, [bodydata.cart_id, bodydata.product_id]);

  pool.query(sql, (error, results, fields) => {
    if (results.length > 0) {
      let quantitynumber = results[0].quantity;
      let newquantity = quantitynumber + bodydata.quantity;

      let sql = "update cart_item set quantity = ? where cart_id = ? and product_id = ?";
          sql = mysql.format(sql, [
                                newquantity,
                                bodydata.cart_id,
                                bodydata.product_id,
                            ]);

      pool.query(sql, (error, results, fields) => {
        if (error) {
          res.status(500).json({ massage: "Database error" });
        }

        if (results) {
          res.status(201).json({
            message: "Product has been added to the cart.",
          });
        } else {
          res.status(405).json({
            message: "Failed",
          });
        }
      });
    } else {
      let insertSql ="INSERT INTO cart_item (cart_id, product_id, quantity) VALUES (?, ?, ?)";
      insertSql = mysql.format(insertSql, [
        bodydata.cart_id,
        bodydata.product_id,
        bodydata.quantity,
      ]);
      pool.query(insertSql, (error, results, fields) => {
        if (error) {
          return res.status(500).json({ message: "Database error" });
        }

        if (results.affectedRows === 1) {
          res.status(201).json({
            message: "เพิ่มสินค้าในรถเข็นสำเร็จ",
          });
        } else {
          res.status(404).json({
            message: "เพิ่มสินค้าในรถเข็นไม่สำเร็จ",
          });
        }
      });
    }
  });
});
router.post("/createCart", (req, res) => {
  let bodydata = req.body;
  let cart_name = bodydata.cart_name;

  let checkSql = "SELECT * FROM cart WHERE customer_id = ? AND cart_name = ?";
  checkSql = mysql.format(checkSql, [bodydata.customer_id, cart_name]);

  pool.query(checkSql, (error, results, fields) => {
    if (results.length > 0) {
      res.status(409).json({ message: "Cart name already exists" });
    }

    let carateCart = "insert into cart (customer_id, cart_name)" + "VALUES (?, ?)";
    carateCart = mysql.format(carateCart, [bodydata.customer_id, cart_name]);

    pool.query(carateCart, (error, results, fields) => {
      if (error) {
        res.status(500).json({ message: "Database error" });
      }

      if (results.affectedRows === 1) {
        res.status(201).json({
          message: "created cart successful",
        });
      } else {
        res.status(405).json({
          message: "create cart failed",
        });
      }
    });
  });
});
router.post('/selectproduct', (req, res) => {
  const { customer_id } = req.body;

  if (!customer_id) {
     res.status(400).json({ message: "customer_id is required" });
  }

  let sql = `
    SELECT 
      p.product_name,
      p.price,
      ci.quantity
    FROM cart c
    JOIN cart_item ci ON c.cart_id = ci.cart_id
    JOIN product p ON ci.product_id = p.product_id
    WHERE c.customer_id = ?
  `;

  sql = mysql.format(sql, [customer_id]);

  pool.query(sql, (error, results, fields) => {
    if (error) {
       res.status(500).json({ message: "Database error" });
    }

    if (results.length > 0) {
      res.status(200).json(results);
    } else {
      res.status(404).json({ message: "ไม่มีสินค้าในรถเข็น" });
    }
  });
});
module.exports = router;