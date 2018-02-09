var http = require('./http'),
	router = require('./routes/index'),
	requestHandlers = require('./routes/names'),
	req = require('./models/names'),
	payApi = require('./routes/payapi'),
	tg = require('./routes/tg');

/*
所有新的接口都要再此注册，这里是一个路由表的用途
如 handle['/addquerylog'] = requestHandlers.addQueryLog
这里表示路径为 /addquerylog 时  执行requestHandlers里的addQueryLog方法
requestHandlers这里表示从上面引入的require('./routes/names')
*/
var handle = {};
handle['/'] = requestHandlers.getNamesGroup;
handle['/getnamesgroup'] = requestHandlers.getNamesGroup;
handle['/refreshnames'] = requestHandlers.refreshNamesGroup;
handle['/getnamedetail'] = requestHandlers.getNameDetail;
handle['/addquerylog'] = requestHandlers.addQueryLog;
handle['/test'] = requestHandlers.test;
handle['/getuserinfo'] = requestHandlers.getUserInfo;
handle['/getuserinfo/savename'] = requestHandlers.saveName;
handle['/getcollectionname'] = requestHandlers.getCollectionName;
handle['/reviewname'] = requestHandlers.reviewName;
handle['/getlastnameinfo'] = requestHandlers.getLastNameInfo;
handle['/getart'] = requestHandlers.getArt;
handle['/pushcount'] = requestHandlers.pushCount;
handle['/getgroupinfo'] = requestHandlers.getGroupInfo;
handle['/addresult'] = requestHandlers.addResultInGroup;
handle['/getusertest'] = requestHandlers.getUserTest;
handle['/fixusertest'] = requestHandlers.fixUserTest;
handle['/getenglishnamesgroup'] = requestHandlers.englishNamesGroup;
handle['/example'] = requestHandlers.example;
handle['/getbazi'] = req.getBazi;
handle['/getWuXingInfo'] = req.getWuXingInfo;
handle['/getWuge'] = req.getWuge ;
//推广相关
handle['/tg/custom'] = tg.customInfo;

//支付接口
handle['/createorder'] = payApi.createOrder;
handle['/notifypay'] = payApi.notify;

http.start(router.route,handle);


