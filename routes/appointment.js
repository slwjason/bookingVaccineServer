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
//预约，预约前判断是否重复预约
router.post('/createAppointment', function(req, res, next) {
    const params = req.body;
    const uid = uuid.v1();
    //先判断是否重复预约
    const p = new Promise((resolve, reject) => {
        const sql1 =$sql.appointment.findAppoint
        conn.query(sql1, [ params.archives], function (err, result) {
            if(err){
                reject(err)
            }else{
                let data = JSON.parse(JSON.stringify(result))
                for (let i = 0; i <data.length ; i++) {
                    //根据请求参数和结果进行比较，判断是否重复
                    if(params.archives === data[i].archives && params.point === data[i].point && params.vaccine === data[i].vaccine && params.hospital === data[i].hospital){
                        return res.send({
                            code: 500,
                            msg: "不能重复预约",
                            data: data
                        })
                    }
                }
            //没有重复的进行预约
                resolve(true)
            }

        })
    })
    p.then(function (data) {
        if(data){
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
                sql: "INSERT INTO appointment (id,archives,hospital,hospitalName,point,pointName,vaccine,createDate,status) VALUES (?,?,?,?,?,?,?,?,?)",
                values: [uid.toString(),params.archives,params.hospital,params.hospitalName,params.point,params.pointName,params.vaccine,dateTime.praseTime(new Date().getTime()),'待处理']
            }, {
                //预约成功将疫苗数量减一个
                sql: "update vaccine_point  set num =num-1 where point = ? and vaccine = ?",
                values: [params.point,params.vaccine]
            },
            ];
            //调用事务
            execTransection(sqlArr).then(resp => {
                let data = JSON.parse(JSON.stringify(resp))
                return res.send({
                    code: 200,
                    msg: "预约成功",
                    data: data
                })
            }).catch(err => {
                return res.send({
                    code: 500,
                    msg: "系统繁忙，请稍后重试",
                    data: null,
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
//处理预约
router.post('/disposeAppoint', function(req, res, next) {
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
    for (let i = 0; i <params.disposes.length ; i++) {
        let arr = new Array()
        let uid = uuid.v1();
        arr[0] = uid
        arr[1] = params.disposes[i]
        arr[2] = params.message
        arr[3] = dateTime.praseTime(new Date().getTime())
        arr[4] = '正常'
        arr[5] = stringRandom(16, { numbers: true })
        values.push(arr)
    }
// 将事务粉转为数组
    const sqlArr=[{
        sql: "INSERT INTO list (id,archives,message,createDate,status,number) VALUES ?",
        values: [values]
    }, {
        sql: "update appointment set status = ? where archives in ?",
        values: ['已处理',[params.disposes]]
    },
    ];
    //调用事务
    execTransection(sqlArr).then(resp => {
        let data = JSON.parse(JSON.stringify(resp))
        //查找处理用户的邮箱处理成功发送邮件进行通知
        const sql2 = $sql.archives.findEmailById;
        conn.query(sql2, [[params.disposes]], function (err, result) {
            let data2 = JSON.parse(JSON.stringify(result))
            console.log(data2)
            for (let i = 0; i <data2.length ; i++) {
                if(data2[i].email!=null){
                    console.log(3)
                    email.email(data2[i],data2[i].name+data2[i].message+'您的排号单是：'+data2[i].number)
                }

            }
        })
        return res.send({
            code: 200,
            msg: "处理成功",
            data: data,
        })
    }).catch(err => {
        return res.send({
            code: 500,
            msg: "系统繁忙，请稍后重试",
            data: null,
        })
        // error execution. You can use console to log this error info.
    })
});
//根据地区查接种点
router.post('/findPoint', function(req, res, next) {
    const sql = $sql.point.findPoint;
    const params = req.body;
    conn.query(sql, [params.region], function (err, result) {
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

router.post('/findAppointByPoint', function(req, res, next) {
    const sql = $sql.appointment.findAppointByPoint;
    const params = req.body;
    conn.query(sql, [params.point,'待处理'], function (err, result) {
        var data = JSON.parse(JSON.stringify(result))
        for (let i = 0; i <data.length ; i++) {
            data[i].appointDate = dateTime.dateTimeToTime(data[i].appointDate);
        }
        if(err){
            return res.send({
                code: 500,
                msg: "查找失败",
                data: err
            })
        }else{
            return res.send({
                code: 200,
                msg: "查找成功",
                data: data
            })
        }




    })
});
//查找预约总记录数
router.post('/findAppointAll', function(req, res, next) {
    const sql = $sql.appointment.findAppointAll;
    const params = req.body;
    conn.query(sql, [params.hospital], function (err, result) {
        var data = JSON.parse(JSON.stringify(result))
        if(err){
            return res.send({
                code: 500,
                msg: "查找失败",
                data: err
            })
        }else{
            return res.send({
                code: 200,
                msg: "查找成功",
                data: data[0].num
            })
        }




    })
});
//根据预约者id查未处理记录
router.post('/findAppointById', function(req, res, next) {
    const sql = $sql.appointment.findAppointById;
    const params = req.body;
        conn.query(sql, [params.status,params.archivesId], function (err, result) {
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
            }else{
                return res.send({
                    code: 400,
                    msg: "查找失败",
                    data: null
                })
            }


        })

});
//根据预约者id查记录详情
router.post('/getRecord', function(req, res, next) {
    const sql = $sql.appointment.getRecord;
    const params = req.body;
    conn.query(sql, [params.archivesId], function (err, result) {
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
                data: data[0]
            })
        }else{
            return res.send({
                code: 400,
                msg: "查找失败",
                data: null
            })
        }


    })

});
//查找已处理的
router.post('/findAppointed', function(req, res, next) {
    const sql = $sql.appointment.findAppointed;
    const params = req.body;
    conn.query(sql, [params.point,'已处理'], function (err, result) {
        var data = JSON.parse(JSON.stringify(result))
        for (let i = 0; i <data.length ; i++) {
            data[i].appointDate = dateTime.dateTimeToTime(data[i].appointDate);
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
//待处理
router.post('/findAppointByLike', function(req, res, next) {
    const sql = $sql.appointment.findAppointByLike;
    const params = req.body;
    conn.query(sql, [params.point,params.status,params.name,params.idCard], function (err, result) {
        var data = JSON.parse(JSON.stringify(result))
        for (let i = 0; i <data.length ; i++) {
            data[i].appointDate = dateTime.dateTimeToTime(data[i].appointDate);
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

//已处理
router.post('/findAppointedByLike', function(req, res, next) {
    const sql = $sql.appointment.findAppointedByLike;
    const params = req.body;
    conn.query(sql, [params.point,params.status,params.name,params.idCard], function (err, result) {
        var data = JSON.parse(JSON.stringify(result))
        for (let i = 0; i <data.length ; i++) {
            data[i].appointDate = dateTime.dateTimeToTime(data[i].appointDate);
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
router.post('/getPoint', function(req, res, next) {
    const sql = $sql.point.getPoint;
    const params = req.body;
    conn.query(sql, [params.id], function (err, result) {

        var data = JSON.parse(JSON.stringify(result))

        //封装数据
        var newData = {}
        newData.point = data[0].point
        newData.pointName = data[0].pointName
        newData.hospital = data[0].hospital
        newData.hospitalName = data[0].hospitalName
        newData.items = new Array()
        for (let i = 0; i <data.length ; i++){
            var obj = new Object()
            obj.vaccine = data[i].vaccine
            obj.vaccineName = data[i].vaccineName
            obj.num = data[i].num
            obj.status = data[i].status
            obj.createDate = dateTime.dateTimeToTime(data[i].createDate);
            newData.items.push(obj)
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
                data: newData
            })
        }
    })
});
//查找当周每天的预约人数
router.post('/findNumByDay', function(req, res, next) {
    const sql = $sql.appointment.findNumByDay;
    const params = req.body;
    conn.query(sql, [params.hospital,params.createDate], function (err, result) {
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
