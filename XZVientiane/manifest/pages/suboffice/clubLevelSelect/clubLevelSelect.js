/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'suboffice-clubLevelSelect',
        data: {
            systemId: 'suboffice',
            moduleId: 'clubLevelSelect',
            data: [],
            options: {},
            settings: {},
            form: {},
			client:app.config.client,
			ajaxLoading:false,
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
				app.request('//clubapi/getClubsLevel',{clubid:options.clubid,sort:'taix'},function(res){
					if(res&&res.length){
						_this.setData({
							data:res,
							ajaxNoData:false,
						});
					}else{
						_this.setData({
							data:[],
							ajaxNoData:true
						});
					};
				},'',function(){
					_this.setData({ajaxLoading:false});
				});
            },
			selectThis:function(e){
				let _this = this,
					index = Number(app.eData(e).index),
					data = this.getData().data;
				app.dialogSuccess(data[index]);
			},
        }
    });
})();