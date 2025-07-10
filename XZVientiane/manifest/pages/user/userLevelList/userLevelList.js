/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'user-userLevelList',
        data: {
            systemId: 'user',
            moduleId: 'userLevelList',
            data: {},
            options: {},
            settings: {},
            form: {},
			isUserLogin: app.checkUser(),
			client:app.config.client,
			levelList:[],
        },
        methods: {
            onLoad: function(options) {
			},
			onShow: function() {
				let _this = this;
				app.checkUser(function() {
					_this.setData({
						isUserLogin: true
					});
					_this.load();
				});
			},
			onPullDownRefresh: function() {
				if(this.getData().isUserLogin){
					this.load();
				};
				wx.stopPullDownRefresh();
			},
            load: function(){
				let _this = this;
				app.request('//homeapi/getMyInfo', {}, function(res){
					if (res.headpic) {
						res.headpicUrl = res.headpic;
						res.headpic = app.image.crop(res.headpic, 60, 60);
					};
					_this.setData({data:res});
				});
				app.request('//set/get', {type: 'levelset'}, function (res) {
					if (res.data && res.data.length) {
						_this.setData({
							levelList: res.data
						});
					};
				});
			},
        }
    });
})();