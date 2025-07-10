/**
 *模块组件构造器
 */
(function () {

	let app = getApp();

	app.Page({
		pageId: 'activity-signed',
		data: {
			systemId: 'activity',
			moduleId: 'signed',
			isUserLogin: app.checkUser(),
			data: {},
			options: {},
			settings: {},
			language: {},
			showNoData: false,
			showLoading: false,
			userdata: {},
			dataJson:{},
		},
		methods: {
			onLoad: function (options) {
				this.setData({
					options: options
				});
			},
			onShow: function () {
				let _this = this;
				app.checkUser(function(){
					_this.setData({
						isUserLogin: true
					});
					_this.load();
				});
			},
			load: function () {
				this.getinfo();
			},
			getinfo: function (loadMore) {
				let _this = this;
				options = _this.getData().options;
				_this.setData({
					showLoading: true
				});
				app.request('//activityapi/getSignInfo', {
					id: options.id,
					userid: options.userid
				}, function (backData) {
					_this.setData({
						data: backData,
						dataJson:app.toJSON(backData),
					});
					if (backData.userdata) {
						backData.userdata.headpic = app.image.crop(backData.userdata.headpic, 150, 150);
						_this.setData({
							userdata: backData.userdata
						});
					};
				}, '', function () {
					_this.setData({
						showLoading: false
					});
				});
			},
			submit: function () {
				let _this = this;
				options = _this.getData().options;
				app.request('//activityapi/doSignStatus', {
					id: options.joinid
				}, function (backData) {
					app.tips('签到成功')
					_this.getinfo();
				});
			}
		}
	});
})();