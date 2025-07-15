(function() {

    let app = getApp();

    app.Page({
        pageId: 'user-myServer',
        data: {
            systemId: 'user',
            moduleId: 'myServer',
			isUserLogin: app.checkUser(),
            data:{
				teamCount:0,
				teamMonthCount:0,
				servers:0,
				commion:0,
			},
            options: {},
            settings: {},
            language: {},
            client: app.config.client,
            form: {
				grouppic:'',
			},
			showLoading:true,
        },
        methods: {
            onLoad: function(options) {
				let _this = this;
				this.setData({
					options:options
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
				if (this.getData().isUserLogin) {
					this.load();
				};
				wx.stopPullDownRefresh();
			},
			load: function() {
				let _this = this;
				app.request('//operapi/getMyOperServerInfo',{},function(res){
					if(res.applyInfo&&res.applyInfo.grouppic){
						res.applyInfo.grouppic = app.image.width(res.applyInfo.grouppic,100);
					};
					_this.setData({
						data:res,
						showLoading:false,
					});
				});
			},
			reSubmit:function(){
				this.setData({
					'data.applyInfo':'',
				});
			},
			submit:function(){//申请
				let _this = this,
					formData = this.getData().form;
				if(!formData.grouppic){
					app.tips('请上传群截图','error');
				}else{
					app.request('//userapi/info', {}, function(userInfo){
						if(userInfo.wxCodePic){
							app.request('//operapi/applyOperServer',formData,function(res){
								app.tips('申请成功','success');
								_this.load();
							});
						}else{
							app.confirm({
								content:'请先上传个人微信二维码',
								confirmText:'立即上传',
								success:function(req){
									if(req.confirm){
										app.navTo('../../user/info/info');
									};
								},
							});
						};
					});
				};
			},
			uploadSuccess: function(e) {
				this.setData({
					'form.grouppic': e.detail.src[0]
				});
            },
        }
    });
})();