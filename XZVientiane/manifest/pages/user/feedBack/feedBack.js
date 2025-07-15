/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'user-feedBack',
        data: {
            systemId: 'user',
            moduleId: 'feedBack',
						isUserLogin: app.checkUser(),
            data: {},
            options: {},
            settings: {},
            language: {},
            form: {
				content:''
            },
        },
        methods: {
            onLoad: function(options) {
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