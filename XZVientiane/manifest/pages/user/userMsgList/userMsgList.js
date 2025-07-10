/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'user-userMsgList',
        data: {
            systemId: 'user',
            moduleId: 'userMsgList',
            data: [],
            options: {},
            settings: {
				bottomLoad:false,
			},
            form: {
				page:1,
				size:10,
			},
			client:app.config.client,
			showLoading:false,
			showNoData:false,
			count:0,
			pageCount:0,
			picWidth:((app.system.windowWidth>480?480:app.system.windowWidth)-40)*0.5,
			picHeight:((app.system.windowWidth>480?480:app.system.windowWidth)-40)*0.5/0.875,
        },
        methods: {
            onLoad: function(options) {
				let _this = this;
				_this.setData({
					options: options
				});
				app.checkUser({
					goLogin: false,
					success: function () {
						_this.setData({
							isUserLogin: true
						});
					}
				});
				this.load();
            },
            onPullDownRefresh: function() {
                this.load();
                wx.stopPullDownRefresh();
            },
            load: function() {
				this.getList();
            },
			getList:function(){
				let _this = this;
				_this.setData({'showLoading':true});
				app.request('//homeapi/getUserLetter',{},function(backData){
					if(backData&&backData.length){
						app.each(backData,function(i,item){
							item.headpic = app.image.crop(item.headpic,60,60);
							item.toheadpic = app.image.crop(item.toheadpic,60,60);
						});
						_this.setData({
							data:backData,
							shoNoData:false,
							count:backData.length,
						});
					}else{
						_this.setData({
							data:[],
							shoNoData:true,
							count:0,
						});
					};
				},'',function(){
					_this.setData({
						'showLoading':false,
					});
				});
			},
			onReachBottom:function(){
				if(this.getData().settings.bottomLoad) {
					let formData = this.getData().form;
					formData.page++;
					this.setData({form:formData});
					this.getList(true);
				};
			},
        }
    });
})();