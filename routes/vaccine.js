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

router.post('/addVaccine', function(req, res, next) {
    const sql = $sql.vaccine.addVaccine;
    const params = req.body;
    const uid = uuid.v1();
    conn.query(sql, [uid.toString(),params.name,params.sum,params.lot,params.manufacturer,params.unitName,params.unit,dateTime.praseTime(new Date().getTime()),'正常'], function (err, result) {
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
//修改
router.post('/updateVaccine', function(req, res, next) {
    const sql = $sql.vaccine.updateVaccine;
    const params = req.body;
    conn.query(sql, [params.name,params.sum,params.lot,params.manufacturer,dateTime.praseTime(new Date().getTime()),params.id], function (err, result) {
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
router.post('/findVaccineByLike', function(req, res, next) {
    const sql = $sql.vaccine.findVaccineByLike;
    const params = req.body;
    conn.query(sql, [params.unit,params.name], function (err, result) {
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
//查找预约总记录数
router.post('/findVaccineAll', function(req, res, next) {
    const sql = $sql.vaccine.findVaccineAll;
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
//删除
router.put('/deleteVaccine', function(req, res, next) {
    const sql = $sql.vaccine.deleteVaccine;
    const params = req.body;
    conn.query(sql, [params.id], function (err, result) {
        if(err){
            if(err.code==='ER_ROW_IS_REFERENCED_2'){
                return res.send({
                    code: 400,
                    msg: "该数据被使用中无法删除！",
                    data: err
                })
            }else{
                return res.send({
                    code: 500,
                    msg: "删除失败",
                    data: err
                })
            }

        }else{
            return res.send({
                code: 200,
                msg: "删除成功",
                data: params
            })
        }



    })
});
router.post('/findVaccineByUnit', function(req, res, next) {
    const sql = $sql.vaccine.findVaccineByUnit;
    const params = req.body;
    conn.query(sql, [params.unit], function (err, result) {
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
        }else{

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
module.exports = router;
