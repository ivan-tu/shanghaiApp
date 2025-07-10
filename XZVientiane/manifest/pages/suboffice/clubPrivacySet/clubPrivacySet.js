(function () {
	let app = getApp();
	app.Page({
		pageId: 'suboffice-clubPrivacySet',
		data: {
			systemId: 'suboffice',
			moduleId: 'clubPrivacySet',
			isUserLogin: app.checkUser(),
			data: [],
			options: {},
			settings: {},
			language: {},
			form: {
				showUser:0,// 成员不对外开放，0开放，1不开放
				showActivity:0,//友局不对外开放，0开放，1不开放
				showDynamic:0,//动态不对外开放
				showSearch:0,//不被推荐和搜索
			},
		},
		methods: {
			onLoad: function (options) {
				this.setData({
					options: options
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
				if (options.clubid) {
					app.request('//clubapi/getClubDetail', {id: options.clubid}, function (res) {
						_this.setData({
							showLoading:false
						});
						_this.setData({
							'form.id':res._id,
							'form.showUser':res.showUser||0,
							'form.showActivity':res.showActivity||0,
							'form.showDynamic':res.showDynamic||0,
							'form.showSearch':res.showSearch||0,
						});
					});
				};
			},
			switchThis: function (e) {
				let type = app.eData(e).type,
					formData = this.getData().form;
				if (type == 'isfree'||type=='faceFreeStatus') {
					formData[type] = formData[type] == 2 ? 1 : 2;
				}else{
					formData[type] = formData[type] == 1 ? 0 : 1;
				};
				this.setData({
					form: formData
				});
			},
			selectThis:function(e){
				let type = app.eData(e).type,
					value = app.eData(e).value,
					formData = this.getData().form;
				formData[type] = value;
				this.setData({
					form: formData
				});
			},
			submit: function () {
				let _this = this,
					formData = this.getData().form,
					msg = '';
				console.log(app.toJSON(formData));
				if (msg) {
					app.tips(msg, 'error');
				} else {
					app.request('//clubapi/updateClub', formData, function () {
						app.tips('设置成功', 'success');
						setTimeout(function () {
							app.navBack();
						}, 1000);
					});
				}
			},
		}
	})
})();