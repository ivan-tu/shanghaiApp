(function() {

	let app = getApp();

	app.Page({
		pageId: 'user-gedianCredit',
		data: {
			systemId: 'user',
			moduleId: 'gedianCredit',
			isUserLogin: app.checkUser(),
			data: {},
			options: {},
			settings: {},
			language: {},
			form: {
				page:1,
				size:10
			},
			showType:'receive',
			trunDialog:{
				show:false,
				height:300,
				account:'',
				total:'',
				userInfo:''
			},
		},
		methods: {
			onLoad:function(options){
				let _this = this;
				_this.setData({
					options: options
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
				let _this = this,
					options = this.getData().options;
				app.request('//homeapi/getGedianCreditInfo',{},function(res){
					res.needexpert = Number(res.maxexpert) - Number(res.expert%res.maxexpert);
					if(res.needexpert<0){
						res.needexpert = 0;
					};
					_this.setData({
						data:res
					});
				});
			},
			screenType:function(e){
				this.setData({showType:app.eData(e).type});
			},
			toReceive:function(){//立即领取	
				let _this = this;
				app.confirm('确定领取吗？',function(){
					app.request('//homeapi/reviceGedianDiamond',{},function(res){
						app.tips('领取成功','success');
						_this.setData({showType:'receive'});
						_this.load();
					});
				});
			},
			showTrun:function(){//去转让
				this.setData({
					'trunDialog.show':true,
					'trunDialog.account':'',
					'trunDialog.total':'',
					'trunDialog.userInfo':'',
				});
			},
			toHideDialog:function(){
				this.setData({'trunDialog.show':false});
			},
			toConfirmDialog:function(){
				let _this = this,
					trunDialog = this.getData().trunDialog,
					isNum = /^[0-9]+.?[0-9]*$/,//允许小数点
					msg = '';
				if(!trunDialog.account){
					msg = '请输入账号';
				}else if(!trunDialog.userInfo){
					msg = '请确认账号';
				}else if(!trunDialog.total||!isNum.test(trunDialog.total)){
					msg = '请输入正确的数量';
				};
				if(msg){
					app.tips(msg,'error');
				}else{
					app.request('//homeapi/trunGedianCredit',{account:trunDialog.account,total:trunDialog.total},function(res){
						app.tips('操作成功','success');
						_this.toHideDialog();
						_this.setData({showType:'truend'});
						_this.load();
					});
				};
			},
			checkAccount:function(){
				let _this = this,
					trunDialog = this.getData().trunDialog;
				if(!trunDialog.account){
					app.tips('请输入账号','error');
				}else{
					app.request('//userapi/getInfoByAccount',{account:trunDialog.account},function(res){
						if(res&&res._id){
							res.headpic = app.image.crop(res.headpic,60,60);
							res.account = trunDialog.account;
							_this.setData({
								'trunDialog.userInfo':res
							});
						}else{
							app.tips('用户不存在','error');
						};
					});
				};
			},
		}
	});
})();