(function() {

	let app = getApp();

	app.Page({
		pageId: 'manage-finance',
		data: {
			systemId: 'manage',
			moduleId: 'finance',
			isUserLogin: app.checkUser(),
			data: {},
			options: {},
			settings: {},
			language: {},
			form: {},
			manageShopId:app.session.get('manageShopId')||'',
		},
		methods: {
			onLoad: function(options){
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
					if (isUserLogin){
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
				app.request('//shopapi/getShopFinance', {}, function(res){
					_this.setData({
						data: res
					});
				});
			},
		}
	});
})();