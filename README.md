# Youloge.Plus 开放扩展服务 ⚡ 当前处于非正式版 🚧

> * 前端开放服务，可以快速集成`人机验证`,`登录注册`,`转账支付`,`视频点播` 服务。
> * 先到 [任意开发者管理后台-apikey](https://www.youloge.com) 获取一对加解密密钥对(`apikey/secret`)。
> * 项目开源，欢迎提交PR，或者提交Issue。

### [💡 ⚡️ 🛠️ 📦 🔩 🔑 - 接口来源-开放API文档 ](https://youfeed.github.io/plus)


> - 建议直接引入CDN 即可使用  `3.45 kB │ gzip: 1.61 kB`
> - `https://unpkg.com/youloge.plus`或者`https://cdn.jsdelivr.net/npm/youloge.plus`
> - 主动调用 `youloge.plus.METHOD(config)`方法，通过`.then`和`.catch`接收回调,还可添加`.emit` 监听变化
> - `npm install youloge.plus` 或者 `yarn add youloge.plus`
> - ES6 模块引入 `import usePlus from 'youloge.plus'`

#### 更新日志

- 2.0.0 [20250330] 优化窗口加载逻辑，增加`video` 视频播放器服务
- 1.9.1 添加`utils`辅助函数，统一事件
- 1.2.0 优化监听事件，增加窗口新建销毁处理逻辑
- 1.0.8 引入`notify` 参数：直接对接开发者接口
- 1.0.7 修复弹窗`fiexd` 样式问题
- 1.0.6 修复`selector`设置错误情况下走`弹窗式`遮罩层不会关闭问题
- 1.0.5 统一风格`apikey 初始化` + `selector` 支持内嵌式渲染
- 0.0.9 前置服务`captcha`人机验证，归入到`匿名账户`体系
- 0.0.2 增加`login`单点登录服务(邮箱匿名代理)
- 0.0.1 初始化项目 构建逻辑 统一模块

### 开始使用 & 初始化

- 通知地址：网址参数不变，自动替换路劲部分
- 请求方式：POST 请求路径：/wallet/versive 请求参数：notify的query
- 请求头部：Authorization:  <Youloge-Notify signature | Youloge-Apikey apikey> Content-type: application-json
- 请求内容：{} 以为实际接口为准

```js
let PLUS = youloge.plus({
  // 如果未填写则从 sessionStorage.youloge.APIKEY 中获取
  apikey:'', // 必填*用于加密数据区分开发者 
  // 如果未填写则从 sessionStorage.youloge.NOTIFY 中获取
  notify:'' // 必填*同步通知接口地址; 注意跨域处理(*) 鉴权处理 解密处理
});
```

#### 弹窗式 | 内嵌式 & 可关闭 & 样式配置
``` js
// METHOD => 取值参考下文
PLUS.METHOD({
  // 只取查询到的第一个`Element`
  "selector":'HTMLElement #id .class null' // 可选* 如果未填写则为`全屏弹窗式`遮罩层
  "close":Bloom, // 可选* 是否允许模态框关闭，默认true,关闭后只能右上角关闭
  "styled":{ "dialog":"","iframe":"" },// 可选* 样式配置
  // 不同服务的参数不同，具体参考下文
  ...other params // 其他配置参数
}).emit(data=>{
  // 监听事件(流程尚未结束)(可选项) * 在`then catch`之前添加监听
}).then(res=>{
  // 处理成功(流程结束)
}).catch(err=>{
  // 处理失败(流程结束)
});
```

---

##  人机验证服务 `METHOD`=`captcha`

> 验证客户端环境是否正常：用于`登录邮件`,`支付邮件`,`发表评论`等数据交互的前置条件

- 人机验证通过时有`method params`参数时候，可以进行内部`vip接口`调用
- `captcha.signature` 有效期为`300秒`，请及时验证并消费。

> 关于`匿名用户`的生成方式还可以使用开发者`singer`代替,如果你自己实现人机验证的话

``` js
PLUS.captcha({
  "uuid":"", // 可选* 优先寻找该`Profile.UUID`本地账户
  "method":"captcha/verify", // 可选* 下一跳 VIP接口地址
  "params":{}, // 可选* 下一跳 VIP接口参数
  "verify":false, // 可选* 人机验证后(或下一跳调用VIP接口后),前端是否同步调用开发者`notify接口验证`
})
// 在调用`VIP接口`时，调用人身份为：`开发者`
```

---

## 身份认证 `METHOD`=`authorize` 

> 验证账户身份正确：用于`用户登录`,`修改账户`,`支付转账`,`商品购买`,`订阅资源`等敏感操作

- 强烈建议开启`同步验证 verify`参数，开发者控制 消费下一跳
- `verify`为`true`时,返回`expire signrnatrue`并同步通知开发者`authorize/verify`接口,开发者决定是否消费
- (默认)`verify`为`false`时，内网直接进行下一跳，返回下一跳直接消费数据，返回VIP接口返回数据

``` js
PLUS.authorize({
  "uuid":"", // 可选* 优先指定该`Profile.UUID`账户(本地)；本地无账户，会自动拉起登录窗口
  "desc":"", // 可选* 描述信息
  "method":"", // 可选* 下一跳 VIP接口地址
  "params":{}, // 可选* 下一跳 VIP接口参数
  "verify":false,
})
// 在调用`VIP接口`时，调用人身份为`已登录账户`
```

---

##  用户登录 `METHOD`=`login`

> 支持第三方快捷登录，这是对`人机验证 captcha`的二次封装，简化了`授权流程`

- 客户端登录后本地会存储登录信息(包括第三方授权登录)，下次可快捷登录;
- 快捷登录条件：用户登陆过一次且登录所使用的`apikey`与调用者`apikey`相同。

``` js
PLUS.login({
  "uuid":"" "*", // 优先指定该`Profile.UUID`账户(本地)
  "mail":String "*", // 优先指定`Profile.mail`邮箱(快速填写功能)
  "verify":false, // 可选* 同步验证 同步通知开发者`login/verify`接口,开发者决定是否消费
})
```

##  收银台付款服务 `METHOD`=`payment`

> 这是对`身份认证 authorize`的二次封装，简化了`授权流程`

- 平台货币为:`#1.00RGB ≈ ¥1.0001CNY ≈ $0.1372USD` 灵感来源于`css颜色数值`;
- 任意用户付款给开发者：`非点对点收款`
- *支付人*和当前*登录用户*是没有关系的，当前用户可能使用其他账户支付
- 只有`local`支付订单号，是你确认支付唯一的凭证
- 详细支付流水 在后台`apikey`下可查看时间，来源，IPV4
- `点对点收款 即指定用户付款`直接用户登录状态下：调用支付API即可。
- 开发者收款经过`>T+3 +7 +15`按比例`提现 > 0.6% 0.8% 3% 5%`(配合平台做纳税,实名认证)

``` js
PLUS.payment({
  "uuid":"" "*", // 优先指定该`Profile.UUID`账户(本地)
  "local":String "*", // 本地订单号 支付成功原样返回
  "money":Number "*", // 整数金额 100 => #1.00RGB
  "verify":false, // 可选* 同步验证 同步通知开发者`payment/verify`接口,开发者决定是否消费
}).then(res=>{ 
  // 成功(消费成功结果或验证同步通知结果)
})
```
##  视频点播服务 `METHOD`=`video`

> 视频点播服务，也可以播放其他来源视频 支持`flv`,`m3u8`,`dash`和`mp4`格式

- 优先处理video.uuid的视频点播。
- 再依次读取 `mp4` > `m3u8` > `dash` > `flv`
- 长视频(>60秒)的视频，播放器可能会插入贴片广告(可跳过)
- 开发者务必使用正确的`apikey`，否则无法产生的广告收益无法结算(优先保证视频播放)
- 广告收收益 结算至主账户名下，可在开发者后台`console`下查看

``` js
PLUS.payment({
  "uuid":"" "*", // 优先使用改值该`video.UUID` 视频ID
  "flv":String "*", // 第三方资源
  "mp4":String "*", // 第三方资源
  "m3u8":String "*", // 第三方资源
  "dash":String "*", // 第三方资源
}).then(res=>{ 
  // 成功(消费成功结果或验证同步通知结果)
})
```


## 关于数据校验解密

`apikey` - 暴漏给前端,用于调用各种开发服务

`secret` - 专门用于后端`AES-256-CBC * 2`解密(固定IP服务端解密使用`不要暴漏`)

`signature` 后端通过解密`signature`可以获取`JSON`字符串格式数据

-  解密参考 算法使用`AES-256-CBC * 2`
-  signature 前16字节为 iv 
-  secret 00-32字节为 key_one
-  secret 16-64字节为 key_two

``` php
public function signature_decrypt($signature,$secret='')
{
  $key = base64_decode($secret);
  $bin = base64_decode($signature);$iv = substr($bin,0,16);$str = substr($bin,16);
  $one = openssl_decrypt($str,'AES-256-CBC',substr($key,0,32),1,$iv);
  $two = openssl_decrypt($one,'AES-256-CBC',substr($key,32,64),1,$iv);
  return json_decode($two,true);
  // JSON参数根据不同的方法解出来数据不同
}
```

> 但行好事 莫问前程