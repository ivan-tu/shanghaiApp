/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'suboffice-officeUserDetailEdit',
        data: {
            systemId: 'suboffice',
            moduleId: 'officeUserDetailEdit',
            data: {},
            options: {},
            settings: {},
            form: {
				content:'',
			},
			client:app.config.client,
			levelList:[],
			date:app.getNowDate(365),
        },
        methods: {
            onLoad: function(options) {
				let _this = this;
				this.setData({
					options:options
				});
				if(options.title){
					app.setPageTitle(options.title);
				};
				if(app.storage.get('clubUserEditData')){
					this.setData({
						form:app.storage.get('clubUserEditData')
					});
				};
				//获取会员等级
				if(options.type=='editLevel'){
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
				};
				this.load();
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
				let options = this.getData().options,
					formData = this.getData().form,
					msg = '';
				if(options.type=='editParent'&&!formData.content){
					msg ='请输入账号';
				}else if(options.type=='editTime'&&!formData.content){
					msg ='请选择日期';
				}else if(options.type=='editLevel'&&!formData.content){
					msg ='请选择等级';
				};
				if(msg){
					app.tips(msg,'error');
				}else{
					app.dialogSuccess(formData);
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
					'form.content': e.detail.value
				});
			},
        }
    });
})();