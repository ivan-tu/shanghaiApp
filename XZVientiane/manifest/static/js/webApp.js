/*!
 * webApp.js v2.0.1-beta.0
 * (c) 2018-20@2 Sean lee
 */
	

/**
 *获取应用实例
 */

getApp=xzSystem.getApp;
	
/**
 *注册应用
 */

App=xzSystem.App;
		

/**
 *注册页面
 */
Page=xzSystem.Page;

/**
 *注册组件
 */

Component=xzSystem.Component;


/**
 *注册模块
 */
module={
	exports:{}
};

/**
 *模块缓存
 */
modules={};

	
/**
 *引入模块
 */
require=function(src,success){
	if(!modules[src]){
		xzSystem.loadSrc(src,success,'require');
	}else{
		modules[src]={src:src};
	};
};

/**
 *注册模块
 */
register=function(m,callback){
	if(typeof m=='string'){
		m=[m];
	};
	let i=0,
	    k=0,
			fn=function(){
				if(typeof window[m[i]]!='undefined'){
					i++;
					if(i==m.length){
						if(typeof callback=='function'){
							callback();
						};
					}else{
						fn();
					};
				}else{
					let requires=setInterval(function(){
					
					if(typeof window[m[i]]!='undefined'){
							clearInterval(requires);
							i++;
							k=0;
							if(i==m.length){
								if(typeof callback=='function'){
									callback();
								};
							}else{
								fn();
							};
						}else{
							k++;
							if(k>=50000){
								clearInterval(requires);
							};
						};
					},1);
				};
			};
	fn();
};
