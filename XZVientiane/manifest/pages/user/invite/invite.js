/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'user-invite',
        data: {
            systemId: 'user',
            moduleId: 'invite',
            data:{
				invite:0,
				member:0,
			},
            options: {},
            settings: {},
            form: {},
			client:app.config.client,
			isUserLogin: app.checkUser(),
			sharePicDialog:{
				show:true,
				height:400
			},
			content:'',
        },
        methods: {
            onLoad: function(options) {
				//设置分享参数
				let _this = this,
					newData = app.extend({}, options);
				newData = app.extend(newData, {
					pocode: app.storage.get('pocode')
				});
				let pathUrl = app.mixURL('/p/home/index/index', newData), 
					sharePic = 'https://statics.tuiya.cc/17333689747996230.jpg',
					shareData = {
						shareData: {
							title: '快来一起入局，出门入局，乐在局中。',  
							content: '在局活动社交平台',
							path: 'https://' + app.config.domain + pathUrl,
							pagePath: pathUrl,
							img: sharePic,
							imageUrl: sharePic,
							weixinH5Image: sharePic,
							wxid: 'gh_601692a29862',
							showMini: false,
							hideCopy: app.config.client=='wx'?true:false,
						},
					}, 
					reSetData = function() {
						setTimeout(function() {
							if (_this.selectComponent('#newShareCon')) {
								_this.selectComponent('#newShareCon').reSetData(shareData)
							} else {
								reSetData();
							}
						}, 500)
					};
				reSetData();
            },
            onPullDownRefresh: function() {
                this.load();
                wx.stopPullDownRefresh();
            },
			onShow:function(){
				let _this = this;
				app.checkUser(function() {
					_this.setData({
						isUserLogin: true
					});
					_this.load();
				});
			},
            load: function() {
				let _this = this;
				app.request('/admin/admin/getArticleInfo',{customId:'inviteRule'},function(res){
					let content = app.parseHtmlData(res.content);
					_this.setData({content:content});
				});
				app.request('//userapi/getRecommendStatics',{},function(res){
					_this.setData({data:res})
				});
            },
			getSharePic:function(){
				let _this = this,
					data = this.getData().data;
				if(data.level>0){
					if(app.config.client=='wx'){
						app.navTo('../../home/webview/webview?url=https://' + app.config.domain + '/p/user/getSharePic/getSharePic&type=home');
					}else{
						app.navTo('../../user/getSharePic/getSharePic?type=home&client=web');
					};
				}else{
					app.confirm({
						content:'你还不是会员，不能邀请',
						confirmText:'升级会员',
						success:function(req){
							if(req.confirm){
								app.navTo('../../user/upGrade/upGrade');
							};
						},
					});
				};
			},
			toShare:function(){
				let _this = this,
					data = this.getData().data;
				if(data.level>0){
					this.selectComponent('#newShareCon').openShare();
				}else{
					app.confirm({
						content:'你还不是会员，不能邀请',
						confirmText:'升级会员',
						success:function(req){
							if(req.confirm){
								app.navTo('../../user/upGrade/upGrade');
							};
						},
					});
				};
			},
			onShareAppMessage: function () {
				return app.shareData;
			},
			onShareTimeline: function () {
				let data = app.urlToJson(app.shareData.pagePath),
					shareData = {
						title: app.shareData.title,
						query: 'scene=' + data.pocode,
						imageUrl: app.shareData.imageUrl
					};
				return shareData;
			},
			toHideDialog:function(){
				this.setData({'sharePicDialog.show':false});
			},
        }
    });
})();