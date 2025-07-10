(function () {
	let app = getApp();
	app.Page({
		pageId: 'pay-fenqiPay',
		data: {
			systemId: 'pay',
			moduleId: 'fenqiPay',
			data:{
				price:0,//全款金额
				zjbCoin:0,//全款送股
				dinjinPrice:0,//定金
				dingjinZjbCoin:0,//定金送多少股
				dingjinZjbCoinPercent:0,//定金少百分之几
				fenqiList:[],//分期列表
			},
			options: {},
			settings: {},
			language: {},
			form: {},
			payType:1,//1-全额，2-定金，3-分期
			stagesnum:1,//分期数
			diamondSet:{},
			depositSet:{},
		},
		methods: {
			onLoad: function (options) {
				let _this = this;
				this.setData({
					options: options
				});
				this.load();
			},
			onShow: function () {
			},
			onPullDownRefresh: function () {
				this.load();
				wx.stopPullDownRefresh()
			},
			load: function () {
				let _this = this,
					options = this.getData().options;
				//获取礼包设置
				app.request('//set/get', {type:'diamondgift'},function(res){
					let backData = res.data||{};
					if(backData){
						_this.setData({diamondSet:backData});
						app.each(backData,function(i,item){
							if(options.type==item.type){
								_this.setData({
									'data.price':item.price,
									'data.zjbCoin':item.zjbcoin,
								});
							};
						});
					};
				});
				//获取分期定金设置
				app.request('//set/get', {type: 'deposit'}, function (res) {
					let backData = res.data||{};
					if(backData){
						_this.setData({depositSet:backData});
						
						if(options.type=='white'){//白钻礼包-对应达人
							_this.setData({
								'data.fenqiList':backData.expertStages
							});
							if(backData.deposit.white){
								_this.setData({
									'data.dinjinPrice':backData.deposit.white,//定金
									'data.dingjinZjbCoin':backData.tips.expertZjbcoin,//定金送多少股
									'data.dingjinZjbCoinPercent':backData.tips.expertZjbcoinPercent,//定金少百分之几
								});
							};
						}else if(options.type=='red'){//红钻礼包-对应代理
							_this.setData({
								'data.fenqiList':backData.agentStages
							});
							if(backData.deposit.red){
								_this.setData({
									'data.dinjinPrice':backData.deposit.red,//定金
									'data.dingjinZjbCoin':backData.tips.agentZjbcoin,//定金送多少股
									'data.dingjinZjbCoinPercent':backData.tips.agentZjbcoinPercent,//定金少百分之几
								});
							};
						}else if(options.type=='gold'){//金钻礼包-对应合伙人
							_this.setData({
								'data.fenqiList':backData.partnerStages
							});
							if(backData.deposit.gold){
								_this.setData({
									'data.dinjinPrice':backData.deposit.gold,//定金
									'data.dingjinZjbCoin':backData.tips.partnerZjbcoin,//定金送多少股
									'data.dingjinZjbCoinPercent':backData.tips.partnerZjbcoinPercent,//定金少百分之几
								});
							};
						};
					};
				});
			},
			screenType:function(e){
				this.setData({
					payType:app.eData(e).type,
					stagesnum:app.eData(e).num,
				});
			},
			submit: function () {
				let _this = this,
					options = this.getData().options,
					requestData = {
						type:options.type,
						onceopen:1,
					},
					payType = this.getData().payType,//1-全额，2-定金，3-分期
					msg = '';
				if(payType==2){
					requestData.stagestype = 'deposit';
					requestData.stagesnum = 1;
				}else if(payType==3){
					requestData.stagestype = 'stages';
					requestData.stagesnum = _this.getData().stagesnum;
				};
				console.log(app.toJSON(requestData));
				app.request('//diamondapi/createDiamondOrder',requestData,function(res){
					if(res.ordernum){
						app.navTo('../../pay/pay/pay?ordertype=' + res.ordertype + '&ordernum=' + res.ordernum + '&total=' + res.paymoney+'&backStep=2');
					}else{
						app.tips('创建订单失败','error');
					};
				});
			},
			reback:function(){
				app.navBack();
			},
		}
	})
})();