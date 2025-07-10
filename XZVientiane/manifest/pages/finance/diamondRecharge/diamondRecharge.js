/**
 *模块组件构造器
 */
(function() {

	let app = getApp();

	app.Page({
		pageId: 'finance-diamondRecharge',
		data: {
			systemId: 'finance',
			moduleId: 'diamondRecharge',
			isUserLogin: app.checkUser(),
			client:app.config.client,
			data: [],
			options: {},
			settings: {},
			language: {},
			form: {},
			balance:0,
			list:[],
		},
		methods: {
			onLoad:function(options){
				let isPrice = /^[0-9]+.?[0-9]*$/,
					alertArray = app.storage.get('alertArray')||{};
				if(options.total&&isPrice.test(options.total)){
					options.total = Math.ceil(options.total);
					if(options.total<10){
						options.total = 10;
					};
					this.setData({
						'form.selectPrice':Number(options.total)
					});
				};
			},
			onShow: function(){
				let _this = this;
				app.checkUser(function(){
					_this.setData({
						isUserLogin:true
					});
					_this.load();
				});
			},
			onPullDownRefresh: function() {
				if(this.getData().isUserLogin){
					this.setData({'form.page':1});
					this.load();
				};
			  	wx.stopPullDownRefresh();
			},
			selectThisPrice:function(e){
				this.setData({'form.selectPrice':app.eData(e).value});
			},
			load:function(){
				let _this = this,
					formData = this.getData().form;
				app.request('//diamondapi/getMyDiamond',{},function(res){
					_this.setData({balance:res.balance||0});
				});
				/*app.request('//diamondapi/getReachargeSetup',{},function(res){
					_this.setData({list:res});
				});*/
				//获取钻石充值设置
				app.request('//set/get',{type:'diamondrecharge',result:'data'},function(backData){
					let res = backData.data||{};
					if(res&&res.length){
						_this.setData({list:res});
					};
				});
			},
			toBuy:function(){
				let _this = this,
					isNum = /^[1-9]\d*$/,
					formData = this.getData().form;
				if(!formData.selectPrice||!isNum.test(formData.selectPrice)){
					app.tips('请输入正确的数字','error');
				}else{
					app.request('//diamondapi/createRechargeOrder',{total:formData.selectPrice},function(res){
						if(res.ordernum){
							app.navTo('../../pay/pay/pay?ordertype=' + res.ordertype + '&ordernum=' + res.ordernum + '&total=' + res.paymoney+'&backStep=1');
						}else{
							app.tips('创建订单失败','error');
						};
					});
				};
			},
		}
	});
})();