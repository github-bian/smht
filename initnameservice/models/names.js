var mysql = require('mysql');
    bazi = require('../utils/bazi'),
    wuge = require('../utils/wuge'),
    http = require('http'),
    https = require('https'),
    url = require('url');



/*创建连接  使用连接池*/
var client = mysql.createPool({    
  host:'localhost',
  user: 'root',
  password: '1234',
  port:'3306',
  database:'qiming'
})

//敏感词过滤
function filterMgc(name) {
    var mgc =  ["习近平", "马凯", "王岐山", "王沪宁", "刘奇葆", "刘云山", "刘延东", "孙春兰", "李建国", "杜青林", "张春贤", "张高丽", "杨晶", "李克强", "汪洋", "孟建柱", "俞正声", "赵洪祝", "胡春华", "赵乐际", "郭金龙", "栗战书", "韩正", "毛泽东", "朱德", "刘少奇", "周恩来", "邓小平", "林彪", "彭德怀", "陈毅", "华国锋", "胡耀邦", "赵紫阳", "江泽民", "胡锦涛"];
    if(mgc.indexOf(name) >= 0){
        console.log('敏感')
        return Promise.reject({err_code: 1, err_msg: '该名字深不可测'})
    }else{
        return Promise.resolve()
    }
}

//姓氏信息
function getLastNameInfo(lastname) {
    var sql = "SELECT id,lastname,pinyin,bihua,ftbihua,wuxing,rank,sort,fuxing FROM qiming.xingshibase WHERE lastname='"+lastname+"'";
    return new Promise(function (resolve, reject) {
        client.query(sql,function (err, rows) {
            if(err){
              throw err
            }else{
              if(rows[0]){
                resolve(rows[0])
              }else{
                client.query("SELECT id,font,pinyin,bihua,ftbihua,wuxing FROM qiming.fontbase WHERE font='"+lastname+"'",function (err2, rows2) {
                  if(err2){
                      throw err
                  }else{
                    if(rows2.length>0){
                      var LInfo = Object.assign({},rows2[0],{
                          lastname: rows2[0]['font'],
                          rank: -1,
                          sort: -1,
                          fuxing: 0
                      })
                        delete LInfo.font
                        resolve(LInfo)
                    }else{
                        client.query("UPDATE qiming.generatename_log SET `exists`=0 WHERE lastname='"+lastname+"'",function (err) {
                            if(err){
                                throw err
                            }
                        })
                      reject({err_code: 3, err_msg: '抱歉哦，没有找到您的姓氏相关信息(；′⌒`)'})
                    }
                  }
                })
              }
            }
        })
    })
}


