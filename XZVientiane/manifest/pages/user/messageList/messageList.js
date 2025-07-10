(function() {

	let app = getApp();

	app.Page({
		pageId: 'user-messageList',
		data: {
			systemId: 'user',
			moduleId: 'messageList',
			isUserLogin: app.checkUser(),
			data: [],
			options: {},
			settings: {
				bottomLoad: true,
				noMore: false
			},
			language: {},
			form: {
				size: 20,
				page: 1,
				type:'',
				shopid:'',
			},
			showNoData:false,
			showLoading:false,
			pageCount:0,
			count:0,
			number: 0,
			imageWidth: app.system.windowWidth,
			imageHeight: app.system.windowWidth / 2
		},
		methods: {
			onLoad: function(options) {
				let _this = this;
				this.setData({
					options:options,
					form:app.extend(this.getData().form,options),
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
				};
			},
			onPullDownRefresh: function() {
				this.setData({
					'form.page': 1
				});
				if (this.getData().isUserLogin) {
					this.load();
				};
				wx.stopPullDownRefresh();
			},
			readAll:function(){
				let _this = this;
				app.confirm('确定将所有消息标记为已读吗？',function(){
					app.request('//homeapi/setMsgRead',{id:'all'},function(){
						app.tips('操作成功');
						_this.load();
					});
				});
			},
			load: function(loadMore) {
				var _this = this,
					formData = _this.getData().form,
					number = _this.getData().number,
					pageCount = _this.getData().pageCount,
					imageWidth = _this.getData().imageWidth,
					imageHeight = _this.getData().imageHeight;
				_this.setData({'showLoading': true});
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
							item.id = item.id||item._id;
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
					});
				},'',function(){
					_this.setData({
						'showLoading':false,
					});
				});
			},
			toPage:function(e){
				let _this=this, 
					data=_this.getData().data,
					index=Number(app.eData(e).index),
					status = Number(app.eData(e).status),
					id = app.eData(e).id,
					link = data[index].url;
				if(status==1){
					if(link){
						app.navTo(link);
					};
				}else{
					app.request('//homeapi/setMsgRead',{id:id},function(res){
					});
					data[index].status=1;
					_this.setData({data:data});
					if(link){
						app.navTo(link);
					};
					/*if(app.config.client=='app'){//通知APP更新消息数字
						wx.app.call('readMessage', {data:1});
					};*/
				};
			},
			loadMore: function() {
				var _this = this,
					form = this.getData().form,
					pageCount = this.getData().pageCount;
				if (form.page < pageCount) {
					form.page++;
					this.setData({
						form: form
					});
					this.load(true);
				};
			},
			onReachBottom: function() {
				if (this.getData().settings.bottomLoad) {
					this.loadMore();
				};
			}
		}
	});
})();