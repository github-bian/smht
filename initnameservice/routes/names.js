var bazi = require('../utils/bazi'),
	wuge = require('../utils/wuge'),
	query = require('../models/names'),
	http = require('http'),
	https = require('https'),
	url = require('url'),

	qs = require('querystring'),
	WXBizDataCrypt = require('../utils/WXBizDataCrypt'),
	mysql = require('mysql'),
	pay = require('./payapi'),
	request = require('request');

/*创建连接  使用连接池*/
var client = mysql.createPool({
    host:'localhost',
    user: 'root',
    password: '1234',
    port:'3306',
    database:'qiming'
});

/*获取用户信息*/
function getUserInfo(res,reqData,req){
	console.log('getuserinfo');
	console.log(reqData)
	//开始获取用户信息
	var appId = 'wxde194c3ecffe62ec',
	   secret = '05f82e8c24bdb173701ecdf155d4debf';

	var html='';
	var url="https://api.weixin.qq.com/sns/jscode2session?appid="+appId+"&secret="+secret+"&js_code=" + reqData['code'] + "&grant_type=authorization_code";  
    https.get(url, function (response) {  
        var datas = [];
        var size = 0;  
        response.on('data', function (data) { 
            datas.push(data);  
            size += data.length;  
        });
        response.on("end", function () {
            var buff = Buffer.concat(datas, size); 
            var result = JSON.parse(buff.toString());  
            var encryptedData = reqData['encryptedData'],
            	sessionKey = result.session_key,
            	iv = reqData['iv'];

			var pc = new WXBizDataCrypt(appId, sessionKey);

			var decrypt = pc.decryptData(encryptedData , iv);
			if(!decrypt){res.write(JSON.stringify(decrypt));res.end()} //解密出错  返回null
			console.log(decrypt);
			var sql1 = "SELECT openid,nickname,avatarUrl,unionid,testresult,refresh,havecount FROM qiming.testmember WHERE openid='"+decrypt['openId']+"'",
				sql2 = "UPDATE qiming.testmember SET nickName='"+decrypt['nickName']+"',avatarUrl='"+decrypt['avatarUrl']+"' WHERE openid='"+decrypt['openId']+"'",
				sql3 = "INSERT INTO qiming.testmember (openid,nickname,avatarUrl,unionid,testresult,refresh) VALUES(?,?,?,?,?,?)",
				logSql = "INSERT INTO ";
			var backData = {};
			//查询用户是否第一次登陆
			client.query(sql1,function (err1, rows) {
				if(err1){
					throw err1;
				}else{
					if(rows.length>0){
						//如不是第一次登陆，则刷新用户信息
						client.query(sql2,function (err2,result2) {
							if(err2){
								throw err2;
							}else{
								query.isTip(decrypt['openId']).then(function (tipcount) {   //是否付19.8
                                    backData['tipCount'] = tipcount;
                                    backData['openId'] = decrypt['openId'];
                                    backData['unionId'] = decrypt['unionId'];
                                    backData['nickName'] = decrypt['nickName'];
                                    backData['avatarUrl'] = decrypt['avatarUrl'];
                                    backData['refresh'] = rows[0]['refresh'];
                                    backData['haveCount'] = rows[0]['havecount'];
                                    res.write(JSON.stringify(backData));
                                    res.end();
                                })

							}
                        })
					}else{
						//如果是第一次登陆  记录用户信息
						client.query(sql3,[decrypt['openId'],decrypt['nickName'],decrypt['avatarUrl'],decrypt['unionId'],11,3],function (err3, result3) {
							if(err3){
								throw err3;
							}else{
                                backData['tipCount'] = 0;
                                backData['openId'] = decrypt['openId'];
                                backData['unionId'] = decrypt['unionId'];
                                backData['nickName'] = decrypt['nickName'];
                                backData['avatarUrl'] = decrypt['avatarUrl'];
                                backData['refresh'] = 3;
                                backData['haveCount'] = 30;
                                res.write(JSON.stringify(backData));
                                res.end();
							}
                        })
					}

				}
            });
        });  
    })
}

/*添加queryname日志*/
function test(res,reqData){
	console.log(reqData);
}

