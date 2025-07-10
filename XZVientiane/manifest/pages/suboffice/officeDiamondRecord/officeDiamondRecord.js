(function() {

	let app = getApp();

	app.Page({
		pageId: 'suboffice-officeDiamondRecord',
		data: {
			systemId: 'finance',
			moduleId: 'officeDiamondRecord',
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
				type:1,
			},
			showLoading:false,
			showNoData:false,
			count:0,
			pageCount:0,
			total:0,
			changeForm:{
				show:false,
				height:180,
				maxTotal:0,
				total:''
			},
		},
		methods: {
			onLoad: function(options) {
				let _this = this,
					alertArray = app.storage.get('alertArray')||{};
				this.setData({
					options:options,
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
			screen:function(e){
				let formData = this.getData().form,
					type = app.eData(e).type,
					value = app.eData(e).value;
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
				app.request('//clubapi/getClubDiamondLog',formData,function(backData){
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
			toChange:function(){
				let _this = this,
					options = this.getData().options;
				app.request('//clubapi/getClubStatics',{clubid:options.clubid},function(res){
					_this.setData({
						'changeForm.maxTotal':res.diamondBalance||0,
						'changeForm.total':res.diamondBalance||0,
						'changeForm.show':true,
					});
				});
			},
			toHideDialog:function(){
				this.setData({'changeForm.show':false});
			},
			toConfirmDialog:function(){
				let _this = this,
					options = this.getData().options,
					isNum = /^[1-9]\d*$/,
					changeForm = this.getData().changeForm,
					msg = '';
				if(!changeForm.total||!isNum.test(changeForm.total)){
					msg = '请输入正确的数量';
				}else if(Number(changeForm.total)>changeForm.maxTotal){
					msg = '钻石余额不足';
				};
				if(msg){
					app.tips(msg,'error');
				}else{
					app.request('//clubapi/trunClubDiamond',{clubid:options.clubid,total:changeForm.total},function(res){
						app.tips('转入成功','success');
						_this.setData({
							'form.page':1,
							'form.type':2,
						});
						_this.toHideDialog();
						_this.getList();
					});
				};
			},
			toWidthdraw:function(){
				let _this = this,
					options = this.getData().options;
				app.navTo('../../finance/withdraw/withdraw?clubid='+options.clubid+'&type=clubdiamond');
			},
		}
	});
})();