(function () {
	let app = getApp();
	app.Page({
		pageId: 'suboffice-clubSharePicSet',
		data: {
			systemId: 'suboffice',
			moduleId: 'clubSharePicSet',
			isUserLogin: app.checkUser(),
			data: [],
			options: {},
			settings: {},
			language: {},
			form: {
				id:'',
				sharepic:'',
			},
			showSharePic:false,
			picWidth: app.system.windowWidth - 120,
			loadOk:false,
			loadPic:'',
			loadPicUrl:'',
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
							'form.id':res._id,
							'form.sharepic': res.sharepic||'',
						});
						setTimeout(function () {
							if (res.sharepic) {
								_this.selectComponent('#uploadPic').reset(res.sharepic);
							};
						}, 300);
					});
				};
			},
			uploadPic: function (e) {
				this.setData({
					'form.sharepic': e.detail.src[0]
				});
				let formData = this.getData().form;
				app.request('//clubapi/updateClub', formData, function () {
					app.tips('修改成功', 'success');
				});
			},
			getSharePic:function(){
				let _this = this,
					options = this.getData().options,
					loadPicUrl = this.getData().loadPicUrl,
					formData = this.getData().form;
				if(!formData.sharepic){
					app.tips('请上传海报封面','error');
				}else{
					if(!loadPicUrl){
						app.request('//clubapi/getClubSharePic',{clubid:options.clubid}, function(res) {
							if(res){
								_this.setData({
									loadPic: app.config.filePath + '' + res,
									loadPicUrl: app.image.width(res, _this.getData().picWidth),
									showSharePic:true
								});
							}else{
								app.tips('生成邀请海报失败','error');
							};
						});
					}else{
						this.setData({showSharePic:true});
					};
				};
			},
			loadSuccess: function() {
				this.setData({
				   loadOk: true
				});
			},
			closeSharePic:function(){
				this.setData({showSharePic:false});
			},
			saveImage: function() {
				let loadPic = this.getData().loadPic;
				app.saveImage({
				   filePath: loadPic,
				   success: function() {
					  app.tips('保存成功', 'success');
				   }
				});
			},
		}
	})
})();