(function() {

    let app = getApp();

    app.Page({
        pageId: 'user-operCenter',
        data: {
            systemId: 'user',
            moduleId: 'operCenter',
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
				app.request('//operapi/getMyOperCenterInfo',{},function(res){
					if(res.applyInfo&&res.applyInfo.grouppic){
						res.applyInfo.grouppic = app.image.width(res.applyInfo.grouppic,100);
					};
					https://hi3.tuiya.cc/operapi/getMyOperCenterInfo
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
					app.request('//operapi/applyOperServer',formData,function(res){
						app.tips('申请成功','success');
						_this.load();
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