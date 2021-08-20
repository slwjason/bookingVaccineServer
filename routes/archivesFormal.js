var express = require('express');
var uuid = require('node-uuid');
var router = express.Router();
var models = require('../server/db');
var mysql = require('mysql');
var $sql = require('../server/sql');
var dateTime = require('../util/dateTime');

// 初始化数据库配置,建立连接池 mysql端口号默认为3306
const conn = mysql.createPool(models.mysql);



//绑定正式档案
router.post('/createArchivesFormal', function(req, res, next) {
    const params = req.body;
    const uid = uuid.v1();
    //绑定正式档案前判断该用户是否打过第一针
    const p2 = new Promise((resolve, reject) => {
        const sql2 = $sql.first.findFirstByIdCard;
        conn.query(sql2, [params.idCard], function (err, result) {
            if(err){
               reject(err)
            }
            else{
                resolve(result[0].num)
            }
        })
    })

    p2.then(function (data1) {
        //如果没有数据
        if(data1<=0){
            return res.send({
                code: 500,
                msg: "您还未接种！",
                data: data1
            })
        }else{
            //绑定正式档案并把临时档案改为正式
            const execTransection = (sqlArr) => {
                return new Promise((resolve, reject) => {
                    var promiseArr = [];
                    conn.getConnection(function (err, connection) {
                        if (err) {
                            return reject(err)
                        }
                        connection.beginTransaction(err => {
                            if (err) {
                                return reject('开启事务失败')
                            }
                            // 将所有需要执行的sql语句和参数封装为数组
                            promiseArr = sqlArr.map(({sql, values}) => {

                                // 把每个异步封装成promise
                                return new Promise((resolve, reject) => {

                                    connection.query(sql, values, (e, rows, fields) => {
                                        console.log(e)
                                        e ? reject(e) : resolve({rows, success: true})
                                    })
                                })
                            })
                            // Promise调用所有sql，一旦出错，回滚，否则，提交事务并释放链接
                            Promise.all(promiseArr).then(res => {
                                connection.commit((error) => {
                                    if (error) {
                                        console.log('事务提交失败')
                                        reject(error)
                                    }
                                })
                                connection.release()  // 释放链接
                                resolve(res)
                            }).catch(err => {
                                connection.rollback(() => {
                                    console.log('数据操作回滚')
                                })
                                reject(err)
                            })
                        })
                    });
                })
            }
            // 将事务粉转为数组
            const sqlArr=[{
                sql: "insert into archives_formal (id,phone,idCard,createDate,status) values (?,?,?,?,?)",
                values: [uid.toString(),params.phone,params.idCard,dateTime.praseTime(new Date().getTime()),'正常']
            },
                {
                    sql:'update archives set status = ? where idCard=?',
                    values:['正式',params.idCard]
                }
            ];
            //调用事务
            execTransection(sqlArr).then(resp => {
                var data = JSON.parse(JSON.stringify(resp))
                return res.send({
                    code: 200,
                    msg: "绑定成功",
                    result: data,
                })
            }).catch(err => {
                return res.send({
                    code: 500,
                    msg: "不要重复操作",
                    result: err,
                })
                // error execution. You can use console to log this error info.
            })


        }
    })

});
//修改
router.post('/updateArchives', function(req, res, next) {
    const sql = $sql.archives.updateArchives;
    const params = req.body;
    console.log(req.body)
    const uid = uuid.v1();
    conn.query(sql, [params.name,params.brithDay,params.isIll,params.phone,params.isWill,dateTime.praseTime(new Date().getTime()), params.idCard, params.address,params.sex,params.age,params.id], function (err, result) {
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
