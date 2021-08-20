// sql语句
var sql = {
    //用户
    hospital:{

        login: 'SELECT * from hospital where account = ? and password=?',
        register:'insert into hospital (id,account,password,creatDate,address,name,phone,status) VALUES (?,?,?,?,?,?,?,?)'
    },
    // 建档
    archives: {
        findEmailById:'select a.email,a.name,a.id,l.number,l.message from archives a right join list l on a.id = l.archives where a.id in ?',
        findArchives:'SELECT * from archives where wxId= ?',
        queryUserList: 'select * from user',
        createArchives: 'INSERT INTO archives (id,wxId,brithDay,isILl,isWill,name,createDate,phone,idCard,address,sex,age,email,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        updateStatus:'update user set status = ? where id =?',
        delete: 'delete from user where id =?',
        updateArchives:'update archives set name=?,brithDay=?,isILl=?,phone=?,isWill=?,createDate=?,idCard=?,address=?,sex=?,age=?,email=? where id =?',
        updateRoleByUser:'update admin_user_role set rid =? where uid =?',
        reset:"update user set password='123' where id=?",
        findMembers:'select * from user where isJoin =?',
        getArchives:'select * from archives where id =?',
        //查找个人信息并判断是否打过第一针，如果fid有值代表打过
        getArchivesByIdCard:'select ar.id,ar.name,ar.phone,ar.age,ar.idCard,ar.sex,ap.point,ap.vaccine,ap.hospital ,f.id as fid from archives ar left join appointment ap on ar.id = ap.archives LEFT JOIN FIRST f ON ar.id = f.archives where ar.idCard = ?'
    },
    //正式档案
    archivesFormal:{
        createArchivesFormal:'insert into archives_formal (id,phone,idCard,createDate,status) values (?,?,?,?,?)'
    },
    //接种点
    point:{
        findPointAll:'SELECT COUNT(id) num FROM point WHERE unit =?',
        //根据地区查找接种点
        findPoint:"select * from point where region = ?",
        findPointByUnit:"select * from point where unit= ?",
        deletePoint:'delete from point where id = ?',
        findPointBySearch:'select * from point where name like ?',
        getPoint:'select vp.*,v.hospital,v.hospitalName from vaccine_point vp left join vaccine v on vp.vaccine = v.id where vp.point = ?',
        addPoint:'insert into point (id,name,region,phone,address,latitude,longitude,unit,unitName,startTime,endTime,createDate,status) values (?,?,?,?,?,?,?,?,?,?,?,?,?)',
        updatePoint:'update point set name =?,region=?,phone=?,address=?,latitude=?,longitude=?,startTime=?,endTime=?,createDate=? where id=?',
        findPointByLike:'SELECT * FROM point WHERE unit = ? AND NAME LIKE ? OR region LIKE ?',
        getPointById:'select p.*,v.vaccine,v.vaccineName,v.num from point  p left join vaccine_point v on p.id  = v.point where p.id = ?'
    },
    //预约信息
    appointment:{
        //查找当周每天预约的数量
        findNumByDay:'SELECT COUNT(id) num FROM appointment WHERE hospital = ? and  createDate LIKE ? ',
        findAppointAll:'SELECT COUNT(id) num FROM appointment WHERE hospital =?',
        createAppointment:'INSERT INTO appointment (id,archives,hospital,hospitalName,point,pointName,vaccine,createDate,status) VALUES (?,?,?,?,?,?,?,?,?)',
        disposeAppoint:'update appointment set status = ? where archives in ? ',
        findAppoint:'select * from appointment where archives = ?',
        getRecord:'select ap.pointName,ap.hospitalName,ap.createDate,ar.name as archivesName ,ar.age,ar.sex,ar.idCard, va.name as vaccineName,va.lot,va.manufacturer from appointment ap left join archives ar on ap.archives = ar.id left join vaccine va on ap.vaccine = va.id where  ar.id = ?',
        findAppointById:'select ap.*,ar.name as archivesName ,ar.age,ar.sex, va.name as vaccineName from appointment ap left join archives ar on ap.archives = ar.id left join vaccine va on ap.vaccine = va.id where ap.status=? and ar.id = ?',
        findAppointed:'SELECT ap.createDate AS appointDate,ap.status AS appointStatus,ar.* ,l.number FROM appointment ap LEFT JOIN archives ar  ON ap.archives = ar.id LEFT JOIN LIST l ON ar.id = l.archives WHERE ap.point = ?  AND  ap.status= ?',//查找已处理的数据
        findAppointByLike:'select ap.createDate as appointDate,ap.status as appointStatus,ar.* from appointment ap left join archives ar on ap.archives = ar.id where ap.point = ? and ap.status = ? and name like ? or idCard like ?',
        findAppointByPoint:'select ap.createDate as appointDate,ap.status as appointStatus,ar.* from appointment ap left join archives ar on ap.archives = ar.id where ap.point = ?  and ap.status = ?',
        findAppointedByLike:'select ap.createDate as appointDate,ap.status as appointStatus,ar.* from appointment ap left join archives ar on ap.archives = ar.id where ap.point = ? and ap.status = ? and name like ? or idCard like ?',
    },
    //疫苗
    vaccine:{
        deleteVaccine:'delete from vaccine where id = ?',
        findVaccineAll:'SELECT SUM(SUM) num FROM vaccine WHERE hospital = ?',
        findVaccineByUnit:"select * from vaccine where hospital= ?",
        addVaccine:'insert into vaccine (id,name,sum,lot,manufacturer,hospitalName,hospital,createDate,status) values (?,?,?,?,?,?,?,?,?)',
        findVaccineByLike:"select * from vaccine where hospital=? and name like ?",
        updateVaccine:'update vaccine set name=?,sum=?,lot=?,manufacturer=?,createDate=? where id =?'
    },
    //接种点疫苗
    vaccinePoint:{
        addVaccinePoint:'insert into vaccine_point (id,vaccine,vaccineName,point,pointName,num,createDate,status) values (?,?,?,?,?,?,?,?)'
    },
    //通知
    message:{
        findMessageAll:'SELECT COUNT(id) num FROM message WHERE hospital =?',
    },
    //第一针
    first:{
        //模糊查询
        findFirstByLike:'select a.id,a.name,a.idCard,a.sex,l.number,f.status,f.createDate from first f left join archives a on f.archives = a.id left join list l on f.archives = l.archives where f.point = ? and a.name like ? or a.idCard like ? or l.number like ?',
        addFirst:'INSERT INTO first (id,archives,hospital,point,vaccine,reaction,createDate,status) VALUES (?,?,?,?,?,?,?,?)',
        //通过身份证查找是否有接种记录
        findFirstByIdCard:"select COUNT(f.id) as num from first f left join archives a on f.archives = a.id where a.idCard = ?",
        //通过接种点查找记录
        findFirstByPoint:'select a.id,a.name,a.idCard,a.sex,l.number,f.status,f.createDate from first f left join archives a on f.archives = a.id left join list l on f.archives = l.archives where f.point = ?'
    },
    //第二针
    second:{
        findSecondByLike:'select a.id,a.name,a.idCard,a.sex,l.number,s.status,s.createDate from second s left join archives a on s.archives = a.id left join list l on s.archives = l.archives where s.point = ? and a.name like ? or a.idCard like ? or l.number like ?',
        addSecond:"INSERT INTO second (id,archives,hospital,point,vaccine,reaction,createDate,status) VALUES (?,?,?,?,?,?,?,?)",
        findSecondByPoint:'select a.id,a.name,a.idCard,a.sex,l.number,s.status,s.createDate from second s left join archives a on s.archives = a.id left join list l on s.archives = l.archives where s.point = ?'
    }
}

module.exports = sql;