//名字信息
function getFirstNameInfoByFont(firstname) {
  return new Promise(function (resolve, reject) {
      var fontSql;              //根据单双名生成查询语句
      if(firstname.length === 1){
          fontSql = "SELECT id,font,pinyin,bushou,bihua,ftbihua,wuxing,fanti,`desc` FROM qiming.fontbase WHERE font='"+firstname+"'";
      }else if(firstname.length === 2){
          fontSql = "SELECT id,font,pinyin,bushou,bihua,ftbihua,wuxing,fanti,`desc` FROM qiming.fontbase WHERE font='"+firstname.substring(0,1)+"' OR font='"+firstname.substring(1)+"'"
      }
      client.query(fontSql,function (err, rows) {
          if(err){
              throw err
          }else{
              if((rows.length<firstname.length && firstname.substring(0,1) !== firstname.substring(1)) || (rows.length === 0)){  //如果字库中查不到该名字  则为null
                  reject({err_code: 4, err_msg: '抱歉哦，没有找到您的名字相关信息(；′⌒`)'})
              }else{
                  rows.forEach(function(item,index){
                      var filterJS = JSON.parse(item['desc']);  //去掉解释中的尖括号  后期优化数据库 这一步可以省略

                      filterJS.forEach(function(dyItem,dyIdx){
                          dyItem['js'].forEach(function(jsItem,jsIdx){
                              jsItem['cixing'] = jsItem['cixing'].replace(/(^〈)|(〉$)/g,'')

                          });
                      });
                      item['desc'] = JSON.stringify(filterJS)

                  });
                  if(rows[0]['font'] !== firstname.substring(0,1)){   //判断查询结果是否按名字顺序排列，如不是则调换位置
                      rows.reverse()
                  }
                  if(rows.length>2){
                      console.log('名字有重复!')
                  }
                  resolve(rows)
              }
          }
      })
  })
}
//获取八字
function getBazis(birth) {
    var param = birth.split(/[-:\s]/g)
    var baziInfo = bazi.getbazi(param[0], param[1], param[2], param[3])
    var formatBazi = baziInfo.bz.replace(/\s/g, '');
    return getWuxingInfo(formatBazi).then(function (wuxingInfo) {
        return new Promise(function (resolve, reject) {
            baziInfo['lackprop'] = wuxingInfo['xishen']['xiyongshen']
            resolve(baziInfo)
        })
    })
}
//获取八字,五行信息
function getBazi(res,reqData) {
    console.log(reqData);
    var birth = reqData.birthdaydate + ' ' + reqData.birthdaytime;
    var param = birth.split(/[-:\s]/g)
    var baziInfo = bazi.getbazi(param[0], param[1], param[2], param[3])
    var formatBazi = baziInfo.bz.replace(/\s/g, '');
    return getWuxingInfo(formatBazi).then(function (wuxingInfo) {
        return new Promise(function (resolve, reject) {
            baziInfo['wuxingInfo'] = wuxingInfo;
            //resolve(baziInfo)
            res.write(JSON.stringify(baziInfo));
            res.end();
        })
    })
}
//获取五行信息
function getWuXingInfo(res,reqData){
    var resInfo = {};
    var birth = reqData.birthdaydate + ' ' + reqData.birthdaytime;
    var param = birth.split(/[-:\s]/g);
    var baziInfo = bazi.getbazi(param[0], param[1], param[2], param[3])
    var formatBazi = baziInfo.bz.replace(/\s/g, '');
    return getWuxingInfo(formatBazi).then(function (wuxingInfo) {
        resInfo['wuxingInfo'] =wuxingInfo;
        res.write(JSON.stringify(resInfo));
        res.end();
    });
}
//获取五格信息
function getWuge(res,reqData){
    var lname = reqData['lastname'];
    var fname = reqData['firstname'];
    var wugeInfo =wuge.getWuge(lname, fname);
    res.write(JSON.stringify(wugeInfo));
    res.end();
}

