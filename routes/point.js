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

router.post('/addPoint', function(req, res, next) {
    const params = req.body;
    const p1 = new Promise( (resolve, reject) =>{
        let sql1 = $sql.point.addPoint;
        let uid = uuid.v1();
        conn.query(sql1, [uid.toString(),params.name,params.region,params.phone,params.address,params.latitude,params.longitude,params.unit,params.unitName,params.startTime,params.endTime,dateTime.praseTime(new Date().getTime()),'正常'], function (err, result) {
            let data = req.body;
            if(err) {
                reject(err)
            }else{
                resolve(uid.toString())
            }
    } )
    })
   p1.then(function (result) {
       let sql2 = $sql.vaccinePoint.addVaccinePoint;
       let uid = uuid.v1();
       conn.query(sql2, [uid.toString(),params.vaccine,params.vaccineName,result,params.name,params.num,dateTime.praseTime(new Date().getTime()),'正常'], function (err, resu) {
           let data = req.body;
           if(err) {
               return res.send({
                   code: 500,
                   msg: "添加失败",
                   data: err
               })
           }else{
               return res.send({
                   code: 200,
                   msg: "添加成功",
                   data: data
               })
           }
   })
})
});

//修改
router.post('/updatePoint', function(req, res, next) {
    const sql = $sql.point.updatePoint;
    const params = req.body;
    console.log(req.body)
    conn.query(sql, [params.name,params.region,params.phone,params.address,params.latitude,params.longitude,params.startTime,params.endTime,dateTime.praseTime(new Date().getTime()),params.id], function (err, result) {
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
                code: 400,
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
                code: 500,
                msg: "查找失败",
                data: null
            })
        }


    })
});
//查找接种点总记录数
router.post('/findPointAll', function(req, res, next) {
    const sql = $sql.point.findPointAll;
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
router.post('/findPointBySearch', function(req, res, next) {
    const sql = $sql.point.findPointBySearch;
    const params = req.body;
    conn.query(sql, [params.name], function (err, result) {
        var data = JSON.parse(JSON.stringify(result))
        for (let i = 0; i <data.length ; i++) {
            data[i].createDate = dateTime.dateTimeToTime(data[i].createDate);
        }

        if(err){
            return res.send({
                code: 400,
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
                code: 500,
                msg: "查找失败",
                data: null
            })
        }


    })
});
router.post('/findPointByUnit', function(req, res, next) {
    const sql = $sql.point.findPointByUnit;
    const params = req.body;
    conn.query(sql, [params.unit], function (err, result) {
        var data = JSON.parse(JSON.stringify(result))
        for (let i = 0; i <data.length ; i++) {
            data[i].createDate = dateTime.dateTimeToTime(data[i].createDate);
            data[i].startTime = dateTime.dateTimeToTime(data[i].startTime);
            data[i].endTime = dateTime.dateTimeToTime(data[i].endTime);
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
router.post('/findPointByLike', function(req, res, next) {
    const sql = $sql.point.findPointByLike;
    const params = req.body;
    conn.query(sql, [params.unit,params.name,params.region], function (err, result) {
        var data = JSON.parse(JSON.stringify(result))
        for (let i = 0; i <data.length ; i++) {
            data[i].createDate = dateTime.dateTimeToTime(data[i].createDate);
            data[i].startTime = dateTime.dateTimeToTime(data[i].startTime);
            data[i].endTime = dateTime.dateTimeToTime(data[i].endTime);
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
//删除
router.put('/deletePoint', function(req, res, next) {
    const sql = $sql.point.deletePoint;
    const params = req.body;
    conn.query(sql, [params.id], function (err, result) {
        console.log(err)
        if(err){
            return res.send({
                code: 500,
                msg: "删除失败",
                data: err
            })
        }else{
            return res.send({
                code: 200,
                msg: "删除成功",
                data: params
            })
        }



    })
});

router.post('/getPointById', function(req, res, next) {
    const sql = $sql.point.getPointById;
    const params = req.body;
    conn.query(sql, [params.id], function (err, result) {
        var data = JSON.parse(JSON.stringify(result))

            data[0].createDate = dateTime.dateTimeToTime(data[0].createDate);
        data[0].startTime = dateTime.dateTimeToTime(data[0].startTime);
        data[0].endTime = dateTime.dateTimeToTime(data[0].endTime);
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
        }

    })
});
module.exports = router;
