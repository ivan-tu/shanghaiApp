/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'user-myTeamDetail',
        data: {
            systemId: 'user',
            moduleId: 'myTeamDetail',
            data: {},
            options: {},
            settings: {},
            form: {},
			ajaxLoading:true,
			client:app.config.client,
        },
        methods: {
            onLoad: function(options) {
				this.setData({
					options:options
				});
            },
			onShow:function(){
				this.load();
			},
            onPullDownRefresh: function() {
                this.load();
                wx.stopPullDownRefresh();
            },
            load: function() {
				let _this = this,
					options = this.getData().options;
				this.setData({ajaxLoading:true});
				app.request('//homeapi/getUserDetail',{userid:options.userid},function(res){
					if(res.headpic){
						res.headpic = app.image.crop(res.headpic,80,80);
					};
					if(res.parentInfo&&res.parentInfo.headpic){
						res.parentInfo.headpic = app.image.crop(res.parentInfo.headpic,50,50);
					};
					_this.setData({
						data:res,
						ajaxLoading:false,
					});
				});
            },
			callTel:function(e){
				let tel = app.eData(e).tel;
				if(app.config.client=='wx'){
					wx.makePhoneCall({
						phoneNumber: tel
					});
				};
			},
			copyThis:function(e){
				let tel = app.eData(e).tel;
				if(app.config.client=='wx'){
					wx.setClipboardData({
						data:tel,
						success: function () {
						  app.tips('复制成功', 'success');
						},
					});
				}else if(app.config.client=='app'){
					wx.app.call('copyLink', {
						data: {
							url:tel
						},
						success: function (res) {
							app.tips('复制成功', 'success');
						}
					});
				}else{
					$('body').append('<input class="readonlyInput" value="'+tel+'" id="readonlyInput" readonly />');
					var originInput = document.querySelector('#readonlyInput');
					originInput.select();
					if(document.execCommand('copy')) {
						document.execCommand('copy');
						app.tips('复制成功','error');
					}else{
						app.tips('浏览器不支持，请手动复制','error');
					};
					originInput.remove();
				};
			},
        }
    });
})();