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
        dialog: 'display: contents; height: 0; width: 0; border: 0; margin: auto;max-height:none;max-width:none; overflow: hidden; background: transparent;',
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
}
/**
 * 参数取值：sessionStorage => 配置参数 => 默认参数 后面参数可以覆盖前面参数
 * @param {*} apikey 接口密钥
 * @param {*} notify 异步通知地址
 * @param {*} debug 调试地址
 * @param {*} deploy 配置参数
 * @returns {*}
**/
export default function ({apikey:apikey,debug:debug=false}={}){
    let {APIKEY} = JSON.parse(sessionStorage.getItem('youloge') || '{}');
    let {access_token} = JSON.parse(localStorage.getItem('profile') || '{}');
    if(!apikey && !APIKEY) return (console.error('apikey undefined!'),{});
    const presets = {
        apikey: apikey ?? APIKEY,
        debug: debug,
    };
    access_token && (presets.access_token = access_token)
    // 定义模块配置并生成对应方法
    const modules = [
        { name: 'login', target: 'login.html' },
        { name: 'audio', target: 'audio.html' },
        { name: 'video', target: 'video.html' },
        { name: 'prifile', target: 'prifile.html' },
        { name: 'setting', target: 'setting.html' },
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