//五格信息
function getWugeInfo(lastInfo, firstInfo) {
    return new Promise(function (resolve, reject) {
        console.log('begin1111111');
        var wugeInfo =wuge.getWuge(lastInfo, firstInfo);
        console.log('success');
        console.log(wugeInfo);
        if(wugeInfo){
            var zongge_num = wugeInfo['zong']>80?wugeInfo['zong']-80:wugeInfo['zong'];
            var sql = "SELECT content FROM qiming.scwg_zong WHERE num="+zongge_num;
            client.query("SELECT content FROM qiming.scwg_zong WHERE num="+zongge_num,function (zErr, zRows) {
               console.log('执行了sql');
               console.log(sql);
                if(!zErr){
                    console.log('jinglail')
                    wugeInfo['zongge_js'] = zRows[0]['content'];
                    var wugeshuli = [
                        {"shuzi":"1","anshiyiyi":"（太极之数）太极之数，万物开泰，生发无穷，利禄亨通。","jixiong":"吉"},
                        {"shuzi":"2","anshiyiyi":"（两仪之数）两仪之数，混沌未开，进退保守，志望难达。","jixiong":"凶"},
                        {"shuzi":"3","anshiyiyi":"（三才之数）三才之数，天地人和，大事大业，繁荣昌隆。","jixiong":"吉"},
                        {"shuzi":"4","anshiyiyi":"（四象之数）四象之数，待于生发，万事慎重，不具营谋。","jixiong":"凶"},
                        {"shuzi":"5","anshiyiyi":"（五行之数）五行俱权，循环相生，圆通畅达，福祉无穷。","jixiong":"吉"},
                        {"shuzi":"6","anshiyiyi":"（六爻之数）六爻之数，发展变化，天赋美德，吉祥安泰。","jixiong":"吉"},
                        {"shuzi":"7","anshiyiyi":"（七政之数）七政之数，精悍严谨，天赋之力，吉星照耀。","jixiong":"吉"},
                        {"shuzi":"8","anshiyiyi":"（八卦之数）八卦之数，乾坎艮震，巽离坤兑，无穷无尽。","jixiong":"半吉"},
                        {"shuzi":"9","anshiyiyi":"（大成之数）大成之数，蕴涵凶险，或成或败，难以把握。","jixiong":"凶"},
                        {"shuzi":"10","anshiyiyi":"(终结之数）终结之数，雪暗飘零，偶或有成，回顾茫然。","jixiong":"凶"},
                        {"shuzi":"11","anshiyiyi":"（旱苗逢雨）万物更新，调顺发达，恢弘泽世，繁荣富贵。","jixiong":"吉"},
                        {"shuzi":"12","anshiyiyi":"（掘井无泉）无理之数，发展薄弱，虽生不足，难酬志向。","jixiong":"凶"},
                        {"shuzi":"13","anshiyiyi":"（春日牡丹）才艺多能，智谋奇略，忍柔当事，鸣奏大功。","jixiong":"吉"},
                        {"shuzi":"14","anshiyiyi":"（破兆）家庭缘薄，孤独遭难，谋事不达，悲惨不测。","jixiong":"凶"},
                        {"shuzi":"15","anshiyiyi":"（福寿）福寿圆满，富贵荣誉，涵养雅量，德高望重。","jixiong":"吉"},
                        {"shuzi":"16","anshiyiyi":"（厚重）厚重载德，安富尊荣，财官双美，功成名就。","jixiong":"吉"},
                        {"shuzi":"17","anshiyiyi":"（刚强）权威刚强，突破万难，如能容忍，必获成功。","jixiong":"半吉"},
                        {"shuzi":"18","anshiyiyi":"（铁镜重磨）权威显达，博得名利，且养柔德，功成名就。","jixiong":"半吉"},
                        {"shuzi":"19","anshiyiyi":"（多难）风云蔽日，辛苦重来，虽有智谋，万事挫折。","jixiong":"凶"},
                        {"shuzi":"20","anshiyiyi":"（屋下藏金）非业破运，灾难重重，进退维谷，万事难成。","jixiong":"凶"},
                        {"shuzi":"21","anshiyiyi":"（明月中天）光风霁月，万物确立，官运亨通，大搏名利。女性不宜此数。","jixiong":"吉"},
                        {"shuzi":"22","anshiyiyi":"（秋草逢霜）秋草逢霜，困难疾弱，虽出豪杰，人生波折。","jixiong":"凶"},
                        {"shuzi":"23","anshiyiyi":"（壮丽）旭日东升，壮丽壮观，权威旺盛，功名荣达。女性不宜此数。","jixiong":"吉"},
                        {"shuzi":"24","anshiyiyi":"（掘藏得金）家门余庆，金钱丰盈，白手成家，财源广进。","jixiong":"吉"},
                        {"shuzi":"25","anshiyiyi":"（荣俊）资性英敏，才能奇特，克服傲慢，尚可成功。","jixiong":"半吉"},
                        {"shuzi":"26","anshiyiyi":"（变怪）变怪之谜，英雄豪杰，波澜重叠，而奏大功。","jixiong":"凶"},
                        {"shuzi":"27","anshiyiyi":"（增长）欲望无止，自我强烈，多受毁谤，尚可成功。","jixiong":"半吉"},
                        {"shuzi":"28","anshiyiyi":"（阔水浮萍）遭难之数，豪杰气概，四海漂泊，终世浮躁。女性不宜此数。","jixiong":"凶"},
                        {"shuzi":"29","anshiyiyi":"（智谋）智谋优秀，财力归集，名闻海内，成就大业。","jixiong":"吉"},
                        {"shuzi":"30","anshiyiyi":"（非运）沉浮不定，凶吉难变，若明若暗，大成大败。","jixiong":"半吉"},
                        {"shuzi":"31","anshiyiyi":"（春日花开）智勇得志，博得名利，统领众人，繁荣富贵。","jixiong":"吉"},
                        {"shuzi":"32","anshiyiyi":"（宝马金鞍）侥幸多望，贵人得助，财帛如裕，繁荣至上。","jixiong":"吉"},
                        {"shuzi":"33","anshiyiyi":"（旭日升天）旭日升天，鸾凤相会，名闻天下，隆昌至极。女性不宜此数。","jixiong":"吉"},
                        {"shuzi":"34","anshiyiyi":"（破家）破家之身，见识短小，辛苦遭逢，灾祸至极。","jixiong":"凶"},
                        {"shuzi":"35","anshiyiyi":"（高楼望月）温和平静，智达通畅，文昌技艺，奏功洋洋。","jixiong":"吉"},
                        {"shuzi":"36","anshiyiyi":"（波澜重叠）波澜重叠，沉浮万状，侠肝义胆，舍己成仁。","jixiong":"半吉"},
                        {"shuzi":"37","anshiyiyi":"（猛虎出林）权威显达，热诚忠信，宜着雅量，终身荣富。","jixiong":"吉"},
                        {"shuzi":"38","anshiyiyi":"（磨铁成针）意志薄弱，刻意经营，才识不凡，技艺有成。","jixiong":"半吉 "},
                        {"shuzi":"39","anshiyiyi":"（富贵荣华）富贵荣华，财帛丰盈，暗藏险象，德泽四方。","jixiong":"半吉"},
                        {"shuzi":"40","anshiyiyi":"（退安）智谋胆力，冒险投机，沉浮不定，退保平安。","jixiong":"半吉"},
                        {"shuzi":"41","anshiyiyi":"（有德）纯阳独秀，德高望重，和顺畅达，博得名利。此数为最大好运数。","jixiong":"吉"},
                        {"shuzi":"42","anshiyiyi":"（寒蝉在柳）博识多能，精通世情，如能专心，尚可成功。","jixiong":"半吉"},
                        {"shuzi":"43","anshiyiyi":"（散财破产）散财破产，诸事不遂，虽有智谋，财来财去。","jixiong":"凶"},
                        {"shuzi":"44","anshiyiyi":"（烦闷）破家亡身，暗藏惨淡，事不如意，乱世怪杰。","jixiong":"凶"},
                        {"shuzi":"45","anshiyiyi":"（顺风）新生泰和，顺风扬帆，智谋经纬，富贵繁荣。","jixiong":"吉"},
                        {"shuzi":"46","anshiyiyi":"（浪里淘金）载宝沉舟，浪里淘金，大难尝尽，大功有成。","jixiong":"半吉"},
                        {"shuzi":"47","anshiyiyi":"（点石成金）花开之象，万事如意，祯祥吉庆，天赋幸福。","jixiong":"吉"},
                        {"shuzi":"48","anshiyiyi":"（古松立鹤）智谋兼备，德量荣达，威望成师，洋洋大观。","jixiong":"吉"},
                        {"shuzi":"49","anshiyiyi":"（转变）吉临则吉，凶来则凶，转凶为吉，配好三才。","jixiong":"半吉"},
                        {"shuzi":"50","anshiyiyi":"（小舟入海）一成一败，吉凶参半，先得庇荫，后遭凄惨。","jixiong":"半吉"},
                        {"shuzi":"51","anshiyiyi":"（沉浮）盛衰交加，波澜重叠，如能慎始，必获成功。","jixiong":"半吉"},
                        {"shuzi":"52","anshiyiyi":"（达眼）卓识达眼，先见之明，智谋超群，名利双收。","jixiong":"吉"},
                        {"shuzi":"53","anshiyiyi":"（曲卷难星）外祥内患，外祸内安，先富后贫，先贫后富。","jixiong":"凶"},
                        {"shuzi":"54","anshiyiyi":"（石上栽花）石上栽花，难得有活，忧闷烦来，辛惨不绝。","jixiong":"凶"},
                        {"shuzi":"55","anshiyiyi":"（善恶）善善得恶，恶恶得善，吉到极限，反生凶险。","jixiong":"半吉"},
                        {"shuzi":"56","anshiyiyi":"（浪里行舟）历尽艰辛，四周障碍，万事龃龌，做事难成。","jixiong":"凶"},
                        {"shuzi":"57","anshiyiyi":"（日照春松）寒雪青松，夜莺吟春，必遭一过，繁荣白事。","jixiong":"吉"},
                        {"shuzi":"58","anshiyiyi":"（晚行遇月）沉浮多端，先苦后甜，宽宏扬名，富贵繁荣。","jixiong":"半吉"},
                        {"shuzi":"59","anshiyiyi":"（寒蝉悲风）寒蝉悲风，意志衰退，缺乏忍耐，苦难不休。","jixiong":"凶"},
                        {"shuzi":"60","anshiyiyi":"（无谋）无谋之人，漂泊不定，晦暝暗黑，动摇不安。","jixiong":"凶"},
                        {"shuzi":"61","anshiyiyi":"（牡丹芙蓉）牡丹芙蓉，花开富贵，名利双收，定享天赋。","jixiong":"吉"},
                        {"shuzi":"62","anshiyiyi":"（衰败）衰败之象，内外不和，志望难达，灾祸频来。","jixiong":"凶"},
                        {"shuzi":"63","anshiyiyi":"（舟归平海）富贵荣华，身心安泰，雨露惠泽，万事亨通。","jixiong":"吉"},
                        {"shuzi":"64","anshiyiyi":"（非命）骨肉分离，孤独悲愁，难得心安，做事不成。","jixiong":"凶"},
                        {"shuzi":"65","anshiyiyi":"（巨流归海）天长地久，家运隆昌，福寿绵长，事事成就。","jixiong":"吉"},
                        {"shuzi":"66","anshiyiyi":"（岩头步马）进退维谷，艰难不堪，等待时机，一跃而起。","jixiong":"凶"},
                        {"shuzi":"67","anshiyiyi":"（顺风通达）天赋幸运，四通八达，家道繁昌，富贵东来。","jixiong":"吉"},
                        {"shuzi":"68","anshiyiyi":"（顺风吹帆）智虑周密，集众信达，发明能智，拓展昂进。","jixiong":"吉"},
                        {"shuzi":"69","anshiyiyi":"（非业）非业非力，精神迫滞，灾害交至，遍偿痛苦。","jixiong":"凶"},
                        {"shuzi":"70","anshiyiyi":"（残菊逢霜）残菊逢霜，寂寞无碍，惨淡忧愁，晚景凄凉。","jixiong":"凶"},
                        {"shuzi":"71","anshiyiyi":"（石上金花）石上金花，内心劳苦，贯彻始终，定可昌隆。","jixiong":"半吉"},
                        {"shuzi":"72","anshiyiyi":"（劳苦）荣苦相伴，阴云覆月，外表吉祥，内实凶祸。","jixiong":"半吉"},
                        {"shuzi":"73","anshiyiyi":"（无勇）盛衰交加，徒有高志，天王福祉，终世平安。","jixiong":"半吉"},
                        {"shuzi":"74","anshiyiyi":"（残菊经霜）残菊经霜，秋叶寂寞，无能无智，辛苦繁多。","jixiong":"凶"},
                        {"shuzi":"75","anshiyiyi":"（退守）退守保吉，发迹甚迟，虽有吉象，无谋难成。","jixiong":"凶"},
                        {"shuzi":"76","anshiyiyi":"（离散）倾覆离散，骨肉分离，内外不和，虽劳无功。","jixiong":"凶"},
                        {"shuzi":"77","anshiyiyi":"（半吉）家庭有悦，半吉半凶，能获援护，陷落不幸。","jixiong":"半吉"},
                        {"shuzi":"78","anshiyiyi":"（晚苦）祸福参半，先天智能，中年发达，晚景困苦。","jixiong":"凶"},
                        {"shuzi":"79","anshiyiyi":"（云头望月）云头望月，身疲力尽，穷迫不伸，精神不定。","jixiong":"凶"},
                        {"shuzi":"80","anshiyiyi":"（遁吉）辛苦不绝，早入隐遁，安心立命，化凶转吉。","jixiong":"凶"},
                        {"shuzi":"81","anshiyiyi":"（万物回春）最吉之数，还本归元，吉祥重叠，富贵尊荣。","jixiong":"吉"}
                    ];
                    wugeInfo['zong_js'] = wugeInfo['zong']<=81?wugeshuli[wugeInfo['zong']-1]:wugeshuli[wugeInfo['zong']-81];
                    wugeInfo['tian_js'] = wugeInfo['tian']<=81?wugeshuli[wugeInfo['tian']-1]:wugeshuli[wugeInfo['tian']-81];
                    wugeInfo['di_js'] = wugeInfo['di']<=81?wugeshuli[wugeInfo['di']-1]:wugeshuli[wugeInfo['di']-81];
                    wugeInfo['ren_js'] = wugeInfo['ren']<=81?wugeshuli[wugeInfo['ren']-1]:wugeshuli[wugeInfo['ren']-81];
                    wugeInfo['wai_js'] = wugeInfo['wai']<=81?wugeshuli[wugeInfo['wai']-1]:wugeshuli[wugeInfo['wai']-81];
                    resolve(wugeInfo)
                }else{
                    console.log('失败了');
                    throw zErr;
                }
            });
        }else{
            reject({err_code: 5, err_msg: '五格信息缺失'})
        }
    })
}

