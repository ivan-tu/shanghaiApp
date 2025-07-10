/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'suboffice-officeFiance',
        data: {
            systemId: 'suboffice',
            moduleId: 'officeFiance',
            data: {
				todayTotal:0,
				total:0,
				balance:0
			},
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
				app.request('//clubapi/getClubStatics',{clubid:options.id},function(res){
					if(res){
						res.sharePic = app.image.crop(res.pic||'16870792940383251.jpg',480,480);
						res.pic = app.image.crop(res.pic||'16870792940383251.jpg',80,80);
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
        }
    });
})();