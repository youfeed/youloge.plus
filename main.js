import './style.css'
import plus from './lib/index.js'

let PLUS = plus({
  debug:'http://localhost:4173', // false
  apikey:'it-lk1ER3z-iVEDdHRtIxh-jwymtE65cfZwjh2OUOYbBg3E6Z54DILcVgfbi5KYyn5J0OVyCTReXCIaFtgGxdw',
  notify:'https://www.youloge.com/yaroslaff/ws-emit?site=125245',
})
console.log('PLUS',PLUS)


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
    method:'',
    params:{},
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
// 调试身份验证
document.querySelector('#mfa').onclick = ()=>{
  PLUS.authorize({
    method:'',
    params:{},
    verify:true,
    mail:'',
  }).emit(res=>{
    console.log('authorize.emit',res)
  }).then(res=>{
    console.log('authorize.then',res)
  }).catch(err=>{
    console.log('authorize.err',err)
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
// 调试转账支付
document.querySelector('#payment').onclick = ()=>{
  PLUS.payment({
    local:'no123456789',
    // 付款人
    sender:10000,
    // 收款金额
    amount:360,
    // 支付场景 - 同步通知
    method:'profile', // profile drive goods
    // 收款参数 - 同步通知
    params:{
      uuid:100,
    },
  }).emit(res=>{
    console.log('payment.emit',res)
  }).then(res=>{
    console.log('payment.then',res)
  }).catch(err=>{
    console.log('payment.err',err)
  })
}
// 调试云盘支付服务
document.querySelector('#drive').onclick = ()=>{
  PLUS.payment({
    notify:'https://www.youloge.com/captcha/verify?site=125245',
    pathname:'captcha/verify',
    //
    local:'no123456789',
    // 付款人
    sender:10000,
    // 收款金额 1.02
    amount:102,
    // 支付场景 - 同步通知
    method:'drive', // profile drive goods
    // 收款参数 - 同步通知
    params:{
      uuid:1000,
    },
  }).emit(res=>{
    console.log('drive.emit',res)
  }).then(res=>{
    console.log('drive.then',res)
  }).catch(err=>{
    console.log('drive.err',err)
  })
}
// 调用商城购物服务
document.querySelector('#goods').onclick = ()=>{
  PLUS.shopcart({
    notify:'URL_ADDRESS',
    pathname:'captcha/verify',
    //
    local:'no123456789',
    // 付款人
    sender:10000,
    buyer:10000,
    // 收款金额 1.02
    amount:102,
    // 支付场景 - 同步通知
    method:'goods', // profile drive goods
    // 收款参数 - 同步通知
    params:{
      uuid:1000,
    },
  }).emit(res=>{
    console.log('goods.emit',res)
  }).then(res=>{
    console.log('goods.then',res)
  }).catch(err=>{
    console.log('goods.err',err)
  })
}