/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'user-upGrade',
        data: {
            systemId: 'user',
            moduleId: 'upGrade',
            data: {
				userData:'',
				setup:[]
			},
            options: {},
            settings: {},
            form: {},
			isUserLogin: app.checkUser(),
			client:app.config.client,
			subofficeName:'',
        },
        methods: {
            onLoad: function(options) {
			},
			onShow: function() {
				let _this = this;
				app.checkUser(function() {
					_this.setData({
						isUserLogin: true
					});
					_this.load();
				});
			},
			onPullDownRefresh: function() {
				if(this.getData().isUserLogin){
					this.load();
				};
				wx.stopPullDownRefresh();
			},
            load: function(){
				let _this = this;
				app.request('//homeapi/getMemberLevelSet',{},function(res){
					_this.setData({data:res});
					if(res.userData.level<1){//不是会员
						app.request('//subofficeapi/getJoinSubofficeDetail',{},function(req){
							if(req.name){
								_this.setData({subofficeName:req.name});
							};
						},function(){
						});
					};
				});
			},
			toBuy:function(e){
				let level = app.eData(e).level;
				app.request('//homeapi/createMemberOrder',{level:level},function(res){
					if(res.ordernum) {
						app.navTo('../../pay/pay/pay?ordertype=' + res.ordertype + '&ordernum=' + res.ordernum + '&total=' + res.paymoney);
					};
				})
			},
			toAuthenInfo:function(){
				app.navTo('../../user/authenInfo/authenInfo');
			},
        }
    });
})();