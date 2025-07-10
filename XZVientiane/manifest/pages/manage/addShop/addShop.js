/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'manage-addShop',
        data: {
            systemId: 'manage',
            moduleId: 'addShop',
            isUserLogin: app.checkUser(),
            data: {},
            options: {},
            settings: {},
            language: {},
            form: {
				clubid:'',
                name: '',
                area: [],
            },
			userInfo:{},
        },
        methods: {
            onLoad: function(options) {
                let _this = this;
                this.setData({
                    options: options,
					'form.clubid':options.clubid,
                });
            },
            onShow: function() {
                //检查用户登录状态
                let _this = this;
                app.checkUser({
                    success: function() {
                        _this.setData({
                            isUserLogin: true
                        });
                        _this.load();
                    }
                });
            },
            onPullDownRefresh: function() {
                wx.stopPullDownRefresh();
            },
            load: function() {
                let _this = this;
            },
            bindAreaChange: function(res) {
                this.setData({
                    'form.area': res.detail.value,
                });
            },
            toAdd: function(e) {
                let _this = this,
                    formData = this.getData().form,
                    msg = '';
				if (!formData.name) {
                    msg = '请输入店铺名称';
                }else if (!formData.area || !formData.area.length) {
                    msg = '请选择所在地';
                };
                if (msg) {
                    app.tips(msg, 'error');
                } else {
                    app.request('//shopapi/applyShop',formData,function(res){
						app.storage.set('pageReoload',1);
						app.confirm({
							content:'恭喜开店成功，前往管理店铺',
							confirmText:'立即前往',
							success:function(req){
								if(req.confirm){
									app.navTo('../../manage/index/index?id='+res.id);
								}else{
									app.navBack();
								};
							},
						})
                    });
                };
            },
        }
    });
})();