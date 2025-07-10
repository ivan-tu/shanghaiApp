/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'user-messageCategory',
        data: {
            systemId: 'user',
            moduleId: 'messageCategory',
            data: [],
            options: {},
            settings: {},
            form: {
				page:1,
				size:20
			},
			showNoData:false,
			showLoading:false,
			pageCount:0,
			count:0,
			client:app.config.client,
			isUserLogin: app.checkUser(),
        },
        methods: {
            onLoad: function(options) {
				let _this = this;
				_this.setData({
					options: options
				});
				app.checkUser(function() {
					_this.setData({
						isUserLogin: true
					});
					_this.load();
				});
            },
            onShow: function() {
				//检查用户登录状态
				let isUserLogin = app.checkUser();
				if (isUserLogin != this.getData().isUserLogin) {
					this.setData({
						isUserLogin: isUserLogin
					});
					if (isUserLogin) {
						this.load();
					};
				}else if(app.storage.get('pageReoload')==1){
					app.storage.remove('pageReoload');
					this.load();
				}else if(!isUserLogin){
					setTimeout(function(){
						app.checkUser(function() {
							_this.setData({
								isUserLogin: true
							});
							_this.load();
						});
					},1000);
				};
			},
			onPullDownRefresh: function() {
				if (this.getData().isUserLogin) {
					this.load();
				};
				wx.stopPullDownRefresh();
			},
            load: function() {
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
				app.request('//homeapi/getMyMsgList',formData,function(backData){
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
							if(item.headpic){
								item.headpic = app.image.crop(item.headpic,60,60);
							};
						});
					};
					if(loadMore){
						list = _this.getData().data.concat(list);
					};
					_this.setData({
						data:list,
						count:backData.count||0,
						total:backData.total||0,
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
			toDetail:function(e){
				let data = this.getData().data,
					index = Number(app.eData(e).index),
					url = data[index].url||'../../user/messageList/messageList';
				if(url=='/p/user/messageCategory/messageCategory'){
					return;
				};
				app.navTo(url);
			},
        }
    });
})();