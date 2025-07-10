(function () {
	let app = getApp();
	app.Page({
		pageId: 'activity-typeAdd',
		data: {
			systemId: 'activity',
			moduleId: 'typeAdd',
			isUserLogin: app.checkUser(),
			data: [],
			options: {},
			settings: {},
			language: {},
			form: {
				pic:'',
				name:'',
				content:'',
			},
		},
		methods: {
			onLoad: function (options) {
				let _this = this;
				this.setData({
					options: options
				});
				if(options.id){
					app.setPageTitle('编辑系列');
				}else{
					this.setData({
						'form.clubid':options.clubid
					});
				};
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
					app.request('//activityapi/getActivityTypeDetail', {id: options.id}, function (res) {
						_this.setData({
							'form.id':res._id,
							'form.pic': res.pic||'',
							'form.name':res.name,
							'form.content':res.content||'',
						});
						setTimeout(function () {
							if (res.pic) {
								_this.selectComponent('#uploadPic').reset(res.pic);
							};
						}, 300);
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
				if(!formData.name){
					msg = '请输入名称';
				};
				console.log(app.toJSON(formData));
				if (msg) {
					app.tips(msg, 'error');
				} else {
					if (formData.id) {
						app.request('//activityapi/updateActivityType', formData, function () {
							app.tips('编辑成功', 'success');
							app.storage.set('pageReoload',1);
							setTimeout(function () {
								app.navBack();
							}, 1000);
						});
					} else {
						app.request('//activityapi/addActivityType', formData, function () {
							app.confirm({
								content:'添加成功',
								confirmText:'继续添加',
								cancelText:'返回',
								success:function(req){
									if(req.confirm){
										_this.setData({
											'form.name':'',
											'form.pic':'',
											'form.content':'',
										});
										_this.selectComponent('#uploadPic').reset();
									}else{
										app.navBack();
									};
								},
							});
						});
					};
				}
			},
		}
	})
})();