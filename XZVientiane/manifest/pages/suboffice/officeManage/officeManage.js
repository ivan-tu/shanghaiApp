/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'suboffice-officeManage',
        data: {
            systemId: 'suboffice',
            moduleId: 'officeManage',
            data: {
				todayTotal:0,
				total:0,
				balance:0,
				diamond:0,
				activity:0,
			},
            options: {},
            settings: {},
            form: {},
			client:app.config.client,
			ajaxLoading:true,
			ajaxNoData:false,
			userInfo:{},
			inviteDialog:{
				show:false,
				height:180,
				freekey:'',
			},
			showSharePic:false,
			picWidth: app.system.windowWidth - 120,
			loadOk:false,
			loadPic:'',
			loadPicUrl:'',
        },
        methods: {
            onLoad: function(options) {
				this.setData({options:options});
				this.load();
            },
			onShow:function(){
				this.load();
			},
            onPullDownRefresh: function() {
				if(app.checkUser()){
					this.load();
				};
                wx.stopPullDownRefresh();
            },
            load: function() {
				let _this = this,
					options = this.getData().options;
				this.setData({ajaxLoading:true});
				app.request('//clubapi/getClubStatics',{clubid:options.id},function(res){
					if(res){
						res.sharePic = app.image.crop(res.pic||'16870792940383251.jpg',480,480);
						res.pic = app.image.crop(res.pic||'16870792940383251.jpg',80,80);
						_this.setData({
							data:res,
							ajaxNoData:false,
						});
					}else{
						_this.setData({ajaxNoData:true});
					};
				},'',function(){
					_this.setData({ajaxLoading:false});
				});
				app.request('//homeapi/getMyInfo',{},function(res){
					_this.setData({userInfo:res});
				});
            },
			toEdit:function(){
				let options = this.getData().options;
				app.navTo('../../suboffice/clubAdd/clubAdd?id='+options.id);
			},
			toActivity:function(){
				let options = this.getData().options;
				app.navTo('../../activity/add/add?clubid='+options.id);
			},
			toFreeInvite:function(){//获取免费邀请key
				let _this = this,
					options = this.getData().options;
				app.request('//clubapi/getFreeJoinKey',{clubid:options.id},function(res){
					if(res){
						_this.setData({
							'inviteDialog.show':true,
							'inviteDialog.freekey':res,
						});
						_this.setShareData();
					};
				});
			},
			toCloseInvite:function(){
				this.setData({
					'inviteDialog.show':false,
					'inviteDialog.freekey':'',
				});
				setTimeout(this.setShareData,2000);
			},
			setShareData:function(){
				let _this = this,
					data = this.getData().data,
					inviteDialog = this.getData().inviteDialog,
					options = this.getData().options,
					newData = {
						id: options.id,
						freekey:inviteDialog.freekey,
						pocode: app.storage.get('pocode')
					};
				let pathUrl = app.mixURL('/p/suboffice/clubDetail/clubDetail', newData),
					shareData = {
						shareData: {
							title: data.name||data.title,
							content: data.slogan||'',
							path: 'https://' + app.config.domain + pathUrl,
							pagePath: pathUrl,
							img: data.sharePic||data.pic,
							imageUrl: data.sharePic||data.pic,
							weixinH5Image: data.sharePic||data.pic,
						}
					},
					reSetData = function () {
						setTimeout(function () {
							if (_this.selectComponent('#newShareCon')) {
								_this.selectComponent('#newShareCon').reSetData(shareData);
							} else {
								reSetData();
							};
						}, 500);
					};
				reSetData();
			},
			toShare:function(){
				this.selectComponent('#newShareCon').openShare();
				this.toCloseInvite();
			},
			onShareAppMessage:function(){
				this.toCloseInvite();
				return app.shareData;
			},
			getSharePic:function(){
				let _this = this,
					options = this.getData().options,
					loadPicUrl = this.getData().loadPicUrl;
				if(!loadPicUrl){
					app.request('//clubapi/getClubSharePic',{clubid:options.id}, function(res) {
						if(res){
							_this.setData({
								loadPic: app.config.filePath + '' + res,
								loadPicUrl: app.image.width(res, _this.getData().picWidth),
								showSharePic:true
							});
						}else{
							app.tips('生成邀请海报失败','error');
						};
					});
				}else{
					this.setData({showSharePic:true});
				};
			},
			loadSuccess: function() {
				this.setData({
				   loadOk: true
				});
			},
			closeSharePic:function(){
				this.setData({showSharePic:false});
			},
			saveImage: function() {
				let loadPic = this.getData().loadPic;
				app.saveImage({
				   filePath: loadPic,
				   success: function() {
					  app.tips('保存成功', 'success');
				   }
				});
			},
        }
    });
})();