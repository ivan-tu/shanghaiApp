/**
 *模块组件构造器
 */
(function() {

	let app = getApp();

	app.Page({
		pageId: 'finance-diamondBuy',
		data: {
			systemId: 'finance',
			moduleId: 'diamondBuy',
			isUserLogin: app.checkUser(),
			data: {},
			options: {},
			settings: {},
			language: {},
			form: {
				type:'',
			},
			typeList:[],
			itemData:{},
			expertInfo:{},
			changeForm:{
				show:false,
				height:330,
				changecode:'',
				data:'',
			},
			totalPrice:'0.00',
			oldPrice:'',//原价，可用来判断是否补差价升级
			canBuy:true,
			agreeMent:true,
			showToBuy:0,//是否支持购买
			depositSet:{},//定金、分期设置
		},
		methods: {
			onLoad:function(options){
				let _this = this;
				this.setData({options:options});
				if(app.config.client=='wx'){
					app.request('//set/get', {type: 'homeSet'}, function (res) {
						let backData = res.data||{};
						let wxVersion = app.config.wxVersion;
						if(backData){
							backData.wxVersion = backData.wxVersion?Number(backData.wxVersion):1;
							if(wxVersion>backData.wxVersion){//如果当前版本大于老版本，就要根据设置来
								_this.setData({
									showToBuy:backData.showToBuy||0,
								});
							}else{
								_this.setData({
									showToBuy:1
								});
							};
						}else{
							_this.setData({
								showToBuy:1
							});
						};
					},function(){
						_this.setData({
							showToBuy:1
						});
					});
				}else{
					this.setData({
						showToBuy:1
					});
				};
			},
			onShow: function(){
				let _this = this;
				app.checkUser(function(){
					_this.setData({isUserLogin:true});
					_this.load();
				});
			},
			onPullDownRefresh: function() {
				if(this.getData().isUserLogin){
				   this.load();
				};
			  	wx.stopPullDownRefresh();
			},
			selectThis:function(e){
				let index = Number(app.eData(e).index),
					typeList = this.getData().typeList,
					expertInfo = this.getData().expertInfo;
				this.setData({
					itemData:typeList[index],
					'form.type':typeList[index].type,
				});
				//不是代理的情况下，不能购买其他礼包
				/*if(expertInfo.isexpert!=1&&typeList[index].type!='white'){
					this.setData({canBuy:false});
				}else{
					this.setData({canBuy:true});
				};*/
				this.getPrice();
			},
			load:function(){
				let _this = this,
					options = this.getData().options,
					formData = this.getData().form;
				//获取分期设置
				_this.getDepositSet();
				app.request('//homeapi/getExpertInfo',{},function(res){
					//res.isexpert = 0;
					//res.isagent = 0;
					//res.ispartner = 0;
					if(!options.onceopen){
						res.upgradePrice = 0;
					};
					_this.setData({expertInfo:res});
				});
				app.request('//set/get', {type: 'diamondgift'}, function (res) {
					let backData = res.data||[];
					if (backData){
						_this.setData({
							typeList:backData,
							itemData:backData[0],
							'form.type':backData[0].type,
						});
						_this.getPrice();
					};
				});
			},
			getDepositSet:function(){//获取分期，定金设置
				let _this = this;
				app.request('//set/get', {type: 'deposit'}, function (res) {
					let backData = res.data||{};
					if(backData){
						_this.setData({depositSet:backData});
					};
				});
			},
			getPrice:function(){//计算价格
				let itemData = this.getData().itemData,
					expertInfo = this.getData().expertInfo,
					totalPrice = '',
					oldPrice = '';
				if(expertInfo.upgradePrice){//有差价
					if(expertInfo.ispartner==1){//当前是合伙人
						totalPrice = itemData.price;
					}else if(expertInfo.isagent==1){//当前是代理
						if(itemData.type=='gold'){
							oldPrice = itemData.price;
							totalPrice = app.getPrice(Number(itemData.price) - Number(expertInfo.upgradePrice));
						}else{
							totalPrice = itemData.price;
						};
					}else if(expertInfo.isexpert==1){//当前是达人
						if(itemData.type=='gold'||itemData.type=='red'){
							oldPrice = itemData.price;
							totalPrice = app.getPrice(Number(itemData.price) - Number(expertInfo.upgradePrice));
						}else{
							totalPrice = itemData.price;
						};
					};
				}else{
					totalPrice = itemData.price;
				};
				this.setData({
					totalPrice:Number(totalPrice),
					oldPrice:oldPrice,
				});
			},
			toBuy:function(){
				let _this = this,
					options = this.getData().options,
					canBuy = this.getData().canBuy,
					formData = this.getData().form,
					expertInfo = this.getData().expertInfo,
					depositSet = this.getData().depositSet;//定金-分期设置
				if(!this.getData().agreeMent){
					app.tips('请同意充值协议','error');
				}else if(!formData.type){
					app.tips('请选择一个礼包类型','error');
				}else if(!canBuy){
					app.tips('非达人无法购买此礼包','error');
				}else{
					let requestData = {
						type:formData.type,
						onceopen:options.onceopen||0
					},
					toBuyFn = function(){
						app.request('//diamondapi/createDiamondOrder',requestData,function(res){
							if(res.ordernum){
								app.navTo('../../pay/pay/pay?ordertype=' + res.ordertype + '&ordernum=' + res.ordernum + '&total=' + res.paymoney+'&backStep=1');
							}else{
								app.tips('创建订单失败','error');
							};
						});
					};
					//补差价升级强制性打开礼包
					if(_this.getData().oldPrice){
						requestData.onceopen = 1;
						requestData.upgradePrice = expertInfo.upgradePrice;
						toBuyFn();
					}else{//非补差价就走分期
						if(formData.type=='white'){
							if((depositSet.deposit&&Number(depositSet.deposit.white)>0)||(depositSet.expertStages&&depositSet.expertStages.length)){
								app.navTo('../../pay/fenqiPay/fenqiPay?type='+requestData.type);
							}else{
								toBuyFn();
							};
						}else if(formData.type=='red'){
							if((depositSet.deposit&&Number(depositSet.deposit.red)>0)||(depositSet.agentStages&&depositSet.agentStages.length)){
								app.navTo('../../pay/fenqiPay/fenqiPay?type='+requestData.type);
							}else{
								toBuyFn();
							};
						}else if(formData.type=='gold'){
							if((depositSet.deposit&&Number(depositSet.deposit.gold)>0)||(depositSet.partnerStages&&depositSet.partnerStages.length)){
								app.navTo('../../pay/fenqiPay/fenqiPay?type='+requestData.type);
							}else{
								toBuyFn();
							};
						};
					};
				};
			},
			toChange:function(){//兑换
				let options = this.getData().options,
					expertInfo = this.getData().expertInfo;
				if(options.onceopen&&expertInfo.upgradePrice){
					app.tips('补差价升级无法使用兑换码','error');
					return;
				};
				this.setData({
					'changeForm.show':true,
					'changeForm.data':'',
					'changeForm.changecode':'',
				});
			},
			toHideDialog:function(){
				this.setData({
					'changeForm.show':false
				});
			},
			checkCode:function(){//确认兑换码
				let _this = this,
					changeForm = this.getData().changeForm;
				if(!changeForm.changecode){
					app.tips('请输入兑换码','error');
				}else{
					app.request('//diamondapi/getGiftByCode',{changecode:changeForm.changecode},function(res){
						_this.setData({
							'changeForm.data':res||'',
						});
					});
				};
			},
			toConfirmDialog:function(){
				let _this = this,
					changeForm = this.getData().changeForm;
				if(!changeForm.changecode){
					app.tips('请输入兑换码','error');
				}else if(!changeForm.data){
					app.tips('请确认兑换码','error');
				}else{
					app.request('//diamondapi/changeDiamondGift',{changecode:changeForm.changecode},function(){
						app.tips('兑换成功','success');
						_this.toHideDialog();
					});
				};
			},
			changeAgreeMent:function(){
				this.setData({agreeMent:!this.getData().agreeMent});
			},
		}
	});
})();