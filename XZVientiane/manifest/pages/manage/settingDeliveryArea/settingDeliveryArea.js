/**
 *模块组件构造器
 */
(function() {

	let app = getApp();

	app.Page({
		pageId: 'manage-settingDeliveryArea',
		data: {
			systemId: 'manage',
			moduleId: 'settingDeliveryArea',
			isUserLogin: app.checkUser(),
			data:[],
			options: {},
			settings: {},
			language: {},
			form: {name:'',id:'',area:[]},
			myAuthority: app.storage.get('myAuthority'),
			client: app.config.client,
			isDialog:false,//是否弹出模式
		},
		methods: {
			onLoad: function(options) {
				this.setData({
					myAuthority: app.storage.get('myAuthority')
				});
				if (!this.getData().myAuthority) {
					app.navTo('../../manage/index/index');
				};
				let _this = this;
				if(options.id){
					this.setData({'form.id':options.id});
				};
				if(options.isDialog){
					this.setData({'isDialog':options.isDialog});
				};
				app.checkUser(function() {
					_this.setData({
						isUserLogin: true
					});
					_this.load();
				});

			},
			onShow: function() {
				let _this = this;
				//检查用户登录状态
				let isUserLogin = app.checkUser();
				if (isUserLogin != this.getData().isUserLogin) {
					this.setData({
						isUserLogin: isUserLogin
					});
					this.load();
				};
			},
			onPullDownRefresh: function() {
				this.onShow();
				wx.stopPullDownRefresh();
			},
			selectThis:function(e) {
				let data = this.getData().data,
					index = Number(app.eData(e).index);
				if(data[index].active==1){
					data[index].active=0;
				}else{
					data[index].active=1;
				};
				if(index==0){
					app.each(data,function(i,item){
						item.active = data[index].active;
					});
					this.setData({data:data});
				}else{
					this.setData({data:data});
					this.checkAll();
				};
			},
			checkAll:function(e){
				let data = this.getData().data,
					a = 0;
				app.each(data,function(i,item){
					if(i>0&&item.active==1){
						a++;
					};
				});
				if(a==data.length-1){
					data[0].active=1;
				}else{
					data[0].active=0;
				};
				this.setData({data:data});
			},
			load: function() {
				let _this = this,
					id = this.getData().form.id;
				if (_this.getData().myAuthority.setting) {
					app.request('//api/getProvince',{}, function(res) {
						if (res&&res.length) {
							if(!id){
								app.each(res,function(i,item){
									item.active=1;
								});
								_this.setData({
									data: res
								});
							}else{
								app.request('//shopapi/getDeliveryAreaDetail',{id:id},function(backData){
									app.each(res,function(i,item){
										if(app.inArray(item.area,backData.area)>=0){
											item.active=1;
										}else{
											item.active=0;
										};
									});
									_this.setData({
										data: res,
										'form.name':backData.name
									});
								});
							};
						};
					});
				};
			},
			delThis:function(){
				let _this = this,
					formData = this.getData().form;
				app.confirm('确定删除这个模板吗？',function(){
					app.request('//shopapi/deleteDeliveryArea',{id:formData.id},function(){
						app.tips('删除成功','success');
						setTimeout(app.navBack, 500);
					});
				});
			},
			submit: function() {
				let _this = this, 
					msg = '',
					formData = this.getData().form,
					data = _this.getData().data;
				if(!formData.name){
					msg='请输入模板名称';
				};
				if (msg) {
					app.tips(msg, 'error');
				} else {
					formData.area = [];
					app.each(data,function(i,item){
						if(item.active==1){
							formData.area.push(item.area);
						};
					});
					app.request('//shopapi/saveDeliveryArea', formData, function(){
						app.tips(formData.id?'修改成功':'添加成功','success');
						if(_this.getData().isDialog){
							app.dialogSuccess();
						}else{
							setTimeout(app.navBack, 500);
						};
					});
				};
			}
		}
	});
})();