/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'user-bindUser',
        data: {
            systemId: 'user',
            moduleId: 'bindUser',
						isUserLogin: app.checkUser(),
            data: {
                weixin: '',
                phone: ''
            },
            options: {},
            settings: {},
            language: {},
            form: {}
        },
        methods: {
            onLoad:function(options){
							let _this=this;
							_this.setData({options:options});
							app.checkUser(function(){
								_this.setData({isUserLogin:true});
								_this.load();
							});
							
						},
						onShow: function(){
							//检查用户登录状态
							let isUserLogin=app.checkUser();
							if(isUserLogin!=this.getData().isUserLogin){
								this.setData({isUserLogin:isUserLogin});
							};
							if(isUserLogin&&this.isLoaded){
									this.load();	
								};
						},
						onPullDownRefresh: function() {
							if(this.getData().isUserLogin){
							 this.load();
							};
							wx.stopPullDownRefresh();
						},
            load: function() {
                let _this = this;
                _this.getUserBind();
            },
            getUserBind: function() {
                let _this = this;
                app.request('user/userapi/getUserBind', function(backData) {
                    _this.setData({ data: backData });
										_this.isLoaded=true;
                });
            },
            bindWeixin: function(e) {
                let _this = this;
                if (_this.getData().data.weixin) {
                    app.confirm('解绑后不能使用微信登录了，确定要解绑微信吗？', function() {
                        app.request('user/userapi/unBindWeixin', function() {
                            app.tips('微信解绑成功');
                            _this.setData({
                                'data.weixin': ''
                            });
                        });
                    });
										//app.tips('已绑定微信');
                } else {
                    app.weixinLogin({
                        userSession: app.session.get('userSession'),
                        success: function(value) {
                            app.tips('微信绑定成功');
                            _this.setData({
                                'data.weixin': value
                            });
                        }
                    });
                }
            }
        }
    });
})();