//五行信息
function getWuxingInfo(bazi) {
    var getWuxingUrl = "https://qmsq.7dar.com/apigetxys?bazi="+encodeURI(bazi);
    return new Promise(function (resolve, reject) {
        https.get(getWuxingUrl, function (response) {
            var datas = [];
            var size = 0;
            response.on('data', function (data) {
                datas.push(data);
                size += data.length;
            });
            response.on('end', function () {
                var buff = Buffer.concat(datas, size);
                var result = JSON.parse(buff.toString());
                resolve(result)
            })
        })
    })
}

//五格分数
function getWugeScore(wugeInfo) {
    var url = "https://qmsq.7dar.com/apigetsancaiwuge?tian="+wugeInfo['tian']+"&di="+wugeInfo['di']+"&ren="+wugeInfo['ren']+"&wai="+wugeInfo['wai']+"&zong="+wugeInfo['zong'];
    return new Promise(function (resolve, reject) {
        https.get(url, function (response) {
            var datas = [];
            var size = 0;
            response.on('data', function (data) {
                datas.push(data)
                size += data.length
            });
            response.on('end', function () {
                var buff = Buffer.concat(datas, size);
                var result = JSON.parse(buff.toString());
                resolve(result)
            })
        })
    })
}

//卦象
function getGx(lastStrokes, firstStrokes) {
    var url = "https://qmsq.7dar.com/apigetzygx?xing="+lastStrokes+"&ming="+firstStrokes;
    return new Promise(function (resolve, reject) {
        https.get(url, function (response) {
            var datas = [];
            var size = 0;
            response.on('data', function (data) {
                datas.push(data)
                size += data.length
            })
            response.on('end', function () {
                var buff = Buffer.concat(datas, size)
                var result = JSON.parse(buff.toString())
                resolve(result)
            })
        })
    })
}