/*记录查询日志*/
function addQueryLog(res, reqData) {
	console.log(reqData);
	client.getConnection(function (err, conn) {
        var generatenameLogSql = 'INSERT INTO qiming.generatename_log(nickname,lastname,namenum,sex,mode,birthday,openid,unionid) VALUES(?,?,?,?,?,?,?,?)',
            birthday = reqData['birthdaydate']+' '+reqData['birthdaytime'];
        conn.query(generatenameLogSql,[reqData['nickname'],reqData['lastname'],reqData['double'],reqData['sex'],reqData['mode'],birthday,reqData['openid'],reqData['unionid']],function(err,result){
            if(err){
                throw err;
            }else{
                res.end(JSON.stringify(result))
            }
        });
		conn.release()
    })
}

/*按条件获取姓名组*/
function getNamesGroup(res,reqData){
	console.log('/getnameGroup');
	var birthday = reqData.birthdaydate + ' ' + reqData.birthdaytime;
	var resInfo = {};
	query.getBazi(birthday)
	.then(function (baziInfo) {
		 resInfo.bazi=baziInfo['bz'];
		 resInfo.nongli=baziInfo['nongli'];
		 resInfo.wuxing=baziInfo['wuxing'];
		 resInfo.shengxiao=baziInfo['shengxiao'];
		 resInfo.sxjx=baziInfo['sxjx'];
		 resInfo.sx_ruo=baziInfo['sx_ruo'];
		 resInfo.sx_yi=baziInfo['sx_yi'];
		 resInfo.sx_ji=baziInfo['sx_ji'];
		reqData['lackprop'] = baziInfo.lackprop
        console.log('五行前')
		return query.getNamesGroup(reqData)
	}).then(function (namesGroup) {
		resInfo.namesGroup = namesGroup;
		var bazi = resInfo['bazi'].replace(/\s/g,'');

		return query.getWuxingInfo(bazi)
	}).then(function(wuxingInfo){
        console.log('五行后')
		resInfo.wuxingInfo =wuxingInfo
		return query.getLastNameInfo(reqData['lastname'])
	}).then(function (lastnameInfo) {
		resInfo.lastname = lastnameInfo
		return Promise.all([
            query.isTip(reqData['openid']),
            query.updateUserRefreshCount(reqData)
		])
	}).then(function(tipCount){
		resInfo['tipCount'] = tipCount[0] 
		resInfo.err_code = 0
		res.write(JSON.stringify(resInfo))
		res.end()
	}).catch(function (err) {
		res.write(JSON.stringify(err))
		res.end()

	})
}

/*刷新名字组*/
function refreshNamesGroup(res, reqData) {
	console.log(reqData)
	Promise.all([
		query.getNamesGroup(reqData),
		query.updateUserRefreshCount(reqData),
		query.addUserRefreshLog(reqData)
	])
	.then(function (data) {
		var result = {list: data[0]}
		res.end(JSON.stringify(result))
	})
}

/*获取姓氏信息*/
function getLastNameInfo(res,reqData){
	client.getConnection(function(err,conn){
		var sql = "SELECT id,pinyin,bihua,wuxing FROM qiming.xingshibase WHERE lastname='"+reqData['lastname']+"'";
		conn.query(sql,function(err,results){
			if(err){
				throw err
			}else{
				//姓氏库存在
				if(results.length>0){
					res.write(JSON.stringify(results[0]));
					res.end()
				}else{
					//姓氏库不存在
					conn.query("SELECT id,pinyin,bihua,wuxing FROM qiming.fontbase WHERE font='"+reqData['lastname']+"'",function(err2,results2){
						if(err2){
							throw err2
						}else{
							if(results2.length>0){
								//字库存在
								res.write(JSON.stringify(results2[0]))
								res.end()
							}else{
								//字库不存在
								res.write(JSON.stringify(null))
								res.end()
							}
						}
					});
					conn.release()
				}
			}
		})
	})
}

