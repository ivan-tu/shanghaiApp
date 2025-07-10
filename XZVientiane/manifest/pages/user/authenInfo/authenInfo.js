/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'user-authenInfo',
        data: {
            systemId: 'user',
            moduleId: 'authenInfo',
            data: {},
            options: {},
            settings: {
                uploadPic: true
            },
            language: {},
            form: {
				faceAuthPic:'',
            },
			isUserLogin: app.checkUser(),
			client:app.config.client,
			faceAuthInfo:{
				status:0,//颜值认证状态，0-待提交 1-认证中 2-已有结果，评分足够 3-已有结果，评分不足
			},
        },
        methods: {
            onLoad: function(options) {
				let _this = this;
				app.checkUser(function() {
					_this.setData({
						isUserLogin: true
					});
					_this.load();
				});
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
						data:res,
                        'form.faceAuthPic':res.faceAuthPic||'',
                    });
					if(res.faceBeauty&&res.faceBeauty>=60){
						_this.setData({
							'faceAuthInfo.status':2,
						});
					}else if(res.faceBeauty&&res.faceBeauty<60){
						_this.setData({
							'faceAuthInfo.status':3
						});
					}else{
						_this.setData({
							'faceAuthInfo.status':0
						});
					};
                });
            },
			uploadSuccess: function(e) {//认证照片
				this.setData({
					'form.faceAuthPic': e.detail.src[0]
				});
            },
			reBack:function(){
				app.navBack();
			},
			submitPic:function(){
				let _this = this,
					data = this.getData().data,
					formData = this.getData().form;
				if(!formData.faceAuthPic){
					app.tips('请上传照片','error');
				}else{
					_this.setData({
						'faceAuthInfo.status':1,
						'data.faceAuthTimes':data.faceAuthTimes+1,
					});
					app.request('//userapi/addBaiduFaceAuth', {pic:formData.faceAuthPic}, function(res) {
						if(res.status==1){
							_this.setData({
								'faceAuthInfo.status':2,
								'data.faceBeauty':res.beauty
							});
						}else{
							app.tips('换一张人脸清晰的照片试试','error');
							_this.setData({
								'faceAuthInfo.status':3,
								'data.faceBeauty':res.beauty
							});
						};
					},function(msg){
						app.tips(msg,'error');
						_this.setData({
							'faceAuthInfo.status':0
						});
					});
				};
			},
			reSubmitPic:function(){
				let data = this.getData().data;
				if(data.faceAuthTimes>=10){
					app.tips('验证次数不足','error');
				}else{
					this.setData({
						'data.faceAuthPic':'',
						'faceAuthInfo.status':0
					});
				};
			},
        }
    });
})();