/**
 *模块组件构造器
 */
(function() {

	let app = getApp();

	app.Page({
		pageId: 'manage-selectCategory',
		data: {
			systemId: 'manage',
			moduleId: 'selectCategory',
			data: [],
			options: {},
			settings: {
			},
			language: {},
			form: {
			},
			showAll:false,
			showLoading:true,
			showNoData:false,
			selectType:1,//1-一级可选 2-二级可选
			custom:false,//是否获取自定义分类
			showSon:1,//1-显示下级 2-不显示
		},
		methods: {
			onLoad:function(options){
				let _this=this;
				_this.setData({
					options:options,
					showAll:options.hasAll?true:false,
					selectType:options.selectType||1,
					custom:options.custom?true:false,
					showSon:options.showSon||1,
				});
				_this.load();
			},
			onShow: function(){
			},
			onPullDownRefresh: function() {
				wx.stopPullDownRefresh();
			},
			load:function(){
				let _this=this,
					showAll=this.getData().showAll,
					options=this.getData().options,
					custom=this.getData().custom;
				console.log(app.toJSON(options));
				app.request(custom?'//vshopapi/getShopGoodsCategory':'//admin/getAllGoodsCategory',{type:options.type||''},function(res){
					console.log(app.toJSON(res));
					if(res&&res.length){
						app.each(res,function(i,item){
							if(item.id==options.id){
								item.show = 1;
							}else{
								item.show = 0;
							};
							if(item.child&&item.child.length){
								app.each(item.child,function(l,g){
									g.id = g.id||g._id;
									if(g._id==options.id){
										item.show = 1;
									};
								});
							};
						});
						_this.setData({data:res,showNoData:false});
					}else{
						_this.setData({data:[],showNoData:true});
					};
				},'',function(){
					_this.setData({showLoading:false});
				});
			},
			showThis:function(e){
				let data = this.getData().data,
					index = Number(app.eData(e).index);
				console.log(index);
				data[index].show = data[index].show==1?0:1;
				this.setData({data:data});
			},
			selectThis:function(e){
				let id = app.eData(e).id,
					selectType = this.getData().selectType,
					index = Number(app.eData(e).index),
					parent = Number(app.eData(e).parent),
					type = app.eData(e).type,
					title = app.eData(e).title,
					data = this.getData().data;
				if(type=='parent'){
					if(selectType==2){
						data[index].show = data[index].show==1?0:1;
						this.setData({data:data});
					}else{
						this.setData({'options.id':id});
						app.dialogSuccess({
							pId:id,
							pTitle:title,
							sId:'',
							sTitle:''
						});
					};
				}else if(type=='son'){
					this.setData({'options.id':id});
					app.dialogSuccess({
						pId:data[parent].id,
						pTitle:data[parent].title,
						sId:id,
						sTitle:title
					});
				};
			},
		}
	});
})();