//人际关系解释
function getRelation(renge, waige) {
    var ren_num =renge%10<1?10:renge%10,
        wai_num = waige%10<1?10:waige%10;
    return new Promise(function (resolve, reject) {
        client.query("SELECT relation FROM qiming.scwg_wai WHERE ren="+ren_num+" AND wai="+wai_num,function (wErr, wRows) {
            if(wErr){
                throw wErr;
            }else{
                console.log('get relation finished')
                resolve(wRows[0]['relation'])
            }
        });
    })
}

//成功运、基础运、三才解释
function getSuccess(tian, di, ren) {
    //天和地都是只取奇数个位数， 如 1或2对应1,3或4对应3,9或10对应9
    var tian_num = tian%10<1?9:(tian%10)%2===0?tian%10-1:tian%10,
        di_num = di%10<1?9:(di%10)%2===0?di%10-1:di%10,
        ren_num = ren%10<1?10:ren%10;
    var sql = "SELECT success,basis,scfenxi FROM qiming.scwg_tiandi WHERE tian="+tian_num+" AND di="+di_num+" AND ren="+ren_num;
    return new Promise(function (resolve, reject) {
        client.query(sql,function (err,rows) {
            if(err){
                throw err
            }else{
                resolve(rows[0])
            }
        });
    })
}

