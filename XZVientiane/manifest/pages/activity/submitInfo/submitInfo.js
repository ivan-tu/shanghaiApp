(function () {
	let app = getApp();
	app.Page({
		pageId: 'activity-submitInfo',
		data: {
			systemId: 'suboffice',
			moduleId: 'submitInfo',
			isUserLogin: app.checkUser(),
			data:[],
			options: {},
			settings: {},
			language: {},
			form: {
				idcardFront:'',//身份证证明
				idcardBack:'',//身份证反面
			},
			activityDetail:{},
			ajaxLoading:true,
		},
		methods: {
			onLoad: function (options) {
				let _this = this;
				this.setData({
					options: options
				});
				this.load();
			},
			onShow: function () {
				let isUserLogin = app.checkUser();
				if (isUserLogin != this.getData().isUserLogin) {
					this.setData({
						isUserLogin: isUserLogin
					});
					if (isUserLogin) {
						this.load()
					}
				};
			},
			onPullDownRefresh: function () {
				wx.stopPullDownRefresh()
			},
			load: function () {
				let _this = this,
					options = this.getData().options;
				if (options.id) {
					app.request('//activityapi/getActivityDetail', {id: options.id}, function (res) {
						if(res.collectList&&res.collectList.length){
							app.each(res.collectList,function(i,item){
								item.formData = '';
							});
						};
						_this.setData({
							activityDetail:res,
							data:res.collectList,
							ajaxLoading:false,
						});
					});
				};
			},
			switchThis: function (e) {
				let index = Number(app.eData(e).index),
					data = this.getData().data;
				data[index].formData = data[index].formData==1?0:1;
				this.setData({
					data:data
				});
			},
			selectThis:function(e){
				let index = Number(app.eData(e).index),
					value = app.eData(e).value,
					data = this.getData().data;
				data[index].formData = value;
				this.setData({
					data:data
				});
			},
			changeInput:function(e){
				let index = Number(app.eData(e).index),
					value = app.eValue(e),
					data = this.getData().data;
				data[index].formData = value;
				this.setData({
					data:data
				});
			},
			uploadIdCard_a:function(e){
				this.setData({
					'form.idcardFront': e.detail.src[0]
				});
			},
			uploadIdCard_b:function(e){
				this.setData({
					'form.idcardBack': e.detail.src[0]
				});
			},
			bindAreaChange:function(e){
				this.setData({
					'form.area': e.detail.value
				});
			},
			uploadPic:function(e){
				let index = Number(e.detail.index),
					data = this.getData().data;
				data[index].formData = value;
				this.setData({
					data:data
				});
			},
			submit: function () {
				let _this = this,
					options = this.getData().options,
					isPhone = /^0?1[2|3|4|5|6|7|8|9][0-9]\d{8}$/,
					isCard = /^[1-9]\d{5}(18|19|20|(3\d))\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
					formData = this.getData().form,
					data = this.getData().data,
					activityDetail = this.getData().activityDetail,
					msg = '';
				app.each(data,function(i,item){
					if(item.value&&item.id=='idcard'&&item.formData&&!isCard.test(item.formData)){
						msg = '请输入正确的身份证号码';
					};
					if(item.value&&item.id=='mobile'&&item.formData&&!isPhone.test(item.formData)){
						msg = '请输入正确的手机号码';
					};
					if(item.value&&item.type=='cardpic'){
						if(item.value==2&&(!formData.idcardFront||!formData.idcardBack)){
							msg = '请上传身份证照片';
						};
						item.formData = [formData.idcardFront,formData.idcardBack];
					};
					if(item.value==2&&!item.formData){//必填
						if(item.type=='radio'){
							msg = '请选择'+item.title;
						}else if(item.type=='pic'&&!item.formData){
							msg = '请上传'+item.title;
						}else if(item.type!='cardpic'){
							msg = '请输入'+item.title;
						};
					};
					if(msg){
						return false;
					};
				});
				console.log(app.toJSON(data));
				if(msg){
					app.tips(msg, 'error');
				}else{
					let requestData = [];
					app.each(data,function(i,item){
						if(item.value){
							requestData.push(item);
						};
					});
					app.request('//activityapi/saveActivityJoininfo',{id:options.id,info:requestData},function(){
						app.tips('提交成功','success');
						setTimeout(app.navBack,1000);
					});
				};
			},
		}
	})
})();