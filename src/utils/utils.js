
import moment from 'moment';
import { func } from 'prop-types';
import Common from "../common/constants";
export const locale = {
  name: 'zhCn',
  config: {
    months: '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split(
      '_'
    ),
    monthsShort: '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split(
      '_'
    ),
    weekdays: '星期日_星期一_星期二_星期三_星期四_星期五_星期六'.split('_'),
    weekdaysShort: '日_一_二_三_四_五_六'.split('_'),
    weekdaysMin: '日_一_二_三_四_五_六'.split('_'),
    longDateFormat: {
      LT: 'HH:mm',
      LTS: 'HH:mm:ss',
      L: 'DD/MM/YYYY',
      LL: 'D MMMM YYYY',
      LLL: 'D MMMM YYYY LT',
      LLLL: 'dddd D MMMM YYYY LT'
    },
    calendar: {
      sameDay: "[今天] LT",
      nextDay: '[明天] LT',
      nextWeek: 'dddd [到] LT',
      lastDay: '[昨天] LT',
      lastWeek: 'dddd [最后到] LT',
      sameElse: 'L'
    },
    relativeTime: {
      future: '过 %s',
      past: '过去 %s',
      s: '秒',
      m: '分',
      mm: '%d 分',
      h: '时',
      hh: '%d 时',
      d: '天',
      dd: '%d 天',
      M: '月',
      MM: '%d 月',
      y: '年',
      yy: '%d 年'
    },
    ordinal: function(number) {
      return number + '日';
    },
    meridiemParse: /PD|MD/,
    isPM: function(input) {
      return input.charAt(0) === 'M';
    },
    // in case the meridiem units are not separated around 12, then implement
    // this function (look at locale/id.js for an example)
    // meridiemHour : function (hour, meridiem) {
    //     return /* 0-23 hour, given meridiem token and hour 1-12 */
    // },
    meridiem: function(hours, minutes, isLower) {
      return hours < 12 ? 'PD' : 'MD';
    },
    week: {
      dow: 0, // Monday is the first day of the week.
      // doy: 4 // The week that contains Jan 4th is the first week of the year.
    }
  }
};
export function getWeek (date) { // 参数时间戳
    let week = moment(date).day()
    switch (week) {
      case 1:
        return '周一'
      case 2:
        return '周二'
      case 3:
        return '周三'
      case 4:
        return '周四'
      case 5:
        return '周五'
      case 6:
        return '周六'
      case 0:
        return '周日'
    }
  }
  export function getWeekXi (date) { // 参数时间戳
    let week = moment(date).day()
    switch (week) {
      case 1:
        return '星期一'
      case 2:
        return '星期二'
      case 3:
        return '星期三'
      case 4:
        return '星期四'
      case 5:
        return '星期五'
      case 6:
        return '星期六'
      case 0:
        return '星期日'
    }
  }

  export function getContentView (start, end) { 
    let startArray = [0, 0];
    let endArray = [0, 0];
    if(start){
      startArray = start.split(':');
      if(!end) {
        endArray = [parseInt(startArray[0])+1, parseInt(startArray[0])== 23 ? 0 : parseInt(startArray[1])];
      }
    }
    if(end) {
      endArray = end.split(':');
      if(!start) {
        startArray = [parseInt(endArray[0]) == 0 ? 0 : parseInt(endArray[0])-1, parseInt(endArray[0]) == 0 ? 0 :0];
      }
    }
    // logger(endArray)
    // if(startArray.length<=1 && endArray.length<=1 ) {
    //   return [0, 0]
    // }
    return [parseInt(startArray[0])  + parseInt(startArray[1]) / 60,  parseInt(endArray[0]) + parseInt(endArray[1]) / 60 - parseInt(startArray[0]) - parseInt(startArray[1]) / 60]
  }

  export function getContentViewWidth (data) { 
    if(data instanceof Array) {
      let pos = [];
      let pos1 = [];
      let rs = [];
      let longPos = [];
      for (let i=0; i<data.length; i++){
        let startArray = data[i].start_time ? moment(data[i].start_time).format('HH:mm').split(':') : moment(data[i].wakeup_time).format('HH:mm').split(':');
        let endArray = data[i].end_time ? moment(moment(data[i].end_time).format('YYYY-MM-DD 00:00:00')).diff(moment(moment(data[i].start_time).format('YYYY-MM-DD 00:00:00')), "days")==1 ?  ['24', '0'] : 
        moment(data[i].end_time).format('HH:mm').split(':') : [];
        if(startArray.length<=1 && endArray.length<=1 ) {
          rs.push({...data[i], lIndex: 0, wSplit: 0});
        }
        else {
          if(!data[i].end_time) {
            endArray = [parseInt(startArray[0])+1, parseInt(startArray[0])== 23 ? 0 : parseInt(startArray[1])];
          } 
          // if(!data[i].start_time) {
          //   startArray = [parseInt(endArray[0]) == 0 ? 0 : parseInt(endArray[0])-1, parseInt(endArray[0]) == 0 ? 0 : parseInt(endArray[1])];
          // }
          let start = parseInt(startArray[0]) + parseInt(startArray[1]) / 60
          let end = parseInt(endArray[0]) + parseInt(endArray[1]) / 60;
          if(end<= start) {
            endArray = [parseInt(startArray[0])+1, parseInt(startArray[0])== 23 ? 0 : parseInt(startArray[1])];
            end = parseInt(endArray[0]) + parseInt(endArray[1]) / 60;
          } else if (end - start < 1) {
            endArray = [parseInt(startArray[0])+1, parseInt(startArray[0])== 23 ? 0 : parseInt(startArray[1])];
            end = parseInt(endArray[0]) + parseInt(endArray[1]) / 60;
          }
          // logger(endArray, end)
          // logger(start, end, pos)
          if(pos.length > 0) {
            let flag = 0;
            let tp= [];
            // let tp1= [];
            for(let j=0; j<pos.length; j++) {
              let temp = pos[j];
              let poxy = getStartEnd(temp, longPos);
              let s = poxy[0];
              let e = poxy[1];
              // logger(s, e )
              // logger(temp )
              if(!flag && (start>=s && start < e)) {
                for(let k=0; k < temp.length; k++) {
                  // logger('不在范围内', temp[k])
                  if (end <= temp[k]['start'] || start>=temp[k]['end']) {  //不在范围内
                    // logger('1****** id='+data[i].id )
                    tp= [];
                    // tp1= [];
                    for(let p=0; p < k; p++) {
                      // logger('tp******', temp[p].id)
                      tp.push({...temp[p], blank: true});
                      // tp1.push(temp[p].id);
                    }
                    // tp.push({start, end, ...data[i], blank: false});
                    // tp1.push(data[i].id);
                    if(j===pos.length-1 && k=== temp.length-1) {
                      flag = 1;
                    }
                  }
                  else if(start < temp[k]['start'] && end>=temp[k]['start']) {
                    // logger('2******', data[i].id)
                    //前
                    pos[j].unshift({start, end, ...data[i], blank: false});
                    pos1[j].unshift(data[i].id);
                    tp= [];
                    // tp1= [];
                    flag = 1;
                    break;
                  } else if( k < temp.length - 1 && start>=temp[k]['start'] && start < temp[k+1]['start'] && end > temp[k+1]['start']) {
                    // logger('3******', data[i].id)
                    let p =  k + 1;    //后
                    pos[j].splice(p, 0, {start, end, ...data[i], blank: false});
                    pos1[j].splice(p, 0, data[i].id);
                    tp= [];
                    // tp1= [];
                    flag = 1;
                    break;
                  } else if ( k == temp.length -1 && start>=temp[k]['start']  && start < temp[k]['end']) {
                    // logger('4******', data[i].id)
                    pos[j].push({start, end, ...data[i], blank: false});
                    pos1[j].push(data[i].id);
                    tp= [];
                    // tp1= [];
                    flag = 1;
                    break;
                  } 
                }
              }
            }

              // logger('********flag' + flag + ' tp.length' + tp.length)
            if(flag && tp.length>0){
              let t = [];
              let t1 = [];
              for(let m=0; m< tp.length; m++) {
                if((start>=tp[m].start && start < tp[m].end))
                {
                  longPos.push(tp[m]);
                  t.push(tp[m]);
                  t1.push(tp[m].id);
                }
              }
              t.push({start, end, ...data[i], blank: false});
              t1.push(data[i].id);
              pos.push(t);
              pos1.push(t1);
              // logger('********flag', pos)
            }
            if(!flag) {
              // rs.push({...data[i], lIndex: 0, wSplit: 1});
              pos.push([{start, end, ...data[i], blank: false}]);
              pos1.push([data[i].id]);
              // logger('********' + i + '******' + rs.length)
            }
          }
          else {
            // rs.push({...data[i], lIndex: 0, wSplit: 1});
            pos.push([{start, end, ...data[i], blank: false}]);
            pos1.push([data[i].id]);
          }
        }
      }
      // logger(pos)
      for (let j=0; j<pos.length; j++) {
        let temp = pos[j];
        for(let k=0; k < temp.length; k++) {
          if(!temp[k].blank) {
            rs.push({...temp[k], lIndex: k, wSplit: temp.length});
          }
          else {
            let item = rs.find(o=> o.id == temp[k].id);
            if(item.wSplit < temp.length) {
              item.wSplit =  temp.length;
            }
          }
        }
      }
      // logger(rs)
      return rs
    }
    return []
  }

  export function sortList(value) {
    let list = JSON.parse(JSON.stringify(value))
    for(let i=0; i<list.length-1; i++){
      for(let j=0; j<list.length-i-1; j++) {
        let preArray = moment(list[j].start_time).format('HH:mm').split(':');
        let nextArray = moment(list[j+1].start_time).format('HH:mm').split(':');
        let preNum = parseInt(preArray[0]) + parseInt(preArray[1]) / 60
        let nextNum = parseInt(nextArray[0]) + parseInt(nextArray[1]) / 60;
         if (preNum > nextNum) {
               let temp = list[j]
               list[j] = list[j+1]
               list[j+1] = temp
          } 
      }
    }
    return list;
  }
  function getStartEnd(temp, filtArr) {
    let newArr = [];
    let min=-1, max=-1; 
    // logger(temp, filtArr)
    for (let i=0;  i< temp.length; i++) {
      // logger(temp[i], filtArr.find(o=> o.id == temp[i].id))
      if(filtArr.find(o=> o.id == temp[i].id) && temp.length > 2) {
       
      }
      else {
        newArr.push({...temp[i]})
        if (min < 0) {
          min = temp[i].start;
        } 
        else if( temp[i].start < min){
          min = temp[i].start
        }
        if (max < 0) {
          max = temp[i].end;
        } else if( temp[i].end > max){
          max = temp[i].end
        }
      }
    }
    // logger(min, max)
    return [min, max];
  }

 export function getFinishBlankHeight (list) {
  let h = Common.window.height - Common.statusBarHeight - 100 - 75 -45;
  for (let i=0; i< list.length; i++){
    let childH = list[i].data.length * 67;
    let headerH = list[i].isShowYear ?  18 + 15 + 18 : 18 + 15;
    h = h - childH - headerH;
  }
  return h;
 }

 export function getProcessList (plan, preItem) {
  let rs = [];
  let last = undefined;
  let year = moment().year();
  let preYear = preItem && preItem.date ? moment(preItem.date).year() : year;
  let index = 0;
  for (let key in plan){
    let timeYear = moment(key).year();
    if(preItem && preItem.date && index == 0 && key== preItem.date){
      let total = 0;
      for(let i=0; i < preItem.data.length; i++){
        let item =  preItem.data[i];
        total = total + item.fee_time;
      }
      for(let i=0; i < plan[key].length; i++){
        let item =  plan[key][i];
        total = total + item.fee_time;
      }
      last = {date: preItem.date, data: preItem.data.concat(plan[key]), total, isShowYear: preItem.isShowYear, isFestival: preItem.isFestival}
    }
    else{
      let total = 0;
      for(let i=0; i < plan[key].length; i++){
        let item =  plan[key][i];
        total = total + item.fee_time;
      }
      let map = {date: key, data: plan[key], total, isShowYear: year !== timeYear && preYear && preYear !== timeYear, isFestival: true}
      rs.push(map)
    }
    preYear = timeYear;
    ++index;
  }
  // logger(rs)
  return {last, rs};
 }

 export function getFeeTimeFormat (min) {
  if(min) {
    let hour = Math.abs(parseInt(min / 60));
    let hourStr = hour < 10 ? '0'+hour : hour;
    let m = min % 60;
    let mStr = m <  10 ? '0'+m : m;
    // logger(hourStr + ':' + mStr)
    return  hourStr + ':' + mStr+ '';
  }
  return '00:00';
 }

 export function produce(list, plan) {
  let newList = JSON.parse(JSON.stringify(list));
  newList.map(item=>{
    item.data.map(it=>{
      // logger(it.id === plan.id)
      if(it.id === plan.id){
        it.is_wakeup = !plan.is_wakeup;
        return it
      } else {
        return it
      }
    })
  });
  return newList;
}

