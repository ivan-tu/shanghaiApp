/*!
 * App.js v2.0.1-beta.0
 * (c) 2018-20@2 Sean lee
 */

//设置默认配置		
const config={
     domain:domain,
			
			//客户端，app、web、wx
      client:client,
      
			//独立项目id
			projectId:projectId,
 			
			//生成的响站客户端id
      xzAppId:xzAppId,
			
			//启动时检测userSession
      checkUserSession:checkUserSession,
			
			//启动时检测managerSession
      checkManagerSession:checkManagerSession,
			
			//默认需要用户登录userSession
      userSession:userSession,
			
			//默认需要管理员登录managerSession
      managerSession:managerSession,
			
			//ajax请求接口地址，返回json数据			
			ajaxJSON:ajaxJSON,
			
			//ajax请求接口地址，返回请求的任何数据
			ajaxURL:ajaxURL,
			
			//上传文件地址
      filePath:filePath,

			//错误图片的地址
      errorImgSrc:errorImgSrc,
			
			//请求超时时间
			networkTimeout:networkTimeout,
			
			//静态资源文件地址前缀
			staticPath:staticPath,
			
			//响站插件资源文件地址前缀
			xzPath:xzPath,	
			
			//系统资源包文件地址
			distPath:distPath,
			
			//本地资源包文件地址
			localDistPath:localDistPath,
			
			//上传文件地址
			filePath:filePath,
			
			//设置语言
			language:language,
			
			//七牛存储区域
			qiniuRegion:qiniuRegion,
			
			//支持的上传文件类型
			uploadFileType:uploadFileType,
			
			//微信登录后是否需要绑定手机
			needBindAccount:needBindAccount,
			
			//获取支付链接的接口
			getPayUrl:'/finance/finance/getPayUrl'
			
		};	
 
App({
    config: config,
		gData:{
				session:{}
    },
    onLaunch: function () {
			//xzApp.init(this);
			xzImage.init(this);
			this.setLanguage(LANGUAGE);
    },
    onShow: function () {
    },
    onHide: function () {
    }
});
