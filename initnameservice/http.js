var http = require('http'),
	url = require('url'),
	qs = require('querystring');


function start(route,handle){
	function onRequest(req,res){
		res.writeHead(200, {'Content-Type': 'text/plain;charset=utf-8'});
		var pathname = url.parse(req.url).pathname;
		// 设置接收数据编码格式为 UTF-8
    	req.setEncoding('utf-8');
		if(req.method.toUpperCase() == 'POST'){
			console.log('post');
			var postData = '';
			req.addListener("data",function(chunk){
				postData += chunk;
			});
			req.addListener("end",function(){
				postData = qs.parse(postData);
				route(handle,pathname,res,postData,req)
			})
		}else if(req.method.toUpperCase() == 'GET'){
			var getData = url.parse(req.url, true).query;
			route(handle,pathname,res,getData,req)
		}else{
			//put delete
		}
	}
	http.createServer(onRequest).listen(8088);
}

exports.start = start;