//记录查询日志
function add_queryname_log(obj) {

    var sql = 'INSERT INTO qiming.queryname_log(name,lastname,openid,unionid,multi_name_id) VALUES(?,?,?,?,?)';
    return new Promise(function (resolve, reject) {
        client.query(sql,[obj['firstname'],obj['lastname'],obj['openid'],obj['unionid'],obj['nameid']],function(err,result){
            if(err) {
                throw err;
            }else{
                resolve(result)
            }
        })
    })
}

//更新名字被查询次数
function update_querycount(nameid) {
    var sql = 'UPDATE qiming.multi_name SET querycount=querycount+1 WHERE id='+nameid;
    return new Promise(function (resolve, reject) {
        client.query(sql,function(err,result){
            if(err){
                throw err;
            } else{
                resolve(result)
            }
        });
    })
}

//是否收藏
function isSave(obj) {
    var sql = "SELECT id FROM qiming.user_collection WHERE firstname='"+obj['firstname']+"' AND openid='"+obj['openid']+"' AND lastname='"+obj['lastname']+"' AND isdel=1";
    return new Promise(function (resolve, reject) {
        client.query(sql,function(err,results){
            if(err){
                throw err;
            }else{
                if(results.length>0){
                    resolve(1)
                }else{
                    resolve(-1)
                }
            }
        })
    })
}