export function removeItem(list, plan) {
 let newList = JSON.parse(JSON.stringify(list));
 let nList = [];
 newList.map(item=>{
   let data = item.data.filter(it=> plan.id !== it.id)
   if(data && data.length>0) {
      item.data = data;
      nList.push(item);
   }
 });
 return nList;
}

export function updateFinish(list, finish) {
  let newList = JSON.parse(JSON.stringify(list));
  newList.map(item=>{
    item.data.map(it=>{
      // logger(it.id === plan.id)
      if(it.id === finish.id){
        item.total = item.total - it.fee_time + finish.fee_time;
        it.wakeup_time = finish.wakeup_time;
        it.start_time = finish.start_time;
        it.end_time = finish.end_time;
        it.fee_time = finish.fee_time;
        return it
      } else {
        return it
      }
    })
  });
  return newList;
}

export function getHoliday(time) {
   let week = moment(time).day();
   let dates = moment(time).format('YYYY-MM-DD');

   let holidys = Common.holidy.h;
   let work = Common.holidy.d;
   if(holidys.indexOf(dates)>=0) {
      return '节日'
   }
   else if(work.indexOf(dates)>=0) {
      return '调休'
   } else if(week==6 || week==0) {
      return '假日'
   }
   return '';
}

export function logger(str, str1) {
  if(Common.env !== 'dev') {
    if(str1) {
      console.log(str, str1)
    } else {
      console.log(str)
    }
  }
}

export function caseSetting(caseList) {
  let arr = {}
  for(let key in caseList) {
    arr[key] = caseList[key][2]
  }
  return arr;
}

export function getPhone(value, char) {
  if(value) {
    return value.replace(/(\d{3})\d*(\d{4})/, `$1${new Array(5).join(char)}$2`);
  }
  return value
}

export function compareVersion(per, last) {
  let sources = per.split('.');
  let dests = last.split('.');
  let maxLength = Math.max(sources.length, dests.length);
  let result = 0;
  for(let i=0; i< maxLength; i++) {
    let preValue = sources.length>i ? sources[i]:0;
    let preNum = isNaN(Number(preValue)) ? preValue.charCodeAt() : Number(preValue); 
    let lastValue = dests.length>i ? dests[i]:0;
    let lastNum = isNaN(Number(lastValue)) ? lastValue.charCodeAt() : Number(lastValue); 
    if (preNum < lastNum) { 
      result = -1;
      break;
    } else if (preNum > lastNum) { 
      result = 1;
      break;
    }
  }
  return result
}