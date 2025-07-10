(function() {

	let app = getApp();

	app.Page({
		pageId: 'suboffice-recruitClubFinance',
		data: {
			systemId: 'suboffice',
			moduleId: 'recruitClubFinance',
			isUserLogin: app.checkUser(),
			data: [],
			options: {},
			settings: {
				bottomLoad: false
			},
			language: {},
			form: {
				page:1,
				size:30,
				timestap:'',
			},
			showLoading:false,
			showNoData:false,
			count:0,
			pageCount:0,
			total:0,
		},
		methods: {
			onLoad: function(options) {
				let _this = this;
				this.setData({
					form:app.extend(this.getData().form,options)
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
			load: function() {
				this.getList();
			},
			screenType:function(e){
				let type = app.eData(e).type,
					formData = this.getData().form;
				if(type=='showDate'){
					this.setData({
						'form.timestap':'',
						showDate:true
					});
				}else{
					this.setData({
						'form.timestap':type,
						'form.begindate':'',
						'form.enddate':'',
						'form.page':1,
						showDate:false
					});
					this.getList();
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
				app.request('//homeapi/getPartnerFinance',formData,function(backData){
					if(!backData||!backData.list){
						backData = {list:[],count:0};
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
					let list = backData.list;
					if(list&&list.length){
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
		}
	});
})();