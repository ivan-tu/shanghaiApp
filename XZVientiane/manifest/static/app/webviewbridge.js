/**
 *与webview交互
 */
 
var webViewBridge,webViewCall;
	
function connectWebViewJavascriptBridge(callback) {
	if (window.WebViewJavascriptBridge) { return callback(WebViewJavascriptBridge); }
	if(window.location.href.indexOf('http')==0){
		window.WebViewJavascriptBridge={
			registerHandler:function(bridge,responseCallback){
				app.trigger(responseCallback,{success:true,action:'setData',data:'111'});
			},
			callHandler:function(bridge,data,responseCallback){
				app.trigger(responseCallback,{success:true});
			}
		};
		return callback(WebViewJavascriptBridge);
	};
	if(isIos){
		if (window.WVJBCallbacks) { return window.WVJBCallbacks.push(callback); }
		window.WVJBCallbacks = [callback];
		var WVJBIframe = document.createElement('iframe');
		WVJBIframe.style.display = 'none';
		WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';		
		var ready=setTimeout(function(){
			document.documentElement.removeChild(WVJBIframe);
			document.addEventListener('WebViewJavascriptBridgeReady', function() {
				callback(WebViewJavascriptBridge);
			}, false);
		},50);
		
		WVJBIframe.onload=function(){
			document.documentElement.removeChild(WVJBIframe);
			clearTimeout(ready);
		};
		document.documentElement.appendChild(WVJBIframe);
	}else{
		document.addEventListener('WebViewJavascriptBridgeReady', function() {
			callback(WebViewJavascriptBridge);
		}, false);
	};	
};
wx.app.connect=function(callback){
		connectWebViewJavascriptBridge(function(bridge) {
		
		webViewBridge=bridge;
		
		bridge.registerHandler('xzBridge', function(backData, responseCallback) {
			 
			if(!backData.action||!wx.app.on[backData.action]){
				app.trigger(responseCallback,{
					success:false,
					errorMessage:backData.action+' is undefined'
				});
				return;
			};
			wx.app.on[backData.action](backData.data,responseCallback);
		 
		});
			
		webViewCall=function(action,obj){
			 
			 if(typeof obj=='function'){
				 obj={
					 success:obj
					 };
			 };
			
			 obj=app.extend(true,{
							success:app.noop,
							fail:app.noop,
							complete:app.noop,
							data:''
					 },obj);
			 
			 
			 bridge.callHandler('xzBridge',{action:action,data:obj.data},function(backData){
				 
				 if(backData.success&&backData.success!='false'){
					
					 app.trigger(obj.success,backData.data||{});
				 }else{
					 app.trigger(obj.fail,backData.errorMessage);
				 };
				  app.trigger(obj.complete,backData);
			 });
		};
		wx.app.call=webViewCall;
		webViewCall('pageReady');
		app.trigger(callback);
	});
};
	