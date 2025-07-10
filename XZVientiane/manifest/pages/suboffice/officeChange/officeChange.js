/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'suboffice-officeChange',
        data: {
            systemId: 'suboffice',
            moduleId: 'officeChange',
            data: {},
            options: {},
            settings: {
				bottomLoad:false,
			},
            form: {
				page:1,
				size:10,
				keyword:'',
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
					options: options
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
			selectThis:function(e){
				let _this = this,
					index = Number(app.eData(e).index),
					data = this.getData().data,
					clubid = data[index]._id;
				app.confirm({
					title:'提示',
					content:'加入俱乐部以后无法修改，确定加入【'+data[index].name+'】吗?',
					success:function(req){
						if(req.confirm){
							app.request('//subofficeapi/changeSuboffice',{clubid:clubid},function(){
								app.tips('加入成功','success');
								setTimeout(app.navBack,1000);
							});
						};
					}
				});
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
							item.pic = app.image.crop(item.pic,100,100);
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