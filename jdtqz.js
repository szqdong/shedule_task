//使用nobyda大佬的jdcookie
// cron "5 8 * * *" script-path=https://raw.githubusercontent.com/iisams/Scripts/master/liwo/jdtqz.js, tag= 京东特权值


const sams =new Env('')//init()
let Val = sams.getdata('CookieJD')
if (sams.isNode()) {
  if (!Val) {
    let CookieJDs = [];
    if (process.env.JD_COOKIE) {
      if (process.env.JD_COOKIE.indexOf('&') > -1) {
        console.log(`您的cookie选择的是用&隔开\n`)
        CookieJDs = process.env.JD_COOKIE.split('&');
      } else if (process.env.JD_COOKIE.indexOf('\n') > -1) {
        console.log(`您的cookie选择的是用换行隔开\n`)
        CookieJDs = process.env.JD_COOKIE.split('\n');
      } else {
        CookieJDs = [process.env.JD_COOKIE];
      }
    }
    Val = CookieJDs[0];
  }
}

const headers ={"Accept": "application/json, text/plain, */*",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "zh-cn",
                "Connection": "keep-alive",
                "Cookie": Val,
                "Host": "ms.jr.jd.com",
                "Origin": "https://btfront.jd.com",
                "Referer": "https://btfront.jd.com/release/growth/index.html",
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.1 Mobile/15E148 Safari/604.1",}
                
var taskid = []
var taskname = []
var signinfo=[]

var message=""
var taskmsg = ""
const option = {"open-url":"openapp.jdmobile://virtual?params=%7B%22category%22:%22jump%22,%22des%22:%22m%22,%22url%22:%22https%3A%2F%2Fbtfront.jd.com%2Frelease%2Fgrowth%2Findex.html%23%2Fhome%22%7D"}


function userinfo() {
  return new Promise((resolve) => {
    var userparams = {
      url:"https://ms.jr.jd.com/gw/generic/bt/h5/m/queryEcologicUserInfo",
      headers:headers,
      body:"reqData={}"
    }
    sams.post(userparams,
    (error,reponse,data) => {
      try {
        data = JSON.parse(data);
        sams.log(JSON.stringify(data))
        if (data.resultCode == 0) {
          var list = data.resultData.ecologicUserInfo
          taskmsg += `👤『用户』${list.pin}\n🎖『活力值』${list.ecologicScore}\n🔰『等级』Lv${list.scoreLevel}\n`
          //sams.log("获取用户信息成功:"+usermsg)
        }
       else{taskmsg += null}
      } catch (e) {
        sams.log(e, reponse);
      } finally {
        resolve(data);
      }
    })
  })
}

function gettaskid() {
  return new Promise((resolve) => {
    var nowtime = Date.now()
    var taskparams = {
      url:"https://ms.jr.jd.com/gw/generic/bt/h5/m/taskStatistics?_="+nowtime+"&reqData=%7B%22req%22:%7B%22pageSize%22:50,%22channelId%22:3%7D%7D",
      headers:headers
    }
    sams.get(taskparams,
    (error,reponse,data) => {
      try {
        data = JSON.parse(data);
        sams.log(JSON.stringify(data))
        sams.log("正在获取taskID")
        if (data.resultCode == 0) {
          var list = data.resultData.taskList
          for (var i in list) {
            taskid.push(list[i].taskId)
            taskname.push(list[i].subTitle)
          }
          sams.log("获取taskID和taskName成功:"+taskid+" \n "+taskname)
        }
       else{taskid += null}
      } catch (e) {
        sams.log(e, reponse);
      } finally {
        resolve(data);
      }
    })
  })
}

function dotaskid(id) {
  return new Promise((resolve) => {
    var dotaskparams = {
      url:"https://ms.jr.jd.com/gw/generic/bt/h5/m/doSpecifyClick?reqData=%7B%22req%22:%7B%22taskId%22:"+id+"%7D%7D",
      headers:headers
    }
    sams.get(dotaskparams,
    (error,reponse,data) => {
      try{
        data = JSON.parse(data)
      }
      catch(e){
        sams.log(e,response)
      }
      finally{
        resolve(data)
      }
    })
  })
}

function getsigninfo(){
  return new Promise((resolve)=>{
    var nowtime = Date.now()
    var params = {
      url:"https://ms.jr.jd.com/gw/generic/bt/h5/m/queryMailboxList?_="+nowtime+"&reqData=%7B%22req%22:%7B%22msgGroup%22:2,%22readStatus%22:0,%22bizSource%22:%222%22,%22pageSize%22:4%7D%7D",
      headers:headers
    }
    sams.get(params,(error,response,data)=>{
      try{
        data = JSON.parse(data)
        var d = data.resultData.list
        var i
          for (i=0;i<d.length;i++){
            if (d.length !== 0 ){
              signinfo.push({
                "bizGroup":d[i].bizGroup,
                "bizType":d[i].bizType,
                "msgName":d[i].msgName,
                "id":d[i].id,
                "uuid":d[i].uuid
              })
            }
          }
       sams.log(signinfo)
      }catch(e){sams.log(e,response)
      }finally{
        resolve(data)
        }
    }
    )
  }
  )
}

function dosigninfo(uuid,bizGroup,bizType){
  return new Promise((resolve) => {
      var params = {
        url:"https://ms.jr.jd.com/gw/generic/bt/h5/m/readMailbox?reqData=%7B%22req%22:%7B%22uuid%22:%22"+uuid+"%22,%22bizGroup%22:"+bizGroup+",%22bizType%22:"+bizType+"%7D%7D",
        headers:headers
      }
      sams.get(params,
      (error,reponse,data) => {
        try{
          data = JSON.parse(data)
        }
        catch(e){
          sams.log(e,response)
        }
        finally{
          resolve(data)
        }
      })
    })
}

async function doingsign(){
  await getsigninfo()
  if (signinfo.length !== 0){
    sams.log("正在领取任务")
    for (var i in signinfo){
      let d = await dosigninfo(signinfo[i].uuid,signinfo[i].bizGroup,signinfo[i].bizType)
      if (d.resultCode == 0){
        let subTitle = `❤领取${signinfo[i].msgName}活力值结果${d.resultData.info}\n`
        taskmsg += subTitle
        sams.log(subTitle)
      }
    }
  }
  else return
}

async function doing(){
  if (taskid){
    sams.log("正在逐个处理任务")
    for (var i in taskid){
       let d = await dotaskid(taskid[i]) 
       if (d.resultCode == 0) {
          let subTitle = `❤浏览${taskname[i]}${d.resultData.info}\n`
          taskmsg += subTitle
          sams.log(subTitle)
        }
    }
  }
else return
}


function Sign() {
  return new Promise((resolve) => {
    const signparams ={
         url:'https://ms.jr.jd.com/gw/generic/bt/h5/m/doSign?reqData=%7B%7D',
         headers:headers,
     }
    sams.get(signparams,
    (error,reponse,data) => {
      try {
        data = JSON.parse(data);
        if (data.resultCode == 0 && data.resultMsg == '操作成功') {
                subTitle = `❤特权活力值签到成功\n`
                message += subTitle
                sams.log(JSON.stringify(data))
              } else if (data.resultCode == 3) {
                  subTitle = `💔签到失败,请重新获取cookie\n`
                  message += subTitle
                  sams.log(JSON.stringify(data))
              } else {
                subTitle = `未知`
                detail = `❗ ${data.resultrMsg}\n`
                message += subTitle+detail
                sams.log(JSON.stringify(data))
              }
       
      } catch (e) {
        sams.log(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}


function show(){
    let title = "京东特权活力值签到并领取"
    sams.msg(title,message,taskmsg,option)
}

async function dotask() {
  await Sign();
  await gettaskid();
  await doing()
  await getsigninfo()
  await doingsign()
  await userinfo()
  await show()
  await sams.done();
}

dotask()

function init() {
  isSurge = () => {
    return undefined === this.$httpClient ? false : true
  }
  isQuanX = () => {
    return undefined === this.$task ? false : true
  }
  getdata = (key) => {
    if (isSurge()) return $persistentStore.read(key)
    if (isQuanX()) return $prefs.valueForKey(key)
  }
  setdata = (key, val) => {
    if (isSurge()) return $persistentStore.write(key, val)
    if (isQuanX()) return $prefs.setValueForKey(key, val)
  }
  msg = (title, subtitle, body, option) => {
    if (isSurge()) $notification.post(title, subtitle, body, option["open-url"])
    if (isQuanX()) $notify(title, subtitle, body, option)
  }
  log = (message) => console.log(message)
  get = (url, cb) => {
    if (isSurge()) {
      $httpClient.get(url, cb)
    }
    if (isQuanX()) {
      url.method = 'GET'
      $task.fetch(url).then((resp) => cb(null, resp, resp.body))
    }
  }
  post = (url, cb) => {
    if (isSurge()) {
      $httpClient.post(url, cb)
    }
    if (isQuanX()) {
      url.method = 'POST'
      $task.fetch(url).then((resp) => cb(null, resp, resp.body))
    }
  }
  done = (value = {}) => {
    $done(value)
  }
  return {
    isSurge,
    isQuanX,
    msg,
    log,
    getdata,
    setdata,
    get,
    post,
    done
  }
}


//$done({})
//Compatible code from https://github.com/chavyleung/scripts/blob/master/Env.min.js
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("","")}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t){let e={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r)));let h=["",""];h.push(e),s&&h.push(s),i&&h.push(i),console.log(h.join("\n")),this.logs=this.logs.concat(h)}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
