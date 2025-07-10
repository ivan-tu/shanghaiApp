(function() {
	let app = getApp();
	app.Page({
		pageId: 'pay-helpPay',
		data: {
			systemId: 'pay',
			moduleId: 'helpPay',
			isUserLogin: app.checkUser(),
			data:{
				userinfo:{},
				goodsInfo:{},
			},
			options: {},
			settings: {},
			language: {},
			form: {},
			client:app.config.client,
			showLoading:true,
			showNoData:false,
		},
		methods: {
			onLoad: function(options) {
				app.setPageTitle('代付详情');
				app.config.needBindAccount = 0;
				let _this = this,
					client = this.getData().client,
					windowURL = app.mixURL('https://'+app.config.domain+'/p/pay/helpPay/helpPay',options);
				if (app.config.client == 'wx' && options.scene) {
					let scenes = options.scene.split('_');
					options.ordernum = scenes[0];
					if (scenes.length > 1) {
						app.session.set('vcode', scenes[1]);
					};
					delete options.scene;
				};
				_this.setData({
					options:options
				});
				if(client == 'web' && isWeixin) {
					if(!options.openid){
						let clientKey = app.session.get('clientKey');
						if (!clientKey) {
							clientKey = app.getNowRandom();
							app.session.set('clientKey', clientKey);
						};
						let redirect_uri = encodeURIComponent(windowURL||window.location.href);
						window.location.href = '/index/getUserWxOpenidV2?xzAppId=' + app.config.xzAppId + '&clientKey=' + clientKey + '&redirect_uri=' + redirect_uri;
					}else{
						this.load();
					};
				}else{
					this.load();
				};
			},
			onShow: function() {
			},
			onPullDownRefresh: function() {
				wx.stopPullDownRefresh();
			},
			load: function() {
				let _this = this,
					options = this.getData().options;
				if(options.ordernum){
					app.request('//api/getReplaceOrderInfo',{ordernum:options.ordernum},function(res){
						console.log(app.toJSON(res));
						//paystatus = 1 待支付 =2已支付 =3已取消
						if(res.userinfo&&res.userinfo.headpic){
							res.userinfo.headpic = app.image.crop(res.userinfo.headpic,60,60);
						};
						if(res.goodsInfo){
							if(!Array.isArray(res.goodsInfo)){
								res.goodsInfo = [res.goodsInfo];
							};
							app.each(res.goodsInfo,function(i,item){
								item.pic = app.image.crop(item.pic,60,60);
							});
						};
						res.endtimeText = '00:00:00';
						_this.setData({data:res});
						//设置分享参数
						let newData = {ordernum:options.ordernum};
						let pathUrl = app.mixURL('/p/pay/helpPay/helpPay', newData), 
							sharePic = app.config.client=='wx'?'':'https://static.gedian.shop/16396237725881838.png',
							shareData = {
							shareData: {
								title: '请帮我代付这个订单，感谢您',
								content: '需付款：'+res.ordertotal+'元',
								path: 'https://' + app.config.domain + pathUrl,
								pagePath: pathUrl,
								img: sharePic,
								imageUrl: sharePic,
								weixinH5Image: sharePic,
								wxid:'gh_4a817d503791',
								hideH5:true,
								hideCopy:app.config.client=='web'?false:true,
							}
						}, 
						reSetData = function() {
							setTimeout(function() {
								if (_this.selectComponent('#newShareCon')) {
									_this.selectComponent('#newShareCon').reSetData(shareData);
								} else {
									reSetData();
								};
							}, 500)
						};
						reSetData();
						//检测支付
						if(res.paystatus==1){
							_this.checkPay();
							_this.countDown();
						};
					},function(msg){
						app.tips(msg,'error');
						_this.setData({showNoData:true});
					},function(){
						_this.setData({showLoading:false});
					});
				}else{
					app.tips('缺少订单编号');
				};
			},
			paySuccess:function(){
				let _this = this,
					options = this.getData().options;
				//当前订单状态标记为已支付
				app.storage.set('paySuccessType',options.ordertype);
				app.storage.set('paySuccess',1);
				app.tips('支付成功','success');
				if(this.countDownFn) {
					clearInterval(this.countDownFn);
				};
				_this.load();
			},
			checkPay: function(next) {
				let _this = this,
					options = _this.getData().options;
				var checkPay = setInterval(function() {
					app.request('//api/checkPaystatus', {
						ordernum: options.ordernum
					}, function(res) {
						if (res == '1') {
							clearInterval(checkPay);
							_this.paySuccess();
						};
					}, function() {});
				}, 2000);
			},
			toPay: function() {
				let _this = this,
					options = this.getData().options,
					data = this.getData().data,
					client = this.getData().client;
				if(client == 'web' && isWeixin) {
					let obj = {
						paytype: 'weixin',
						ordernum: options.ordernum,
						ordertype: data.ordertype,
						openid: options.openid || '',
						client: 'wxh5'
					};
					app.request('//api/getPaylink', obj, function(res) {
						if (res) {
							wx.config({
								debug: false,
								appId: res.appId,
								timestamp: res.timeStamp,
								nonceStr: res.nonceStr,
								signature: res.sign,
								jsApiList: ['chooseWXPay']
							});
							let payData = {
								'appId': res.appId,
								'timestamp': res.timeStamp,
								'nonceStr': res.nonceStr,
								'package': res.package,
								'signType': 'MD5',
								'paySign': res.sign,
								'success': function(r) {
									_this.paySuccess();
								}
							};
							wx.chooseWXPay(payData);
						} else {
							app.tips('微信配置出错');
						};
					},function(msg){
						app.tips(msg,'error');
						//app.weixinLogin();
					});
				}else if(client=='wx'){
					wx.login({
						 success: function(req) {
							if (req.code) {
								app.request('//userapi/getWxOpenid',{code:req.code},function(backData){
									let obj = {
										ordernum: options.ordernum,
										ordertype: data.ordertype,
										client: 'wxapp',
										paytype: 'weixin',
										openid:backData.openid,
									};
									app.request('//api/getPaylink', obj, function(res) {
										let payData = {
											'timeStamp': res.timeStamp.toString(),
											'nonceStr': res.nonceStr,
											'package': res.package,
											'signType': 'MD5',
											'paySign': res.sign,
											'success': function(r) {
												_this.paySuccess();
											}
										};
										wx.requestPayment(payData);
									});
								});
							   /*wx.getUserInfo({
								  success: function(detail) {
								  }
							   });*/
							};
						 }
					});
				}else{
					_this.weixinPayDialog = app.web.dialogBox({
						title: '微信支付',
						content: '<div style="text-align:center" class="pd20"><img src=/api/qrcode/?data=' + encodeURIComponent(window.location.href) + ' width="180" height="180" /><br/><br/>打开微信扫描二维码支付</div>',
						width: 320,
						height: 320,
					});
				};
			},
			toShare: function(e) {
				if (app.config.client == 'wx'){
					//存储formid用于发货通知
					app.request('//userapi/saveUserWxFormid', { formid: e.detail.formId},function(){},function(){});
				};
				this.selectComponent('#newShareCon').openShare();
			},
			onShareAppMessage: function () {
				return app.shareData;
			},
			getDateTime: function (date) {
				//var hours = parseInt((date % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
				var hours = parseInt((date / (1000 * 60 * 60 * 24)) * 24);
				var minutes = parseInt((date % (1000 * 60 * 60)) / (1000 * 60));
				var seconds = parseInt((date % (1000 * 60)) / 1000);
				hours = hours < 10 ? '0' + hours : hours;
				minutes = minutes < 10 ? '0' + minutes : minutes;
				seconds = seconds < 10 ? '0' + seconds : seconds;
				return hours+':'+minutes+':'+seconds;
			},
			countDown: function () { //倒计时
				var _this = this,
					nowTime = (new Date(app.getNowDate(0, true).replace(/-/g, '/'))).getTime(),
					data = this.getData().data;
				if (!data.expiretime) return;
				if (this.countDownFn) {
					clearInterval(this.countDownFn);
				};
				this.countDownFn = setInterval(function () {
					nowTime = nowTime + 1000;
					if (data.expiretime * 1000 - nowTime <= 0) {
						data.endtimeText = '00:00:00';
						data.status = 2;//已结束
					} else {
						data.endtimeText = _this.getDateTime(data.expiretime * 1000 - nowTime);
					};
					_this.setData({
						data: data
					});
				}, 1000);
			},
		}
	})
})();