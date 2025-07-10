/**
 *模块组件构造器
 */
(function() {

	let app = getApp();

	app.Page({
		pageId: 'finance-recharge',
		data: {
			systemId: 'finance',
			moduleId: 'recharge',
			isUserLogin: app.checkUser(),
			client:app.config.client,
			data: [],
			options: {},
			settings: {bottomLoad: false},
			language: {},
			form: {
				page:1,
				size:20,
				status:'',
				gettype:'my',//revice
			},
			showLoading:false,
			showNoData:false,
			balance:0,
			count:0,
			pageCount:0,
			openForm:{
				show:false,
				height:300,
				index:'',
				data:'',
			},
			shareData:{},
		},
		methods: {
			onLoad:function(options){
				this.setData({options:options});
			},
			onShow: function(){
				let _this = this;
				app.checkUser(function(){
					_this.setData({
						'form.page':1,
						isUserLogin:true
					});
					_this.load();
				});
			},
			onPullDownRefresh: function() {
				if(this.getData().isUserLogin){
					this.setData({'form.page':1});
					this.load();
				};
			  	wx.stopPullDownRefresh();
			},
			load:function(){
				let _this = this,
					formData = this.getData().form;
				app.request('//diamondapi/getMyDiamond',{},function(res){
					_this.setData({balance:res.balance||0});
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
			toBuy:function(){
				//app.navTo('../../finance/diamondBuy/diamondBuy');
				app.navTo('../../finance/diamondRecharge/diamondRecharge');
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
				app.request('//diamondapi/getMyDiamondGift',formData,function(backData){
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
			openThis:function(e){//打开礼包
				let _this = this,
					index = Number(app.eData(e).index),
					data = this.getData().data;
				this.setData({
					'openForm.index':index
				});
				app.request('//diamondapi/getGiftByCode',{changecode:data[index].changecode},function(res){
					if(res){
						_this.setData({
							'openForm.data':res,
							'openForm.show':true,
						});
					}else{
						app.confirm('确定要打开吗?',function(){
							app.request('//diamondapi/changeDiamondGift',{changecode:data[index].changecode},function(){
								app.tips('打开成功','success');
								_this.setData({'form.page':1});
								_this.load();
							});
						});
					};
				},function(){
					app.confirm('确定要打开吗?',function(){
						app.request('//diamondapi/changeDiamondGift',{changecode:data[index].changecode},function(){
							app.tips('打开成功','success');
							_this.setData({'form.page':1});
							_this.load();
						});
					});
				});
			},
			toHideDialog:function(){
				this.setData({'openForm.show':false});
			},
			toConfirmDialog:function(){
				let _this = this,
					openForm = this.getData().openForm,
					index = openForm.index,
					data = this.getData().data;
				app.request('//diamondapi/changeDiamondGift',{changecode:data[index].changecode},function(){
					app.tips('打开成功','success');
					_this.setData({'form.page':1});
					_this.toHideDialog();
					_this.load();
				});
			},
			copyThis: function (e) {//复制内容
				let client = app.config.client,
					content = app.eData(e).content;
				if (client == 'wx') {
					wx.setClipboardData({
						data: content,
						success: function () {
							app.tips('复制成功', 'error');
						},
					});
				} else if (client == 'app') {
					wx.app.call('copyLink', {
						data: {
							url: content
						},
						success: function (res) {
							app.tips('复制成功', 'error');
						}
					});
				} else {
					$('body').append('<input class="readonlyInput" value="'+content+'" id="readonlyInput" readonly />');
					  var originInput = document.querySelector('#readonlyInput');
					  originInput.select();
					  if(document.execCommand('copy')) {
						  document.execCommand('copy');
						  app.tips('复制成功','error');
					  }else{
						  app.tips('浏览器不支持，请手动复制','error');
					  };
					  originInput.remove();
				};
			},
			shareThis:function(e){
				wx.showShareMenu({
				  withShareTicket: true,
				  menus: ['shareAppMessage', 'shareTimeline']
				})
			},
			onShareAppMessage:function(e){
				let index;
				if(app.config.client=='wx'){
					index = Number(e.target.dataset.index);
				}else{
					index = Number(app.eData(e).index);
				};
				let data = this.getData().data,
					itemData = data[index],
					newData = {
						pocode:app.storage.get('pocode'),
						changecode:data[index].changecode
					};
				let pathUrl = app.mixURL('/p/finance/diamondReceive/diamondReceive', newData), 
					sharePic = 'https://statics.tuiya.cc/17333689747996230.jpg',
					shareData = {
						title: '送您一个价值'+itemData.price+'元的'+itemData.name+'，点击领取',  
						path: pathUrl,
						pagePath: pathUrl,
						img: sharePic,
						imageUrl: sharePic,
					};
				return shareData;
			},
			toRefund:function(e){
				let _this = this,
					index = Number(app.eData(e).index),
					data = this.getData().data;
				app.confirm('退回后无法恢复，确定退回吗?',function(){
					app.request('//diamondapi/rebackDiamondGift',{id:data[index]._id},function(){
						app.tips('退回成功','success');
						_this.setData({'form.page':1});
						_this.load();
					});
				});
			},
			toCancel:function(e){
				let _this = this,
					index = Number(app.eData(e).index),
					data = this.getData().data;
				app.confirm('退款后将失去礼包所得，确定退款吗?',function(){
					app.request('//diamondapi/refundMyDiamondGift',{id:data[index]._id},function(){
						app.tips('申请成功','success');
						_this.setData({'form.page':1});
						_this.load();
					});
				});
			},
		}
	});
})();