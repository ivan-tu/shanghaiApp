(function() {

	let app = getApp();

	app.Page({
		pageId: 'manage-financeCashinList',
		data: {
			systemId: 'manage',
			moduleId: 'financeCashinList',
			isUserLogin: app.checkUser(),
			data: [],
			settings: {
				bottomLoad: true,
				noMore: false
			},
			client:app.config.client,
			language: {},
			options:{},
			form: {
				size: 20,
				page: 1,
				timestap:'',
				begindate:'',
				enddate:'',
			},
			showLoading: false,
			pageCount: 1,
			count:0,
			total:0,
			timeScreen: [{
                name: '全部',
                value: ''
            }, {
                name: '今天',
                value: 'today'
            }, {
                name: '昨天',
                value: 'yesterday'
            }, {
                name: '本周',
                value: 'week'
            }, {
                name: '本月',
                value: 'month'
            }],
			begindate:app.getNowDate(-1),
			enddate:app.getNowDate(),
			showDate:false,
			exportURL:'',
		},
		methods: {
			onLoad: function(options) {
				let _this = this;
				this.setData({
					form:app.extend(this.getData().form,options)
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
					'form.page': 1
				});
				if (this.getData().isUserLogin) {
					this.load();
				};
				wx.stopPullDownRefresh();
			},
			load: function() {
				this.getList();
			},
			screen:function(e){
				let _this = this,
					eData = {};
				if(app.eData(e).type=='timestap'){
					eData['begindate']='';
					eData['enddate']='';
					this.setData({showDate:false});
				};
				eData[app.eData(e).type]=app.eData(e).value; 
				let	formData = app.extend(_this.getData().form,eData);
				_this.setData({
					form:formData
				});
				_this.getList();
			},
			bindStartTime:function(e){
				this.setData({
					'form.begindate':e.detail.value,
					begindate:e.detail.value,
				});
			},
			bindEndTime:function(e){
				this.setData({
					'form.enddate':e.detail.value,
					enddate:e.detail.value,
				});
			},
			screenTime:function(){
				this.setData({
					'form.timestap':'',
					showDate:true
				});
			},
			confirmTime:function(){
				let	_this = this,
					formData = _this.getData().form,
					begindate = formData.begindate?Date.parse(new Date(formData.begindate)):'',
					enddate = formData.enddate?Date.parse(new Date(formData.enddate)):'';
				if(begindate&&enddate&&begindate>enddate){
					app.tips('结束时间不能小于起始时间','error');
					_this.setData({
						'form.endTime':''
					});
				}else{
					_this.getList();
				};
			},
			getList: function(loadMore) {
				var _this = this,
					formData = _this.getData().form,
					pageCount = _this.getData().pageCount;

				if (loadMore) {
					if (formData.page >= pageCount) {
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
					'showLoading': false,
					exportURL:app.mixURL('/export/exportShopFinanceLog',{
						shopid:app.session.get('manageShopId'),
						size: formData.size,
						page: formData.page,
						status:formData.status,
						timestap:formData.timestap,
						begindate:formData.begindate,
						enddate:formData.enddate,
						projectid:formData.projectid,
					})
				});
				app.request('//shopapi/getShopIncomeList', formData, function(res) {
					if (!loadMore) {
						if (res.count) {
							pageCount = Math.ceil(res.count / formData.size);
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
						data: list,
						count:res.count,
						total:res.total
					});
				}, '', function() {
					_this.setData({
						'showLoading': true
					});
				});
			},
			loadMore: function() {
				var _this = this,
					formData = this.getData().form,
					pageCount = this.getData().pageCount;

				if (pageCount > formData.page) {
					formData.page++;
					this.setData({
						form: formData
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