/*获取姓名解析*/
function getNameDetail(res,reqData){
	console.log('get name detail');
	console.log(reqData);
	var queryNameLogSql = 'INSERT INTO qiming.queryname_log(name,lastname,openid,unionid,multi_name_id) VALUES(?,?,?,?,?)',
		addQueryCountSql = 'UPDATE qiming.multi_name SET querycount=querycount+1 WHERE id='+reqData['nameid'],
		judgeSaveSql = "SELECT id FROM qiming.user_collection WHERE name_id="+reqData['nameid']+" AND openid='"+reqData['openid']+"' AND lastname='"+reqData['lastname']+"' AND isdel=1";
	var fontSql = '';
	var data = {
		isSave:'',
		wordData:null
	};
	if(reqData['firstname'].length==1){
		fontSql = "SELECT id,font,pinyin,bushou,bihua,wuxing,fanti,`desc` FROM qiming.fontbase WHERE font='"+reqData['firstname']+"'";
	}else if(reqData['firstname'].length==2){
		fontSql = "SELECT id,font,pinyin,bushou,bihua,wuxing,fanti,`desc` FROM qiming.fontbase WHERE font='"+reqData['firstname'].substring(0,1)+"' OR font='"+reqData['firstname'].substring(1)+"'"
	}
	client.getConnection(function(err,connection){
		//记录查询日志
		connection.query(queryNameLogSql,[reqData['firstname'],reqData['lastname'],reqData['openid'],reqData['unionid'],reqData['nameid']],function(err,result){
			if(err) {
				throw err;
			}else{
				console.log('log2添加成功')
			}
		});

		//为选定名字querycount加1
		connection.query(addQueryCountSql,function(err,result){
			if(err){
				throw err;
			} else{
				console.log('+1成功')
			}
		});

		//查询指定名字具体信息
		connection.query(fontSql,function(err,results){
			if(err){
				throw err;
            }else{
                results.forEach(function(item,index){
                    var filterJS = JSON.parse(item['desc']);
                    filterJS.forEach(function(dyItem,dyIdx){
                        dyItem['js'].forEach(function(jsItem,jsIdx){
                            console.log(jsItem['cixing']);
                            jsItem['cixing'] = jsItem['cixing'].replace(/(^〈)|(〉$)/g,'')
							console.log(jsItem.cixing);
                        })
                    });
                    item['desc'] = JSON.stringify(filterJS)
                });
                data['wordData'] = results;
                if(data['wordData'][0]['font'] !== reqData['firstname'].substring(0,1)){
                    data['wordData'].reverse()
                }
			}

			//查询指定名字是否被收藏
			connection.query(judgeSaveSql,function(err,results){
				if(err){
					throw err;
                }else{
                    if(results.length>0){
                        data['isSave'] = true
                    }else{
                        data['isSave'] = false
                    }
                    res.write(JSON.stringify(data));
                    res.end();
				}
			})
		});

		 connection.release();
	})

}

/*收藏名字*/
function saveName(res,reqData){

	client.getConnection(function(err,connection){
		if(reqData['savetype'] === 'false'){   //收藏
            var judgeSaveSql = "SELECT id FROM qiming.user_collection WHERE name_id="+reqData['nameid']+" AND openid='"+reqData['openid']+"' AND lastname='"+reqData['lastname']+"'";
            var addSql = 'INSERT INTO qiming.user_collection(openid,firstname,lastname,name_id) VALUES(?,?,?,?)';
			connection.query(judgeSaveSql,function(err,result){
				if(err){
					throw err;
				}else{
					//判断以前是否保存过  有的话修改isdel为1  没有的话新插入一条
					if(result.length>0){    //以前收藏过
						connection.query("UPDATE qiming.user_collection SET isdel=1 WHERE name_id="+reqData['nameid']+" AND openid='"+reqData['openid']+"' AND lastname='"+reqData['lastname']+"'",function(updateErr,updateRes){
							if(updateErr){
								throw updateErr
							}else{
								res.write(JSON.stringify(updateErr));
								res.end()
							}
						})
					}else{					//第一次收藏
						connection.query(addSql,[reqData['openid'],reqData['firstname'],reqData['lastname'],reqData['nameid']],function(insertErr,insertRes){
							if(insertErr){
								throw insertErr
							}else{
								var sql = "SELECT id FROM qiming.user_collection WHERE name_id="+reqData['nameid']+" AND openid='"+reqData['openid']+"' AND lastname='"+reqData['lastname']+"'";
								res.write(JSON.stringify(insertRes));
								res.end() 
							}
						})
					}
				}
			})

		}else{     //取消收藏
			
			connection.query("UPDATE qiming.user_collection SET isdel=0 WHERE name_id="+reqData['nameid']+" AND openid='"+reqData['openid']+"'",function(err,result){
				if(err){
					throw err
				}else{
                    getCollectionName(res,reqData);
				}
			})
		}
		
		connection.release();
	})	
}

/*获取收藏的名字*/
function getCollectionName(res,reqData){
	console.log(reqData);
	var sql = "SELECT firstname,lastname,name_id FROM qiming.user_collection WHERE openid='"+reqData['openid']+"' AND isdel=1";
	client.getConnection(function(err,connection){
		connection.query(sql,function(err,results){
			if(err){
				throw err;
			}else{
				res.write(JSON.stringify(results));
				res.end();
			}
			// 关闭连接池
			connection.release();
		})
	})
}

