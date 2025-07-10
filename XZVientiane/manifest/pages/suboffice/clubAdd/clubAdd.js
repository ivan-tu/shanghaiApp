(function () {
	let app = getApp();
	app.Page({
		pageId: 'suboffice-clubAdd',
		data: {
			systemId: 'suboffice',
			moduleId: 'clubAdd',
			isUserLogin: app.checkUser(),
			data: [],
			options: {},
			settings: {},
			language: {},
			form: {
				pic:'16872516872642543.jpg',
				name:'',
				area:[],
				summary:'',
				slogan:'',//宣传标语
				showUser:0,// 成员不对外开放，0开放，1不开放
				showActivity:0,//友局不对外开放，0开放，1不开放
				showDynamic:0,//动态不对外开放
				showSearch:0,//不被推荐和搜索
			},
			dynamicPublishWX:0,
			ajaxLoading:true,
		},
		methods: {
			onLoad: function (options) {
				let _this = this;
				this.setData({
					options: options
				});
				if(app.config.client=='wx'){
					app.request('//set/get', {type: 'homeSet'}, function (res) {
						_this.setData({ajaxLoading:false});
						let backData = res.data||{};
						let wxVersion = app.config.wxVersion;
						if(backData){
							backData.wxVersion = backData.wxVersion?Number(backData.wxVersion):1;
							if(wxVersion>backData.wxVersion){//如果当前版本大于老版本，就要根据设置来
								_this.setData({
									dynamicPublishWX:backData.dynamicPublishWX||0,
								});
							}else{
								_this.setData({
									dynamicPublishWX:1
								});
							};
						}else{
							_this.setData({
								dynamicPublishWX:1
							});
						};
					},function(){
						_this.setData({
							ajaxLoading:false,
							dynamicPublishWX:1
						});
					});
				}else{
					this.setData({
						ajaxLoading:false,
						dynamicPublishWX:1
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
					app.request('//clubapi/getClubDetail', {id: options.id}, function (res) {
						_this.setData({
							'form.id':res._id,
							'form.pic': res.pic||'16872516872642543.jpg',
							'form.name':res.name,
							'form.area':res.area||[],
							'form.summary':res.summary||'',
							'form.slogan':res.slogan||'',
							'form.showUser':res.showUser||0,
							'form.showActivity':res.showActivity||0,
							'form.showDynamic':res.showDynamic||0,
							'form.showSearch':res.showSearch||0,
						});
						setTimeout(function () {
							if (res.pic) {
								_this.selectComponent('#uploadPic').reset(res.pic);
							};
						}, 300);
					});
				}else{
					setTimeout(function () {
						_this.selectComponent('#uploadPic').reset('16872516872642543.jpg');
					},300);
				};
			},
			toPage:function(e){
				app.navTo(app.eData(e).page);
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
			bindAreaChange: function (res) {
				this.setData({
					'form.area': res.detail.value
				});

			},
			uploadPic: function (e) {
				this.setData({
					'form.pic': e.detail.src[0]
				});
			},
			selectLevel:function(e){//选择会员等级
				let index = Number(app.eData(e).index),
					levelList = this.getData().levelList;
				levelList[index].active = levelList[index].active==1?0:1;
				this.setData({levelList:levelList});
			},
			submit: function () {
				let _this = this,
					isPrice = /^[0-9]+.?[0-9]*$/,
					formData = this.getData().form,
					levelList = this.getData().levelList,
					msg = '';
				if (!formData.name) {
					msg = '请输入俱乐部名称';
				} else if (!formData.area.length) {
					msg = '请选择地区';
				} else if(app.getLength(formData.slogan)>24){
					msg = '宣传语最多12个汉字';
				} else if (!formData.summary) {
					msg = '请输入简介';
				};
				console.log(app.toJSON(formData));
				if (msg) {
					app.tips(msg, 'error');
				} else {
					if (formData.id) {
						app.request('//clubapi/updateClub', formData, function () {
							app.tips('编辑成功', 'success');
							app.storage.set('pageReoload',1);
							setTimeout(function () {
								app.navBack();
							}, 1000);
						});
					} else {
						app.request('//clubapi/addClub', formData, function () {
							app.tips('创建成功', 'success');
							app.storage.set('pageReoload',1);
							setTimeout(function () {
								app.navBack();
							}, 1000);
						});
					};
				}
			},
			reback:function(){
				app.navBack();
			},
		}
	})
})();