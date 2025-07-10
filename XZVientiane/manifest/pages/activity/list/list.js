/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'activity-list',
        data: {
            systemId: 'activity',
            moduleId: 'list',
            data: {},
            options: {},
            settings: {
				bottomLoad:false,
			},
            form: {
				page:1,
				size:10,
				isshow:'1',
				joinclubid:'',
				typeid:'',
			},
			client:app.config.client,
			showLoading:false,
			showNoData:false,
			count:0,
			pageCount:0,
			getType:'',
			getType2:'join',
			typeList:[],
        },
        methods: {
            onLoad: function(options){
				let _this = this;
				this.setData({
					options:options,
					form: app.extend(this.getData().form,options)
				});
				if(options.clubid||options.joinclubid){
					app.request('//activityapi/getActivityType',{clubid:options.clubid||options.joinclubid},function(res){
						if(res&&res.length){
							app.each(res,function(i,item){
								item.id = item.id||item._id;
								if(item.pic){
									item.pic = app.image.crop(item.pic,80,80);
								};
							});
							_this.setData({typeList:res});
						};
					});
				};
				this.load();
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
				let type = app.eData(e).type,
					value = app.eData(e).value,
					formData = this.getData().form;
				formData[type] = value;
				formData.page = 1;
				this.setData({form:formData});
				this.getList();
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
				app.request('//activityapi/getActivityList',formData,function(backData){
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
							item.masterpic = app.image.crop(item.masterpic,30,30);
							item.pic = app.image.crop(item.pic,120,96);
							item.areaText = (item.area&&item.area.length)?item.area[1]+'-'+item.area[2]:'';
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
			copyThis:function(e){
				let _this = this,
					id = app.eData(e).id;
				app.confirm('确定复制吗?',function(){
					app.request('//activityapi/copyActivity',{id:id},function(res){
						if(res.id){
							app.confirm({
								content:'复制成功，是否去编辑',
								success:function(req){
									if(req.confirm){
										app.navTo('../../activity/add/add?id='+res.id);
									}else{
										_this.setData({'form.page':1});
										_this.load();
									};
								},
							});
						}else{
							app.tips('复制成功','success');
							_this.setData({'form.page':1});
							_this.load();
						};
					});
				});
			},
			toDetail:function(e){
				let index = Number(app.eData(e).index),
					data = this.getData().data,
					options = this.getData().options;
				if(options.clubid||options.joinclubid){
					app.navTo('../../activity/detail/detail?id='+data[index]._id+'&clubid='+(options.clubid||options.joinclubid));
				}else{
					app.navTo('../../activity/detail/detail?id='+data[index]._id);
				};
			},
			upThis:function(e){//上架
				let _this = this,
					id = app.eData(e).id;
				app.request('//activityapi/updateActivityStatus',{id:id,showstatus:1},function(){
					app.tips('上架成功','success');
					_this.load();
				});
			},
			downThis:function(e){//下架
				let _this = this,
					id = app.eData(e).id;
				app.request('//activityapi/updateActivityStatus',{id:id,showstatus:0},function(){
					app.tips('上架成功','success');
					_this.load();
				});
			},
			delThis:function(e){//删除
				let _this = this,
					id = app.eData(e).id;
				app.confirm('确定要删除吗？',function(){
					app.request('//activityapi/delMyActivity',{id:id},function(){
						app.tips('删除成功','success');
						_this.load();
					});
				});
			},
        }
    });
})();