(function() {

	let app = getApp();

	app.Page({
		pageId: 'user-myWallteExtract',
		data: {
			systemId: 'user',
			moduleId: 'myWallteExtract',
			isUserLogin: app.checkUser(),
			data: {},
			options: {},
			settings: {},
			language: {},
			form: {
				total:'',
				solAddress:'',
				code:'',
			},
			codeStatus:0,//0-可获取，1-倒计时
			codeText:'获取验证码',
			expertInfo:{},
		},
		methods: {
			onLoad: function(options) {
				let _this = this;
				this.setData({
					options:options
				});
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
			load: function() {
				let _this = this;
				app.request('//userapi/info', {}, function(res) {
					if(res.solAddress){
						_this.setData({'form.solAddress':res.solAddress});
					};
				});
				app.request('//homeapi/getExpertInfo',{},function(res){
					_this.setData({expertInfo:res});
				});
			},
			getCode:function(){
                let _this = this,
					formData = this.getData().form,
                    countDown = 60,
					countDownFn,
					isNum = /^[1-9]\d*$/,
                    codeStatus = this.getData().codeStatus,
					msg = '';
                if(codeStatus==1){
                   return;
                };
				if(!formData.total||!isNum.test(formData.total)){
					msg = '请输入正确的提币数量';
				}else if(!formData.solAddress){
					msg = '请输入接收地址';
				};
				if(msg){
					app.tips(msg,'error');
					return;
				};
				_this.setData({
					codeStatus:1
				});
				app.request('//userapi/securityCodeToLoginUser',{},function(backData){
					countDownFn = setInterval(function(){
						countDown--;
						_this.setData({
							codeText:countDown+'s后重新获取'
						});
						if(countDown == 0){
							clearInterval(countDownFn);
							_this.setData({
								codeStatus:0,
								codeText:'获取验证码'
							});
						};
					},1000);
				},function(msg){
					app.tips(msg||'获取验证码失败', 'error');
					_this.setData({
						codeStatus:0
					});
				});
            },
			setAll:function(){
				let expertInfo = this.getData().expertInfo;
				this.setData({
					'form.total':expertInfo.userBeans
				});
			},
			submit:function(){
				let _this = this,
					formData = this.getData().form,
					isNum = /^[1-9]\d*$/,
					msg = '';
				if(!formData.total||!isNum.test(formData.total)){
					msg = '请输入正确的提币数量';
				}else if(!formData.solAddress){
					msg = '请输入接收地址';
				}else if(!formData.code){
					msg = '请输入验证码';
				};
				if(msg){
					app.tips(msg,'error');
				}else{
					app.request('//homeapi/applyBeansWith',formData,function(backData){
						
						//保存提币地址
						app.request('//userapi/setting', {solAddress:formData.solAddress},function(){
						},function(){});
						
						app.tips('申请成功','success');
						setTimeout(app.navBack,1000);
					});
				};
			},
		}
	});
})();