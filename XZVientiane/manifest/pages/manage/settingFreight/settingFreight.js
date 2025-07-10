/**
 *模块组件构造器
 */
(function() {

	let app = getApp();

	app.Page({
		pageId: 'manage-settingFreight',
		data: {
			systemId: 'manage',
			moduleId: 'settingFreight',
			isUserLogin: app.checkUser(),
			data:[],
			options: {},
			settings: {},
			language: {},
			form: {
				name:'',
				id:'',
				freeShipping:'',
				area:[],
				freearea:[],
				weightarea:[],//首重
				conweightarea:[],//续重
			},
			allNum:'',//运费
			allFree:'',//包邮
			allWeight:'',//首重
			allConWeight:'',//续重
			myAuthority: app.storage.get('myAuthority'),
			client: app.config.client,
			isDialog:false,//是否弹出
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
			changeAll:function(e) {//批量设置运费
				let allNum = this.getData().allNum,
					data = this.getData().data,
					isPrice = /^[0-9]+.?[0-9]*$/;
				if(allNum&&!isPrice.test(allNum)){
					app.tips('请输入正确的价格','error');
				}else{
					app.confirm('批量设置将会同时修改所有地区的运费',function(){
						app.each(data,function(i,item){
							item.price = allNum;
						});
					});
					this.setData({data:data,allNum:''});
				};
			},
			changeAllFree:function(e) {//批量设置包邮
				let allFree = this.getData().allFree,
					data = this.getData().data,
					isPrice = /^[0-9]+.?[0-9]*$/;
				if(allFree&&!isPrice.test(allFree)){
					app.tips('请输入正确的价格','error');
				}else{
					app.confirm('批量设置将会同时修改所有地区的包邮设置',function(){
						app.each(data,function(i,item){
							item.free = allFree;
						});
					});
					this.setData({data:data,allFree:''});
				};
			},
			changeAllWeight:function(e) {//批量设置首重
				let allWeight = this.getData().allWeight,
					data = this.getData().data,
					isPrice = /^[0-9]+.?[0-9]*$/;
				if(allWeight&&!isPrice.test(allWeight)){
					app.tips('请输入正确的价格','error');
				}else{
					app.confirm('批量设置将会同时修改所有地区的首重设置',function(){
						app.each(data,function(i,item){
							item.weight = allWeight;
						});
					});
					this.setData({data:data,allWeight:''});
				};
			},
			changeConWeight:function(e) {//批量设置续重
				let allConWeight = this.getData().allConWeight,
					data = this.getData().data,
					isPrice = /^[0-9]+.?[0-9]*$/;
				if(allConWeight&&!isPrice.test(allConWeight)){
					app.tips('请输入正确的价格','error');
				}else{
					app.confirm('批量设置将会同时修改所有地区的续重设置',function(){
						app.each(data,function(i,item){
							item.conweight = allConWeight;
						});
					});
					this.setData({data:data,allConWeight:''});
				};
			},
			changeInput:function(e) {
				let index = Number(app.eData(e).index),
					type = app.eData(e).type,
					data = this.getData().data;
				data[index][type] = app.eValue(e);
			},
			load: function() {
				let _this = this,
					id = this.getData().form.id;
				if (_this.getData().myAuthority.setting) {
					app.request('//api/getProvince',{}, function(res){
						if (res&&res.length){
							if(!id){
								app.each(res,function(i,item){
									item.price='';
									item.free='';
									item.weight='';
									item.conweight='';
								});
								_this.setData({
									data: res
								});
							}else{
								app.request('//shopapi/getFreightDetail',{id:id},function(backData){
									app.each(res,function(i,item){
										item.price=(backData.area&&backData.area[item.area])?backData.area[item.area]:'';
										item.free=(backData.freearea&&backData.freearea[item.area])?backData.freearea[item.area]:'';
										item.weight=(backData.weightarea&&backData.weightarea[item.area])?backData.weightarea[item.area]:'';
										item.conweight=(backData.conweightarea&&backData.conweightarea[item.area])?backData.conweightarea[item.area]:'';
									});
									_this.setData({
										data:res,
										'form.name':backData.name,
										'form.freeShipping':backData.freeShipping
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
					app.request('//shopapi/deleteFreightSetup',{id:formData.id},function(){
						app.tips('删除成功','success');
						setTimeout(app.navBack, 500);
					});
				});
			},
			submit: function() {
				let _this = this, 
					msg = '',
					formData = this.getData().form,
					isPrice = /^[0-9]+.?[0-9]*$/,
					data = _this.getData().data;
				if(!formData.name){
					msg='请输入模板名称';
				};
				formData.area = {};
				formData.freearea = {};
				formData.weightarea = {};
				formData.conweightarea = {};
				app.each(data,function(i,item){
					if(!item.price){
						item.price = '';	
					};
					if(!item.weight){
						item.weight = '';	
					};
					if(!item.conweight){
						item.conweight = '';	
					};
					if(!item.free){
						item.free = '';	
					};
					if(item.price&&!isPrice.test(item.price)){
						msg=item.area+'的运费填写不正确';
						return false;
					}else if(item.weight&&!isPrice.test(item.weight)){
						msg=item.area+'的首重填写不正确';
						return false;
					}else if(item.conweight&&!isPrice.test(item.conweight)){
						msg=item.area+'的续重填写不正确';
						return false;
					}else if(item.free&&!isPrice.test(item.free)){
						msg=item.area+'的包邮填写不正确';
						return false;
					}else{
						formData.area[item.area] = item.price;
						formData.weightarea[item.area] = item.weight;
						formData.conweightarea[item.area] = item.conweight;
						formData.freearea[item.area] = item.free;
					};
				});
				console.log(app.toJSON(formData));
				if (msg) {
					app.tips(msg, 'error');
				} else {
					app.request('//shopapi/saveFreightSetup', formData, function(){
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