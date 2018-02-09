/**
 * Created by Administrator on 2017/10/26.
 */
var payApi = require('./payapi');
var mysql = require('mysql');
/*创建连接  使用连接池*/
var client = mysql.createPool({
    host:'localhost',
    user: 'root',
    password: '1234',
    port:'3306',
    database:'qiming'
});


//收集用户信息
function customInfo(res, reqData,req) {
    console.log(reqData);
    var sql = "INSERT INTO qiming.intentuser (lastname,sex,`double`,birthday,tel,mail,product,price,remark,ordernum) VALUES(?,?,?,?,?,?,?,?,?,?)";
    var birthday = reqData['birthDate'] + ' ' + reqData['birthTime'];
    client.query(sql,[reqData['lastname'],+reqData['sex'],+reqData['double'],birthday,reqData['tel'],reqData['mail'],reqData['body'],+reqData['total_fee'],reqData['remark'],reqData['bookingNo']],function (err, rows) {
        if(err){
            console.log(err);
            throw err
        }else{
            payApi.createOrder(res,reqData,req)
        }
    })
}

exports.customInfo = customInfo