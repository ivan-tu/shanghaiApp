/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'suboffice-myInvite',
        data: {
            systemId: 'suboffice',
            moduleId: 'myInvite',
            data: [],
            options: {},
            settings: {
				bottomLoad:false,
			},
            form: {
				page:1,
				size:10,
				keyword:'',
				clubid:'',
				gettype:'parent',//gettype=parent,commander,partner
				levelid:'',
			},
			client:app.config.client,
			showLoading:false,
			showNoData:false,
			count:0,
			pageCount:0,
			picWidth:((app.system.windowWidth>480?480:app.system.windowWidth)-40)*0.5,
			picHeight:((app.system.windowWidth>480?480:app.system.windowWidth)-40)*0.5/0.875,
			levelList:[],
			myClubInfo:{},
        },
        methods: {
            onLoad: function(options) {
				let _this = this;
				_this.setData({
					options: options,
					form:app.extend(this.getData().form,options)
				});
				app.checkUser({
					success: function () {
						_this.setData({
							isUserLogin: true
						});
						_this.load();
					}
				});
				//获取我在俱乐部的身份
				app.request('//clubapi/getMyClubLevelInfo',{clubid:options.clubid},function(res){
					_this.setData({myClubInfo:res});
				});
				//获取会员等级
				app.request('//clubapi/getClubsLevel',{clubid:options.clubid,sort:'taix'},function(res){
					if(res&&res.length){
						_this.setData({
							levelList:res
						});
					}else{
						_this.setData({
							levelList:[]
						});
					};
				});
            },
            onPullDownRefresh: function() {
                this.load();
                wx.stopPullDownRefresh();
            },
            load: function() {
				this.getList();
            },
			screen:function(e){
				let formData = this.getData().form,
					type = app.eData(e).type,
					value = appp.eData(e).value;
				formData.page = 1;
				formData[type] = value;
				this.setData({form:formData});
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
				app.request('//clubapi/getMyClubUserList',formData,function(backData){
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
							if(item.headpic){
								item.headpic = app.image.crop(item.headpic,70,70);
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