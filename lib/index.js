import {version} from '../package.json';
/**
 * selector：null false 0 空值 => 全屏弹窗
 * selector：Css选择器 => 内嵌式 参数先取Element的data-* 并覆盖配置参数
 */
var EventBus = {};
const onCreate = (config,CURL = null)=>{
    const HASH = `#${Math.random().toString(32).substring(2)}`;
    const {selector,target,styled={}} = config;

    const modal = selector instanceof HTMLElement ? selector : document.querySelector(selector);
    const root = modal || document.body;
    // 从data属性覆盖配置
    if(modal){
        Object.entries(modal.dataset).forEach(([key, value]) => {
            config[key] = value;
        });
    }
    // 初始化URL
    try {
        CURL = config.debug ? new URL(config.debug) : new URL(`https://open.youloge.com`);
        CURL.pathname = target;CURL.hash = HASH;
    } catch (error) {
        console.error('open url error!',error);
        return;
    }
    // 初始化事件总线
    let resolveFn, rejectFn;
    const promise = new Promise((resolve, reject) => {
        resolveFn = resolve;
        rejectFn = reject;
    });
    EventBus[HASH] = {
        resolve: resolveFn,
        reject: rejectFn,
        event: null,
        dialog: null
    };
    // 添加emit方法
    promise.emit = (event) => {
        EventBus[HASH].event = event;
        return promise;
    };
    // 样式配置
    const defaultStyles = {
        dialog: 'display: contents; height: 0; width: 0; border: 0; margin: auto; overflow: hidden; background: transparent;',
        iframe: 'border: 0; background: transparent; width: 100%; height: 100%;'
    };
    // 创建对话框和iframe
    const dialog = document.createElement('dialog');
    dialog.title = 'Youloge.Plus.Dialog';
    dialog.style = styled.dialog || defaultStyles.dialog;
    
    const iframe = document.createElement('iframe');
    iframe.allowFullscreen = true;
    iframe.src = CURL.href;
    iframe.name = HASH;
    iframe.style = styled.iframe || defaultStyles.iframe;
    
    dialog.appendChild(iframe);
    (modal ? modal : document.body).appendChild(dialog);
    // 加载动画
    const animate = iframe.animate(
        [
            { boxShadow: 'inset 0 0 5px 0px rgba(218, 218, 218, 0.5)' },
            { boxShadow: 'inset 0 0 15px 30px rgba(241, 241, 241, 0.8)' },
            { boxShadow: 'inset 0 0 10px 90px rgba(245, 245, 245, 0.29)' },
            { boxShadow: 'inset 0 0 5px 180px rgba(218, 218, 218, 0.5)' }
        ],
        {
            iterations: Infinity,
            duration: 1000,
            easing: 'ease-in-out'
        }
    );
    animate.play();
    // 尺寸变化监听
    const resizeObserver = new ResizeObserver(entries => {
        clearTimeout(window.resizeTimer);
        window.resizeTimer = setTimeout(() => {
            const { width, height } = entries[0].contentRect;
            dialog.style.width = `${width}px`;
            dialog.style.height = `${height}px`;
        }, 200);
    });
    // 显示对话框
    modal ? dialog.show() : dialog.showModal();
    resizeObserver.observe(modal || root);
    // 清理函数
    const cleanup = () => {
        resizeObserver.unobserve(modal || root);
        dialog.remove();
        delete EventBus[HASH];
        window.removeEventListener('message', messageHandler, { capture: true });
    };
    // 预先检查资源是否存在
    fetch(CURL.href, { method: 'HEAD' }).then(({ status }) => {
        if (status !== 200) cleanup();
    }).catch(() => {
        EventBus[HASH].event?.call(this, { err: 404, msg: 'Not Found' });
        cleanup();
    });
    // 消息处理函数
    const messageHandler = ({ origin, data, source }) => {
        const [key] = Object.keys(data || {});
        const { method, params } = data?.[key] || {};
        if (method && CURL.origin === origin && key === HASH) {
            const { resolve, reject, event } = EventBus[key];
            const actions = {
                oninit: () => {
                    animate.cancel();
                    source.postMessage({ [HASH]: { method: 'onload', params: config } }, origin);
                },
                success: () => {
                    cleanup();
                    resolve?.(params);
                },
                error: () => {
                    cleanup();
                    reject?.(params);
                }
            };
            // 处理消息
            actions[method] ? actions[method]() : event?.call(this, params);
        }
    };
    window.addEventListener('message', messageHandler, { capture: true });
    return promise;
    // 事件总线
    // EventBus[HASH] = {resolve:null,reject:null,event:null,dialog:null};
    // const promise = new Promise((resolve, reject) => (EventBus[HASH].resolve = resolve,EventBus[HASH].reject = reject));
    // promise.emit = event => (EventBus[HASH].event = event,promise);
    // // Embed Fullscreen
    // const styles = {
    //     dialog:'display: contents;height: 0; width: 0; border:0;margin:auto;overflow: hidden; background: transparent;',
    //     iframe:'border: 0; background: transparent; width: 100%; height: 100%;'
    // };
    // const dialog = document.createElement('dialog');
    // dialog.title = 'Youloge.Dialog';
    // dialog.style = styled?.dialog || styles.dialog;
    // const iframe = document.createElement('iframe');
    // iframe.setAttribute('allowfullscreen', '')
    // iframe.src = CURL.href;
    // iframe.name = HASH;
    // iframe.style = styled?.iframe || styles.iframe;
    // dialog.appendChild(iframe);modal ? (modal.innerHTML = '', modal.appendChild(dialog)) : document.body.appendChild(dialog);
    // // 加载动画
    // let keyframes = [
    //     {
    //     borderRadius: "5px",
    //     boxShadow: "inset 0 0 5px 0px rgba(218, 218, 218, 0.5)"
    //     },
    //     {
    //     borderRadius: "5px",
    //     "boxShadow": "inset 0 0 15px 30px rgba(241, 241, 241, 0.8)"
    //     },
    //     {
    //     borderRadius: "5px",
    //     "boxShadow": "inset 0 0 10px 90px rgba(245, 245, 245, 0.29)"
    //     },
    //     {
    //     borderRadius: "5px",
    //     boxShadow: "inset 0 0 5px 180px rgba(218, 218, 218, 0.5)"
    //     }
    // ];
    // let timing = {
    //     iterations: Infinity,
    //     duration: 1000,
    //     easing: 'ease-in-out'
    // };let animate = iframe.animate(keyframes, timing); animate.play(); // 显示
    // const throttle = (func, delay)=>{
    //         let timer = null;
    //         return function (...args) {
    //             if (timer) {
    //                 clearTimeout(timer);
    //             };
    //             timer = setTimeout(() => {
    //             func.apply(this, args);
    //                 timer = null;
    //             }, delay);
    //         };
    // }
    // // 监听尺寸变化
    // let timer = null;
    // const resize = new ResizeObserver(entries => {
    //     entries.forEach(entry => {
    //         timer && clearTimeout(timer);
    //         timer = setTimeout(() => {
    //             dialog.style.height = `${entry.contentRect.height}px`;
    //             dialog.style.width = `${entry.contentRect.width}px`;
    //             console.log(entry,entry.contentRect.width, entry.contentRect.height); // 修改尺寸
    //         },200)
    //     })
    // });
    // modal ? dialog.show() : dialog.showModal(); // 监听尺寸变化
    // modal ? resize.observe(modal) : resize.observe(root);
    // // 统一卸载
    // const onDestroy = ()=>{
    //     modal ? resize.unobserve(modal) : resize.unobserve(root);
    //     dialog.remove();delete EventBus[HASH];
    //     window.removeEventListener('message',onMessage);
    // };
    // // 预先请求
    // const preCheck = ()=>{
    //     fetch(CURL.href,{method:'HEAD'}).then(({status})=>{
    //         status == 200 || onDestroy(); 
    //     }).catch(()=>{
    //         EventBus[HASH].event.call(this,{err:404,msg:'Not Found'}); // 移除
    //         onDestroy();
    //     });
    // };preCheck();
    // // 统一监听 [HASH]:{method:'onload',params:config | {err:404,msg:'Not Found'}}
    // const onMessage = ({origin,data,source})=>{
    //     const [keys] = Object.keys(data),{method,params} = data[keys] || {};
    //     if(method && CURL.origin == origin && keys === HASH){
    //     const {resolve,reject,event} = EventBus[keys];
    //     const work = {
    //         'oninit':()=>{
    //         animate.cancel()
    //         source.postMessage({[HASH]:{method:'onload',params:config}},origin)
    //         },
    //         'success':()=>{onDestroy();resolve && resolve.call(this,params)},
    //         'error':()=>{onDestroy();reject && reject.call(this,params)},
    //     };
    //     work[method] ? work[method]() : (event && event.call(this,params));
    //     }
    // };window.addEventListener('message',onMessage,{capture:true});
    // // 异步回调
    // return promise;
}
/**
 * 参数取值：sessionStorage => 配置参数 => 默认参数 后面参数可以覆盖前面参数
 * @param {*} apikey 接口密钥
 * @param {*} notify 异步通知地址
 * @param {*} debug 调试地址
 * @param {*} deploy 配置参数
 * @returns {*}
**/
export default function ({apikey:apikey,notify:notify}={}){
    let {APIKEY,NOTIFY} = JSON.parse(sessionStorage.getItem('youloge') || '{}');
    if(!apikey && !APIKEY) return (console.error('apikey undefined!'),{});
    const presets = {
        apikey: apikey ?? APIKEY,
        notify: notify ?? NOTIFY
    };
    // 定义模块配置并生成对应方法
    const modules = [
        { name: 'login', target: 'login.html' },
        { name: 'audio', target: 'audio.html' },
        { name: 'video', target: 'video.html' },
        { name: 'payment', target: 'payment.html' },
        { name: 'discuss', target: 'discuss.html' },
        { name: 'captcha', target: 'captcha.html' },
        { name: 'shopcart', target: 'shopcart.html' },
        { name: 'authorize', target: 'authorize.html' },
    ];
    const methods = modules.reduce((acc, { name, target }) => {
        acc[`use${name.charAt(0).toUpperCase() + name.slice(1)}`] = (config = {}) => 
            onCreate({ ...config, ...{ name: `Youloge.${name}`, target, ...presets } });
        return acc;
    }, {});
    // 配置参数覆盖
    return {
        version,name:'Youloge.plus',
        ...methods
    };
}