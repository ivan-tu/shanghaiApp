/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'suboffice-officeGroupList',
        data: {
            systemId: 'suboffice',
            moduleId: 'officeGroupList',
            data: {},
            options: {},
            settings: {
				bottomLoad:false,
			},
            form: {
				page:1,
				size:10,
				keyword:'',
				cityOfficeid:'',
			},
			client:app.config.client,
			showLoading:false,
			showNoData:false,
			count:0,
			pageCount:0,
        },
        methods: {
            onLoad: function(options) {
				let _this = this;
				_this.setData({
					options: options,
					form:app.extend(this.getData().form,options),
				});
				app.checkUser({
					goLogin: false,
					success: function () {
						_this.setData({
							isUserLogin: true
						});
					}
				});
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
			changeKeyword: function(e) {
				let keyword = e.detail.keyword;
				this.setData({
					'form.keyword': e.detail.keyword,
					'form.page': 1
				});
				this.getList();
			},
			closeKeyword: function(e) {
				let keyword = e.detail.keyword;
				this.setData({
					'form.keyword': '',
					'form.page': 1
				});
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
				app.request('//subofficeapi/getSubofficeList',formData,function(backData){
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
							item.pic = app.image.crop(item.pic||'16865581725385419.jpg',100,100);
							//item.headpic = app.image.crop(item.headpic,50,50);
							item.areaText = item.area[1]+''+item.area[2];
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