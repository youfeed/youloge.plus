import './style.css'
import plus from './lib/index.js'

let PLUS = plus({
  // apikey:'pt0ALFviHU5yHTb0acTkLAF7Tg53BP8ld7F3pHqVMDBI233JVN0CykDFx9qZDxWteH1XxN0r__54h1dY_OzqhtRCFoIoLQWcyflHkarkp0o',
  apikey:'it-lk1ER3z-iVEDdHRtIxh-jwymtE65cfZwjh2OUOYbBg3E6Z54DILcVgfbi5KYyn5J0OVyCTReXCIaFtgGxdw',
  notify:'https://www.youloge.com/yaroslaff/ws-emit?site=125245'
})
console.log('PLUS',PLUS)
// 调试单点登录
document.querySelector('#sso').onclick = ()=>{
  console.info(777777777,'sso.emit')
  PLUS.sso({
    // selector:null,
    selector:'#sso3',
  }).emit(res=>{
    console.info(777777777,'sso.emit',res)
  }).then(res=>{
    console.log(777777777,'sso.then',res)
  }).catch(err=>{
    console.log(777777777,'sso.catch',err)
  })
}
document.querySelector('#captcha').onclick = ()=>{
  const captcha = PLUS.captcha({
    width:'360'
  });
  captcha.emit(res=>{
    console.log('#captcha.emit',res)
  })
  
  captcha.then(res=>{
    console.log('#captcha.then',res)
  }).catch(err=>{
    console.log('#captcha.catch',err)
  })
  console.log(captcha)
}

document.querySelector('#hello').onclick = ()=>{

  // let ppp = plus({ukey:'TKoLtLJatVyqbbNWQFb_yMdoFzoWx40b9I7JzUYwRORqiHB7MxNdfqpN8hnSsx3hdbThUbauq0M60DNkZQZDrQ=='})
  let login = PLUS.login({width:'360',close:true,selector:0})
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