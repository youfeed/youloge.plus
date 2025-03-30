import {version} from '../package.json';
/**
 * selector：null false 0 空值 => 全屏弹窗
 * selector：Css选择器 => 内嵌式 参数先取Element的data-* 并覆盖配置参数
 */
var EventBus = {};
const onCreate = (config,CURL = null)=>{
  const HASH = `#${Math.random().toString(32).substring(2)}`,{selector,target,styled={}} = config;
  console.log('selector',selector);
  const modal = selector instanceof HTMLElement ? selector : document.querySelector(selector);
  const root = modal || document.body;
  // 参数覆盖
  if(selector && modal){
    for (const key in modal.dataset) {
      if (Object.hasOwnProperty.call(modal.dataset, key)) {
        config[key] = modal.dataset[key]
      }
    }
  }
  try {
    CURL = new URL(`https://open.youloge.com`);
    CURL.pathname = target;CURL.hash = HASH;
  } catch (error) {
    return console.error('debug url error!');
  }
  // 事件总线
  EventBus[HASH] = {resolve:null,reject:null,event:null,dialog:null};
  const promise = new Promise((resolve, reject) => (EventBus[HASH].resolve = resolve,EventBus[HASH].reject = reject));
  promise.emit = event => (EventBus[HASH].event = event,promise);
  // Embed Fullscreen
  const styles = {
    dialog:'display: contents;height: 0; width: 0; border:0;overflow: hidden; background: transparent;',
    iframe:'border: 0; background: transparent; width: 100%; height: 100%;'
  };
  const dialog = document.createElement('dialog');
  dialog.title = 'Youloge.Dialog';
  dialog.style = styled?.dialog || styles.dialog;
  const iframe = document.createElement('iframe');
  iframe.setAttribute('allowfullscreen', '')
  iframe.src = CURL.href;
  iframe.name = HASH;
  iframe.style = styled?.iframe || styles.iframe;
  dialog.appendChild(iframe);modal ? (modal.innerHTML = '', modal.appendChild(dialog)) : document.body.appendChild(dialog);
  // 加载动画
  // let keyframes = {
  //   'border-width':["5px","0px"],
  //   'border-color':["#fff","transparent"],
  //   'border-style':["solid","solid"],
  //   opacity: [.9, 1],
  //   // transform: ["scaleY(0px)", "scaleY(1px)"],
  // };
  let keyframes = [
    {
      borderRadius: "5px",
      boxShadow: "inset 0 0 5px 0px rgba(218, 218, 218, 0.5)"
    },
    {
      borderRadius: "5px",
      "boxShadow": "inset 0 0 15px 30px rgba(241, 241, 241, 0.8)"
    },
    {
      borderRadius: "5px",
      "boxShadow": "inset 0 0 10px 90px rgba(245, 245, 245, 0.29)"
    },
    {
      borderRadius: "5px",
      boxShadow: "inset 0 0 5px 180px rgba(218, 218, 218, 0.5)"
    }
  ];
  let timing = {
    iterations: Infinity,
    duration: 1000,
    easing: 'ease-in-out'
  };let animate = iframe.animate(keyframes, timing); animate.play(); // 显示
  // 监听尺寸变化
  const resize = new ResizeObserver(entries => {
    entries.forEach(entry => {
      dialog.style.height = `${entry.contentRect.height}px`;
      dialog.style.width = `${entry.contentRect.width}px`;
      console.log(entry.contentRect.width, entry.contentRect.height);
    })
  });modal ? resize.observe(modal) : resize.observe(root);
  modal ? dialog.show() : dialog.showModal(); 
  // 统一卸载
  const onDestroy = ()=>{
    dialog.remove();delete EventBus[HASH];
    window.removeEventListener('message',onMessage);
  };
  // 预先请求
  const preCheck = ()=>{
      fetch(CURL.href,{method:'HEAD'}).then(({status})=>{
        status == 200 || onDestroy(); 
      }).catch(()=>{
        EventBus[HASH].event.call(this,{err:404,msg:'Not Found'}); // 移除
        onDestroy();
      });
  };preCheck();
  // 统一监听 [HASH]:{method:'onload',params:config | {err:404,msg:'Not Found'}}
  const onMessage = ({origin,data,source})=>{
    const [keys] = Object.keys(data),{method,params} = data[keys] || {};
    if(method && CURL.origin == origin && keys === HASH){
      const {resolve,reject,event} = EventBus[keys];
      const work = {
        'oninit':()=>{
          animate.cancel()
          source.postMessage({[HASH]:{method:'onload',params:config}},origin)
        },
        'success':()=>{onDestroy();resolve && resolve.call(this,params)},
        'error':()=>{onDestroy();reject && reject.call(this,params)},
      };
      work[method] ? work[method]() : (event && event.call(this,params));
    }
  };window.addEventListener('message',onMessage,{capture:true});
  // 异步回调
  return promise;
}
/**
 * 参数取值：sessionStorage => 配置参数 => 默认参数 后面参数可以覆盖前面参数
 * @param {*} apikey 接口密钥
 * @param {*} notify 异步通知地址
 * @param {*} debug 调试地址
 * @param {*} deploy 配置参数
 * @returns {*}
**/
export default function ({apikey:apikey,notify:notify,debug:debug}={}){
  let {APIKEY,NOTIFY,DEBUG} = JSON.parse(sessionStorage.getItem('youloge') || '{}');
  if(!apikey && !APIKEY) return (console.error('apikey undefined!'),{});
  const presets = {
    apikey: apikey ?? APIKEY,
    notify: notify ?? NOTIFY,
    debug: debug ?? DEBUG,
  };
  // 配置参数覆盖
  const login = (config={})=>onCreate({...config,...{name:'Youloge.login',target:'login',...presets}})
  const audio = (config={})=>onCreate({...config,...{name:'Youloge.audio',target:'audio',...presets}})
  const video = (config={})=>onCreate({...config,...{name:'Youloge.video',target:'video',...presets}})
  const payment = (config={})=>onCreate({...config,...{name:'Youloge.payment',target:'payment',...presets}})
  const discuss = (config={})=>onCreate({...config,...{name:'Youloge.discuss',target:'discuss',...presets}})
  const captcha = (config={})=>onCreate({...config,...{name:'Youloge.captcha',target:'captcha',...presets}})
  const shopcart = (config={})=>onCreate({...config,...{name:'Youloge.shopcart',target:'shopcart',...presets}})
  const authorize = (config={})=>onCreate({...config,...{name:'Youloge.authorize',target:'authorize',...presets}})
  
  return {
    version,name:'Youloge.plus',
    login,captcha,authorize,payment,shopcart,
    discuss,audio,video,
  };
}