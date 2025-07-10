/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'suboffice-officeUserAdd',
        data: {
            systemId: 'suboffice',
            moduleId: 'officeUserAdd',
            data: {},
            options: {},
            settings: {},
            form: {
				account:'',
				parentAccount:'',
				levelid:'',
				date:'',
				summary:'',
				userid:'',
				parentuid:'',
			},
			isUserLogin:app.checkUser(),
			client:app.config.client,
			levelList:[],
			date:app.getNowDate(365),
			userInfo:{},
			parentInfo:{},
        },
        methods: {
            onLoad: function(options) {
				let _this = this;
				this.setData({
					options:options
				});
				//获取会员等级
				app.request('//clubapi/getClubsLevel',{clubid:options.clubid,sort:'taix'},function(res){
					if(res&&res.length){
						_this.setData({
							levelList:res
						});
					}else{
						_this.setData({
							levelList:[]
						});
					};
				});
				//获取个人资料
				app.request('//userapi/info', {}, function(res) {
					if(res._id){
						_this.setData({
							parentInfo:res,
							'form.parentAccount':res.account,
							'form.parentuid':res._id,
						});
					};
				});
            },
			onShow:function(){
				let _this = this;
				app.checkUser(function(){
					_this.setData({
						isUserLogin: true
					});
					_this.load();
				});
			},
            onPullDownRefresh: function() {
				if(app.checkUser()){
					this.load();
				};
                wx.stopPullDownRefresh();
            },
            load: function() {
            },
			submit:function(){
				let _this = this,
					options = this.getData().options,
					formData = this.getData().form,
					msg = '';
				if(!formData.userid){
					msg ='请验证账号';
				}else if(!formData.parentuid){
					msg ='请验证推荐人';
				}else if(!formData.levelid){
					msg ='请选择会员等级';
				};
				if(msg){
					app.tips(msg,'error');
				}else{
					console.log(app.toJSON(formData));
					let requestData = {
						clubid:options.clubid,
						userid:formData.userid,
						levelid:formData.levelid,
						date:formData.date,
						parentuid:formData.parentuid,
						summary:formData.summary,
					};
					app.request('//clubapi/addClubUser',requestData,function(){
						app.tips('添加成功','success');
						_this.setData({
							'form.account':'',
							'form.summary':'',
							'form.userid':'',
							userInfo:{},
						});
					});
				};
			},
			selectThis:function(e){
				let formData = this.getData().form,
					value = app.eData(e).value,
					type = app.eData(e).type;
				formData[type] = value;
				this.setData({form:formData});
			},
			bindTimeChange:function(e){
				this.setData({
					date:e.detail.value,
					'form.date': e.detail.value
				});
			},
			checkAccount:function(account,callback){
				let _this = this;
				if(!account){
					app.tips('请输入账号','error');
				}else{
					app.request('//userapi/getInfoByAccount',{account:account},function(res){
						if(res&&res._id){
							res.headpic = app.image.crop(res.headpic,60,60);
							if(typeof callback == 'function'){
								callback(res);
							};
						}else{
							app.tips('用户不存在','error');
						};
					});
				};
			},
			checkThisUser:function(){
				let _this = this,
					formData = this.getData().form;
				this.checkAccount(formData.account,function(req){
					_this.setData({
						userInfo:req,
						'form.userid':req._id,
					});
				});
			},
			checkThisParent:function(){
				let _this = this,
					formData = this.getData().form;
				this.checkAccount(formData.parentAccount,function(req){
					_this.setData({
						parentInfo:req,
						'form.parentuid':req._id,
					})
				});
			},
        }
    });
})();