import './style.css'
import plus from './lib/index.js'

let PLUS = plus({
  debug:'http://localhost:4173', // false
  apikey:'it-lk1ER3z-iVEDdHRtIxh-jwymtE65cfZwjh2OUOYbBg3E6Z54DILcVgfbi5KYyn5J0OVyCTReXCIaFtgGxdw',
  notify:'https://www.youloge.com/yaroslaff/ws-emit?site=125245',
})
console.log('PLUS',PLUS)

document.querySelector('#pay').onclick = ()=>{
  PLUS.pay({
    money:0.01,
    width:'360',
    height:'380',
  }).emit(res=>{
    console.log(777777777,'pay.emit',res)
  }).then(res=>{
    console.log(777777777,'pay.then',res)
  }).catch(err=>{
    
  })
}
// 调试单点登录
document.querySelector('#login').onclick = ()=>{
  PLUS.login({
    selector:'#login',
    // styled:{
    //   dialog:'',
    //   iframe:'',
    // }
    
  }).emit(res=>{
    console.info(777777777,'sso.emit',res)
  }).then(res=>{
    console.log(777777777,'sso.then',res)
  }).catch(err=>{
    console.log(777777777,'sso.catch',err)
  })
}
// 调试人机验证
document.querySelector('#captcha').onclick = ()=>{
  const captcha = PLUS.captcha({
    router:'a',
    params:{}
  });
  console.log(captcha)
  
  captcha.emit(res=>{
    console.log('#captcha.emit',res)
  })
  
  captcha.then(res=>{
    console.log('#captcha.then',res)
  }).catch(err=>{
    console.log('#captcha.catch',err)
  })
}

document.querySelector('#hello').onclick = ()=>{

  let login = PLUS.login({width:'360',close:true})
  // let ssos = ppp.sso({width:'360'})
  // console.log(plus,ppp,sso)
  // let P = plus.sso({
  //   ukey:'TKoLtLJatVyqbbNWQFb_yMdoFzoWx40b9I7JzUYwRORqiHB7MxNdfqpN8hnSsx3hdbThUbauq0M60DNkZQZDrQ==',
  //   local:'localid',
  //   width:'360',
  //   height:'380',
  //   money:0.01,
  // })
  console.log(login)

  login.emit(err=>{
    console.log(888888888888888,'emit',err)
  })
  
  login.then(res=>{
    console.log(888888888888888,'then',res)
  }).catch(err=>{
    console.log(888888888888888,'catch',err)
  })


}