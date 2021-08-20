var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');
var qr = require('qr-image');//二维码
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.post('/Code',(req,res)=>{
  let text = 'http://192.168.43.102:8080/code';
  let svg_string = qr.imageSync(text, { type: 'svg' });
  return res.send({
    code: 200,
    msg: "处理成功",
    result: svg_string,
  })
})

router.post('/findNews',(req,res)=>{
  request('https://search.sina.com.cn/?q=%E6%96%B0%E5%86%A0&c=news&from=channel&ie=utf-8', (err, response) => {
    let data=[]
    if (!err && response.statusCode === 200) {
      let $ = cheerio.load(response.body)
      let arr = []
      // 将a标签的数据放到数组中
      $(".box-result").each(function(i,v){
        if(arr.length<10){
          arr.push($(v).html())
        }else{

        }
      })
      let newArr = arr.filter(item=>item.indexOf('r-img')!==-1 && item.indexOf('r-info')!==-1)
      //第一步过滤数据
      for (let i = 0; i <newArr.length ; i++) {
        newArr[i] = newArr[i].replace(/[\r\n]/g,"");
        let obj = new Object()
          //查找h2的位置
          let h2IndexStart= newArr[i].indexOf('<h2>')
          let h2IndexEnd= newArr[i].indexOf('<div class="r-img">')
          obj.h2 = newArr[i].slice(h2IndexStart,h2IndexEnd).replace(/<font color="red">/g,'')
          obj.h2 = obj.h2.replace(/<\/font>/g,'')
          let imgStart= newArr[i].indexOf('<div class="r-img">')
          let imgEnd= newArr[i].indexOf('<div class="r-info">')
          obj.img = newArr[i].slice(imgStart,imgEnd).replace(/width="120"/g,"style='display:inline-block;width:200rpx'")
          let infoStart= newArr[i].indexOf('<div class="r-info">')
          let infoEnd= newArr[i].length
          obj.info = newArr[i].slice(infoStart,infoEnd)
          let httpStart = newArr[i].indexOf('https://')
          let httpEnd = newArr[i].indexOf('\" target="_blank\"')
          obj.http = newArr[i].slice(httpStart,httpEnd)
          data.push(obj)
      }
      return res.send({
        code: 200,
        msg: "处理成功",
        data: data,
      })

    }
  })


})



module.exports = router;
