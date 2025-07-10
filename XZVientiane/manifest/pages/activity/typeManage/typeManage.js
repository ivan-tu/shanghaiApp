/**
 *模块组件构造器
 */
(function () {

	let app = getApp();

	app.Page({
		pageId: 'activity-typeManage',
		data: {
			systemId: 'activity',
			moduleId: 'typeManage',
			data:[],
			options: {},
			settings: {},
			form: {},
			isUserLogin: app.checkUser(),
			showLoading:false,
			showNoData:false,
		},
		methods: {
			onLoad: function (options) {
				let _this = this;
				this.setData({
					options: options,
					'form.clubid': options.clubid
				});
			},
			onShow: function () {
				let _this = this;
				app.checkUser(function(){
					_this.setData({
						isUserLogin: true
					});
					_this.load();
				});
			},
			onPullDownRefresh:function(){
				this.load();
				wx.stopPullDownRefresh();
			},
			load:function(){
				let _this = this,
					formData = this.getData().form;
				this.setData({showLoading:true});
				app.request('//activityapi/getActivityType',formData,function(res){
					if(res&&res.length){
						app.each(res,function(i,item){
							item.id = item.id||item._id;
							if(item.pic){
								item.pic = app.image.crop(item.pic,80,80);
							};
						});
						_this.setData({
							data:res,
							showNoData:false
						});
					}else{
						_this.setData({
							data:[],
							showNoData:true
						});
					};
				},'',function(){
					_this.setData({showLoading:false});
				});
			},
			toEdit:function(e){
				let index = Number(app.eData(e).index),
					data = this.getData().data;
				app.navTo('../../activity/typeAdd/typeAdd?id='+data[index].id);
			},
			toDel:function(e){
				let _this = this,
					index = Number(app.eData(e).index),
					data = this.getData().data;
				app.confirm('确定要删除吗?',function(){
					app.request('//activityapi/delActivityType',{id:data[index].id},function(){
						data.splice(index,1);
						_this.setData({data:data});
						if(_this.getData().data.length==0){
							_this.setData({showNoData:true});
						};
					});
				});
			},
			selectThis:function(e){
				let index = Number(app.eData(e).index),
					data = this.getData().data;
				app.dialogSuccess(data[index]);
			},
			toAdd:function(){
				let options = this.getData().options;
				app.navTo('../../activity/typeAdd/typeAdd?clubid='+options.clubid);
			},
		}
	});
})();