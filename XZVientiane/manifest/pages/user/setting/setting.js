(function() {

    let app = getApp();

    app.Page({
        pageId: 'user-setting',
        data: {
            systemId: 'user',
            moduleId: 'setting',
						isUserLogin: app.checkUser(),
            data: null,
            options: {},
            settings: {},
            language: {},
            client: app.config.client,
            form: {}
        },
        methods: {
            onLoad:function(options){
				let _this=this;
				_this.setData({options:options});
				app.checkUser(function(){
					_this.setData({isUserLogin:true});
				});
				
			},
			onShow: function(){
				//检查用户登录状态
				let isUserLogin=app.checkUser();
				if(isUserLogin!=this.getData().isUserLogin){
					this.setData({isUserLogin:isUserLogin});
					
				};
			},
			onPullDownRefresh: function() {
				wx.stopPullDownRefresh();
			},
            signOut: function(e) {
                let _this = this;
                app.confirm('确定要退出登录吗?', function () {
                    app.request('/user/userapi/logout', function () {
                        app.removeUserSession();
						app.tips('退出成功','success');
						setTimeout(function(){
							app.reLaunch('../../home/index/index');
						},1000);
                    });
                })

            }
        }
    });
})();