//记录名字测试记录
function add_review_log(obj) {
    var birthday = obj['birthdaydate']+ ' '+obj['birthdaytime']
    var logSql = "INSERT INTO qiming.review_log " +
        "(nickname,lastname,firstname,sex,birthday,openid,unionid,lexist,fexist) " +
        "VALUES('"+obj['nickname']+"','"+obj['lastname']+"','"+obj['firstname']+"',"+obj['sex']+",'"+birthday+"','"+obj['openid']+"','"+obj['unionid']+"',"+obj['lFlag']+","+obj['fFlag']+")";
    return new Promise(function (resolve) {
        client.query(logSql,function (err, result) {
            if(err){
                throw err
            }else{
                //日志记录成功
                resolve()
            }
        });
    })
}

//获取名字组
function getNamesGroup(obj) {
    console.log(obj)
    var mode = +obj['mode'],
        count = +obj['double'],
        sex = +obj['sex'],
        lackprop = obj['lackprop'],
        page = +obj['curpage'];
    var sql = '';
    if ( mode === 1) {
        sql = "SELECT id,name FROM qiming.multi_name WHERE isfull=1 AND num="+count+" AND(sex ="+sex+" OR sex=0) AND "+lackprop+"=1 ORDER BY RAND() limit 10"
    }else{
        sql = "SELECT id,name FROM qiming.multi_name WHERE isfull=1 AND num="+count+" AND(sex ="+sex+" OR sex=0) ORDER BY RAND() limit 10"
    }
console.log(sql)
    return new Promise(function (resolve, reject) {
        client.query(sql, function (err, rows) {
            if (err) {
               throw err+'查询名字组出错'
            }else{
                resolve(rows)
            }
        })
    })
}

//更新用户刷新次数
function updateUserRefreshCount(obj) {
    var sql = '';
    console.log(obj)
    if(obj['refreshCount']){
        sql = "UPDATE qiming.testmember SET havecount=havecount-1 WHERE openid='"+obj['openid']+"'"
    }else{
        sql = "UPDATE qiming.testmember SET refresh=refresh+1,havecount=havecount-"+obj['size']+" WHERE openid='"+obj['openid']+"'"
    }
    console.log(sql)
    return new Promise(function (resolve, reject) {
        client.query(sql, function (err, result) {
            if(err){
                reject(err)
            }else{
                console.log('update refresh count success!')
                resolve()
            }
        })
    })
}

//添加用户刷新日志
function addUserRefreshLog(obj) {
    var sql = "INSERT INTO qiming.refreshlog (lastname,openid) VALUES('"+obj['lastname']+"','"+obj['openid']+"')"
    return new Promise(function (resolve, reject) {
        client.query(sql, function (err) {
            if(err){
                reject(err)
            }else{
                console.log('add user refresh log success!')
                resolve()
            }
        })
    })
}

//记录用户点击上一个下一个按钮日志
function addCutNameLog(obj) {
    var sql = "INSERT INTO qiming.cutNameLog (cuttype,lastname,firstname,nameid,openid) VALUES(?,?,?,?,?)"
    return new Promise(function (resolve, reject) {
        console.log(obj['cutName'])
        if(obj['cutName']){
            var cutType = obj['cutName']==='next'?1:-1;
            client.query(sql,[cutType,obj['lastname'],obj['firstname'],obj['nameid'],obj['openid']],function (err, result) {
                if(err){
                    reject(err)
                }else{
                    resolve()
                }
            })
        }else{
            resolve()
        }

    })

}

//获取用户是否曾经打赏
function isTip(openid) {
    var sql = "SELECT * from qiming.qmorder where attach='起名神器-打赏' and openid='"+openid+"'"
    return new Promise(function (resolve, reject) {
        client.query(sql, function (err, result) {
            if(err){
                throw err
            }else{
                resolve(result.length)
            }
        })
    })

}

