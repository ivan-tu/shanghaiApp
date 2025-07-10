(function() {

	let app = getApp();

	app.Page({
		pageId: 'pay-fenqiPayInfo',
		data: {
			systemId: 'pay',
			moduleId: 'fenqiPayInfo',
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
				status:'',
			},
			showLoading:false,
			showNoData:false,
			count:0,
			pageCount:0,
			changeDialog:{
				show:false,
				height:400,
				id:'',
				stagesnum:'',
			},
			depositSet:{},
		},
		methods: {
			onLoad: function(options) {
				let _this = this;
				this.setData({
					form:app.extend(this.getData().form,options)
				});
			},
			onShow: function() {
				let _this = this;
				app.checkUser(function() {
					_this.setData({
						isUserLogin: true
					});
					_this.load();
				});
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
				let formData = this.getData().form;
				formData[app.eData(e).type] = app.eData(e).value;
				formData.page = 1;
				this.setData({form:formData});
				this.getList();
			},
			toPay:function(e){
				let _this = this,
					index = Number(app.eData(e).index),
					data = this.getData().data;
				app.request('//diamondapi/createGiftOrderPayOrder',{id:data[index]._id},function(res){
					if(res.ordernum){
						app.navTo('../../pay/pay/pay?ordertype=' + res.ordertype + '&ordernum=' + res.ordernum + '&total=' + res.paymoney+'&backStep=1');
					}else{
						app.tips('创建订单失败','error');
					};
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
				app.request('//diamondapi/getGiftOrder',formData,function(backData){
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
						let needPay = 0;
						app.each(list,function(i,item){
							item.waitPay = 0;
							if(item.stagestype=='stages'){//是分期订单
								if(needPay&&item.status==1){//前面有需要支付的并且本次需要支付
									item.waitPay = needPay;
								}else if(item.status==1){
									needPay = item.num;
								};
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
			screenStages:function(e){
				this.setData({
					'changeDialog.stagesnum':app.eData(e).num,
				});
			},
			toChange:function(e){
				let _this = this,
					data = this.getData().data,
					index = Number(app.eData(e).index);
				//获取分期配置
				app.request('//set/get', {type: 'deposit'}, function (res) {
					let backData = res.data||{};
					if(backData){
						_this.setData({
							depositSet:backData,
							'changeDialog.stagesnum':'',
						});
						if(data[index].type=='white'&&backData.expertStages){//白钻-达人
							app.each(backData.expertStages,function(i,item){
								item.needPay = Number(item.firstPrice) - Number(backData.deposit.white);
								item.needPay = item.needPay>0?Number(app.getPrice(item.needPay)):0;
							});
							_this.setData({
								'changeDialog.show':true,
								'changeDialog.id':data[index]._id,
								'changeDialog.fenqiList':backData.expertStages,
							});
						}else if(data[index].type=='red'&&backData.agentStages){//红钻-代理
							app.each(backData.agentStages,function(i,item){
								item.needPay = Number(item.firstPrice) - Number(backData.deposit.red);
								item.needPay = item.needPay>0?Number(app.getPrice(item.needPay)):0;
							});
							_this.setData({
								'changeDialog.show':true,
								'changeDialog.id':data[index]._id,
								'changeDialog.fenqiList':backData.agentStages,
							});
						}else if(data[index].type=='gold'&&backData.partnerStages){//金钻-合伙人
							app.each(backData.partnerStages,function(i,item){
								item.needPay = Number(item.firstPrice) - Number(backData.deposit.gold);
								item.needPay = item.needPay>0?Number(app.getPrice(item.needPay)):0;
							});
							_this.setData({
								'changeDialog.show':true,
								'changeDialog.id':data[index]._id,
								'changeDialog.fenqiList':backData.partnerStages,
							});
						}else{
							app.tips('暂无分期可选','error');
						};
					}else{
						app.tips('暂无分期可选','error');
					};
				});
			},
			toHideDialog:function(){
				this.setData({'changeDialog.show':false});
			},
			toConfirmDialog:function(){
				let _this = this,
					changeDialog = this.getData().changeDialog,
					msg = '';
				if(!changeDialog.stagesnum){
					msg = '请选择分期';
				};
				if(msg){
					app.tips(msg,'error');
				}else{
					let requestData = {
						id:changeDialog.id,
						stagesnum:changeDialog.stagesnum,
					};
					_this.toHideDialog();
					app.request('//diamondapi/createTrunGiftOrder',requestData,function(res){
						if(res.ordernum){
							app.navTo('../../pay/pay/pay?ordertype=' + res.ordertype + '&ordernum=' + res.ordernum + '&total=' + res.paymoney+'&backStep=1');
						}else{
							app.tips('修改成功','success');
							_this.load();
						};
					});
				};
			},
		}
	});
})();