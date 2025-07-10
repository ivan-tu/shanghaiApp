/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'suboffice-clubLevelManage',
        data: {
            systemId: 'suboffice',
            moduleId: 'clubLevelManage',
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
            },
			onShow:function(){
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
			toAdd:function(){
				let options = this.getData().options;
				app.navTo('../../suboffice/clubLevelAdd/clubLevelAdd?clubid='+options.clubid);
			},
			setMore:function(e){
				let _this = this,
					options = this.getData().options,
					index = Number(app.eData(e).index),
					data = this.getData().data,
					list = ['编辑', '删除'];
				app.actionSheet(list,function(res){
					switch(res){
						case 0:
						app.navTo('../../suboffice/clubLevelAdd/clubLevelAdd?clubid='+options.clubid+'&id='+data[index]._id);
						break;
						case 1:
						app.confirm('确定删除吗？',function(){
							app.request('//clubapi/delClubsLevel',{id:data[index]._id},function(res){
								app.tips('删除成功','success');
								_this.load();
							});
						});
						break;
					};
				});
			},
        }
    });
})();