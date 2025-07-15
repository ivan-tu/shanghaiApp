/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'home-report',
        userSession: true,
        data: {
            systemId: 'home',
            moduleId: 'report',
            data: {},
            options: {},
            settings: {},
            language: {},
            form: {
				content:'',
				url:''
            },
        },
        methods: {
            onLoad: function(options) {
					
				if(options.url){
						let page=options.url,
						    uJson=app.extend(app.urlToJson(page),options);
				delete uJson['url'];
				
				page= app.mixURL(page.split('?')[0],uJson);
				
					this.setData({
						'form.url':page
					});
				};
            },
            onPullDownRefresh: function() {
                wx.stopPullDownRefresh();
            },
			submit:function(){
				let formData = this.getData().form;
				if(!formData.content){
					app.tips('内容不能为空','error');
				}else{
					app.request('/help/help/addFeedback',formData,function(res){
						app.tips('提交成功','success');
						setTimeout(function(){
							app.navBack();
						},500);
					});
				};
			},
        }
    });
})();