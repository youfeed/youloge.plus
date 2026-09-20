import {version} from '../package.json';
/**
 * selector：未填写(null/false/0) => 正常 dialog+iframe 全屏加载
 * selector：Css选择器 查不到 HTMLElement => window.open 无头窗口
 * selector：Css选择器 查到 HTMLElement => 批量加载 每个元素一个新 iframe
 * selector：HTMLElement => 直接内嵌该元素
 */
var EventBus = {};
const onCreate = (config,CURL = null)=>{
    const {selector,target,styled={}} = config;

    // 路由：填写了选择器(字符串)则先查询
    if(!!selector && !(selector instanceof HTMLElement)){
        let nodes = [];
        try{ nodes = [...document.querySelectorAll(selector)]; }catch(e){ nodes = []; }
        // 查不到 HTMLElement => 转为 window.open 弹窗
        if(nodes.length === 0) return onCreate({...config, selector: ''}, CURL);
        // 查到则批量加载：每个 HTMLElement 都是一个新的 iframe（独立 HASH/promise）
        return nodes.map(node => onCreate({...config, selector: node}, CURL));
    }

    const HASH = `#${Math.random().toString(32).substring(2)}`;
    const isWindow = selector === '';
    const isFull = !selector && !isWindow;
    const modal = selector instanceof HTMLElement ? selector : null;
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
    // window.open 弹窗：无头窗口(无地址栏/工具栏)并绝对定位 屏幕居中
    let win = null;
    if(isWindow){
        const width = config.width || Math.round(window.innerWidth * 0.8);
        const height = config.height || Math.round(window.innerHeight * 0.8);
        const left = Math.max(0, Math.round((screen.availWidth - width) / 2));
        const top = Math.max(0, Math.round((screen.availHeight - height) / 2));
        win = window.open(CURL.href, HASH, [
            'popup',
            `width=${width}`, `height=${height}`,
            `left=${left}`, `top=${top}`,
            'toolbar=no', 'menubar=no', 'location=no', 'status=no',
            'resizable=yes', 'scrollbars=yes'
        ].join(','));
    }
    if(isWindow && !win){
        console.error('window.open blocked!');
        delete EventBus[HASH];
        rejectFn?.(new Error('window.open blocked!'));
        return promise;
    }
    // 样式配置
    const defaultStyles = {
        dialog: 'display: contents; height: 0; width: 0; border: 0; margin: auto;max-height:none;max-width:none;padding:0; overflow: hidden; background: transparent;',
        iframe: 'border: 0; background: transparent; width: 100%; height: 100%;max-height:none;max-width:none;'
    };
    // 创建对话框和iframe（window.open 模式跳过）
    let dialog = null, iframe = null, animate = null, resizeObserver = null, onResize = null;
    if(!isWindow){
        dialog = document.createElement('dialog');
        dialog.title = 'Youloge.Plus.Dialog';
        dialog.style = styled.dialog || defaultStyles.dialog;

        iframe = document.createElement('iframe');
        iframe.allowFullscreen = true;
        iframe.src = CURL.href;
        iframe.name = HASH;
        iframe.style = styled.iframe || defaultStyles.iframe;

        dialog.appendChild(iframe);
        (modal || document.body).appendChild(dialog);
        // 加载动画
        animate = iframe.animate(
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
        // 尺寸获取：全屏取可视窗口宽高，内嵌取元素尺寸
        const getSize = () => {
            if(!modal) return { width: window.innerWidth, height: window.innerHeight };
            const rect = modal.getBoundingClientRect();
            return { width: rect.width, height: rect.height };
        };
        const setDialogSize = () => {
            const { width, height } = getSize();
            dialog.style.width = `${width}px`;
            dialog.style.height = `${height}px`;
        };
        setDialogSize();
        // 尺寸变化监听
        onResize = () => {
            clearTimeout(window.resizeTimer);
            window.resizeTimer = setTimeout(setDialogSize, 200);
        };
        if(!modal){
            // 全屏：监听窗口尺寸变化
            window.addEventListener('resize', onResize);
        } else {
            // 内嵌：监听元素尺寸变化
            resizeObserver = new ResizeObserver(onResize);
            resizeObserver.observe(modal);
        }
        // 显示对话框
        modal ? dialog.show() : dialog.showModal();
    }
    // 清理函数
    const cleanup = () => {
        resizeObserver?.disconnect();
        onResize && window.removeEventListener('resize', onResize);
        win?.close();
        dialog?.remove();
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
                    animate?.cancel();
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
        { name: 'passkey', target: 'passkey.html' },
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