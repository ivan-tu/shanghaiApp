/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'finance-diamondReceive',
        data: {
            systemId: 'finance',
            moduleId: 'diamondReceive',
            data: {},
            options: {},
            settings: {},
            form: {},
			client:app.config.client,
			getStatus:0,
			goodsList:[],
			isUserLogin: app.checkUser(),
			showNoData:false,
			showLoading:true,
        },
        methods: {
            onLoad: function(options) {
				this.setData({
					options:options
				});
			},
			onShow: function() {
				let _this = this;
				app.checkUser(function(){
					_this.setData({
						isUserLogin:true
					});
					_this.load();
				});
			},
			onPullDownRefresh: function() {
				this.load();
				wx.stopPullDownRefresh();
			},
			toLogin:function(){
				app.userLogining = false;
				app.userLogin({
					success: function () {
						_this.setData({
							isUserLogin: true
						});
					}
				});
			},
			load:function(){
				let _this = this,
					options = this.getData().options;
				if(options.changecode){
					app.request('//diamondapi/getGiftByCode',{changecode:options.changecode},function(res){
						if(res){
							if(res.userinfo&&res.userinfo.headpic){
								res.userinfo.headpic = app.image.crop(res.userinfo.headpic,60,60);
							};
							_this.setData({
								data:res,
								showNoData:false,
							});
						};
					},function(){
						_this.setData({
							data:{},
							showNoData:true,
						});
					},function(){
						_this.setData({
							showLoading:false
						});
					});
				}else{
				};
			},
			submit:function(){
				let _this = this,
					options = this.getData().options;
				app.confirm('确定领取并且打开吗?',function(){
					app.request('//diamondapi/changeDiamondGift',{changecode:options.changecode},function(){
						app.tips('打开成功','success');
						_this.load();
						setTimeout(function(){
							app.switchTab({
								url:'../../user/my/my'
							});
						},1000);
					});
				});
			},
			toHome:function(){
				app.switchTab({
					url:'../../home/index/index'
				});
			},
        }
    });
})();