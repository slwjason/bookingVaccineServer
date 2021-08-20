var express = require('express');
var uuid = require('node-uuid');
var router = express.Router();
var models = require('../server/db');
var mysql = require('mysql');
var $sql = require('../server/sql');
var dateTime = require('../util/dateTime');

// 初始化数据库配置,建立连接池 mysql端口号默认为3306
const conn = mysql.createPool(models.mysql);



// 登录接口
router.post('/login', (req, res) => {
    var sql = $sql.hospital.login;
    var params = req.body;
    console.log( req.body)
    conn.query(sql, [params.account, params.password], function (err, result) {
        var data = JSON.parse(JSON.stringify(result))
        console.log(data)
        if (data.length === 0) {
            return res.send({
                code: 500,
                msg: "用户名或密码错误"
            })
        } else {
            data[0].createDate = dateTime.dateTimeToTime(data[0].createDate);
            return res.json({
                code: 200,
                msg: '请求成功',
                result:data
            });
        }
    })
});
// 创建用户
router.post('/register', (req, res) => {
    var sql = $sql.hospital.register;
    var uid = uuid.v1();
    conn.query(sql, [uid.toString(), req.body.account,req.body.password,dateTime.praseTime(new Date().getTime()), req.body.address, req.body.name,req.body.phone,'正常'], function (err, result) {
        var data = req.body;
        if(err){
            return res.send({
                code: 500,
                msg: "注册失败",
                data: err
            })
        }else{
            return res.send({
                code: 200,
                msg: "注册成功",
                data: data
            })
        }


    })
});
module.exports = router;
