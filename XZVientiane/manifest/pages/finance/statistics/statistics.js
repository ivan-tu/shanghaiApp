(function() {

	let app = getApp();

	app.Page({
		pageId: 'finance-statistics',
		data: {
			systemId: 'finance',
			moduleId: 'statistics',
			isUserLogin: app.checkUser(),
			data: {},
			options: {},
			settings: {},
			language: {},
			form: {},
			type:'',//user,suboffice,shop,cityoffice
		},
		methods: {
			onLoad: function(options) {
				if(options.type){
					this.setData({type:options.type});
				};
				let _this = this;
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
				};
				if (isUserLogin && this.isLoaded) {
					this.load();
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
					type = this.getData().type;
				app.request('//financeapi/getUserFinance',{type:type},function(res){
					_this.setData({
						data: res
					});
					_this.isLoaded = true;
				});
			},
		}
	});
})();