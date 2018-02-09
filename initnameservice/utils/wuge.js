
function getWuge(last,first) {
    var wugeInfo = {};
    var fname = first.map(function (v) {
        return v['font']
    }).join('');
    //叠字名
    if(fname.substring(0,1) === fname.substring(1)){
        first[1] = first[0]
    }
    //获取姓氏笔画、字数
    if(last === null || first === null || last['ftbihua'] === null){
        wugeInfo = null;
        return wugeInfo
    }
    if(first.length>1){
        if(first[0]['ftbihua'] === null || first[1]['ftbihua'] === null){
            wugeInfo = null;
            return wugeInfo
        }
    }else{
        if(first[0]['ftbihua'] === null){
            wugeInfo = null;
            return wugeInfo
        }
    }

    //天格 （复姓数相加，单姓数加一）
    if (last.fuxing < 1) {
        wugeInfo['tian'] = parseInt(last.ftbihua) + 1
    } else {
        wugeInfo['tian'] = last.ftbihua.split('$').reduce(function (preVal,curVal) {
            return parseInt(preVal)+parseInt(curVal)
        })
    }

    //地格（复名数相加，单名数加一）
    if(first.length>1){
        var n = 0;
        first.forEach(function (val,index) {
            n+=parseInt(val['ftbihua'])
        });
        wugeInfo['di'] = n;
    }else{
        wugeInfo['di'] = parseInt(first[0]['ftbihua'])+1
    }

    //人格 （姓尾名头数相加）
    wugeInfo['ren'] = parseInt(last['ftbihua'].split('$')[last['ftbihua'].split('$').length-1])+parseInt(first[0]['ftbihua']);

    //总格 （姓名全数为总格）
    var xingshibihua = parseInt(last.ftbihua.split('$').reduce(function (preVal,curVal) {
            return parseInt(preVal)+parseInt(curVal)
        })),mingzibihua;
    console.log(xingshibihua);
    if(first.length>1){
        mingzibihua =  first.reduce(function (preVal,curVal) {
            return parseInt(preVal['ftbihua'])+parseInt(curVal['ftbihua'])
        });
        console.log(mingzibihua);
    }else{
        mingzibihua = parseInt(first[0]['ftbihua'])
    }

    wugeInfo['zong'] = xingshibihua + mingzibihua ;
    console.log( wugeInfo['zong']);

    //外格 （总格减人格，添数再相加）
    wugeInfo['wai'] = wugeInfo['zong'] - wugeInfo['ren'];
    if(last.fuxing < 1) wugeInfo['wai']++;
    if(first.length < 2) wugeInfo['wai']++;
    return wugeInfo;
}


exports.getWuge = getWuge;

