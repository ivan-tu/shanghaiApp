/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'club-index',
        data: {
            systemId: 'club',
            moduleId: 'index',
            data: [
				{pic:'16449105352104803.jpg',name:'我是一个活动名称'},
				{pic:'16449105352104803.jpg',name:'我是一个活动名称撒大大所大大多我是一个活动名称撒大大所大大多'},
				{pic:'16449105352104803.jpg',name:'我是一个活动名称撒大大所大大多'},
				{pic:'16449105352104803.jpg',name:'我是一个活动名称撒大大所大大多'},
				{pic:'16449105352104803.jpg',name:'我是一个活动名称撒大大所大大多'},
				{pic:'16449105352104803.jpg',name:'我是一个活动名称我是一个活动名称撒大大所大大多我是一个活动名称撒大大所大大多撒大大所大大多'},
			],
            options: {},
            settings: {
				bottomLoad:false,
			},
            form: {
				type:'recommend',
				page:1,
				size:10,
			},
			client:app.config.client,
			showLoading:false,
			showNoData:false,
			count:0,
			pageCount:0,
        },
        methods: {
            onLoad: function(options) {
				let _this = this;
				if (app.config.client == 'wx' && options.scene) {
					let scenes = options.scene.split('_');
					app.session.set('vcode', scenes[0]);
					delete options.scene;
				};
				_this.setData({
					options: options
				});
				app.checkUser({
					goLogin: false,
					success: function () {
						_this.setData({
							isUserLogin: true
						});
					}
				});
				this.load();
            },
            onPullDownRefresh: function() {
                this.load();
                wx.stopPullDownRefresh();
            },
            load: function() {
				let _this = this,
					data = this.getData().data;
				app.each(data,function(i,item){
					item.pic = app.image.crop(item.pic,90,90);
				});
				this.setData({
					data:data
				});
            },
			screenType:function(){
			},
        }
    });
})();