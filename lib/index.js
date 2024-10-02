import {version} from '../package.json';
/**
 * selector：null false 0 空值 => 全屏弹窗
 * selector：Css选择器 => 内嵌式 参数先取Element的data-* 并覆盖配置参数
 */
var EventBus = {};
const onCreate = (config,CURL = null)=>{
  const HASH = `#${Math.random().toString(32).substring(2)}`,{selector,target,debug='https://open.youloge.com',styled={}} = config;
  const modal = document.querySelector(selector) || false;
  // 参数覆盖
  if(selector && modal){
    for (const key in modal.dataset) {
      if (Object.hasOwnProperty.call(modal.dataset, key)) {
        config[key] = modal.dataset[key]
      }
    }
  }
  try {
    CURL = new URL(debug);
    CURL.pathname = target;
    CURL.hash = HASH;
  } catch (error) {
    return console.error('debug url error!');
  }
  // 事件总线
  EventBus[HASH] = {resolve:null,reject:null,event:null,dialog:null};
  const promise = new Promise((resolve, reject) => (EventBus[HASH].resolve = resolve,EventBus[HASH].reject = reject));
  promise.emit = event => (EventBus[HASH].event = event,promise);
  // Embed Fullscreen
  const styles = {
    dialog:{
      true:'height: 100%; width: 100%; background: transparent;',
      false:'position: fixed; top: 0;left: 0;height: 100%; width: 100%; background: transparent; z-index: 2147483647; backdrop-filter: blur(2px);'
    },
    iframe:{
      true:'border: 0; background: transparent; width: 100%; height: 100%;box-shadow: 0 0 1px #999;',
      false:'border: 0; background: transparent; width: 100%; height: 100%;box-shadow: 0 0 1px #999;'
    }
  };
  const dialog = document.createElement('div');
  dialog.title = 'Youloge.Dialog';
  dialog.style = styled?.dialog || styles.dialog[Boolean(modal)];
  const iframe = document.createElement('iframe');
  iframe.src = CURL.href;
  iframe.name = HASH;
  iframe.style = styled?.iframe || styles.iframe[Boolean(modal)];;
  dialog.appendChild(iframe);(document.querySelector(selector) || document.body).appendChild(dialog)
  // 统一卸载
  const onDestroy = ()=>{
    dialog.remove();delete EventBus[HASH];
    window.removeEventListener('message',onMessage);
  };
  // 预先请求
  const preCheck = ()=>{
      fetch(CURL.href,{method:'HEAD'}).then(({status})=>{
        status == 200 || onDestroy(); 
      }).catch(()=>onDestroy())
  };preCheck();
  // 统一监听
  const onMessage = ({origin,data,source})=>{
    const [keys] = Object.keys(data),{method,params} = data[keys] || {};
    const {resolve,reject,event} = EventBus[keys];
    if(method && CURL.origin == origin && keys === HASH){
      const work = {
        'oninit':()=>source.postMessage({[HASH]:{method:'onload',params:config}},origin),
        'success':()=>{onDestroy();resolve && resolve.call(this,params)},
        'error':()=>{onDestroy();reject && reject.call(this,params)},
        'resize':()=>{iframe.style.height = `${params?.height}px`},
      };
      work[method] ? work[method]() : (event && event.call(this,params));
    }
  };window.addEventListener('message',onMessage,{capture:true})
  // 异步回调
  return promise;
}

export default function ({apikey:apikey,notify:notify,debug:debug}){
  const presets = {apikey,notify,debug};
  const login = (config={})=>onCreate({...config,...{name:'Youloge.login',target:'login',...presets}})
  const audio = (config={})=>onCreate({...config,...{name:'Youloge.audio',target:'audio',...presets}})
  const video = (config={})=>onCreate({...config,...{name:'Youloge.video',target:'video',...presets}})
  const payment = (config={})=>onCreate({...config,...{name:'Youloge.payment',target:'payment',...presets}})
  const discuss = (config={})=>onCreate({...config,...{name:'Youloge.discuss',target:'discuss',...presets}})
  const captcha = (config={})=>onCreate({...config,...{name:'Youloge.captcha',target:'captcha',...presets}})
  const shopcart = (config={})=>onCreate({...config,...{name:'Youloge.shopcart',target:'shopcart',...presets}})
  const authorize = (config={})=>onCreate({...config,...{name:'Youloge.authorize',target:'authorize',...presets}})
  
  return apikey ? {version,name:'Youloge.plus',login,payment,shopcart,discuss,audio,video,captcha,authorize} : (console.error('apikey undefined!'),undefined);
}