//名字评分
function reviewName(res,reqData){
	console.log('review name!')
	console.log(reqData)
	var reviewData = {}; //用来储存最终返回的值
	var isReview = reqData['isreview'];
	var date = reqData['birthdaydate'],
		time = reqData['birthdaytime'],
		birthday = date+' '+time,
		fName = reqData['firstname'],
		lName = reqData['lastname'],
		openid = reqData['openid'],
		sex = reqData['sex'],
		unionid = reqData['unionid'],
		nickname = reqData['nickname'];

	//敏感词过滤
	var name = lName+fName;
    query.isSave(reqData).then(function(data){
        reviewData['isSave'] = data;
	});
	query.filterMgc(name).then(function () {
		return query.getBazis(birthday)

    }).then(function (baziInfo) {
        reviewData['baziInfo'] = baziInfo;
        return query.getLastNameInfo(lName) //获取姓氏信息
    }).then(function (lastNameInfo) {
		reviewData.lName = lastNameInfo
		return query.getFirstNameInfo(fName) //获取名字信息
	}).then(function (firstNameInfo) {
		reviewData.fName = firstNameInfo
		return query.getWugeInfo(reviewData['lName'],reviewData['fName'])	//获取五格信息
	}).then(function (wugeInfo) {
		reviewData['wugeInfo'] = wugeInfo
		reviewData['yxyscore'] = 95;
		reviewData['sxscore'] = 90;
		var bazi = reviewData['baziInfo']['bz'].replace(/\s/g,'');
		var xingshibihua = parseInt(reviewData['lName']['ftbihua'].split('$').reduce(function (preVal,curVal) {
			return parseInt(preVal)+parseInt(curVal)
		})),mingzibihua;
		if(reviewData['fName'].length>1){
			mingzibihua =  reviewData['fName'].reduce(function (preVal, curVal) {
				return parseInt(preVal['ftbihua'])+parseInt(curVal['ftbihua'])
			})
		}else{
			mingzibihua = parseInt(reviewData['fName'][0]['ftbihua'])
		}

		return Promise.all([				//获取五行信息、五格分数、卦象
			query.getWuxingInfo(bazi),
			query.getWugeScore(reviewData['wugeInfo']),
			query.getGx(xingshibihua, mingzibihua)
		])
	}).then(function (data) {
		reviewData['wuxingInfo'] = data[0];
		reviewData['wugeInfo']['sancai'] = data[1]['sancai'];
		reviewData['wugeInfo']['score'] = data[1]['wugefenshu'];
		reviewData['guaxiang'] = data[2];
		Promise.resolve()
	}).then(function () {
		var wugeInfo = reviewData['wugeInfo']
		return query.getRelation(wugeInfo['ren'], wugeInfo['wai'])	//计算人际关系解释
	}).then(function (relation) {
		reviewData['wugeInfo']['relation'] = relation;
		return query.getSuccess(reviewData['wugeInfo']['tian'], reviewData['wugeInfo']['di'], reviewData['wugeInfo']['ren']) //计算成功运、基础运、三才分析
	}).then(function (successInfo) {
		reviewData.wugeInfo['success'] = successInfo['success'];
		reviewData.wugeInfo['basis'] = successInfo['basis'];
		reviewData.wugeInfo['scfenxi'] = successInfo['scfenxi'];



            //起名
            if(isReview=='false'){

                reqData['lackprop'] = reviewData['baziInfo']['lackprop'];
                reqData['double'] = fName.length;
                query.add_queryname_log(reqData);
                query.update_querycount(reqData['nameid']);
                reviewData['err_code'] = 0;
                res.write(JSON.stringify(reviewData));
                res.end();
            }
            //名字测试
            else{

                var lFlag = reviewData.lName === null?0:1,
                    fFlag = reviewData.fName === null?0:1;
                var obj = reqData;
                obj.lFlag = lFlag;
                obj.fFlag = fFlag;
                query.add_review_log(obj).then(function () {
                    reviewData['err_code'] = 0;
                    res.write(JSON.stringify(reviewData));
                    res.end();
                })
            }
	}).catch(function (err) {
        res.write(JSON.stringify(err))
        res.end()
    })
}


