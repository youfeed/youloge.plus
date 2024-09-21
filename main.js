import './style.css'
import plus from './lib/index.js'

let PLUS = plus({
  ukey:'2UsDQYxLJOpdXVWRi4ujVAnIHZUNww92EYAeC6GsQs9q19ccNYDlnFrTe4PGIxsEBTFjjl4w8IFyDzQtQIWMWHpufbals5DrZHsJ3m0VFMMit4FAByb4X00/wqWS1kEy'
})
console.log('PLUS',PLUS)
// 调试单点登录
document.querySelector('#sso').onclick = ()=>{
  PLUS.sso({
    // selector:null,
    selector:'#sso3',
  }).listener(res=>{
    console.info(res)
  }).then(res=>{
    console.log(res)
  }).catch(err=>{
    console.log(err)
  })
}
// document.querySelector('#captcha').onclick = ()=>{
//   let captcha = PLUS.captcha({
//     width:'360'
//   }).then(res=>{
//     console.log('#captcha',res)
//   })
//   .catch(err=>{
//     console.log('#captcha',err)
//   })
//   console.log(captcha)
// }

document.querySelector('#hello').onclick = ()=>{

  // let ppp = plus({ukey:'TKoLtLJatVyqbbNWQFb_yMdoFzoWx40b9I7JzUYwRORqiHB7MxNdfqpN8hnSsx3hdbThUbauq0M60DNkZQZDrQ=='})
  let login = PLUS.login({width:'360',close:true,selector:'#ss'})
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
    console.log('listener',err)
  })
  
  login.then(res=>{
    console.log('res',res)
  }).catch(err=>{
    console.log('err',err)
  })


}