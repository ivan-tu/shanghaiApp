/**
 *模块组件构造器
 */
(function () {

	let app = getApp();

	app.Page({
		pageId: 'activity-ticketSendRecord',
		data: {
			systemId: 'activity',
			moduleId: 'ticketSendRecord',
			data: [],
			options: {},
			settings: {
				bottomLoad: true,
				noMore: false,
			},
			language: {},
			form: {
				page: 1,
				size: 10,
				status:'',
				activityid: '',
			},
			isUserLogin: app.checkUser(),
			client: app.config.client,
			showLoading: false,
			showNoData: false,
			count: 0,
			pageCount: 0,
		},
		methods: {
			onLoad: function (options) {
				let _this = this;
				this.setData({
					options: options,
					'form.activityid': options.id || '',
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
					if (isUserLogin) {
						this.load();
					};
				};
			},
			onPullDownRefresh: function () {
				if (this.getData().isUserLogin) {
					this.load();
				};
				wx.stopPullDownRefresh();
			},
			load: function () {
				this.getList();
			},
			screen: function (e) {
				let type = app.eData(e).type,
					value = app.eData(e).value,
					formData = this.getData().form;
				formData[type] = value;
				formData.page = 1;
				this.setData({form:formData});
				this.getList();
			},
			toCancel: function (e) { //撤回
				let _this = this,
					data = this.getData().data,
					index = Number(app.eData(e).index),
					id = data[index]._id;
				app.confirm('确定撤回吗？', function () {
					app.request('//activityapi/cancelMasterTickets', {
						id: id
					}, function () {
						app.tips('撤回成功', 'success');
						_this.load();
					});
				});
			},
			cancelAll: function (e) { //撤回所有
				let _this = this,
					data = this.getData().data;
				app.confirm('确定撤回吗？', function () {
					app.request('//activityapi/cancelMasterTickets', {
						id: 'all'
					}, function () {
						app.tips('撤回成功', 'success');
						_this.load();
					});
				});
			},
			getList: function (loadMore) {
				let _this = this,
					formData = _this.getData().form,
					pageCount = _this.getData().pageCount;
				_this.setData({
					'showLoading': true
				});
				if (loadMore) {
					if (formData.page >= pageCount) {
						_this.setData({
							'settings.bottomLoad': false,
							'settings.noMore': true
						});
					};
				} else {
					_this.setData({
						'settings.bottomLoad': true,
						'settings.noMore': false
					});
				};
				app.request('//activityapi/getMasterTickets', formData, function (backData) {
					if (!backData.data) {
						backData.data = [];
					};
					if (!loadMore) {
						if (backData.count) {
							pageCount = Math.ceil(backData.count / formData.size);
							_this.setData({
								pageCount: pageCount
							});
							if (pageCount == 1) {
								_this.setData({
									'settings.bottomLoad': false
								});
							};
							_this.setData({
								'showNoData': false
							});
						} else {
							_this.setData({
								'showNoData': true
							});
						};
					};
					let list = backData.data;
					if (list && list.length) {
						app.each(list, function (i, item) {
							if (item.userData && item.userData.headpic) {
								item.userData.headpic = app.image.crop(item.userData.headpic, 60, 60);
							};
						});
					};
					if (loadMore) {
						list = _this.getData().data.concat(backData.data);
					};
					_this.setData({
						data: list,
						count: backData.count || 0
					});
				}, '', function () {
					_this.setData({
						'showLoading': false
					});
				});
			},
			loadMore: function () {
				let _this = this,
					form = this.getData().form;
				form.page++;
				this.setData({
					form: form
				});
				this.getList(true);
			},
			onReachBottom: function () {
				if (this.getData().settings.bottomLoad) {
					this.loadMore();
				};
			},
		}
	});
})();