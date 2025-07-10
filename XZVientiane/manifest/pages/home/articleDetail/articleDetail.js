/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'home-articleDetail',
        data: {
            systemId: 'home',
            moduleId: 'articleDetail',
            data: {},
            options: {},
            settings: {},
            form: {id:'',customId:''},
			content:'',
        },
        methods: {
            onLoad: function(options) {
				this.options=options;			
				if(options.id){
					this.setData({
						'form.id':options.id
					});
				};
				if(options.customId){
					this.setData({
						'form.customId':options.customId
					});
				};
				if(options.title){
					app.setPageTitle(options.title);
				};
				this.load();
            },
            onPullDownRefresh: function() {
                this.load();
                wx.stopPullDownRefresh();
            },
            load: function() {
				let _this = this,
				 	formData = this.getData().form,
					content = '';
				app.request('//admin/getArticleInfo',formData,function(res){
					content = app.parseHtmlData(res.content);
					_this.setData({content:content});
					if(!_this.options.title){
						app.setPageTitle(res.title);
					};
				},function(){
					_this.setData({content:'文章不存在或已被删除'});
				});
            },
        }
    });
})();