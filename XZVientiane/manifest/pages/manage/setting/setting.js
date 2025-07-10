(function () {

	let app = getApp();

	app.Page({
		pageId: 'manage-setting',
		data: {
			systemId: 'manage',
			moduleId: 'setting',
			isUserLogin: app.checkUser(),
			data: null,
			options: {},
			settings: {},
			language: {},
			client: app.config.client,
			form: {},
			myAuthority: app.storage.get('myAuthority'),
			session: app.storage.get('session')
		},
		methods: {
			onLoad: function (options) {
				this.setData({
					myAuthority: app.storage.get('myAuthority'),
					session: app.storage.get('session')
				});
				if (!this.getData().myAuthority) {
					app.navTo('../../manage/index/index');
				};

				let _this = this;
				_this.setData({
					options: options
				});
				app.checkUser(function () {
					_this.setData({
						isUserLogin: true
					});
					_this.load();
				});
			},
			onShow: function () {
				//检查用户登录状态
				let isUserLogin = app.checkUser();
				if (isUserLogin != this.getData().isUserLogin) {
					this.setData({
						isUserLogin: isUserLogin
					});
					this.load();
				};
			},
			onPullDownRefresh: function () {
				this.onShow();
				wx.stopPullDownRefresh();
			},
			load: function () {
				let _this = this;
			},
		}
	});
})();