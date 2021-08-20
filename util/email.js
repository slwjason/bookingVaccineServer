var nodemailer = require("nodemailer");
exports.email = function (user,text) {
// Use Smtp Protocol to send Email
    var transporter = nodemailer.createTransport({
        //https://github.com/andris9/nodemailer-wellknown#supported-services 支持列表
        service: 'qq',
        port: 587, // SMTP 端口
        secure: false,
        // secureConnection: true, // 使用 SSL
        auth: {
            user:"2574349030@qq.com",
            //这里密码不是qq密码，是你设置的smtp密码
            pass: 'tjecxcjvzuyidiec'
        }
    });

// setup e-mail data with unicode symbols
    var mailOptions = {
        to: user.email,
        from: "2574349030@qq.com", // 这里的from和 上面的user 账号一样的
        subject: '疫苗通', // 标题
        //text和html两者只支持一种
        text: text , // 内容
        // html: '<b>Hello world ?</b>' // html 内容
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            return error;
        }
        console.log('邮件发送: ' + info.response);
        transporter.close();
    });
}


