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
                console.log('🔄 [signOut] 用户点击退出登录');
                app.confirm('确定要退出登录吗?', function () {
                    console.log('🔄 [signOut] 用户确认退出登录');
                    
                    // 定义退出成功后的处理逻辑
                    const handleLogoutSuccess = function() {
                        console.log('🔄 [signOut] 开始清理本地数据');
                        app.removeUserSession();
						app.tips('退出成功','success');
						setTimeout(function(){
                            console.log('🔄 [signOut] 准备跳转到首页');
							app.reLaunch('../../home/index/index');
						},1000);
                    };
                    
                    app.request('/user/userapi/logout', function () {
                        console.log('🔄 [signOut] 服务器退出登录成功');
                        handleLogoutSuccess();
                    }, function(error) {
                        console.log('❌ [signOut] 服务器退出登录失败，但继续清理本地数据', error);
                        // 即使服务器退出失败，也要清理本地数据
                        handleLogoutSuccess();
                    });
                })

            }
        }
    });
})();