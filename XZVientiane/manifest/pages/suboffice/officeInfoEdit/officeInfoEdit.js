(function () {
	let app = getApp();
	app.Page({
		pageId: 'suboffice-officeInfoEdit',
		data: {
			systemId: 'suboffice',
			moduleId: 'officeInfoEdit',
			isUserLogin: app.checkUser(),
			data: [],
			options: {},
			settings: {},
			language: {},
			form: {
				pic:'',
				summary:'',
				id:'',
			},
		},
		methods: {
			onLoad: function (options) {
				this.setData({
					options: options,
					'form.id':options.id,
				});
				this.load();
			},
			onShow: function () {
				let isUserLogin = app.checkUser();
				if (isUserLogin != this.getData().isUserLogin) {
					this.setData({
						isUserLogin: isUserLogin
					});
					if (isUserLogin) {
						this.load()
					}
				};
			},
			onPullDownRefresh: function () {
				wx.stopPullDownRefresh()
			},
			load: function () {
				let _this = this,
					options = this.getData().options;
				if (options.id) {
					app.request('//clubapi/getClubDetail', {id: options.id}, function (res) {
						console.log(app.toJSON(res));
						_this.setData({
							'form.pic': res.pic,
							'form.summary':res.summary,
						});
						setTimeout(function () {
							if (res.pic) {
								_this.selectComponent('#uploadPic').reset(res.pic);
							};
						}, 200);
					});
				};
			},
			uploadPic: function (e) {
				this.setData({
					'form.pic': e.detail.src[0]
				});
			},
			submit: function () {
				let _this = this,
					formData = this.getData().form,
					msg = '';
				if (!formData.summary) {
					msg = '请输入简介';
				} else if (!formData.pic) {
					msg = '请上传封面';
				};
				console.log(app.toJSON(formData));
				if (msg) {
					app.tips(msg, 'error');
				} else {
					app.request('//clubapi/updateClub', formData, function () {
						app.tips('修改成功', 'success');
						setTimeout(function () {
							app.navBack();
						}, 1000);
					});
				}
			},
		}
	})
})();