/**
 *模块组件构造器
 */
(function() {

	let app = getApp();

	app.Page({
		pageId: 'finance-withdrawSet',
		data: {
			systemId: 'finance',
			moduleId: 'withdrawSet',
			isUserLogin: app.checkUser(),
			data: {},
			options: {},
			settings: {},
			language: {},
			form: {
				banktype:'person',
				real_name: '',//真实姓名-企业名称
				mobile:'',//手机号码
				id_card: '',//身份证号
				alipay_account:'',//支付宝 账号
				bankname:'',//开户行
				bankcard:'',//银行卡号
				type:'',//user,club,shop,cityoffice
			},
			agreeMent:true,
			showLoading:false,//数据提交时的loading
			client:app.config.client,
			ajaxLoading:true,
			withdrawSetWX:0,
		},
		methods: {
			onLoad: function(options) {
				app.setPageTitle('提现方式设置');
				let _this = this;
				_this.setData({
					options: options,
					'form.type':options.type,
				});
				if(options.subofficeid){
					this.setData({'form.subofficeid':options.subofficeid});
				};
				if(options.clubid){
					this.setData({'form.clubid':options.clubid});
				};
				if(app.config.client=='wx'){
					app.request('//set/get', {type: 'homeSet'}, function (res) {
						_this.setData({ajaxLoading:false});
						let backData = res.data||{};
						let wxVersion = app.config.wxVersion;
						if(backData){
							backData.wxVersion = backData.wxVersion?Number(backData.wxVersion):1;
							if(wxVersion>backData.wxVersion){//如果当前版本大于老版本，就要根据设置来
								_this.setData({
									withdrawSetWX:backData.withdrawSetWX||0,
								});
							}else{
								_this.setData({
									withdrawSetWX:1
								});
							};
						}else{
							_this.setData({
								withdrawSetWX:1
							});
						};
					},function(){
						_this.setData({
							ajaxLoading:false,
							withdrawSetWX:1
						});
					});
				}else{
					this.setData({
						ajaxLoading:false,
						withdrawSetWX:1
					});
				};
				app.checkUser(function() {
					_this.setData({
						isUserLogin: true
					});
					_this.load();
				});
			},
			onShow: function() {
				//检查用户登录状态
				let isUserLogin = app.checkUser();
				if (isUserLogin != this.getData().isUserLogin) {
					this.setData({
						isUserLogin: isUserLogin
					});
					if (isUserLogin) {
						this.load();
					};
				};
			},
			onPullDownRefresh: function() {
				if (this.getData().isUserLogin) {
					this.load();
				};
				wx.stopPullDownRefresh();
			},
			screenType:function(e){
				this.setData({'form.banktype':app.eData(e).type});
			},
			copyLink:function(){
				let url = app.mixURL('https://' + app.config.domain +'/p/finance/withdrawSet/withdrawSet', this.getData().options);
				if (app.config.client == 'wx') {
					wx.setClipboardData({
						data: url,
						success: function() {
							app.tips('复制成功', 'success');
						},
					});
				} else if (app.config.client == 'app') {
					wx.app.call('copyLink', {
						data: {
							url: url
						},
						success: function(res) {
							app.tips('复制成功', 'success');
						}
					});
				} else {
					$('body').append('<input class="readonlyInput" value="' + url + '" id="readonlyInput" readonly />');
					var originInput = document.querySelector('#readonlyInput');
					originInput.select();
					if (document.execCommand('copy')) {
						document.execCommand('copy');
						app.tips('复制成功', 'error');
					} else {
						app.tips('浏览器不支持，请手动复制', 'error');
					};
					originInput.remove();
				};
			},
			load: function() {
				let _this = this,
				 	options = this.getData().options,
					formData = this.getData().form,
					requestData = {
						type:formData.type
					};
				if(options.shopid){
					requestData.shopid = options.shopid;
				}else if(options.clubid){
					requestData.clubid = options.clubid;
				}else if(options.subofficeid){
					requestData.subofficeid = options.subofficeid;
				};
				app.request('//financeapi/getAlipayAccount',requestData, function(res) {
					if (res){
						_this.setData({
							data:res,
							'form.banktype':res.banktype||'person',
							'form.real_name':res.real_name||'',
							'form.mobile':res.mobile||'',
							'form.id_card':res.id_card||'',
							'form.alipay_account':res.alipay_account||'',
							'form.bankname':res.bankname||'',
							'form.bankcard':res.bankcard||'',
						});
					};
				});
			},
			changeAgreement:function(){
				this.setData({agreeMent:!this.getData().agreeMent});
			},
			toViewAgreement:function(){
				app.navTo('../../home/articleDetail/articleDetail?customId=lhjy');
			},
			submit: function(e) {
				let _this = this, 
					options = this.getData().options,
					form = _this.getData().form,
					isNum = /^[+]{0,1}(\d+)$/,
					showLoading = this.getData().showLoading,
					msg = '';
				if(this.getData().showLoading){
					return false;
				};
				if(options.shopid){
					form.shopid = options.shopid;
				}else if(options.clubid){
					form.clubid = options.clubid;
				}else if(options.subofficeid){
					form.subofficeid = options.subofficeid;
				};
				if(form.bankcard){
					form.bankcard = form.bankcard.replace(/\ +/g, ""); //去掉空格
					form.bankcard = form.bankcard.replace(/[ ]/g, ""); //去掉空格	
				};
				if(form.banktype=='person'&&!form.real_name) {
					msg = '请输入真实姓名';
				}else if(form.banktype=='person'&&!form.mobile) {
					msg = '请输入手机号码';
				}else if(form.banktype=='company'&&!form.real_name) {
					msg = '请输入企业名称';
				}else if (form.banktype=='person'&&!form.id_card) {
					msg = '请输入身份证号码';
				}else if (!form.bankcard){
					msg = '请输入银行卡号';
				}else if (!form.bankname){
					msg = '请输入开户行';
				}else if (!this.getData().agreeMent){
					msg = '请阅读并同意协议';
				};
				if (msg) {
					app.tips(msg,'error');
					this.setData({submitLoading:false});
				} else {
					this.setData({showLoading:true});
					app.request('//financeapi/saveAlipayAccount', form, function(res) {
						app.tips('设置成功', 'success');
						setTimeout(app.navBack,1000);
					},'',function(){
						_this.setData({showLoading:false});
					});
				};
			},
			reBack:function(){
				app.navBack();
			},
		}
	});
})();