//获取当前名字下一个名字（通过名字组进入）
function getNextName(obj) {
    var mode = +obj['mode'],
        count = +obj['double'],
        sex = +obj['sex'],
        lackprop = obj['lackprop'],
        nameid = obj['nameid'],
        flag = obj['flag']==='prev'?'<':'>';
    console.log(flag)
    var sql = '';
    if ( mode === 1) {
        if(obj['flag']==='prev'){
            sql = "SELECT id,name FROM qiming.multi_name WHERE isfull=1 AND num="+count+" AND (sex ="+sex+" OR sex=0) AND "+lackprop+"=1 AND id<"+nameid+" ORDER BY id desc limit 0,1"
        }else{
            sql = "SELECT id,name FROM qiming.multi_name WHERE isfull=1 AND num="+count+" AND (sex ="+sex+" OR sex=0) AND "+lackprop+"=1 AND id>"+nameid+" limit 0,1"
        }
    }else{
        if(obj['flag']==='prev'){
            sql = "SELECT id,name FROM qiming.multi_name WHERE isfull=1 AND num="+count+" AND (sex ="+sex+" OR sex=0) AND id"+flag+nameid+" ORDER BY id desc limit 0,1"
        }else{
            sql = "SELECT id,name FROM qiming.multi_name WHERE isfull=1 AND num="+count+" AND (sex ="+sex+" OR sex=0) AND id"+flag+nameid+" limit 0,1"
        }
    }
    console.log(sql)
    return new Promise(function (resolve, reject) {
        client.query(sql, function (err, rows) {
            if (err) {
                throw err
            }else{
                if(rows.length>0){
                    resolve(rows[0])
                }else{
                    if ( mode === 1) {
                        if(obj['flag'] === 'prev'){
                            sql = "SELECT id,name FROM qiming.multi_name WHERE isfull=1 AND num="+count+" AND (sex ="+sex+" OR sex=0) AND "+lackprop+"=1 ORDER BY id desc limit 1"
                        }else{
                            sql = "SELECT id,name FROM qiming.multi_name WHERE isfull=1 AND num="+count+" AND (sex ="+sex+" OR sex=0) AND "+lackprop+"=1 limit 0,1"
                        }

                    }else{
                        if(obj['flag'] === 'prev'){
                            sql = "SELECT id,name FROM qiming.multi_name WHERE isfull=1 AND num="+count+" AND (sex ="+sex+" OR sex=0) ORDER BY id desc limit 1"
                        }else{
                            sql = "SELECT id,name FROM qiming.multi_name WHERE isfull=1 AND num="+count+" AND (sex ="+sex+" OR sex=0) limit 1"
                        }
                    }
                    client.query(sql, function (err2, rows2) {
                        if(err2){
                            throw err2
                        }else{
                            resolve(rows2[0])
                        }
                    })

                }

            }
        })
    })
}

//转发后添加查看名字次数
function pushRefreshCount(openid) {
    var sql = "UPDATE qiming.testmember SET havecount=havecount+50 WHERE openid='"+openid+"'"
    client.query(sql, function (err, result) {
        if(err){
            throw err
        }
    })

}
//五行汉字转拼音
function wxPy2Hz(py) {
    switch (py) {
        case 'jin':
            return '金'
        case 'mu':
            return 'mu'
        case 'shui':
            return '水'
        case 'huo':
            return '火'
        case 'tu':
            return '土'
    }



}

exports.getLastNameInfo = getLastNameInfo
exports.getFirstNameInfo = getFirstNameInfoByFont
exports.getWugeInfo = getWugeInfo
exports.getWuxingInfo = getWuxingInfo

exports.getWugeScore = getWugeScore
exports.getGx = getGx
exports.getRelation = getRelation
exports.getSuccess = getSuccess
exports.add_queryname_log = add_queryname_log
exports.update_querycount = update_querycount
exports.isSave = isSave
exports.add_review_log = add_review_log
exports.getBazi = getBazi
exports.getNamesGroup = getNamesGroup
exports.filterMgc = filterMgc
exports.getNextName = getNextName
exports.isTip = isTip
exports.pushRefreshCount = pushRefreshCount
exports.updateUserRefreshCount = updateUserRefreshCount
exports.addUserRefreshLog = addUserRefreshLog
exports.addCutNameLog = addCutNameLog

exports.getBazis = getBazis
exports.getWuge = getWuge;
exports.getWuXingInfo = getWuXingInfo












