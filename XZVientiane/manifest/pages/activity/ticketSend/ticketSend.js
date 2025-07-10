/**
 *模块组件构造器
 */
(function() {

	let app = getApp();

	app.Page({
		pageId: 'activity-ticketSend',
		data: {
			systemId: 'activity',
			moduleId: 'ticketSend',
			data: [],
			options: {},
			settings: {},
			language: {},
			form: {
				id:'',
				account:'',
				num:1,
				userid:'',
				ticketname:'',
			},
			activityDetail:{},//活动详情
			isUserLogin: app.checkUser(),
			client:app.config.client,
			showLoading:false,
			showNoData:false,
			userInfo:'',
			shareType:'share',
		},
		methods: {
			onLoad:function(options){
				let _this = this;
				this.setData({
					options:options,
					'form.id':options.id||'',
				});
				app.checkUser(function() {
					_this.setData({
						isUserLogin: true
					});
					_this.load();
				});
			},
			onShow: function(){
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
				if (this.getData().isUserLogin) {
					this.load();
				};
				wx.stopPullDownRefresh();
			},
			load: function() {
				let _this = this,
					options = this.getData().options;
				this.setData({showLoading:true});
				app.request('//activityapi/getActivityTicket',{id:options.id},function(res){
					_this.setData({
						data:res,
						'form.ticketname':res.tickets[0]['name']
					});
				},'',function(){
					_this.setData({showLoading:false});
				});
            },
			selectThis:function(e){
				let _this = this,
					productList = this.getData().data.tickets,
					index = Number(app.eData(e).index);
				this.setData({
					selectIndex:index,
					'form.ticketname':productList[index]['name']
				});
			},
			//增加数量
			addCount:function(e){
				let _this=this,
					form=_this.getData().form;
				form.num++;
				_this.setData({form:form});		
			},
			//减少数量
			minusCount:function(e){
				let _this=this,
					form=_this.getData().form;
				if(form.num>1){
					form.num--;
					_this.setData({form:form});
				}else{
					app.tips('最少为1');
				};	
					
			},
			//输入数量
			inputCount:function(e){
				let _this=this,
					value=Number(app.eValue(e)),
					form=_this.getData().form;
				if(value<1){
					value=1;
				};
				form.num=value;
				_this.setData({form:form});
			},
			checkAccount:function(){
				let _this = this,
					isPhone = /^0?1[2|3|4|5|6|7|8|9][0-9]\d{8}$/,
					formData = this.getData().form;
				if(!isPhone.test(formData.account)){
					app.tips('请输入正确的账号','error');
				}else{
					app.request('//userapi/getInfoByAccount',{account:formData.account},function(res){
						if(res&&res._id){
							res.headpic = app.image.crop(res.headpic,60,60);
							_this.setData({
								userInfo:res,
								'form.userid':res._id,
							});
						}else{
							app.tips('用户不存在','error');
							_this.setData({
								userInfo:'',
								'form.userid':'',
							});
						};
					});
				};
			},
			submit:function(){
				let _this = this,
					shareType = this.getData().shareType,
					formData = this.getData().form,
					userInfo = this.getData().userInfo,
					msg = '';
				if(!formData.id){
					msg = '缺少活动id';
				}else if(shareType=='account'&&!formData.userid){
					msg = '请确认赠送人';
				}else if(!formData.ticketname){
					msg = '请选择票种';
				}else if(!formData.num){
					msg = '请添加数量';
				};
				if(msg){
					app.tips(msg,'error');
				}else{
					if(shareType=='account'){
						app.confirm('确认赠送['+userInfo.username+']'+formData.num+'张'+formData.ticketname+'吗?',function(){
							app.request('//activityapi/sendActivityTickets',formData,function(){
								app.tips('赠送成功','success');
								_this.setData({
									userInfo:'',
									'form.account':'',
									'form.num':1,
									'form.userid':'',
								});
								_this.load();
							});
						});
					}else if(shareType=='share'){
						app.confirm('确认生成'+formData.num+'张'+formData.ticketname+'赠票吗?',function(){
							app.request('//activityapi/createActivityTickets',{id:formData.id,num:formData.num,ticketname:formData.ticketname},function(){
								app.tips('生成成功','success');
								_this.setData({
									userInfo:'',
									'form.account':'',
									'form.num':1,
									'form.userid':'',
								});
								setTimeout(function(){
									app.navTo('../../activity/ticketMy/ticketMy?id='+formData.id);
								},1000);
							});
						});
					};
				};
			},
			toTicketMy:function(){
				let formData = this.getData().form;
				app.navTo('../../activity/ticketMy/ticketMy?id='+formData.id);
			},
			toTicketRecord:function(){
				let formData = this.getData().form;
				app.navTo('../../activity/ticketSendRecord/ticketSendRecord?id='+formData.id);
			},
			screenType:function(e){
				this.setData({
					'shareType':app.eData(e).type,
					'form.num':1,
				});
			},
		}
	});
})();