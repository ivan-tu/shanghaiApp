(function() {

	let app = getApp();

	app.Page({
		pageId: 'finance-withdrawList',
		data: {
			systemId: 'finance',
			moduleId: 'withdrawList',
			isUserLogin: app.checkUser(),
			data: [],
			options: {
				size: 20,
				page: 1,
				type:'',
				status:'',
			},
			settings: {
				bottomLoad: true,
				noMore: false
			},
			language: {},
			form: {},
			showLoading: false,
			pageCount: 1,
			type:'',
		},
		methods: {
			onLoad: function(options) {
				let _this = this;
				this.setData({
					options:app.extend(this.getData().options,options)
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
				this.setData({
					'options.page': 1
				});
				if (this.getData().isUserLogin) {
					this.load();
				};
				wx.stopPullDownRefresh();
			},
			load: function() {
				this.getList();
			},
			toDetail:function(e){
                let id=app.eData(e).id;
                app.navTo('../../finance/withdrawDetail/withdrawDetail?id='+id);
            },
			getList: function(loadMore) {
				var _this = this,
					options = _this.getData().options,
					pageCount = _this.getData().pageCount;
				if (loadMore) {
					if (options.page >= pageCount) {
						_this.setData({
							'settings.bottomLoad': false,
							'settings.noMore': true
						});
					}
				} else {
					_this.setData({
						'settings.bottomLoad': true,
						'settings.noMore': false
					});
				};
				_this.setData({
					'showLoading': false
				});
				app.request('//financeapi/getApplyList', options, function(res) {
					if (!loadMore) {
						if (res.count) {
							pageCount = Math.ceil(res.count / options.size);
							_this.setData({
								pageCount: pageCount
							});
							if (pageCount == 1) {
								_this.setData({
									'settings.bottomLoad': false
								});
							};
						};
					};

					let list = res.data;

					if (loadMore) {
						list = _this.getData().data.concat(res.data);
					};
					_this.setData({
						data: list
					});
				}, '', function() {
					_this.setData({
						'showLoading': true
					});
				});
			},
			loadMore: function() {
				var _this = this,
					options = this.getData().options,
					pageCount = this.getData().pageCount;

				if (pageCount > options.page) {
					options.page++;
					this.setData({
						options: options
					});
					this.getList(true);
				};
			},
			onReachBottom: function() {
				if (this.getData().settings.bottomLoad) {
					this.loadMore();
				};
			}
		}
	});
})();