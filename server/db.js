// 数据库连接配置
module.exports = {
    //连接池
    mysql: {
        connectionLimit: 10,    // 连接数量
        host: 'localhost',
        user: 'root',
        password: 'slw',
        database: 'bookingVaccine',
        port: '3306',
        multipleStatements:true//可执行多条语句（事务）
    }
}
