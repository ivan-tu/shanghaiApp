(function() {

	let app = getApp();

	app.Page({
		pageId: 'pay-pay',
		data: {
			systemId: 'pay',
			moduleId: 'pay',
			isUserLogin: app.checkUser(),
			payType: 'weixin',
			payUrl: '',
			aliUrl: '',
			data: {
				paytype: [],
				total: 0,
				ordernum: '',
			},
			options: {},
			settings: {},
			language: {},
			form: {},
			client: app.config.client,
			payStatus: 0,
			showPayDialog: false,
			payData: '',
			hiddenPaytype: true,
			orderError: false,
			showBalance:false,//显示余额支付
			showBalance2:false,//显示余额抵扣
			balanceTotal:0,//所剩余额
			isBalancepay:0,//是否使用余额抵扣
			showDiamond:false,//显示钻石支付
			diamondTotal:0,//钻石余额
			canreplacepay:0,//是否可以代付
			showWeixinPay:false,//app里显示微信支付
		},
		methods: {
			onLoad: function(options) {
				let _this = this, 
					client = this.getData().client;
				_this.options = options;
				if (!options.ordernum) {
					app.tips('非法支付订单');
					return false;
				};
				_this.requestUrl = '//api/getPaylink';
				_this.checkUrl = '//api/checkPaystatus';
				
				if(client=='wx'){//小程序-微信支付
					_this.setData({
						'payType':'weixin',
						'data.paytype': [{
							id: 'weixin',
							name: '微信支付',
							icon: 'xzicon-weChat-pay'
						}],
					});
				}else{
					_this.setData({
						'payType':'weixin',
						'data.paytype': [{
							id: 'weixin',
							name: '微信支付',
							icon: 'xzicon-weChat-pay'
						}/*, {
							id: 'alipay',
							name: '支付宝',
							icon: 'xzicon-alipay-square'
						}*/],
					});
				};
				
				if (client == 'web' && isWeixin) {
					app.config.needBindAccount = 0;
					if (!options.openid) {
						let redirect_uri = encodeURIComponent(window.location.href);
						window.location.href = '/index/getUserWxOpenid?xzAppId=' + app.config.xzAppId + '&clientKey=' + app.session.get('clientKey') + '&redirect_uri=' + redirect_uri;
						return;
					};
				};
				//获取订单信息
				app.request('//api/getPayOrderInfo', {
					ordernum: options.ordernum
				}, function(res) {
					_this.setData({
						'data.ordernum': options.ordernum,
						'data.total': res.ordertotal,
						balanceTotal: res.balance||0,//余额
						diamondTotal:res.diamond||0,//钻石
						payStatus: res.paystatus,
						canreplacepay:res.canreplacepay||0,//是否可以代付
					});
					if (res.paystatus == 1) {
						_this.getPayUrl();
					};
					if(Number(res.balance)&&Number(res.balance)>=Number(res.paymoney)){//允许余额支付
						_this.setData({
							showBalance:true
						});
					}else if(Number(res.balance)>0){//允许余额抵扣
						_this.setData({
							showBalance2:true
						});
					};
					if(options.ordertype!='diamondRecharge'&&res.diamond>0){
						_this.setData({
							showDiamond:true
						});
					};
				},function(msg){
					app.tips('订单获取失败');
				});

			},
			onShow:function(){
			},
			onPullDownRefresh: function() {
				wx.stopPullDownRefresh();
			},
			getMorePay:function(){
				this.setData({showWeixinPay:true});
			},
			toHelpPay:function(){
				let options = this.options;
				app.request('//api/copyPayOrder',{ordernum:options.ordernum},function(res){
					if(res.ordernum){
						app.redirectTo('../../pay/helpPay/helpPay?ordernum='+res.ordernum);
					};
				});
			},
			selectPayType: function(e){
				this.setData({
					payType: app.eData(e).id
				});
				this.getPayUrl();
			},
			copyPayOrder:function(){//余额抵扣拿新的订单，避免出现支付失败，请刷新
				let _this = this,
					options = this.options;
				app.request('//api/copyPayOrder',{ordernum:options.ordernum},function(res){
					if(res.ordernum){
						options.ordernum = res.ordernum;
						_this.setData({
							'options.ordernum':res.ordernum,
							'data.ordernum':res.ordernum,
						});
						_this.options = options;
					};
					_this.getPayUrl();
				},function(){
					_this.getPayUrl();
				});
			},
			selectBalancepay:function(e){//使用余额抵扣
				let _this = this,
					options = this.options;
				this.setData({
					isBalancepay:this.getData().isBalancepay==1?0:1
				});
				this.copyPayOrder();
			},
			getPayUrl: function(callback,errcallback) {
				let _this = this, 
				  	client = app.config.client,
				  	payType = _this.getData().payType, 
				  	data = _this.getData().data, 
					obj = {
						ordernum: data.ordernum,
						client: _this.getData().client,
						paytype: payType,
						balance:_this.getData().isBalancepay,//是否余额抵扣
						redirect_uri: _this.options.redirect_uri
					};
				if (!(client == 'wx' || isWeixin || payType=='balance' || payType=='diamond')) {
					app.request(_this.requestUrl, obj, function(res) {
						let sData = {
							payData: res,
							orderError: false
						};
						if (_this.getData().client == 'web' && payType == 'alipay') {
							sData.aliUrl = res;
						};
						_this.setData(sData);
						if(typeof callback =='function'){
							callback();
						};
					}, function(errMsg) {
						app.tips(errMsg);
						_this.setData({
							orderError: true
						});
						if(typeof errcallback =='function'){
							errcallback();
						};
					});
				};
			},
			submit: function(e) {
				let _this = this, 
					payType = _this.getData().payType,
					data = _this.getData().data, 
					isBalancepay = _this.getData().isBalancepay,
					res = _this.getData().payData, 
					options = _this.options;
				if(payType=='balance'){//余额支付
					if (app.config.client == 'wx'){
						//存储formid用于发货通知
						app.request('//userapi/saveUserWxFormid', { formid: e.detail.formId},function(){},function(){});
					};
					let obj = {
						ordernum: options.ordernum,
						ordertype: options.ordertype,
						redirectUrl:'../../pay/pay/pay',//_this.options.redirect_uri,
						paytype: payType,
						balance:isBalancepay,//是否余额抵扣
					};
					app.request('//api/getPaylink', obj, function(res) {
						_this.paySuccess();
					});
				}else if(payType=='diamond'){//钻石支付
					let diamondTotal = _this.getData().diamondTotal;
					if(Number(diamondTotal)>=data.total){
						let obj = {
							ordernum: options.ordernum,
							ordertype: options.ordertype,
							redirectUrl:'../../pay/pay/pay',//_this.options.redirect_uri,
							paytype: payType,
							balance:isBalancepay,//是否余额抵扣
						};
						app.request('//api/getPaylink', obj, function(res) {
							_this.paySuccess();
						});
					}else{
						app.tips('钻石余额不足','error');
					};
				}else{
					if (app.config.client == 'wx') {
						let obj = {
							ordernum: options.ordernum,
							ordertype: options.ordertype,
							balance:isBalancepay,//是否余额抵扣
							client: 'wxapp',
							paytype: 'weixin',
							fromWxappName: 'hi3',//hi3小程序
						};
						//存储formid用于发货通知
						app.request('//userapi/saveUserWxFormid', { formid: e.detail.formId},function(){},function(){});
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
	
					} else if (app.config.client == 'web' && isWeixin) {
						if(payType=='alipay'){
							app.alert('请点击右上角使用浏览器打开');
							return;
						};
						let obj = {
							paytype: 'weixin',
							ordernum: options.ordernum,
							ordertype: options.ordertype,
							balance:isBalancepay,//是否余额抵扣
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
								//app.tips(app.toJSON(payData));
								wx.chooseWXPay(payData);
							} else {
								app.tips('微信配置出错');
							}
						},function(msg){
							app.weixinLogin();
						});
						e.preventDefault();
					} else {
						if (_this.getData().client == 'app') {
							switch (payType) {
							case 'weixin':
								wx.app.call('weixinPay', {
									success: function() {
										setTimeout(function() {
											_this.checkPay();
										}, 1000);
									},
									data: res
								});
								break;
							case 'alipay':
								wx.app.call('aliPay', {
									success: function() {
										setTimeout(function() {
											_this.checkPay();
										}, 1000);
									},
									data: res
								});
								break;
							};
							e.preventDefault();
						} else {
							let gotoFn = function(){
								res = _this.getData().payData;
								if (payType == 'alipay') {
									_this.setData({
										showPayDialog: true
									})
								} else if (payType == 'weixin') {
									if (isWeixin) {
										window.location.href = res;
									} else {
										_this.weixinPayDialog = app.web.dialogBox({
											title: '微信支付',
											content: '<div style="text-align:center" class="pd20"><img src=/api/qrcode/?data=' + encodeURIComponent(res) + ' width="180" height="180" /><br/><br/>打开微信扫描二维码支付</div>',
											width: 320,
											height: 320,
										});
									};
									e.preventDefault();
								};
								_this.checkPay();
							};
							if(!res){
								_this.getPayUrl(gotoFn);
							}else{
								gotoFn();
							};
						};
					};
				};

			},
			checkPay: function(next) {
				let _this = this, data = _this.getData().data;
				if (_this.getData().client == 'web' && !next) {
					var checkPay = setInterval(function() {
						app.request(_this.checkUrl, {
							ordernum: data.ordernum
						}, function(res) {
							if (res == '1') {
								clearInterval(checkPay);
								_this.paySuccess();
							};
						}, function() {});
					}, 1000);
				} else {
					app.request(_this.checkUrl, {
						ordernum: data.ordernum
					}, function(res) {
						if (res == '1') {
							_this.paySuccess();
						} else {
							app.tips('支付失败', 'error');
							location.reload();
						}
					}, function(msg) {
						app.tips('支付失败', 'error');
						location.reload();
					});
				};
			},
			payDialog_cancel: function() {
				this.setData({
					showPayDialog: false
				});
			},
			payDialog_success: function() {
				this.setData({
					showPayDialog: false
				});
				this.checkPay(true);
			},
			paySuccess:function () {
				let _this = this,
					backStep = Number(this.options.backStep)||1;
				//当前订单状态标记为已支付
				app.storage.set('paySuccessType',_this.options.ordertype);
				app.storage.set('paySuccess',1);
				app.storage.set('pageReoload',1);
				if (!this.dontGo) {
					app.tips('支付成功','success');
					if (_this.getData().client == 'web') {
						if (_this.weixinPayDialog) {
							_this.weixinPayDialog.close();
						};
						_this.setData({
							showPayDialog: false
						});
					};
					if(_this.options.ordertype == 'payBill'){//现金-买单流程
						let paybillInfo = app.storage.get('paybillInfo');
						paybillInfo.payStatus = 1;
						app.storage.set('paybillInfo',paybillInfo);
						if(_this.getData().client == 'web'&&isWeixin){
							app.navBack(backStep+1);
						}else{
							app.navBack(backStep);
						};
					}else if(_this.options.ordertype == 'diamondRecharge'){
						let paybillInfo = app.storage.get('paybillInfo'),
							payActivityInfo = app.storage.get('payActivityInfo');
						if(paybillInfo&&paybillInfo.shopid){//是钻石-买单流程
							let requestData = {
								shopid:paybillInfo.shopid,
								total:paybillInfo.total,
								punch:paybillInfo.punch||0,
							};
							app.request('//shopapi/paybillByDiamond',requestData,function(){
								paybillInfo.payStatus = 1;
								app.storage.set('paybillInfo',paybillInfo);
								if(_this.getData().client == 'web'&&isWeixin){
									app.navBack(backStep+1);
								}else{
									app.navBack(backStep);
								};
							},function(){
								app.alert({
									content:'买单失败，请返回重新买单',
									success:function(){
										if(_this.getData().client == 'web'&&isWeixin){
											app.navBack(backStep+1);
										}else{
											app.navBack(backStep);
										};
									}
								});
							});
						}else if(payActivityInfo&&payActivityInfo.id){//是钻石-参加活动流程
							app.storage.remove('payActivityInfo');
							app.request('//activityapi/applyActivity', {id:payActivityInfo.id},function(res){
								app.alert({
									content:'活动报名成功',
									success:function(){
										if(_this.getData().client == 'web'&&isWeixin){
											app.navBack(backStep+1);
										}else{
											app.navBack(backStep);
										};
									}
								});
								
							});
						}else{
							app.navBack(backStep);
						};
					}else{
						setTimeout(function(){
							if(_this.getData().client == 'web'&&isWeixin){//微信浏览器会返回到pay页面，所以要自己去跳转
								switch(_this.options.ordertype){
									case'payBill'://买单
										app.redirectTo('../../store/payOrder/payOrder?id='+_this.options.id);
									break;
									case'payActivity'://参加活动
										app.redirectTo('../../activity/detail/detail?id='+_this.options.id);
									break;
									case'buyUserMember'://购买会员
										app.redirectTo('../../user/upGrade/upGrade');
									break;
									case'joinclub'://加入俱乐部
										if(_this.options.clubid){
											app.redirectTo('../../suboffice/clubDetail/clubDetail?id='+_this.options.clubid);
										}else{
											app.navBack(backStep+1);
										};
									break;
									default:
										app.navBack(backStep+1);
								};
							}else{
								app.navBack(backStep);
							};
						},300);
					};
				};
				this.dontGo = true;
			},
		}
	});
})();