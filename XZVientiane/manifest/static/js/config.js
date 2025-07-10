/*!
 * config.js v2.0.1-beta.0
 * (c) 2018-20@2 Sean lee
 */
//ios终端
const isIos=!!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);

//android终端或uc浏览器
const isAndroid=navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('Linux') > -1;

//是否为iPhone或者QQHD浏览器
const isIphone=navigator.userAgent.indexOf('iPhone') > -1;

//是否iPad
const isIpad=navigator.userAgent.indexOf('iPad') > -1;

//是否微信
const isWeixin=navigator.userAgent.toLowerCase().match(/MicroMessenger/i)=="micromessenger";

//域名
const domain=xzSystemConfig.domain;

//客户端，app、web、wx
const client=xzSystemConfig.clientMode||'web';

const wxVersion=3;

//工作环境，test：测试，production：生产，develop：开发
const environment=xzSystemConfig.environment;

//独立项目id
const projectId=xzSystemConfig.projectId;

//生成的响站客户端id
const xzAppId=isWeixin?xzSystemConfig.xzAppId+'_weixin':xzSystemConfig.xzAppId;

//模块类型，manage管理、show显示、set设置、project工程
const pageType=xzSystemConfig.pageType;

//启动时检测userSession
const checkUserSession=xzSystemConfig.checkUserSession;
			
//启动时检测managerSession
const checkManagerSession=xzSystemConfig.checkManagerSession;

//默认需要用户登录userSession
const userSession=xzSystemConfig.userSession;
			
//默认需要管理员登录managerSession
const managerSession=xzSystemConfig.managerSession;

//微信登录后是否需要绑定手机
const needBindAccount=xzSystemConfig.needBindAccount?1:0;

//七牛存储区域
const qiniuRegion=xzSystemConfig.qiniuRegion||'z0';

//是否独立项目
const independent=xzSystemConfig.independent;

//模块类型，manage管理、show显示、set设置、project工程
const pageUrl=xzSystemConfig.pageUrl||window.location.href;

//是否App
const isApp=client=='app'&&environment!='develop';

//公共资源的的版本，资源更新后更改版本号，解决缓存问题
const srcVersion=isApp?'':'?'+(environment=='develop'?Math.random():xzSystemConfig.srcVersion||1);

//请求数据的超时时间
const networkTimeout={request:25000,downloadFile:25000};

//ajax请求接口地址，返回json数据
const ajaxJSON='/ajax/getResult';

//ajax请求接口地址，返回请求的任何数据
const ajaxURL='/ajax/getUrl';
		
//静态资源文件地址前缀
const staticPath=isApp?'static/':xzSystemConfig.staticPath||'https://cdn.xzsite.cc/';

//响站系统资源文件地址前缀
const xzPath=staticPath+'xzSystem/';

//系统资源包文件地址
const distPath=isApp?'pages/{{systemId}}/':independent?'/dist/{{pageType}}/{{client}}/{{systemId}}/':'https://{{systemId}}.app.xzsite.cc/dist/';

//本地资源包文件地址
const localDistPath=isApp?'pages/{{systemId}}/':distPath;

//上传文件地址
const filePath=xzSystemConfig.filePath||'https://okgo.top/';

//错误图片的地址
const errorImgSrc=filePath+'errorImg.png';

//设置语言
const language='zh-cn';


//是否支持触摸
const isTouch = "ontouchend" in document?true:false;

//支持的上传文件类型
const uploadFileType ={
	image:'image/png,image/jpeg,image/gif,image/bmp,image/tiff,image/x-icon',
	video:'video/mpeg,video/ram,video/avi,video/avi,video/quicktime,video/x-la-asf,video/x-msvideo,video/flv,video/f4v,video/x-flv,video/mp4,video/mov',
	audio:'audio/mpeg,audio/mp3,audio/mid'
};

