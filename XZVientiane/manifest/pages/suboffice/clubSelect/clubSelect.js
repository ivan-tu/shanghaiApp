/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'suboffice-clubSelect',
        data: {
            systemId: 'suboffice',
            moduleId: 'clubSelect',
            data: [],
            options: {},
            settings: {},
            form: {
				page:1,
				size:30,
				sort:'active',
				keyword:'',
			},
			client:app.config.client,
			showLoading:false,
			showNoData:false,
			count:0,
			pageCount:0,
			selectIds:[],
        },
        methods: {
            onLoad: function(options) {
				this.setData({
					options:options
				});
				if(options.selectIds){
					this.setData({
						selectIds:options.selectIds.split(',')
					});
				};
            },
			onShow:function(){
			},
            onPullDownRefresh: function(){
                wx.stopPullDownRefresh();
            },
            load: function(){
            },
			changeKeyword: function(e) {
				let keyword = e.detail.keyword;
				this.setData({
					'form.keyword': e.detail.keyword,
					'form.page': 1
				});
				if(keyword){
					this.getList();
				};
			},
			closeKeyword: function(e) {
				let keyword = e.detail.keyword;
				this.setData({
					'form.keyword': '',
					'form.page': 1,
					data:[],
				});
			},
			selectThis:function(e){
				let _this = this,
					index = Number(app.eData(e).index),
					data = this.getData().data;
				data[index].active = data[index].active==1?0:1;
				this.setData({data:data});
			},
			submit:function(){
				let _this = this,
					data = this.getData().data,
					submitData = [];
				app.each(data,function(i,item){
					if(item.active==1){
						submitData.push(item);
					};
				});
				app.dialogSuccess(submitData);
			},
			getList:function(loadMore){
				let _this = this,
					options = this.getData().options,
					selectIds = this.getData().selectIds,
					formData = _this.getData().form,
					pageCount = _this.getData().pageCount;
				if(loadMore){
					if (formData.page >= pageCount) {
						_this.setData({'settings.bottomLoad':false});
					};
				};
				_this.setData({'showLoading':true});
				app.request('//clubapi/searchClub',formData,function(backData){
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
					let list = [],
						deductCount = 0;
					if(backData.data&&backData.data.length){
						app.each(backData.data,function(i,item){
							item.pic = app.image.crop(item.pic,50,50);
							if(selectIds.length&&app.inArray(item._id,selectIds)>=0){
								item.active = 1;
							}else{
								item.active = 0;
							};
							if(options.clubid&&item._id==options.clubid){
								deductCount++;
							}else{
								list.push(item);
							};
						});
					};
					if(loadMore){
						list = _this.getData().data.concat(list);
					};
					_this.setData({
						data:list,
						count:backData.count?backData.count-deductCount:0,
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