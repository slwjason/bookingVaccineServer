var express = require('express');
var uuid = require('node-uuid');
var router = express.Router();
var models = require('../server/db');
var mysql = require('mysql');
var $sql = require('../server/sql');
var dateTime = require('../util/dateTime');

// 初始化数据库配置,建立连接池 mysql端口号默认为3306
const conn = mysql.createPool(models.mysql);


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/createArchives', function(req, res, next) {
  const sql = $sql.archives.createArchives;
  const params = req.body;
  console.log(req.body)
  const uid = uuid.v1();
  conn.query(sql, [uid.toString(),params.wxId,params.brithDay,params.isIll,params.isWill,params.name,dateTime.praseTime(new Date().getTime()),params.phone, params.idCard, params.address,params.sex,params.age,params.email,'临时'], function (err, result) {
    let data = req.body;
   if(err){
     return res.send({
       code: 500,
       msg: "建档失败",
       data: err
     })
   }
    return res.send({
      code: 200,
      msg: "建档成功",
      data: data
    })
  })
});
//修改
router.post('/updateArchives', function(req, res, next) {
    const sql = $sql.archives.updateArchives;
    const params = req.body;
    console.log(req.body)
    const uid = uuid.v1();
    conn.query(sql, [params.name,params.brithDay,params.isIll,params.phone,params.isWill,dateTime.praseTime(new Date().getTime()), params.idCard, params.address,params.sex,params.age,params.email,params.id], function (err, result) {
        let data = req.body;
        if(err){
            return res.send({
                code: 500,
                msg: "修改失败",
                data: err
            })
        }
        return res.send({
            code: 200,
            msg: "修改成功",
            data: data
        })
    })
});
router.post('/findArchives', function(req, res, next) {
    const sql = $sql.archives.findArchives;
    const params = req.body;
    conn.query(sql, [params.wxId], function (err, result) {
        var data = JSON.parse(JSON.stringify(result))
        for (let i = 0; i <data.length ; i++) {
            data[i].createDate = dateTime.dateTimeToTime(data[i].createDate);
        }
        if(err){
            return res.send({
                code: 500,
                msg: "建档失败",
                data: err
            })
        }
        return res.send({
            code: 200,
            msg: "建档成功",
            data: data
        })
    })
});
//根据身份证查找
router.post('/getArchivesByIdCard', function(req, res, next) {
    const sql = $sql.archives.getArchivesByIdCard;
    const params = req.body;
    conn.query(sql, [params.idCard], function (err, result) {
        var data = JSON.parse(JSON.stringify(result))
        if(err){
            return res.send({
                code: 500,
                msg: "查找失败",
                data: err
            })
        }
        return res.send({
            code: 200,
            msg: "查找成功",
            data: data
        })
    })
});
router.post('/getArchives', function(req, res, next) {
    const sql = $sql.archives.getArchives;
    const params = req.body;
    conn.query(sql, [params.id], function (err, result) {
        var data = JSON.parse(JSON.stringify(result))
        for (let i = 0; i <data.length ; i++) {
            data[i].createDate = dateTime.dateTimeToTime(data[i].createDate);
        }
        if(err){
            return res.send({
                code: 500,
                msg: "查找失败",
                data: err
            })
        }
        return res.send({
            code: 200,
            msg: "查找成功",
            data: data
        })
    })
});
module.exports = router;
