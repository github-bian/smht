/**
 * Created by Administrator on 2017/8/3.
 */
// var cryptoMO = require('crypto'); // MD5算法
var xml2js = require('xml2js');
var qs = require('querystring');
var https = require('https');
var http = require('http');
var request = require('request');
var crypto = require('crypto');
var mysql = require('mysql');

/*创建连接  使用连接池*/
var client = mysql.createPool({
    host:'localhost',
    user: 'root',
    password: '1234',
    port:'3306',
    database:'qiming'
});

var key = '7darcomzhangsanfengshuo201708044';

function createOrder(res,reqData,req) {
    console.log('生成订单');
    console.log(reqData);
    var total_fee,openid,body,bookingNo;
    var apiUrl = "https://api.mch.weixin.qq.com/pay/unifiedorder";

    total_fee = reqData["total_fee"];
    openid = reqData["openid"];
    body = reqData['body'];
    bookingNo = reqData['bookingNo'];
    attach = body;

    var wxConfig = {
        appid:'wxde194c3ecffe62ec',
        mch_id : '1450547102'
    };
    var timeStamp = createTimeStamp(); //时间节点
    var nonce_str = createNonceStr() + createTimeStamp(); //随机字符串
    // var create_ip = get_client_ip(req); //请求ip
    var create_ip = '192.168.3.150'; //请求ip
    var notify_url ='http://m.kuaidu365.com/qimingPayNotify.php';
    //var notify_url ='http://localhost:8088/notifypay';

    var formData = "<xml>";
    formData += "<appid>"+wxConfig['appid']+"</appid>"; //appid
    formData += "<mch_id>"+wxConfig['mch_id']+"</mch_id>"; //商户号
    formData += "<nonce_str>"+nonce_str+"</nonce_str>"; //随机字符串
    formData += "<attach>"+attach+"</attach>";
    formData += "<body>" + body + "</body>"; //商品描述
    formData += "<notify_url>"+notify_url+"</notify_url>";
    formData += "<openid>" + openid + "</openid>";
    formData += "<out_trade_no>" + bookingNo + "</out_trade_no>";
    formData += "<spbill_create_ip>"+create_ip+"</spbill_create_ip>";
    formData += "<total_fee>" + total_fee + "</total_fee>";
    formData += "<trade_type>JSAPI</trade_type>";
    formData += "<sign>" + paysignjsapi(wxConfig['appid'],body,attach,wxConfig['mch_id'],nonce_str,notify_url,openid,bookingNo,create_ip,total_fee,'JSAPI') + "</sign>";
    formData += "</xml>";
    console.log(formData);
    //记录日志
    var sql = "INSERT INTO qiming.order (order_num,openid,product_name,price,is_success) VALUES(?,?,?,?,?)";
    client.query(sql,[bookingNo,openid,body,total_fee,1],function (err,result) {
         if(err){
             throw err
         }
    });

    request({
        url: apiUrl,
        method: 'POST',
        body: formData
    },function (err, response, body) {
        if (!err && response.statusCode === 200){
            console.log(body);
            var result_code = getXMLNodeValue('result_code', body.toString("utf-8"));
            var resultCode = result_code.split('[')[2].split(']')[0];
            if(resultCode === 'SUCCESS'){ //成功
                var prepay_id = getXMLNodeValue('prepay_id', body.toString("utf-8")).split('[')[2].split(']')[0]; //获取到prepay_id
                //签名
                var _paySignjs = paysignjs(wxConfig['appid'], nonce_str, 'prepay_id='+ prepay_id,'MD5',timeStamp);
                var args = {
                    appId: wxConfig['appid'],
                    timeStamp: timeStamp,
                    nonceStr: nonce_str,
                    signType: "MD5",
                    package: prepay_id,
                    paySign: _paySignjs,
                    status:200
                };

                res.write(JSON.stringify(args));
                res.end();
            }else{                         //失败
                var err_code_des = getXMLNodeValue('err_code_des',body.toString("utf-8"));
                var errDes = err_code_des.split('[')[2].split(']')[0];
               var errArg = {
                   status:400,
                   errMsg: errDes
               };
               res.write(JSON.stringify(errArg));
               res.end();
            }
            console.log('prepay_id是'+resultCode)
        }
    })
}
function notify(res, reqData, req) {
    console.log('支付响应接口');
    var xmlData;
    for(var k in reqData){
        xmlData = k;
        break;
    }
    var return_code =  getXMLNodeValue('return_code',xmlData);
    if(return_code === 'SUCCESS'){
        var formData = "<xml>";
        formData += "<appid>"+ getXMLNodeValue('appid',xmlData)+"</appid>"; //appid
        formData += "<mch_id>"+ getXMLNodeValue('mch_id',xmlData)+"</mch_id>"; //商户号
        formData += "<nonce_str>"+ getXMLNodeValue('nonce_str',xmlData)+"</nonce_str>"; //随机字符串
        formData += "<body>" +  getXMLNodeValue('body',xmlData) + "</body>"; //商品描述
        formData += "<notify_url>"+ getXMLNodeValue('return_code',xmlData)+"</notify_url>";
        formData += "<openid>" +  getXMLNodeValue('openid',xmlData) + "</openid>";
        formData += "<out_trade_no>" + getXMLNodeValue('return_code',xmlData) + "</out_trade_no>";
        formData += "<spbill_create_ip>"+ getXMLNodeValue('return_code',xmlData)+"</spbill_create_ip>";
        formData += "<total_fee>" +  getXMLNodeValue('return_code',xmlData) + "</total_fee>";
        formData += "<trade_type>JSAPI</trade_type>";
        formData += "</xml>";
        var openid =  getXMLNodeValue('openid',xmlData);
        var sql = "UPDATE qiming.order SET is_success=2 WHERE openid='"+openid+"'";
        client.query(sql,function (err, res) {
            //修改支付状态为成功
        })

    }


    var notifyData = '<xml>'+
        '<return_code><![CDATA[SUCCESS]]></return_code>'+
        '<return_msg><![CDATA[OK]]></return_msg>'+
        '</xml>';
    res.write(notifyData);
    res.end();
}
function paysignjs(appid, nonceStr, package, signType, timeStamp) {
    var ret = {
        appId: appid,
        nonceStr: nonceStr,
        package: package,
        signType: signType,
        timeStamp: timeStamp
    };
    var string = raw1(ret);
    string = string + '&key='+key;
    console.log(string);
    var crypto = require('crypto');
    return crypto.createHash('md5').update(string, 'utf8').digest('hex');
}

