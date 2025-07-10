/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'suboffice-cityManage',
        data: {
            systemId: 'suboffice',
            moduleId: 'cityManage',
            data: {},
            options: {},
            settings: {},
            form: {},
			client:app.config.client,
			ajaxLoading:true,
			ajaxNoData:false,
        },
        methods: {
            onLoad: function(options) {
				this.setData({options:options});
				this.load();
            },
            onPullDownRefresh: function() {
				if(app.checkUser()){
					this.load();
				};
                wx.stopPullDownRefresh();
            },
            load: function() {
				let _this = this,
					options = this.getData().options;
				this.setData({ajaxLoading:true});
				app.request('//subofficeapi/getSubofficeStatics',{subofficeid:options.id},function(res){
					if(res){
						res.pic = app.image.crop(res.pic,80,80);
						_this.setData({
							data:res,
							ajaxNoData:false,
						});
					}else{
						_this.setData({ajaxNoData:true});
					};
				},'',function(){
					_this.setData({ajaxLoading:false});
				});
            },
			toEdit:function(){
				let options = this.getData().options;
				app.navTo('../../suboffice/officeInfoEdit/officeInfoEdit?id='+options.id);
			},
			toActivity:function(){
				let options = this.getData().options;
				app.navTo('../../activity/add/add?subofficeid='+options.id);
			},
        }
    });
})();