//获取文章
function getArt(res, reqData) {
	console.log(reqData);
	client.getConnection(function (err, conn) {
		var sql = "SELECT id,title,content FROM qiming.artList WHERE id="+reqData['artid'];
		conn.query(sql,function (err, rows) {
			if(err){
				throw err
			}else{
				res.end(JSON.stringify(rows[0]))
			}
        });
		conn.release()
    })
}

//通过群分享进入获取群成员信息
function getGroupInfo(res,reqData) {
    //开始获取用户信息
    var appId = 'wxde194c3ecffe62ec', 
        secret = '05f82e8c24bdb173701ecdf155d4debf';

    var url="https://api.weixin.qq.com/sns/jscode2session?appid="+appId+"&secret="+secret+"&js_code=" + reqData['code'] + "&grant_type=authorization_code";
    https.get(url, function (response) {
        var datas = [];
        var size = 0;
        response.on('data', function (data) {
            datas.push(data);
            size += data.length;
        });
        response.on("end", function () {
            var buff = Buffer.concat(datas, size);
            var result = JSON.parse(buff.toString());
            var encryptedData = reqData['encryptedData'],
                sessionKey = result.session_key,
                iv = reqData['iv'];

            var pc = new WXBizDataCrypt(appId, sessionKey);

            var decrypt = pc.decryptData(encryptedData , iv);
			if(decrypt === null){				//如果解密失败  返回null
                res.write(JSON.stringify(decrypt));
                res.end();
			}else{
				var openGId = decrypt.openGId,  //获取到群ID
					searechGroupSql = "SELECT id,openid FROM qiming.groupmember WHERE openGId='"+openGId+"'";

                new Promise(function (resolve, reject) {   //查询此群内成员测试结果
                    client.query(searechGroupSql,function (err, rows) {
                        if(err){
                            throw err;
                        }else{
               				resolve(rows)
                        }
                    })
                }).then(function (rows) {
					return new Promise(function (resolve, reject) {
                        var openidGroup = rows.map(function (value){return "'"+value['openid']+"'"} );
                        console.log(openidGroup.indexOf("'"+reqData['openid']+"'"));
                        console.log(openidGroup.join(','));
                        if(rows.length>0){			//通过群ID查询 成员信息 有数据 （此群内有人测过）
                        	var sql = "SELECT nickname,avatarUrl,testresult FROM qiming.testmember WHERE openid IN ("+openidGroup.join(',')+")";
                        	console.log(sql);
                        	client.query(sql,function (err2, rows2) {
								if(err2){
									throw err2;
								}else{
									if(openidGroup.indexOf("'"+reqData['openid']+"'")>-1){	//群内测过的人包括自己 ==> 返回数据
										res.write(JSON.stringify({openGId:openGId,list:rows2}));
										res.end()
									}else{
										console.log(rows2); //群内测过的人不包括自己
                                        resolve({row1:rows,row2:rows2})
									}
								}
                            })
						}else{					//通过群ID查询 成员信息 无数据 （此群内无人测过）
                        	resolve({row1:rows,row2:[]})
						}
                    })
                }).then(function (rows) {
					return new Promise(function (resolve, reject) {
						//此群内无人测过 或者测试过的人不包括自己
						console.log('第三层');

						var sql = "SELECT nickname,avatarUrl,testresult FROM qiming.testmember WHERE openid='"+reqData['openid']+"'";
						client.query(sql,function (err3, rows3) {
							if(err3){
								throw err3;
							}else{
								//将自己的openid与群ID绑定
								var insertSql = "INSERT INTO qiming.groupmember (opengid,openid) VALUES(?,?)";
								client.query(insertSql,[openGId,reqData['openid']],function (insertErr, insertRes) {
									if(insertErr){
										throw insertErr
									}else{
										console.log(insertRes)
									}
                                });
								var data = rows['row2'].concat(rows3);					//将自己的信息合并至查询的信息
								res.write(JSON.stringify({openGId:openGId,list:data}));
								res.end();
							}
                        })
                    })
                })
			}
        });
    })

}

