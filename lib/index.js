import {version} from '../package.json';
/**
 * selector：null false 0 空值 => 全屏弹窗
 * selector：Css选择器 => 内嵌式 参数先取Element的data-* 并覆盖配置参数
 */
let EventBus = {};
const onCreate = (config)=>{
  let hash = `#${Math.random().toString(32).substring(2)}`,{selector,target,style} = config;
  // let URL = `http://localhost:5174/${target}.html`;
  let URL = `https://open.youloge.com/${target}`;
  const iframe = document.createElement('iframe');iframe.src = `${URL}${hash}`;iframe.name = hash;iframe.style = style ? style :`border: 0; background: transparent; width: 100%; height: 100%;box-shadow: 0 0 1px #999;`;
  if(selector && document.querySelector(selector)){
    var modal = document.querySelector(selector);
    for (const key in modal.dataset) {
      if (Object.hasOwnProperty.call(modal.dataset, key)) {
        config[key] = modal.dataset[key]
      }
    }
    modal.innerHTML = '';
    modal.appendChild(iframe);
  }else{
    var modal = document.createElement('div');
    modal.title = '弹窗';
    modal.style = 'position: fixed; top: 0;left: 0;height: 100%; width: 100%; background: transparent; z-index: 2147483647; backdrop-filter: blur(2px);'
    modal.appendChild(iframe);
    document.body.appendChild(modal);
  }
  // 统一监听
  EventBus[hash] = {resolve:null,reject:null,event:null,modal:modal,iframe:iframe};
  const onMessage = ({origin,data,source})=>{
    let [keys] = Object.keys(data),{method,params} = data[keys] || {};
    let {resolve,reject,event,modal,iframe} = EventBus[keys];
    // console.log(1,method,params,modal)
    if(method && URL.startsWith(origin) && keys === hash){
      let work = {
        'ready':()=>source.postMessage({[keys]:{method:'init',params:config}},origin),
        'success':()=>{(modal.title ? modal.remove() : iframe.remove());resolve && resolve.call(this,params)},
        'error':()=>{(modal.title ? modal.remove() : iframe.remove());reject && reject.call(this,params)}
      };
      work[method] ? work[method]() : (event && event.call(this,params));
    }
  }
  const onDispose = ()=>{
    delete EventBus[hash];
    window.removeEventListener('message',onMessage);
  }
  console.log(2333,config,onMessage)
  window.addEventListener('message',onMessage)
  // 异步回调
  const promise = new Promise((resolve, reject) => (EventBus[hash].resolve = resolve,EventBus[hash].reject = reject));
  promise.listener = event => {
    EventBus[hash].event = event
    return promise; 
  };
  return promise;
}

export default function ({ukey:ukey}){
  const sso = (config={})=>onCreate({...config,...{name:'youloge.sso',target:'sso',ukey:ukey}})
  const pay = (config={})=>onCreate({...config,...{name:'youloge.pay',target:'pay',ukey:ukey}})
  const audio = (config={})=>onCreate({...config,...{name:'youloge.audio',target:'audio',ukey:ukey}})
  const video = (config={})=>onCreate({...config,...{name:'youloge.video',target:'video',ukey:ukey}})
  const payment = (config={})=>onCreate({...config,...{name:'youloge.payment',target:'payment',ukey:ukey}})
  const discuss = (config={})=>onCreate({...config,...{name:'youloge.discuss',target:'discuss',ukey:ukey}})
  const captcha = (config={})=>onCreate({...config,...{name:'youloge.captcha',target:'captcha',ukey:ukey}})
  return ukey ? {version,name:'youloge.plus',sso,pay,payment,discuss,audio,video,captcha} : (console.error('Ukey undefined!'),undefined);
}