/**
 *模块组件构造器
 */
(function() {
    let app = getApp();
    app.Page({
        pageId: 'user-addAddress',
        data: {
            systemId: 'user',
            moduleId: 'addAddress',
            data: {},
            options: {},
            settings: {},
            language: {},
            form: {
                name: '',
                mobile: '',
                cycletypeid: '',
                area: '',
                address: '',
                sex: '',
                isdefault: 0
            },
            order: 0,
            select: 0,
            edit: false,
            sex: 0,
            sexList: ['先生', '女士'],
            region: [],
			isWX:app.config.client=='wx'||(app.config.client=='web'&&isWeixin),
			addressDetail:'',//待识别的地址
        },
        methods: {
            onLoad: function(options) {
                if (options.id) {
                    this.setData({ 'options.id': options.id, edit: true });
                };
                if (options.order) {
                    this.setData({ order: options.order });
                };
				this.setData({options:options});
                this.load();
            },
            onPullDownRefresh: function() {
                this.load();
                wx.stopPullDownRefresh();
            },
            load: function() {
                let _this = this,
                    options = _this.getData().options;
                if (options.id) {
                    app.request('/user/userapi/getAddressDetail', options, function(res) {
                        //console.log(app.toJSON(res));
                        _this.setData({
                            'form.name': res.name,
                            'form.mobile': res.mobile,
                            'form.address': res.address,
                            sex: res.sex == 1 ? 0 : 1,
                            region: res.area,
                            'form.isdefault': res.isdefault ? true : false
                        });
                    });
                };
            },
			toGetRealAddress:function(){//识别详细地址
				let _this = this,
					addressDetail = this.getData().addressDetail;
				if(addressDetail){
					app.request('//api/getBaiduAddress',{address:addressDetail},function(res){
						console.log(app.toJSON(res));
						if(res.province&&res.city&&res.county){
							_this.setData({
								region:[res.province,res.city,res.county]
							});
						};
						if(res.phonenum){
							_this.setData({'form.mobile':res.phonenum});
						};
						if(res.person){
							_this.setData({'form.name':res.person});
						};
						if(res.detail){
							_this.setData({'form.address':res.detail});
						};
					});
				}else{
					app.tips('请复制完整地址');
				};
			},
            bindRegionChange: function(res) {
                this.setData({
                    region: res.detail.value
                });
            },
            bindSexChange: function(res) {
                this.setData({ sex: res.detail.value });
            },
			selectWX:function(){
				let _this=this,
					selected=function(res){
						console.log(res);
						let form={
							'name': res.userName,
							'mobile': res.telNumber,
							'address': res.detailInfo,
							area: [res.provinceName, res.cityName, res.countryName]
						 };
				 		_this.setData({form:form,region: [res.provinceName,res.cityName,res.countryName]});
					};
				if(app.config.client=='wx'){
					 wx.chooseAddress({
						 success:function(res) {
		   					res.countryName = res.countyName;
							selected(res);
						 }
					 });
				}else{
					wx.setWxConfig(['openAddress'], function() {
						wx.openAddress({
							success: function (res) {
								 selected(res);
							}
						});
					});
				}
			},
            submit: function(e) {
                let form = this.getData().form,
                    options = this.getData().options,
                    order = this.getData().order,
                    edit = this.getData().edit,
                    sex = this.getData().sex,
					isMobile = /^0?1[2|3|4|5|6|7|8|9][0-9]\d{8}$/,
                    region = this.getData().region;
                if (!form.name) {
                    app.tips('请输入收货人姓名');
                } else if (!isMobile.test(form.mobile)) {
                    app.tips('请输入正确的手机号');
                } else if (!region.length) {
                    app.tips('请选择地区');
                } else if (!form.mobile) {
                    app.tips('请输入详细地址');
                } else {
                    form.area = region;
                    form.sex = sex ? 2 : 1;
                    form.isdefault = form.isdefault ? 1 : 0;
					console.log(app.toJSON(form));
                    if (edit) {
                        if (options.id) {
                            form.id = options.id;
                        };
                        app.request('/user/userapi/updateUserAddress', form, function(res) {
                            app.tips('编辑成功');
                            app.dialogSuccess({ data: '1' });
                        });
                    } else {
                        app.request('/user/userapi/addUserAddress', form, function(res) {
                            app.tips('添加成功');
                            if (order&&options.dialogPage) {
                                app.dialogSuccess(res);
                            } else {
                                app.navBack(1);
                            };
                        });
                    };
                };
            }
        }
    });
})();