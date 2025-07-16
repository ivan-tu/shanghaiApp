/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'user-info',
        data: {
            systemId: 'user',
            moduleId: 'info',
            data: {},
            options: {},
            settings: {
                uploadPic: true
            },
            language: {},
            form: {
                headpic: '',//头像
                username: '',//昵称
				desctext:'',//个人介绍
				sex:1,//性别
				birthday:'',//生日
				area:'',//地区
				identity:'',//职业
				wxCodePic:'',
            },
			avatarUrl:'',
			birthday:'1990-01-01',
            client: app.config.client,
			showSex:false,
			sexList:['男','女'],
			sexIndex:0,
			defaultPic:'16872518696971749.png',//默认头像
			editUserInfoWX:0,
        },
        methods: {
            onLoad: function(options) {
				let _this = this;
				this.load();
				if(app.config.client=='wx'){
					app.request('//set/get', {type: 'homeSet'}, function (res) {
						let backData = res.data||{};
						let wxVersion = app.config.wxVersion;
						if(backData){
							backData.wxVersion = backData.wxVersion?Number(backData.wxVersion):1;
							if(wxVersion>backData.wxVersion){//如果当前版本大于老版本，就要根据设置来
								_this.setData({
									editUserInfoWX:backData.editUserInfoWX||0,
								});
							}else{
								_this.setData({
									editUserInfoWX:1
								});
							};
						}else{
							_this.setData({
								editUserInfoWX:1
							});
						};
					},function(){
						_this.setData({
							editUserInfoWX:1
						});
					});
				}else{
					this.setData({
						editUserInfoWX:1
					});
				};
            },
            onShow: function() {
            },
            onPullDownRefresh: function() {
                this.load();
                wx.stopPullDownRefresh();
            },
            load: function() {
                let _this = this,
                    options = this.getData().options,
                    client = this.getData().client;
                app.request('//userapi/info', {}, function(res) {
                    _this.setData({
                        form: {
                            headpic:res.headpic||'',
                            username:res.username||'',
							desctext:res.desctext||'',
							sex:(res.sex==1||res.sex==2)?res.sex:'',
							birthday:res.birthday||'',
							area:(res.area&&res.area.length)?res.area:'',
							identity:res.identity||'',
							wxCodePic:res.wxCodePic||'',
                        },
						avatarUrl:res.headpic?app.image.crop(res.headpic,90,90):'',
						showSex:(res.sex==1||res.sex==2)?false:true,
						birthday:res.birthday||'1990-01-01',
						sexIndex: res.sex == 2 ? 1 : 0, // 根据实际性别设置索引
                    });
					setTimeout(function(){
						if (res.headpic&&client!='wx') {
							_this.selectComponent('#uploadPic').reset(res.headpic);
						};
						if(res.wxCodePic){
							_this.selectComponent('#uploadCodePic').reset(res.wxCodePic);
						};
               		}, 300);
                });
            },
			selectSex:function(e){
				this.setData({
					'form.sex':Number(app.eData(e).sex)
				});
			},
			bindSexChange:function(e){
				if(e.detail.value==1){
					this.setData({
						'form.sex':2
					});
				}else{
					this.setData({
						'form.sex':1
					});
				};
			},
			bindRegionChange: function(e) {//地区
                this.setData({ 'form.area': e.detail.value });
            },
            bindDateChange: function(e) {//生日
                this.setData({ 
					'birthday':e.detail.value,
					'form.birthday': e.detail.value 
				});
            },
			onChooseAvatar:function(e){//微信头像
				let _this = this,
					avatarUrl = e.detail.avatarUrl;
				this.setData({
					avatarUrl:avatarUrl
				});
				if(avatarUrl){
					app.uploadFile({
						mimeType:'image',
						file:{path:avatarUrl,key:avatarUrl},
						start:function(res){
						},
						progress:function(res){
						},
						success:function(res){
							if(res.key){
								_this.setData({
									'form.headpic': res.key
								});
							};
						},
						fail:function(){
							_this.setData({
								'form.headpic': avatarUrl
							});
						},
					});
				}else{
					app.tips('出错了','error');
				};
			},
            uploadSuccess: function(e) {//头像
				this.setData({
					'form.headpic': e.detail.src[0]
				});
            },
			uploadCodePic: function(e) {//wxCode
				this.setData({
					'form.wxCodePic': e.detail.src[0]
				});
            },
			getAgeText:function(age){
				if(!age)return;
				let newAge = (age.split('-'))[0],
					ageText = '',
					ageArray = [2010,2000,1990,1980,1970,1960,1950];
				app.each(ageArray,function(i,item){
					if(newAge>=item){
						ageText = (item.toString()).substring(2)+'后';
						return false;
					};
				});
				return ageText;
			},
			submit:function(){
				let _this = this,
					formData = this.getData().form,
					defaultPic = this.getData().defaultPic,
					msg = '';
				if(!formData.headpic||formData.headpic==defaultPic){
					msg = '请上传您的头像';
				}else if(!formData.sex){
					msg = '请选择性别';
				}else if(!formData.username){
					msg = '请输入您的昵称';
				}else if(formData.username.indexOf('hi3')==0){
					_this.setData({'form.username':''});
					msg = '请输入您的昵称';
				}else if(app.getLength(formData.username)>28){
					msg = '昵称太长了';
				}else if(!formData.area.length){
					msg = '请选择城市';
				};
				if(msg){
					app.tips(msg,'error');
				}else{
					let checkInfoData = [formData.username,formData.identity,formData.desctext];
					app.wxSecCheck(checkInfoData,1,function(){
						app.request('//userapi/setting', formData, function(backData) {
							app.tips('提交成功','success');
							app.storage.set('pageReoload',1);
							setTimeout(app.navBack,1500);
						});
					});
				};	
			},
        }
    });
})();