/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'user-privacySet',
        data: {
            systemId: 'user',
            moduleId: 'privacySet',
            data: {},
            options: {},
            settings: {},
            language: {},
            form: {
                hideclubs:0,
                hideactivity:0,
            },
            client: app.config.client,
        },
        methods: {
            onLoad: function(options) {
				let _this = this;
				this.load();
            },
            onShow: function(){
            },
            onPullDownRefresh:function(){
                wx.stopPullDownRefresh();
            },
            load: function() {
                let _this = this,
                    options = this.getData().options,
                    client = this.getData().client;
                app.request('//userapi/info', {}, function(res) {
                    _this.setData({
                        'form.hideclubs':res.hideclubs||0,
						'form.hideactivity':res.hideactivity||0,
                    });
                });
            },
			switchThis:function(e){
				let type = app.eData(e).type,
					formData = this.getData().form;
				formData[type] = formData[type]==1?0:1;
				this.setData({form:formData});
			},
			submit:function(){
				let _this = this,
					formData = this.getData().form,
					msg = '';
				if(msg){
					app.tips(msg,'error');
				}else{
					app.request('//userapi/setting', formData, function(backData) {
						app.tips('提交成功','success');
						setTimeout(app.navBack,1500);
					});
				};	
			},
        }
    });
})();