//在群内上传自己的测试结果 将用户ID与分享的群的ID绑定
function addResultInGroup(res, reqData) {
	var selectSql = "SELECT id FROM qiming.groupmember WHERE openid='"+reqData['openid']+"' AND opengid='"+reqData['openGId']+"'",
		insertSql = "INSERT INTO qiming.groupmember (opengid,openid) VALUES(?,?)";
	client.query(selectSql,function (err, rows) {
		if(err){
			throw err;
		}else{
			if(rows.length<1){
                console.log('未绑定过此群ID');
				client.query(insertSql,[reqData['openGId'],reqData['openid']],function(err2,result2){
					if(err2){
						throw err2;
					}else{
                        res.write(JSON.stringify(result2));
                        res.end()
					}
				})
			}else{
				console.log('以绑定过此群ID');
				res.write(JSON.stringify(rows));
				res.end()
			}
		}
    })

}

//获取用户测试结果 （非群分享进入）
function getUserTest(res, reqData) {

	var sql = "SELECT id,nickname,avatarUrl,testresult FROM qiming.testmember WHERE openid='"+reqData['openid']+"'";
	client.query(sql,function (err, rows) {
		if(err){
			throw err;
		}else{
			if(rows[0]['testresult']<11){
				rows = [];
			}
			console.log(rows);
			res.write(JSON.stringify(rows));
			res.end()
		}
    })
}

//修改用户测试结果
function fixUserTest(res,reqData,req) {
	var sql = "UPDATE qiming.testmember SET nickname='"+reqData['nickname']+"',avatarUrl='"+reqData['avatarUrl']+"',testresult="+reqData['testresult']+" WHERE openid='"+reqData['openid']+"'";
	client.query(sql,function (err, result) {
		if(err){
			throw err;
		}else{
			console.log(result);
			res.write(JSON.stringify(result));
			res.end()
		}
    })
}

//添加用户刷新名字个数
function pushCount(res,reqData,req) {
	console.log(reqData)
	var openid = reqData['openid']
    var sql = "UPDATE qiming.testmember SET havecount=havecount+50 WHERE openid='"+openid+"'"
	console.log(sql)
    client.query(sql, function (err, result) {
        if(err){
            throw err
        }else{
        	console.log(result)
        	res.end(JSON.stringify({err_code: 2,count:50}))
		}
    })
}

function englishNamesGroup(res, reqData) {
	console.log(reqData)
	res.write('hello');
	res.end();
}

function notifyPay(res,reqData,req) {

    var xmlData;
    for(var k in reqData){
		xmlData = k;
		break;
    }
    res.write(xmlData);
    res.end();
}

// 拼音五行与汉字五行转换
function formatWuxing(prop) {
	if(prop.length>1){
		switch (prop){
			case 'jin':
				return '金';
				break;
            case 'mu':
                return '木';
                break;
            case 'shui':
                return '水';
                break;
            case 'huo':
                return '火';
                break;
            case 'tu':
                return '土';
                break;
		}
	}else{
        switch (prop){
            case '金':
                return 'jin';
                break;
            case '木':
                return 'mu';
                break;
            case '水':
                return 'shui';
                break;
            case '火':
                return 'huo';
                break;
            case '土':
                return 'tu';
                break;
        }
	}
}

//测试
function test(res, reqData) {
	console.log(reqData);
	var hello = {
		name: 'wang',
		age: 24,
		job: 'a按时'
	};
	var jsonData = JSON.stringify(hello);
	res.end('jsonpCallback('+jsonData+')')
}
//测试接口
function example(res, reqData){
}

exports.getNamesGroup = getNamesGroup; 			//获取名字列表
exports.refreshNamesGroup = refreshNamesGroup;  //刷新名字列表
exports.getNameDetail = getNameDetail; 			//获取单个名字详情
exports.addQueryLog = addQueryLog;				//记录查询日志
exports.test = test;
exports.getUserInfo = getUserInfo;				//获取用户信息
exports.saveName = saveName;					//收藏名字
exports.getCollectionName = getCollectionName;  //获取此用户收藏的名字
exports.reviewName = reviewName;				//名字测评
exports.getLastNameInfo = getLastNameInfo;		//获取姓氏信息
exports.getArt = getArt;						//获取文章信息
exports.pushCount = pushCount;					//添加用户刷新名字个数
exports.getGroupInfo = getGroupInfo;			//获取群内成员测试结果
exports.addResultInGroup = addResultInGroup;	//获取群内成员测试结果
exports.getUserTest = getUserTest;				//获取用户测试结果（非群分享入口进入）
exports.fixUserTest = fixUserTest;				//获取用户测试结果（非群分享入口进入）

exports.englishNamesGroup = englishNamesGroup;//获取英文名组
exports.notifyPay = notifyPay;//支付接口
exports.example = example;//支付接口



