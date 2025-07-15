/*!
 * xz-app.js v2.0.1-beta.0
 * (c) 2018-20@2 Sean lee
 */

(function(global, $) {

    let app = global.getApp(),
        appActions = ['previewImage', 'upload', 'share', 'pay', 'showModal','showToast', 'showActionSheet', 'navigateBack', 'setNavigationBarTitle', 'setTabBarBadge', 'removeTabBarBadge', 'showTabBarRedDot', 'hideTabBarRedDot', 'setTabBarStyle', 'setTabBarItem', 'showTabBar', 'hideTabBar', 'switchTab', 'reLaunch'];

    xzApp.init(app);

    /**
     *扩展wxapi
     */
    $.extend(wx, {

        app: {

            /**
             *app原生框架调用js事件
             */

            on: {

                //重载页面
                reload() {
                    window.location.reload();
                },

                //设置页面数据
                setData(data, callback) {
										currentPage.page.pageXzp.setData(data);
                },
								
								//监听页面隐藏
								pageHide(){
									  currentPage.page.pageXzp.onHide();
								},
								
								//监听页面显示
								pageShow(){
									  currentPage.page.pageXzp.onShow();
								},
								
								//监听页面卸载
								pageUnload(){
									  currentPage.page.pageXzp.onUnload();
								},
								
								//监听用户下拉动作
								pagePullDownRefresh(){
									  currentPage.page.pageXzp.onPullDownRefresh();
								},
                               //监听用户上拉动作
                                onReachBottom() {
                                     currentPage.page.pageXzp.onReachBottom();
                                },

                dialogBridge(data) {
                    if (typeof app.dialogSuccess == 'function') {
                        app.dialogOnSuccess(data);
                    }
                },

                uploadFile(res) {
                    let obj = app.app.uploadCall;
                    if (res.key) {
                        obj.success({
                            key: res.key
                        });
                    } else {
                        obj.progress({
                            percent: res.progress
                        });
                    }
                },
								
								pageTrigger(obj,success){
									 if(obj.action&&typeof currentPage.page.pageXzp[obj.action]=='function'){
										 currentPage.page.pageXzp[obj.action](obj.data,success);
									 }
								}
            }
        },

        /**
         *请求数据
         */

        request(obj) {
			if(obj.data&&typeof obj.data == 'string'){
				obj.data = JSON.parse(obj.data);
			}else{
				obj.data = {};
			};
            wx.app.call('request', {
                success: obj.success,
                fail: obj.fail,
                complete: obj.complete,
                data: {
                    header: obj.header,
                    data: obj.data,
					url:obj.url
                }
            });
        },

        /**
         *新开链接页面
         */

        navigateTo(obj) {
            obj.data = xzSystem.getFullUrl(obj.url);
            delete obj.url;
            wx.app.call('navigateTo', obj);
        },

        /**
         *跳转链接页面
         */

        redirectTo(obj) {
            xzSystem.loadPage(obj.url);
        },

    });

    /**
     *扩展app的app客户端事件
     */
    app.app = {
				
				/**
         *关闭弹窗
         */
        saveImage(obj) {
            wx.app.call('saveImage',{success:obj.success,data:{filePath:obj.filePath},fail:obj.fail});
        },
				
        dialog(obj, page) {
            let options = app.extend(true, {
                title: '',
                url: '',
                success: app.noop,
                fail: app.noop,
                complete: app.noop
            }, obj);
            app.dialogOnSuccess = options.success;
            app.navTo(options.url);
        },

        /**
         *与上一个页面通讯
         */
        dialogBridge(data) {
            wx.app.call('dialogBridge', { data: data });
        },

        /**
         *关闭弹窗
         */
        dialogSuccess() {
            wx.app.call('navigateBack');
        },

        /**
         *微信登录
         */
        weixinLogin(obj) {
            wx.app.call('weixinLogin', {
                success: function(res) {
                    app.gData.weixinLoginData = res;
                    res.needBindAccount = app.config.needBindAccount;
                    app.request('/user/userapi/weixinLoginApp', res, function(backData) {
                        if (backData.type) {
                            switch (backData.type) {
                                case 'bindAccount':
                                    xzSystem.loadPage('../../user/bindAccount/bindAccount');
                                    break;
                                case 'userSession':
                                    app.setUserSession({
                                        userSession: backData.value,
                                        pocode: backData.pocode
                                    });
                                    if (app.userLoginSuccess) {
                                        app.userLoginSuccess();
                                    } else {
                                        xzSystem.loadPage('../../user/userCenter/userCenter');
                                    };
                                    break;
                                case 'nickName':
                                    app.trigger(obj.success, backData.value);
                                    break;
                            }
                        };
                    });
                }
            });
        },

        /**
         *支付
         */

        pay(obj) {

            app.dialog({
                url: '../../finance/pay/pay?payNum=' + obj.payOrderNum,
                success: obj.success
            });




        },

        /**
         * 分享
         */
        share(obj) {
            if (!obj) return;

            let shareEl = obj.shareEl;
            shareEl.delegate('.xzui-share_bar', 'click', function(e) {
                    e.preventDefault();

                    let role = $(this).attr('role');
					if(role=='saveImage'){
						if(obj.img){
							app.saveImage({
								filePath:obj.img,
								success: function() {
									app.tips('保存成功','sccess');
								}
							});
						}else{
							app.tips('没有可保存的图片','error');
						};
						shareEl.removeClass('show');
						setTimeout(function() {
							shareEl.remove();
						}, 300);
					}else{
						wx.app.call('share', {
							data: {
								type: role,
								pagePath:obj.pagePath,
								shareType:obj.shareType,
								title: obj.title,
								content: obj.content || '',
								url: obj.path,
								img: obj.img
							}
						});
					};
                })
                .delegate('.xzui-share_cancel', 'click', function(e) {
                    shareEl.removeClass('show');
                    setTimeout(function() {
                        shareEl.remove();
                    }, 300);
                });
        },

        /**
         * 上传
         */
        chooseFile(obj) {
            wx.app.call('chooseFile', {
                data: obj,
                success: function(res) {
                    let files = res;
                    if (files.length > obj.count) {
                        obj.fail({ errMsg: 'max_files_error' });
                        obj.complete();
                    } else {
                        obj.success(files);
                        obj.complete();
                    };
                }
            })
        },

        /**
         * 上传
         */
        uploadFile(obj) {

            let start = function() {
                if (app.config.uptoken) {
                    if (app.config.uploadFileType[obj.mimeType]) {
                        obj.mimeType = app.config.uploadFileType[obj.mimeType];
                    };
                    app.app.uploadCall = obj;
                   
                    wx.app.call('uploadFile', {
                        data: {
                            token: app.config.uptoken,
                            nameIndex: obj.file.name,
                            type:obj.file.type
                        }
                    });


                } else {
                    app.request('//upload/uptoken', function(backData) {
                        app.config.uptoken = backData;
                        start();
                    });
                }
            };

            if (obj.file) {
                start();
            };


        },
        uploadCall: ''

    };

    /**
     *将部分wxapi定向到app
     */
    $.each(appActions, function(i, item) {
        wx[item] = function(obj) {
            try {
                if (obj && obj.url && !obj.data) {
                    obj.data = obj.url;
                } else if (!obj.data) {
                    let data = {};
                    app.each(obj, function(key, value) {
                        if (key != 'success' && key != 'fail') {
                            data[key] = value;
                            delete obj[key];
                        }
                    });
                    obj.data = data;
                };
                wx.app.call(item, obj);
            } catch (e) {

            }
        };
    });

})(this, jQuery);
