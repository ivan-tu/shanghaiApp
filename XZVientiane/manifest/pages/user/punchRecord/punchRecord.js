/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'user-punchRecord',
        data: {
            systemId: 'user',
            moduleId: 'punchRecord',
            data: [],
            options: {},
            settings: {
				bottomLoad:false,
			},
            form: {
				page:1,
				size:10,
			},
			client:app.config.client,
			showLoading:false,
			showNoData:false,
			count:0,
			pageCount:0,
			picWidth:((app.system.windowWidth>480?480:app.system.windowWidth)-40)*0.5,
			picHeight:((app.system.windowWidth>480?480:app.system.windowWidth)-40)*0.5/0.875,
        },
        methods: {
            onLoad: function(options) {
				let _this = this;
				_this.setData({
					options: options,
					form:app.extend(this.getData().form,options),
				});
				app.checkUser({
					success: function () {
						_this.setData({
							isUserLogin: true
						});
						_this.load();
					}
				});
				
            },
            onPullDownRefresh: function() {
				this.setData({'form.page':1});
                this.load();
                wx.stopPullDownRefresh();
            },
            load: function() {
				this.getList();
            },
			screen:function(e){
				let formData = this.getData().form,
					type = app.eData(e).type,
					value = app.eData(e).value;
				formData[type] = value;
				formData.page = 1;
				this.setData({form:formData});
				this.getList();
			},
			toDetail:function(e){
				if(app.eData(e).id){
					app.navTo('../../user/businessCard/businessCard?id='+app.eData(e).id);
				};
			},
			getList:function(loadMore){
				let _this = this,
					formData = _this.getData().form,
					pageCount = _this.getData().pageCount;
				if(loadMore){
					if (formData.page >= pageCount) {
						_this.setData({'settings.bottomLoad':false});
					};
				};
				_this.setData({'showLoading':true});
				app.request('//homeapi/getMyPunch',formData,function(backData){
					if(!backData||!backData.data){
						backData = {data:[],count:0};
					};
					if(!loadMore){
						if(backData.count){
							pageCount = Math.ceil(backData.count / formData.size);
							_this.setData({'pageCount':pageCount});
							if(pageCount > 1){
								_this.setData({'settings.bottomLoad':true});
							}else{
								_this.setData({'settings.bottomLoad':false});
							};
							_this.setData({'showNoData':false});
						}else{
							_this.setData({
								'settings.bottomLoad':false,
								'showNoData':true
							});
						};
					};
					let list = backData.data;
					if(list&&list.length){
						app.each(list,function(i,item){
							item.id = item.id||item._id;
							if(item.shopdata){
								item.shopdata.pic = app.image.crop(item.shopdata.pic,100,100);
								item.shopdata.areaText = (item.shopdata.area&&item.shopdata.area.length)?item.shopdata.area[1]+'-'+item.shopdata.area[2]:'';
							};
						});
					};
					if(loadMore){
						list = _this.getData().data.concat(list);
					};
					_this.setData({
						data:list,
						count:backData.count||0,
					});
				},'',function(){
					_this.setData({
						'showLoading':false,
					});
				});
			},
			onReachBottom:function(){
				if(this.getData().settings.bottomLoad) {
					let formData = this.getData().form;
					formData.page++;
					this.setData({form:formData});
					this.getList(true);
				};
			},
        }
    });
})();