function raw1(args) {
    var keys = Object.keys(args);
    keys = keys.sort()
    var newArgs = {};
    keys.forEach(function(key) {
        newArgs[key] = args[key];
    });

    var string = '';
    for(var k in newArgs) {
        string += '&' + k + '=' + newArgs[k];
    }
    string = string.substr(1);
    return string;
}

//生成签名
function paysignjsapi(appid,body,attach,mch_id,nonce_str,notify_url,openid,out_trade_no,spbill_create_ip,total_fee,trade_type) {
    var ret = {
        appid: appid,
        body: body,
        attach:attach,
        mch_id: mch_id,
        nonce_str: nonce_str,
        notify_url: notify_url,
        openid: openid,
        out_trade_no: out_trade_no,
        spbill_create_ip: spbill_create_ip,
        total_fee: total_fee,
        trade_type: trade_type
    };
    var string = raw(ret);
    string = string + '&key='+ key;
    var sign = crypto.createHash('md5').update(string, 'utf8').digest('hex');
    return sign.toUpperCase()
}

function raw(args) {
    var keys = Object.keys(args);
    keys = keys.sort();
    var newArgs = {};
    keys.forEach(function(key) {
        newArgs[key.toLowerCase()] = args[key];
    });
    var string = '';
    for(var k in newArgs) {
        string += '&' + k + '=' + newArgs[k];
    }
    string = string.substr(1);
    return string;
}

function getXMLNodeValue(node_name, xml) {
    var tmp = xml.split("<" + node_name + ">");
    var _tmp = tmp[1].split("</" + node_name + ">");
    return _tmp[0];
}
//获取url请求客户端ip
var get_client_ip = function(req) {
    return (req.headers['x-forwarded-for'] || '').split(',')[0] || req.ip;
};

// 随机字符串产生函数
function createNonceStr() {
    return Math.random().toString(36).substr(2, 15)
}
// 时间戳产生函数
function createTimeStamp() {
    return parseInt(new Date().getTime() / 1000) + ''
}

exports.createOrder = createOrder;
exports.notify = notify;