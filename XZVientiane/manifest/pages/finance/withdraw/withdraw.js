/**
 *模块组件构造器
 */
(function() {

	let app = getApp();

	app.Page({
		pageId: 'finance-withdraw',
		data: {
			systemId: 'finance',
			moduleId: 'withdraw',
			isUserLogin: app.checkUser(),
			data: {},
			options: {},
			settings: {},
			language: {},
			client: app.config.client,
			form: {
				total:0,
			},
			canWithdraw:0,//可提现金额
			minWidthdraw:0,//最低可提现金额
			freezeWithdraw:0,//待结算金额
			withdrawInfo:{
				real_name: '',
				id_card: '',
				alipay_account: '',//支付宝
				bankname:'',//开户行
				bankcard:'',//银行卡号
			},//提现方式
			tipText:[],
			poundage:0,//税费百分比
			poundageTotal:0,//需要扣除的税费
			agreeMement:true,
			type:'',//user,club,shop,cityoffice
		},
		methods: {
			onLoad: function(options) {
				let _this = this;
				_this.setData({
					options: options,
					type:options.type,
				});
			},
			onShow: function() {
				let _this = this;
				app.checkUser(function() {
					_this.setData({
						isUserLogin: true
					});
					_this.load();
				});
			},
			onPullDownRefresh: function() {
				if (this.getData().isUserLogin) {
					this.load();
				};
				wx.stopPullDownRefresh();
			},
			screenAgree:function(){
				this.setData({agreeMement:!this.getData().agreeMement});
			},
			toRecord:function(){
				let options = this.getData().options;
				if(options.subofficeid){
					app.navTo('../../finance/withdrawList/withdrawList?subofficeid='+options.subofficeid+'&type='+options.type);
				}else if(options.clubid){
					app.navTo('../../finance/withdrawList/withdrawList?clubid='+options.clubid+'&type='+options.type);
				}else if(options.shopid){
					app.navTo('../../finance/withdrawList/withdrawList?shopid='+options.shopid+'&type='+options.type);
				}else{
					app.navTo('../../finance/withdrawList/withdrawList?&type='+options.type);
				};
			},
			toWithdrawSet:function(){
				let options = this.getData().options;
				if(options.subofficeid){
					app.navTo('../../finance/withdrawSet/withdrawSet?subofficeid='+options.subofficeid+'&type='+options.type);
				}else if(options.clubid){
					app.navTo('../../finance/withdrawSet/withdrawSet?clubid='+options.clubid+'&type='+options.type);
				}else if(options.shopid){
					app.navTo('../../finance/withdrawSet/withdrawSet?shopid='+options.shopid+'&type='+options.type);
				}else{
					app.navTo('../../finance/withdrawSet/withdrawSet?&type='+options.type);
				};
			},
			load: function() {
				let _this = this,
					options = this.getData().options,
					type = this.getData().type,
					requestData = {
						type:type
					};
				if(options.shopid){
					requestData.shopid = options.shopid;
				}else if(options.clubid){
					requestData.clubid = options.clubid;
				}else if(options.subofficeid){
					requestData.subofficeid = options.subofficeid;
				};
				//获取可提现金额
				app.request('//financeapi/getUserFinance',requestData,function(res) {
					_this.setData({
						canWithdraw:res.balance||0
					});
					if(res.poundage&&res.poundage>0){
						_this.setData({
							poundage:Number(app.getPrice(res.poundage))
						});
					};
					if(res.tips){
						_this.setData({
							tipText:[res.tips]
						});
					};
					if(res.minwith){//最低可提现
						_this.setData({
							minWidthdraw:res.minwith
						});
					};
				});
				//获取提现方式
				app.request('//financeapi/getAlipayAccount',requestData, function(res) {
					if (res) {
						_this.setData({
							'withdrawInfo.real_name':res.real_name||'',
							'withdrawInfo.id_card':res.id_card||'',
							'withdrawInfo.bankcard':res.bankcard||'',
						});
					};
				});
			},
			getAll: function() {
				let canWithdraw = this.getData().canWithdraw;
				this.setData({
					'form.total': canWithdraw
				});
				//this.getPoundageTotal();
			},
			submit: function() {
				let _this = this,
					options = this.getData().options,
					form = this.getData().form,
					type = this.getData().type,
					agreeMement = this.getData().agreeMement,
					isPrice =  /^[1-9]\d*$/,
					withdrawInfo = this.getData().withdrawInfo,
					canWithdraw = Number(this.getData().canWithdraw),
					minWidthdraw = Number(this.getData().minWidthdraw),
					msg = '';
				if(options.clubdiamond==1){
					form.type = 'clubdiamond';
				}else{
					form.type = type;
				};
				if(options.shopid){
					form.shopid = options.shopid;
				}else if(options.clubid){
					form.clubid = options.clubid;
				}else if(options.subofficeid){
					form.subofficeid = options.subofficeid;
				};
				if(!_this.stopIng){
					_this.stopIng = true;
					form.total = Number(form.total);
					if (!withdrawInfo.bankcard) {
						msg = '请先设置提现帐号';
					}else if (form.total < minWidthdraw) {
						msg = '最低提现' + minWidthdraw + '元';
					}else if (form.total > canWithdraw) {
						msg = '余额不足，最多提现' + canWithdraw + '元';
					};
					if(msg){
						app.tips(msg,'error');
						_this.stopIng = false;
					}else{
						app.request('//financeapi/applyWith', form, function(res) {
							app.tips('提现申请成功');
							_this.setData({'form.total':''});
							setTimeout(function(){
								app.navTo('../../finance/withdrawDetail/withdrawDetail?ordernum=' + res.ordernum);
							},600);
						},'',function(){
							_this.stopIng = false;
						});
					};
				}else{
					app.tips('请勿重复点击','error');
				};
			},
		}
	});
})();