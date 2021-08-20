var express = require('express');
var uuid = require('node-uuid');
var router = express.Router();
var models = require('../server/db');
var mysql = require('mysql');
var $sql = require('../server/sql');
var dateTime = require('../util/dateTime');
const stringRandom = require('string-random');
var email = require('../util/email')
// 初始化数据库配置,建立连接池 mysql端口号默认为3306
const conn = mysql.createPool(models.mysql);


/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/addMessage', function(req, res, next) {

    var params = req.body;
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
    const  values = []
    if(params.selected.length>0){
        for (let i = 0; i <params.selected.length ; i++) {
            let arr = new Array()
            let uid = uuid.v1();
            arr[0] = uid
            arr[1] = params.selected[i]
            arr[2] = params.title
            arr[3] = params.content
            arr[4] = dateTime.praseTime(new Date().getTime())
            arr[5] = '正常'
            arr[6] = params.hospital
            values.push(arr)
        }
    }

// 将事务粉转为数组
    const sqlArr=[{
        sql: "INSERT INTO message (id,archives,title,content,createDate,status,hospital) VALUES ?",
        values: [values]
    },
    ];
    //调用事务
    execTransection(sqlArr).then(resp => {
        var data = JSON.parse(JSON.stringify(resp))
        //查找处理用户的邮箱处理成功发送邮件进行通知
        const sql2 = $sql.archives.findEmailById;
        conn.query(sql2, [[params.selected]], function (err, result) {
            let data2 = JSON.parse(JSON.stringify(result))
            for (let i = 0; i <data2.length ; i++) {
                email.email(data2[i],params.content)
            }
        })
        return res.send({
            code: 200,
            msg: "处理成功",
            result: data,
        })
    }).catch(err => {
        // error execution. You can use console to log this error info.
    })
});
//查找预约总记录数
router.post('/findMessageAll', function(req, res, next) {
    const sql = $sql.message.findMessageAll;
    const params = req.body;
    conn.query(sql, [params.hospital], function (err, result) {
        var data = JSON.parse(JSON.stringify(result))
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
                data: data[0].num
            })
        }

    })
});
module.exports = router;
