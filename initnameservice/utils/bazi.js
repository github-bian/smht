
var nianyuerizhu = "";
var thisday = 1;//今天的日，几号
var nongliday = "";
var lunarInfo = new Array(0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2, 0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977, 0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, 0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950, 0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557, 0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0, 0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0, 0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6, 0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570, 0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0, 0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5, 0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930, 0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530, 0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, 0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0, 0x14b63);

var solarMonth = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
var Gan = new Array("甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸");
var Zhi = new Array("子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥");
var shizhu0 = ["甲子", "丙子", "戊子", "庚子", "壬子"];
var shizhu2 = ["乙丑", "丁丑", "己丑", "辛丑", "癸丑"];
var shizhu4 = ["丙寅", "戊寅", "庚寅", "壬寅", "甲寅"];
var shizhu6 = ["丁卯", "己卯", "辛卯", "癸卯", "乙卯"];
var shizhu8 = ["戊辰", "庚辰", "壬辰", "甲辰", "丙辰"];
var shizhu10 = ["己巳", "辛巳", "癸巳", "乙巳", "丁巳"];
var shizhu12 = ["庚午", "壬午", "甲午", "丙午", "戊午"];
var shizhu14 = ["辛未", "癸未", "乙未", "丁未", "己未"];
var shizhu16 = ["壬申", "甲申", "丙申", "戊申", "庚申"];
var shizhu18 = ["癸酉", "乙酉", "丁酉", "己酉", "辛酉"];
var shizhu20 = ["甲戌", "丙戌", "戊戌", "庚戌", "壬戌"];
var shizhu22 = ["乙亥", "丁亥", "己亥", "辛亥", "癸亥"];
var Animals = new Array("鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪");
var solarTerm = new Array("小寒", "大寒", "立春", "雨水", "惊蛰", "春分", "清明", "谷雨", "立夏", "小满", "芒种", "夏至", "小暑", "大暑", "立秋", "处暑", "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪", "冬至");
var sTermInfo = new Array(0, 21208, 42467, 63836, 85337, 107014, 128867, 150921, 173149, 195551, 218072, 240693, 263343, 285989, 308563, 331033, 353350, 375494, 397447, 419210, 440795, 462224, 483532, 504758);
var nStr1 = new Array('日', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十');
var nStr2 = new Array('初', '十', '廿', '卅', '□');
var monthName = new Array("JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC");

var sFtv = new Array("0101*元旦", "0202 世界湿地日", "0210 国际气象节", "0214 情人节", "0301 国际海豹日", "0303 全国爱耳日", "0305 学雷锋纪念日", "0308 妇女节", "0312 植树节 孙中山逝世纪念日", "0314 国际警察日", "0315 消费者权益日", "0317 中国国医节 国际航海日", "0321 世界森林日 消除种族歧视国际日 世界儿歌日", "0322 世界水日", "0323 世界气象日", "0324 世界防治结核病日", "0325 全国中小学生安全教育日", "0330 巴勒斯坦国土日", "0401 全国爱国卫生运动月(四月) 税收宣传月(四月) 愚人节", "0407 世界卫生日", "0422 世界地球日", "0423 世界图书和版权日", "0424 亚非新闻工作者日", "0501*劳动节", "0502*劳动节假日", "0503*劳动节假日", "0504 青年节", "0505 碘缺乏病防治日", "0508 世界红十字日", "0512 国际护士节", "0515 国际家庭日", "0517 国际电信日", "0518 国际博物馆日", "0520 全国学生营养日", "0523 国际牛奶日", "0531 世界无烟日", "0601 国际儿童节", "0605 世界环境保护日", "0606 全国爱眼日", "0617 防治荒漠化和干旱日", "0623 国际奥林匹克日", "0625 全国土地日", "0626 国际禁毒日", "0701 香港回归纪念日 中共诞辰 世界建筑日", "0702 国际体育记者日", "0707 抗日战争纪念日", "0711 世界人口日", "0730 非洲妇女日", "0801 建军节", "0808 中国男子节(爸爸节)", "0815 抗日战争胜利纪念", "0908 国际扫盲日 国际新闻工作者日", "0909 毛泽东逝世纪念", "0910 中国教师节", "0914 世界清洁地球日", "0916 国际臭氧层保护日", "0918 九·一八事变纪念日", "0920 国际爱牙日", "0927 世界旅游日", "0928 孔子诞辰", "1001*国庆节 世界音乐日 国际老人节", "1002*国庆节假日 国际和平与民主自由斗争日", "1003*国庆节假日", "1004 世界动物日", "1006 老人节", "1008 全国高血压日 世界视觉日", "1009 世界邮政日 万国邮联日", "1010 辛亥革命纪念日 世界精神卫生日", "1013 世界保健日 国际教师节", "1014 世界标准日", "1015 国际盲人节(白手杖节)", "1016 世界粮食日", "1017 世界消除贫困日", "1022 世界传统医药日", "1024 联合国日", "1031 世界勤俭日", "1107 十月社会主义革命纪念日", "1108 中国记者日", "1109 全国消防安全宣传教育日", "1110 世界青年节", "1111 国际科学与和平周(本日所属的一周)", "1112 孙中山诞辰纪念日", "1114 世界糖尿病日", "1117 国际大学生节 世界学生节", "1120*彝族年", "1121*彝族年 世界问候日 世界电视日", "1122*彝族年", "1129 国际声援巴勒斯坦人民国际日", "1201 世界艾滋病日", "1203 世界残疾人日", "1205 国际经济和社会发展志愿人员日", "1208 国际儿童电视日", "1209 世界足球日", "1210 世界人权日", "1212 西安事变纪念日", "1213 南京大屠杀(1937年)纪念日！血泪史！", "1220 澳门回归纪念", "1221 国际篮球日", "1224 平安夜", "1225 圣诞节", "1226 毛泽东诞辰纪念")

//农历节日 *表示放假日 清云居www.qingyunju.com补充：佛教节日
var lFtv = new Array(//"0101*春节",
  "0102*初二", "0103*初三",//"0115 元宵节",
  //"0505 端午节",
  //"0707 七夕情人节",
  //"0715 中元节",
  //"0815 中秋节",
  //"0909 重阳节",
  //"1208 腊八节",
  "1223 小年",//"0100 除夕")

  "0101*春节、弥勒佛圣诞!", "0104 法王晋美彭措诞", "0106 定光佛圣诞", "0108 丹增活佛诞", "0109 帝释天诞尊", "0115 元宵节", "0208 释迦牟尼佛出家", "0215 释迦牟尼佛涅槃", "0219 观世音菩萨圣诞", "0221 普贤菩萨圣诞", "0316 准提菩萨圣诞", "0404 文殊菩萨圣诞", "0408 释迦牟尼佛圣诞", "0415 佛吉祥日——释迦牟尼佛诞生、成道、涅槃三期同一庆(即南传佛教国家的卫塞节)", "0425 药王诞", "0505 端午节", "0513 伽蓝菩萨圣诞", "0603 护法韦驮尊天菩萨圣诞", "0604 索达吉堪布诞", "0619 观世音菩萨成道——此日放生、念佛，功德殊胜", "0707 七夕情人节", "0713 大势至菩萨圣诞", "0715 中元节", "0721 普安祖师诞", "0724 龙树菩萨圣诞", "0730 地藏菩萨圣诞", "0815 中秋节", "0822 燃灯佛圣诞", "0909 重阳节", "0919 观世音菩萨出家纪念日", "0930 药师琉璃光如来圣诞", "1005 达摩祖师圣诞", "1025 宗咯巴涅盘", "1107 阿弥陀佛圣诞", "1208 释迦如来成道日,腊八节", "1224 小年", "1229 华严菩萨圣诞", "0100*除夕")

//某月的第几个星期几
var wFtv = new Array("0150 世界麻风日",//一月的最后一个星期日（月倒数第一个星期日）
  "0520 国际母亲节", "0530 全国助残日", "0630 父亲节", "0730 被奴役国家周", "0932 国际和平日", "0940 国际聋人节 世界儿童日", "0950 世界海事日", "1011 国际住房日", "1013 国际减轻自然灾害日(减灾日)", "1144 感恩节")

function lYearDays(y) {
  var i, sum = 348;
  for (i = 0x8000; i > 0x8; i >>= 1)
    sum += (lunarInfo[y - 1900] & i) ? 1 : 0;
  return (sum + leapDays(y));
}

function leapDays(y) {
  if (leapMonth(y))
    return ((lunarInfo[y - 1900] & 0x10000) ? 30 : 29);
  else
    return (0);
}

function leapMonth(y) {
  return (lunarInfo[y - 1900] & 0xf);
}

function monthDays(y, m) {
  return ((lunarInfo[y - 1900] & (0x10000 >> m)) ? 30 : 29);
}

//                                       该控件属性有 .year .month .day .isLeap
function Lunar(objDate) {

  var i, leap = 0, temp = 0;
  var offset = (Date.UTC(objDate.getFullYear(), objDate.getMonth(), objDate.getDate()) - Date.UTC(1900, 0, 31)) / 86400000;

  for (i = 1900; i < 2050 && offset > 0; i++) {
    temp = lYearDays(i);
    offset -= temp;
  }

  if (offset < 0) {
    offset += temp;
    i--;
  }

  this.year = i;

  leap = leapMonth(i);
  //闰哪个月
  this.isLeap = false;

  for (i = 1; i < 13 && offset > 0; i++) {
    //闰月
    if (leap > 0 && i == (leap + 1) && this.isLeap == false) {
      --i;
      this.isLeap = true;
      temp = leapDays(this.year);
    } else {
      temp = monthDays(this.year, i);
    }

    //解除闰月
    if (this.isLeap == true && i == (leap + 1))
      this.isLeap = false;

    offset -= temp;
  }

  if (offset == 0 && leap > 0 && i == leap + 1)
    if (this.isLeap) {
      this.isLeap = false;
    } else {
      this.isLeap = true;
      --i;
    }

  if (offset < 0) {
    offset += temp;
    --i;
  }

  this.month = i;
  this.day = offset + 1;
}

//==============================返回公历 y年某m+1月的天数
function solarDays(y, m) {
  if (m == 1)
    return (((y % 4 == 0) && (y % 100 != 0) || (y % 400 == 0)) ? 29 : 28);
  else
    return (solarMonth[m]);
}

function cyclical(num) {
  return (Gan[num % 10] + Zhi[num % 12]);
}

//============================== 阴历属性
function calElement(sYear, sMonth, sDay, week, lYear, lMonth, lDay, isLeap, cYear, cMonth, cDay) {

  this.isToday = false;
  //国历
  this.sYear = sYear;
  this.sMonth = sMonth;
  this.sDay = sDay;
  this.week = week;
  //农历
  this.lYear = lYear;
  this.lMonth = lMonth;
  this.lDay = lDay;
  this.isLeap = isLeap;
  //八字
  this.cYear = cYear;
  this.cMonth = cMonth;
  this.cDay = cDay;

  this.color = '';

  this.lunarFestival = '';
  this.solarFestival = '';
  this.solarTerms = '';
}

//===== 某年的第n个节气为几日(从0小寒起算)
function sTerm(y, n) {
  var offDate = new Date((31556925974.7 * (y - 1900) + sTermInfo[n] * 60000) + Date.UTC(1900, 0, 6, 2, 5));
  return (offDate.getUTCDate());
}

//==========略==================== 返回阴历控件 (y年,m+1月)

function calendar(y, m) {

  var sDObj, lDObj, lY, lM, lD = 1, lL, lX = 0, tmp1, tmp2, tmp3;
  var cY, cM, cD;
  //年柱,月柱,日柱
  var lDPOS = new Array(3);
  var n = 0;
  var firstLM = 0;

  sDObj = new Date(y, m, 1, 0, 0, 0, 0);

  this.length = solarDays(y, m);
  this.firstWeek = sDObj.getDay();

  if (m < 2)
    cY = cyclical(y - 1900 + 36 - 1);
  else
    cY = cyclical(y - 1900 + 36);
  var term2 = sTerm(y, 2);
  //立春日期

  var firstNode = sTerm(y, m * 2)
  //返回当月「节」为几日开始
  cM = cyclical((y - 1900) * 12 + m + 12);

  var dayCyclical = Date.UTC(y, m, 1, 0, 0, 0, 0) / 86400000 + 25567 + 10;

  for (var i = 0; i < this.length; i++) {

    if (lD > lX) {
      sDObj = new Date(y, m, i + 1);
      //当月一日日期
      lDObj = new Lunar(sDObj);
      //农历
      lY = lDObj.year;
      //农历年
      lM = lDObj.month;
      //农历月
      lD = lDObj.day;
      //农历日
      lL = lDObj.isLeap;
      //农历是否闰月
      lX = lL ? leapDays(lY) : monthDays(lY, lM);
      //农历当月最后一天

      if (n == 0)
        firstLM = lM;
      lDPOS[n++] = i - lD + 1;
    }

    if (m == 1 && (i + 1) == term2)
      cY = cyclical(y - 1900 + 36);

    if ((i + 1) == firstNode)
      cM = cyclical((y - 1900) * 12 + m + 13);

    cD = cyclical(dayCyclical + i);

    //sYear,sMonth,sDay,week,
    //lYear,lMonth,lDay,isLeap,
    //cYear,cMonth,cDay
    this[i] = new calElement(y, m + 1, i + 1, nStr1[(i + this.firstWeek) % 7], lY, lM, lD++, lL, cY, cM, cD);
    if (i == thisday) {
      nianyuerizhu = [cY, cM, cD]
      nongliday = '农历 ' + (lL ? '闰' : '') + lM + '月 ' + (lD - 1) + ' 日';
    }
  }

  //节气
  tmp1 = sTerm(y, m * 2) - 1;
  tmp2 = sTerm(y, m * 2 + 1) - 1;
  this[tmp1].solarTerms = solarTerm[m * 2];
  this[tmp2].solarTerms = solarTerm[m * 2 + 1];
  if (m == 3)
    this[tmp1].color = 'red';
  //清明颜色

  //公历节日
  for (i in sFtv)
    if (sFtv[i].match(/^(\d{2})(\d{2})([\s\*])(.+)$/))
      if (Number(RegExp.$1) == (m + 1)) {
        this[Number(RegExp.$2) - 1].solarFestival += RegExp.$4 + ' ';
        if (RegExp.$3 == '*')
          this[Number(RegExp.$2) - 1].color = 'red';
      }

  //月周节日
  for (i in wFtv)
    if (wFtv[i].match(/^(\d{2})(\d)(\d)([\s\*])(.+)$/))
      if (Number(RegExp.$1) == (m + 1)) {
        tmp1 = Number(RegExp.$2);
        tmp2 = Number(RegExp.$3);
        if (tmp1 < 5)
          this[((this.firstWeek > tmp2) ? 7 : 0) + 7 * (tmp1 - 1) + tmp2 - this.firstWeek].solarFestival += RegExp.$5 + ' ';
        else {
          tmp1 -= 5;
          tmp3 = (this.firstWeek + this.length - 1) % 7;
          //当月最后一天星期?
          this[this.length - tmp3 - 7 * tmp1 + tmp2 - (tmp2 > tmp3 ? 7 : 0) - 1].solarFestival += RegExp.$5 + ' ';
        }
      }

  //农历节日
  for (i in lFtv)
    if (lFtv[i].match(/^(\d{2})(.{2})([\s\*])(.+)$/)) {
      tmp1 = Number(RegExp.$1) - firstLM;
      if (tmp1 == -11)
        tmp1 = 1;
      if (tmp1 >= 0 && tmp1 < n) {
        tmp2 = lDPOS[tmp1] + Number(RegExp.$2) - 1;
        if (tmp2 >= 0 && tmp2 < this.length && this[tmp2].isLeap != true) {
          this[tmp2].lunarFestival += RegExp.$4 + ' ';
          if (RegExp.$3 == '*')
            this[tmp2].color = 'red';
        }
      }
    }

  //复活节只出现在3或4月
  if (m == 2 || m == 3) {
    var estDay = new easter(y);
    if (m == estDay.m)
      this[estDay.d - 1].solarFestival = this[estDay.d - 1].solarFestival + ' 复活节 Easter Sunday';
  }

  if (m == 2)
    this[20].solarFestival = this[20].solarFestival + unescape('%20%u6D35%u8CE2%u751F%u65E5');

  //黑色星期五
  if ((this.firstWeek + 12) % 7 == 5)
    this[12].solarFestival += '黑色星期五';

  //今日
  if (y == tY && m == tM)
    this[tD - 1].isToday = true;
}

//======================================= 返回该年的复活节(春分后第一次满月周后的第一主日)
function easter(y) {

  var term2 = sTerm(y, 5);
  //取得春分日期
  var dayTerm2 = new Date(Date.UTC(y, 2, term2, 0, 0, 0, 0));
  //取得春分的公历日期控件(春分一定出现在3月)
  var lDayTerm2 = new Lunar(dayTerm2);
  //取得取得春分农历

  if (lDayTerm2.day < 15)
    //取得下个月圆的相差天数
    var lMlen = 15 - lDayTerm2.day;
  else
    var lMlen = (lDayTerm2.isLeap ? leapDays(y) : monthDays(y, lDayTerm2.month)) - lDayTerm2.day + 15;

  //一天等于 1000*60*60*24 = 86400000 毫秒
  var l15 = new Date(dayTerm2.getTime() + 86400000 * lMlen);
  //求出第一次月圆为公历几日
  var dayEaster = new Date(l15.getTime() + 86400000 * (7 - l15.getUTCDay()));
  //求出下个周日

  this.m = dayEaster.getUTCMonth();
  this.d = dayEaster.getUTCDate();

}

//====================== 中文日期
function cDay(d) {
  var s;

  switch (d) {
    case 10:
      s = '初十';
      break;
    case 20:
      s = '二十';
      break;
      break;
    case 30:
      s = '三十';
      break;
      break;
    default:
      s = nStr2[Math.floor(d / 10)];
      s += nStr1[d % 10];
  }
  return (s);
}

///////////////////////////////////////////////////////////////////////////////

var cld;

function drawCld(SY, SM) {
  var i, sD, s, size;
  cld = new calendar(SY, SM);

}

function changeCld() {
  var y, m;
  y = CLD.SY.selectedIndex + 1900;
  m = CLD.SM.selectedIndex;
  drawCld(y, m);
}

function pushBtm(K) {
  switch (K) {
    case 'YU':
      if (CLD.SY.selectedIndex > 0)
        CLD.SY.selectedIndex--;
      break;
    case 'YD':
      if (CLD.SY.selectedIndex < 150)
        CLD.SY.selectedIndex++;
      break;
    case 'MU':
      if (CLD.SM.selectedIndex > 0) {
        CLD.SM.selectedIndex--;
      } else {
        CLD.SM.selectedIndex = 11;
        if (CLD.SY.selectedIndex > 0)
          CLD.SY.selectedIndex--;
      }
      break;
    case 'MD':
      if (CLD.SM.selectedIndex < 11) {
        CLD.SM.selectedIndex++;
      } else {
        CLD.SM.selectedIndex = 0;
        if (CLD.SY.selectedIndex < 150)
          CLD.SY.selectedIndex++;
      }
      break;
    default:
      CLD.SY.selectedIndex = tY - 1900;
      CLD.SM.selectedIndex = tM;
  }
  changeCld();
}

var Today = new Date();
var tY = Today.getFullYear();
var tM = Today.getMonth();
var tD = Today.getDate();
//////////////////////////////////////////////////////////////////////////////

var width = "130";
var offsetx = 2;
var offsety = 8;

var x = 0;
var y = 0;
var snow = 0;
var sw = 0;
var cnt = 0;




/////////////////////////////////////////////////////////
function getShizhu(dayGan) {
  var reval = 0;
  if (("甲己").indexOf(dayGan) > -1) { reval = 0 }
  if (("乙庚").indexOf(dayGan) > -1) { reval = 1 }
  if (("丙辛").indexOf(dayGan) > -1) { reval = 2 }
  if (("丁壬").indexOf(dayGan) > -1) { reval = 3 }
  if (("戊癸").indexOf(dayGan) > -1) { reval = 4 }
  return reval;

}
function initial(year, month, day, hour) {
  // CLD.SY.selectedIndex = tY - 1900;
  // CLD.SM.selectedIndex = tM;
  //索引值i
  thisday = day - 1;
  //tM=当前月-1
  drawCld(year, month - 1);
  var dayTianan = nianyuerizhu[2].substring(0, 1);
  //console.log(dayTianan);
  var shizhu = "";
  if (hour < 1 || hour >= 23) {
    shizhu = shizhu0[getShizhu(dayTianan)];
  }
  if (hour >= 1 && hour < 3) {
    shizhu = shizhu2[getShizhu(dayTianan)];
  }
  if (hour >= 3 && hour < 5) {
    shizhu = shizhu4[getShizhu(dayTianan)];
  }
  if (hour >= 5 && hour < 7) {
    shizhu = shizhu6[getShizhu(dayTianan)];
  }
  if (hour >= 7 && hour < 9) {
    shizhu = shizhu8[getShizhu(dayTianan)];
  }
  if (hour >= 9 && hour < 11) {
    shizhu = shizhu10[getShizhu(dayTianan)];
  }
  if (hour >= 11 && hour < 13) {
    shizhu = shizhu12[getShizhu(dayTianan)];
  }
  if (hour >= 13 && hour < 15) {
    shizhu = shizhu14[getShizhu(dayTianan)];
  }
  if (hour >= 15 && hour < 17) {
    shizhu = shizhu16[getShizhu(dayTianan)];
  }
  if (hour >= 17 && hour < 19) {
    shizhu = shizhu18[getShizhu(dayTianan)];
  }
  if (hour >= 19 && hour < 21) {
    shizhu = shizhu20[getShizhu(dayTianan)];
  }
  if (hour >= 21 && hour < 23) {
    shizhu = shizhu22[getShizhu(dayTianan)];
  }
  nianyuerizhu.push(shizhu);
  //console.log(nianyuerizhu)
}
function getWuxing(ganzhi) {
  var reval = "";
  if (ganzhi === "甲") { reval = "木" }; if (ganzhi === "乙") { reval = "木" }; if (ganzhi === "丙") { reval = "火" }; if (ganzhi === "丁") { reval = "火" }; if (ganzhi === "戊") { reval = "土" }; if (ganzhi === "己") { reval = "土" }; if (ganzhi === "庚") { reval = "金" }; if (ganzhi === "辛") { reval = "金" }; if (ganzhi === "壬") { reval = "水" }; if (ganzhi === "癸") { reval = "水" }; if (ganzhi === "子") { reval = "水" }; if (ganzhi === "丑") { reval = "土" }; if (ganzhi === "寅") { reval = "木" }; if (ganzhi === "卯") { reval = "木" }; if (ganzhi === "辰") { reval = "土" }; if (ganzhi === "巳") { reval = "火" }; if (ganzhi === "午") { reval = "火" }; if (ganzhi === "未") { reval = "土" }; if (ganzhi === "申") { reval = "金" }; if (ganzhi === "酉") { reval = "金" }; if (ganzhi === "戌") { reval = "土" }; if (ganzhi === "亥") { reval = "水" };
  return reval;
}

function getbazi(y,m,d,h) {
  var res = {};
  initial(y,m,d,h);
  //document.getElementById('hbazi').innerHTML = "测算的八字为 : " + nianyuerizhu.join(" ");
  res['bz'] = nianyuerizhu.join(" ");
  var baziarr = nianyuerizhu.join('').split('');
  var wuxing = [];
  for (var i = 0, len = baziarr.length; i < len; i++) {
    wuxing.push(getWuxing(baziarr[i]))
  }
  var xuxingstr = "";
  var wuxingsum = 0;
  for (var i = 0, len = wuxing.length; i < len; i++) {
    if (wuxing[i] === "金") { wuxingsum++; }
    if ((i + 1) === len) { xuxingstr += wuxingsum + '金 ' }
  }
  wuxingsum = 0;
  for (var i = 0, len = wuxing.length; i < len; i++) {
    if (wuxing[i] === "木") { wuxingsum++; }
    if ((i + 1) === len) { xuxingstr += wuxingsum + '木 ' }
  }
  wuxingsum = 0;
  for (var i = 0, len = wuxing.length; i < len; i++) {
    if (wuxing[i] === "水") { wuxingsum++; }
    if ((i + 1) === len) { xuxingstr += wuxingsum + '水 ' }
  }
  wuxingsum = 0;
  for (var i = 0, len = wuxing.length; i < len; i++) {
    if (wuxing[i] === "火") { wuxingsum++; }
    if ((i + 1) === len) { xuxingstr += wuxingsum + '火 ' }
  }
  wuxingsum = 0;
  for (var i = 0, len = wuxing.length; i < len; i++) {
    if (wuxing[i] === "土") { wuxingsum++; }
    if ((i + 1) === len) { xuxingstr += wuxingsum + '土' }
  }
  res['nongli'] = nongliday;
  res['wuxing'] = xuxingstr;

   /*生肖*/
   switch(res['bz'].substr(1,1)){
      case '子':
          res['shengxiao'] = '鼠';
          res['sx_ruo'] = '稍微胆小怕事，多疑保守，个别问题上约显目光短浅，认识深度不够。';
          res['sx_yi'] = '起名宜有：宀、米、豆、鱼、艹、金、玉、人、木、月、田、钅、亻等部首为吉。';
          res['sx_ji'] = '起名忌有：山、刀、力、弓、土、穴、心、石、皮、氵、马、酉、才、火、车、水等部首。';
          res['sxjx'] = ['做事态度积极，勤奋努力，头脑机智手脚灵巧。','待人和蔼，有自我约束力，遇事能替人着想。','适应性强，善于结交各方面的朋友。','多情善感，性格稍微内向，行动上活泼，待人热情。','观察细致，思维方式有条理。'];
          break;
      case '丑':
          res['shengxiao'] = '牛';
          res['sx_ruo'] = '稍微固执已见，缺乏通融；有时钻“牛角尖”，主观独断。';
          res['sx_yi'] = '起名宜有：水、艹、豆、米、金、玉、宀、人、木、氵、钅、亻等部首为吉。';
          res['sx_ji'] = '起名忌有：月、火、田、车、马、石、血、纟、刀、几等部首。';
          res['sxjx'] = ['勤奋努力，有强烈的进取心。','忠厚老实，务实，责任心强，有耐力。','有正义感，爱打抱不平。','勤俭持家，稳定。'];
          break;
      case '寅':
          res['shengxiao'] = '虎';
          res['sx_ruo'] = '易动感情，自以为是，稍微有点孤傲任性。';
          res['sx_yi'] = '起名宜有：山、玉、金、木、示、水、月、犭、马、氵、钅等部首为吉。';
          res['sx_ji'] = '起名忌有：日、火、田、口、几、纟、石、刀、血、弓、父、足等部首。';
          res['sxjx'] = ['有朝气，有雄心壮志。','敢想敢干，勇于开拓。','热情大方，顽强自信，刚愎自用。','有正义感，乐于助人。'];
          break;
      case '卯':
          res['shengxiao'] = '兔';
          res['sx_ruo'] = '约有虚荣心，性情有时候不稳定，容易急躁，满足于现状的时候多。';
          res['sx_yi'] = '起名宜有：月、艹、山、田、人、禾、木、宀、金、白、玉、豆、钅、亻等部首为吉。';
          res['sx_ji'] = '起名忌有：马、车、石、刀、力、皮、水、川、氵等部首。';
          res['sxjx'] = ['温柔、善良、乐观，感情细腻。','精明灵活，体谅他人。','气质高雅，思维细腻。','能忍耐谦让，不好争执。'];
          break;
      case '辰':
          res['shengxiao'] = '龙';
          res['sx_ruo'] = '有时容易急躁，盛气凌人，主观固执，约显争强好胜，不服输。';
          res['sx_yi'] = '起名宜有：水、金、玉、白、赤、月、鱼、酉、人、氵、钅、亻等部首为吉。';
          res['sx_ji'] = '起名忌有：土、田、木、禾、示、心、日、石、艹、力、刀、纟、犭、火等部首。';
          res['sxjx'] = ['勇往直前，有旺盛的进取心。','专心致志，果断肯干。','孝顺，慷慨，善于理财。','聪明，有才能，气度高。'];
          break;
      case '巳':
          res['shengxiao'] = '蛇';
          res['sx_ruo'] = '有时动摇不定，心胸狭窄，有时钻“牛角尖”，性情多疑，不太信任他人。';
          res['sx_yi'] = '起名宜有：艹、虫、豆、鱼、酉、木、田、山、金、玉、月、土、钅、禾、宀、马、羊、牛、羽、忄、心、辶、廴、几等部首为吉。';
          res['sx_ji'] = '起名忌有：小、石、刀、血、弓、火、人、犭、父、纟等部首。';
          res['sxjx'] = ['专心致志，认真负责','心灵手巧，思路敏捷。','精力充沛，随和开朗。','表面沉着，有时口快。'];
          break;
      case '午':
          res['shengxiao'] = '马';
          res['sx_ruo'] = '欠缺冷静有时急躁，个性约为倔强。';
          res['sx_yi'] = '起名宜有：艹、金、玉、木、禾、虫、米、人、月、土、才、钅、亻等部首为吉。';
          res['sx_ji'] = '起名忌有：田、日、火、水、车、石、力、刀、酉、马等部首。';
          res['sxjx'] = ['精力旺盛，刚毅果断。','善恶分明，耿直热情。','能言善辩，不怕困难，勇往直前。'];
          break;
      case '未':
          res['shengxiao'] = '羊';
          res['sx_ruo'] = '易动感情，主观性差，随波逐流优柔寡断。';
          res['sx_yi'] = '起名宜有：金、白、玉、月、田、豆、米、马、禾、木、人、艹、鱼、亻等部首为吉。';
          res['sx_ji'] = '起名忌有：小、犭、纟、车、山、水、日、火、氵等部首。';
          res['sxjx'] = ['研究欲强，富有创造性。 ','善良、宽容、顺从。 ','有耐心，不惹是非。适应环境快。'];
          break;
      case '申':
          res['shengxiao'] = '猴';
          res['sx_ruo'] = '有嫉妒心，轻浮散漫，性情多变，约缺诚信。';
          res['sx_yi'] = '起名宜有：木、禾、金、玉、豆、米、田、山、月、水、人、氵、亻等部首为吉。';
          res['sx_ji'] = '起名忌有：火、石、口、冖、纟、刀、力、皮、犭等部首。';
          res['sxjx'] = ['有进取心，喜欢竞争。','多才多艺，多面手。','略有虚荣心，生活浪漫，不受拘束。','能与人融洽相处，善于应酬。 '];
          break;
      case '酉':
          res['shengxiao'] = '鸡';
          res['sx_ruo'] = '脾气古怪，爱争善辩，固执已见，稍微自私。';
          res['sx_yi'] = '起名宜有：米、豆、虫、木、禾、玉、月、宀、山、艹、金、钅等部首为吉。';
          res['sx_ji'] = '起名忌有：石、犭、刀、力、日、酉、血、弓、才、乡、车、马等部首。';
          res['sxjx'] = ['精力充沛，善于言谈。','多调查研究，讲究效率。','果断、敏锐、好表现自己。','勇往直前，心强好胜，总想一鸣惊人。 '];
          break;
      case '戌':
          res['shengxiao'] = '狗';
          res['sx_ruo'] = '有时急躁，有盲目倾向，顽固，不计后果，防止被人因小利而亡大义。';
          res['sx_yi'] = '起名宜有：鱼、豆、米、宀、马、金、玉、艹、田、木、月、禾、水、人、氵、钅、亻等部首为吉。';
          res['sx_ji'] = '起名忌有：火、石、纟、山、才、日、酉、车、刀、父、言等部首。';
          res['sxjx'] = ['意志坚定，忠实可靠。','正义、公平、敏捷。','聪明、有见识，有条理。','受人所用，能听话吃苦，注重现实。'];
          break;
      case '亥':
          res['shengxiao'] = '猪';
          res['sx_ruo'] = '易动感情，固执保守，目光短浅，有时脾气不稳。';
          res['sx_yi'] = '起名宜有：豆、米、鱼、水、金、玉、月、木、人、山、土、艹、氵、亻等部首为吉。';
          res['sx_ji'] = '起名忌有：纟、石、刀、力、血、弓、几、皮、父等部首。';
          res['sxjx'] = ['真挚、诚实、有同情心。','精力旺盛，待人诚实。','专心致志，凡事热心。','信任别人，开朗乐观。'];
          break;
   }
  return res
}

exports.getbazi = getbazi