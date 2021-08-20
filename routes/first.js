var express = require('express');
var uuid = require('node-uuid');
var router = express.Router();
var models = require('../server/db');
var mysql = require('mysql');
var $sql = require('../server/sql');
var dateTime = require('../util/dateTime');
const stringRandom = require('string-random');
// 初始化数据库配置,建立连接池 mysql端口号默认为3306
const conn = mysql.createPool(models.mysql);



router.post('/addFirst', function(req, res, next) {
    const sql = $sql.first.addFirst;
    const params = req.body;
    const uid = uuid.v1();
    console.log(params)
    conn.query(sql, [uid.toString(),params.archives,params.hospital,params.point,params.vaccine,params.reaction,dateTime.praseTime(new Date().getTime()),'正常'], function (err, result) {
        let data = req.body;
        if(err){
            return res.send({
                code: 500,
                msg: "添加失败",
                data: err
            })
        }
        return res.send({
            code: 200,
            msg: "添加成功",
            data: data
        })
    })
});


router.post('/findFirstByPoint', function(req, res, next) {
    const sql = $sql.first.findFirstByPoint;
    const params = req.body;
    conn.query(sql, [params.point], function (err, result) {
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
router.post('/findFirstByLike', function(req, res, next) {
    const sql = $sql.first.findFirstByLike;
    const params = req.body;
    conn.query(sql, [params.point,params.name,params.idCard,params.number], function (err, result) {
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
        if(data.length>0){
            return res.send({
                code: 200,
                msg: "查找成功",
                data: data
            })
        }

    })
});

module.exports = router;
