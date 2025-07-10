/*!
 * xz-web.js v2.0.1-beta.0
 * (c) 2018-20@2 Sean lee
 */
(function(global, $) {

    let app = global.getApp();

    xzApp.init(app);

    /**
     *扩展wxapi
     */

    $.extend(wx, {

        /**
         *请求数据
         */

        request(obj) {
            $.ajax({
                type: obj.method,
                dataType: 'json',
                url: obj.url,
                data: obj.data,
                success: function(res) {
                    app.trigger(obj.success, { data: res });
                },
                error: obj.fail || $.noop,
                complete: obj.complete || $.noop,
                beforeSend: function(xhr) {
                    for (key in obj.header) {
                        xhr.setRequestHeader(key, obj.header[key]);
                    };
                }
            });
        },

        /**
         *跳转链接
         */

        navigateTo(obj) {
						if(isWeixin){
							window.location.href=obj.url;
						}else{
            	history.pushState({}, '', obj.url);
            	global.xzSystem.loadPage(window.location.href);
						};
        },

        /**
         *返回上一个页面
         */
        navigateBack(obj) {
            obj = app.extend({ delta: 1 }, obj);
            $('div.page.active').remove();
            window.history.go(-obj.delta);

        },

        /**
         *跳转链接
         */

        redirectTo(obj) {
            xzSystem.loadPage(obj.url);
        },

        /**
         *跳转链接
         */

        switchTab(obj) {
            this.navigateTo(obj);
        },

        /**
         *跳转链接
         */

        reLaunch(obj) {
            this.navigateTo(obj);
        },

        /**
         *动态设置当前页面的标题
         */
        setNavigationBarTitle(obj) {
            if (app.web.dialogEl.length) {
                app.web.dialogEl[app.web.dialogEl.length - 1].setTitle(obj);
            } else {
								$(document).attr('title',obj.title);
                xzSystem.setPageTitle(obj);
            };
        },

        /**
         *显示模态弹窗
         */
        showModal(obj) {
            let options = app.extend(true, {
                title: '',
                content: '',
                showCancel: true,
                cancelText: app.language.cancel,
                cancelColor: '',
                confirmText: app.language.confirm,
                confirmColor: '',
                success: app.noop,
                fail: app.noop,
                complete: app.noop
            }, obj);

            let maskEl = xzSystem.getMaskEl();
            let html = '<div class="xzui-modal" style="z-index:' + xzSystem.getTopIndex() + ';">';

            if (options.title) {
                html += '<div class="xzui-modal_head">\
                            <p class="xzui-modal_title">' + options.title + '</p>\
                        </div>';
            };
            if (options.content) {
                html += '<div class="xzui-modal_body">\
                            <div class="xzui-modal_main">\
                                    <div style="word-break: break-all;">' + options.content + '</div>\
                            </div>\
                    </div>';
            };

            html += '<div class="xzui-modal_foot">\
                            <div class="xzui-modal_btnBox">'

            if (options.showCancel) {
                html += '<button class="xzui-btn cancel xzui-modal_btn" type="default" role="cancel"';
                if (options.cancelColor) {
                    html += 'style="color:' + options.cancelColor + ';"';
                };
                html += '>' + options.cancelText + '</button>';
            };

            html += '<button class="xzui-btn confirm xzui-modal_btn" type="primary" role="confirm"';
            if (options.confirmColor) {
                html += 'style="color:' + options.confirmColor + ';"';
            };
            html += '>' + options.confirmText + '</button>\
                            </div></div></div>';

            maskEl.appendTo('body');
            let modalEl = $(html).appendTo('body');

            modalEl.delegate('button', 'click', function() {
                let backData = {},
                    role = $(this).attr('role');
                backData[role] = true;
                maskEl.removeClass('show');
                modalEl.removeClass('show');
                setTimeout(function() {
                    maskEl.remove();
                    modalEl.remove();
                    app.trigger(options.success, backData);
                    app.trigger(options.complete);
                }, 300);
            });

            setTimeout(function() {
                maskEl.addClass('show');
                modalEl.addClass('show');
            }, 50);

        },

        /**
         *显示操作菜单
         */
        showActionSheet(obj) {
            let options = app.extend(true, {
                itemList: '',
                itemColor: '',
                cancelText: app.language.cancel,
                success: app.noop,
                fail: app.noop,
                complete: app.noop
            }, obj);

            if (options.itemList.length) {
                let maskEl = xzSystem.getMaskEl();
                let html = '<div class="xzui-menu" style="z-index:' + xzSystem.getTopIndex() + ';">\
                            <div class="xzui-menu_body">\
                                    <div class="xzui-menu_main">\
                                            <ul class="xzui-menu_list">';

                $.each(options.itemList, function(i, item) {
                    if (i < 6) {
                        html += '<li class="xzui-menu_item" data-index="' + i + '"';
                        if (options.itemColor) {
                            html += 'style="color:' + options.itemColor + ';"';
                        };
                        html += '><span class="xzui-menu_item_t">' + item + '</span></li>';
                    };
                });

                html += '</ul>\
                                    </div>\
                                </div>\
                                <div class="xzui-menu_foot">\
                                        <div class="xzui-menu_btnBox">\
                                                <button class="xzui-btn xzui-menu_btn" type="default" role="cancel">' + options.cancelText + '</button>\
                                        </div>\
                                </div>\
                        </div>';

                maskEl.appendTo('body');
                let sheetEl = $(html).appendTo('body'),
                    callback = function(obj) {
                        maskEl.removeClass('show');
                        sheetEl.removeClass('show');
                        setTimeout(function() {
                            maskEl.remove();
                            sheetEl.remove();
                            app.trigger(options.success, obj);
                            app.trigger(options.complete);
                        }, 300);
                    };

                sheetEl.delegate('button', 'click', function() {
                    let role = $(this).attr('role');
                    if (role == 'cancel') {
                        callback({ errMsg: 'showActionSheet:fail cancel' });
                    }
                }).delegate('li', 'click', function() {
                    callback({ tapIndex: $(this).data('index') });
                });

                maskEl.click(function() {
                    callback({ errMsg: 'showActionSheet:fail cancel' });
                });

                setTimeout(function() {
                    maskEl.addClass('show');
                    sheetEl.addClass('show');
                }, 50);
            } else {
                app.trigger(options.fail, { errMsg: 'nothing' });
                app.trigger(options.complete);
            };
        },

        /**
         *为 tabBar 某一项的右上角添加文本
         */

        setTabBarBadge(obj) {
            let options = $.extend(true, {
                success: $.noop,
                fail: $.noop,
                complete: $.noop
            }, obj);
            if (options.index == undefined) {
                options.fail({ errMsg: 'index is undefined' });
            } else if (options.text == undefined) {
                options.fail({ errMsg: 'text is undefined' });
            } else {
                options.success();
            };
            options.complete();
        },

        /**
         *预览图片
         */

        previewImage(obj) {
            if (!obj) return;

            let windowWidth = app.system.windowWidth,
                listWidth = windowWidth * obj.urls.length,
                current = obj.current,
                iLeft = 0;

            let previewEl = $('<div class="xzui-gallery"><div class="xzui-gallery_wrap"><div class="xzui-gallery_list" style="width:' + listWidth + 'px;"></div></div></div>'),
                list = $('.xzui-gallery_list', previewEl);

            app.each(obj.urls, function(i, item) {
                if (current && item == current) {
                    iLeft = i * windowWidth;
                };
                $('.xzui-gallery_list', previewEl).append('<span class="xzui-gallery__img" style="background-image: url(' + item + ');width:' + windowWidth + 'px;left:' + (i * windowWidth) + 'px"></span>');
            });

            list.css({
                left: '-' + iLeft + 'px'
            }).data('left', '-' + iLeft);
            previewEl.appendTo('body');
            setTimeout(function() {
                previewEl.addClass('show');
                $('body,html').addClass('noScroll');
            }, 50);

            let start, delta, lastX, firstX, status, move = false;
            previewEl.delegate('.xzui-gallery__img', 'click', function() {
                hidePreview();
            });

            function hidePreview() {
                if (move) return;
                previewEl.removeClass('show');
                $('body,html').removeClass('noScroll');
                setTimeout(function() {
                    previewEl.remove();
                }, 300);
            };


            //鼠标拖拽事件
            list.bind('mousedown', function(e) {
                e.stopPropagation();
                status = true;
                move = false;
                let $this = $(this);

                firstX = Number($this.data('left'));
                start = {
                    x: e.clientX,
                    y: e.clientY
                };
                mousestart(e);
            });

            function mousestart(e) {
                if (e.button == 0) {
                    list.bind('mousemove', function(e) {
                        e.stopPropagation();

                        delta = {
                            x: e.clientX - start.x,
                            y: e.clientY - start.y
                        };

                        if (Math.abs(delta.y) > 30) {
                            hidePreview();
                        };
                        if (status) {
                            let $this = $(this);

                            if (Math.abs(delta.x) > 10) {
                                move = true;
                                let newLeft = firstX + delta.x;
                                $this.css({ left: newLeft + "px" });

                                if (Math.abs(delta.x) >= 50) {
                                    status = false;
                                };
                            };
                        };
                        return false;
                    });
                    list.bind('mouseup', function(e) {
                        e.stopPropagation();

                        let diffX = e.clientX - start.x,
                            $this = $(this);

                        if (diffX < -10) {
                            if (Math.abs(firstX) >= (listWidth - windowWidth)) {
                                firstX = '-' + (listWidth - windowWidth);
                            } else {
                                firstX -= windowWidth;
                            };
                        } else if (diffX > 10) {
                            if (firstX == 0) {
                                firstX = 0;
                            } else {
                                firstX += windowWidth;
                            };
                        };
                        $this.css({ left: firstX + "px" }).data('left', firstX);
                        mousestop();
                        return false;
                    });
                };
                return false;
            };

            function mousestop(e) {
                list.unbind("mousemove");
                list.unbind("mouseup");
            };



            //触摸事件
            list[0].addEventListener('touchstart', function(e) {
                e.stopPropagation();
                status = true;
                let touches = event.touches[0],
                    $this = $(this);

                firstX = Number($this.data('left'));
                lastX = e.changedTouches[0].pageX;
                start = {
                    x: touches.pageX,
                    y: touches.pageY
                };
            });
            list[0].addEventListener('touchmove', function(e) {
                e.stopPropagation();

                let touches = event.touches[0];
                delta = {
                    x: touches.pageX - start.x,
                    y: touches.pageY - start.y
                };

                if (Math.abs(delta.y) > 30) {
                    hidePreview();
                };
                if (status) {
                    let $this = $(this);

                    if (Math.abs(delta.x) > 10) {
                        let newLeft = firstX + delta.x;
                        $this.css({ left: newLeft + "px" });

                        if (Math.abs(delta.x) >= 50) {
                            status = false;
                        };
                    };
                };
            });
            list[0].addEventListener('touchend', function(e) {
                e.stopPropagation();

                let diffX = e.changedTouches[0].pageX - lastX,
                    $this = $(this);

                if (diffX < -10) {
                    if (Math.abs(firstX) >= (listWidth - windowWidth)) {
                        firstX = '-' + (listWidth - windowWidth);
                    } else {
                        firstX -= windowWidth;
                    };
                } else if (diffX > 10) {
                    if (firstX == 0) {
                        firstX = 0;
                    } else {
                        firstX += windowWidth;
                    };
                };
                $this.css({ left: firstX + "px" }).data('left', firstX);
            });
        },
				/**
				将页面滚动到目标位置
				{
					scrollTop: 0,
					duration: 300
				}
				*/
				pageScrollTo(obj){
					 if(!obj){
						 obg={
								scrollTop: 0
							}
					 };
					 $(window).scrollTo(obj.scrollTop);
				}

    });

    /**
     *扩展app的web事件
     */
    app.web = {

        dialogPages: [],

        dialogEl: [],

        /**
         *弹出对话框
         */
        dialogBox(obj) {
            let _this = this,
                options = app.extend(true, {
                    title: '',
                    content: '',
                    cancelText: 'x',
                    cancelColor: '',
                    confirmText: app.language.confirm,
                    confirmColor: '',
                    beforeClose: '',
                    side: false,
                    width: '',
                    height: '',
                    showTopBar: true,
                    success: app.noop,
                    fail: app.noop,
                    complete: app.noop
                }, obj);

            let xid = 'xzui-dialog-' + xzSystem.getTopId();
            let maskEl = xzSystem.getMaskEl();
            let html = '<div class="xzui-dialog ' + (options.side ? 'xzui-dialog-side' : '') + '" style="z-index:' + xzSystem.getTopIndex() + ';';

            if (options.width) {
                html += 'width:' + options.width + 'px;';
            };

            if (options.height) {
                html += 'height:' + options.height + 'px;';
            };

            html += '">';
            if (options.showTopBar) {
                html += '<div class="xzui-dialog_head">\
                                    <a href="javascript:;" class="xzui-dialog_close" role="cancel"';
                if (options.cancelColor) {
                    html += 'style="color:' + options.cancelColor + ';"';
                };
                html += '>' + app.stringToIcon(options.cancelText) + '</a>\
                                    <p class="xzui-dialog_title">' + options.title + '</p>';
                /*  html+='<a href="javascript:;" class="xzui-dialog_confirm" role="confirm" ';
                    if(options.confirmColor){
                        html+='style="color:'+options.confirmColor+';"';
                    };              
                    html+='>'+app.stringToIcon(options.confirmText)+'</a>';*/
                html += '</div>';
            };
            html += '<div class="xzui-dialog_body" ' + (options.showTopBar ? '' : 'style="padding-top:0"') + '>\
                                <div class="xzui-dialog_main">\
                                        <div id="' + xid + '">' + options.content + '</div>\
                                </div>\
                        </div>\
                        </div>';

            maskEl.appendTo('body');

            let dialogEl = $(html).appendTo('body');


            dialogEl.delegate('.xzui-dialog_head a[role]', 'click', function() {
                let backData = {},
                    role = $(this).attr('role');
                backData[role] = true;
                dialogEl.close(backData);
            });

            setTimeout(function() {
                maskEl.addClass('show');
                dialogEl.addClass('show');
            }, 50);

            dialogEl.setTitle = function(tbj) {
                dialogEl.find('p.xzui-dialog_title').text(tbj.title);
            };

            dialogEl.hide = function() {
                dialogEl.removeClass('show');
                maskEl.removeClass('show');
            };
            dialogEl.show = function() {
                setTimeout(function() {
                    maskEl.addClass('show');
                    dialogEl.addClass('show');
                }, 50);
            };
            dialogEl.close = function(backData) {

                let fn = function() {
                    dialogEl.hide();
                    setTimeout(function() {
                        maskEl.remove();
                        dialogEl.remove();
                        //app.trigger(options.success,backData);
                        app.trigger(options.complete);


                    }, 300);
                };
                fn();

                /*if ($.isFunction(options.beforeClose)) {
                    options.beforeClose(backData,fn);
                } else {
                    fn();
                };*/
            };

            return dialogEl;

        },

        /**
         *弹出对话框
         */
        dialog(obj, bridgePage) {
            let _this = this,
                options = app.extend(true, {
                    title: '',
                    url: '',
                    cancelText: 'x',
                    cancelColor: '',
                    confirmText: app.language.confirm,
                    confirmColor: '',
                    beforeClose: '',
                    side: false,
                    width: '',
                    height: '',
                    showTopBar: true,
                    success: app.noop,
                    fail: app.noop,
                    complete: app.noop
                }, obj);

            let xid = 'xzui-dialog-' + xzSystem.getTopId();
            let maskEl = xzSystem.getMaskEl();
            let html = '<div class="xzui-dialog ' + (options.side ? 'xzui-dialog-side' : '') + '" style="z-index:' + xzSystem.getTopIndex() + ';';

            if (options.width) {
                html += 'width:' + options.width + 'px;';
            };

            if (options.height) {
                html += 'height:' + options.height + 'px;';
            };

            html += '">';
            if (options.showTopBar) {
                html += '<div class="xzui-dialog_head">\
                                    <a href="javascript:;" class="xzui-dialog_close" role="cancel"';
                if (options.cancelColor) {
                    html += 'style="color:' + options.cancelColor + ';"';
                };
                html += '>' + app.stringToIcon(options.cancelText) + '</a>\
                                    <p class="xzui-dialog_title">' + options.title + '</p>';
                /*  html+='<a href="javascript:;" class="xzui-dialog_confirm" role="confirm" ';
                    if(options.confirmColor){
                        html+='style="color:'+options.confirmColor+';"';
                    };              
                    html+='>'+app.stringToIcon(options.confirmText)+'</a>';*/
                html += '</div>';
            };
            html += '<div class="xzui-dialog_body" ' + (options.showTopBar ? '' : 'style="padding-top:0"') + '>\
                                <div class="xzui-dialog_main">\
                                        <div id="' + xid + '"></div>\
                                </div>\
                        </div>\
                        </div>';

            maskEl.appendTo('body');

            let dialogEl = $(html).appendTo('body');
            let page;

            dialogEl.delegate('.xzui-dialog_head a[role]', 'click', function() {
                let backData = {},
                    role = $(this).attr('role');
                backData[role] = true;
                dialogEl.close(backData);
            });

            setTimeout(function() {
                maskEl.addClass('show');
                dialogEl.addClass('show');
            }, 50);

            dialogEl.setTitle = function(tbj) {
                dialogEl.find('p.xzui-dialog_title').text(tbj.title);
            };

            dialogEl.hide = function() {
                dialogEl.removeClass('show');
                maskEl.removeClass('show');
                page.onHide();
            };
            dialogEl.show = function() {
                setTimeout(function() {
                    maskEl.addClass('show');
                    dialogEl.addClass('show');
                }, 50);
                page.onShow();
            };
            dialogEl.close = function(backData) {

                let fn = function() {
                    dialogEl.hide();
                    setTimeout(function() {
                        page.onUnload();
                        maskEl.remove();
                        dialogEl.remove();
                        //app.trigger(options.success,backData);
                        app.trigger(options.complete);
                        _this.dialogPages.pop();
                        _this.dialogEl.pop();

                    }, 300);
                };
                fn();

                /*if ($.isFunction(options.beforeClose)) {
                    options.beforeClose(backData,fn);
                } else {
                    fn();
                };*/
            };

            xzSystem.loadPage(options.url, '#' + xid, function(p) {
                page = p.page.pageXzp;
                page.onShow();
                let target = dialogEl.find('div.xzui-dialog_main:first');
                xzSystem.reachBottom(target, $('#' + xid), function() {
                    page.onReachBottom();
                });
                target.scroll(function() {
                    page.onPageScroll({ scrollTop: target.scrollTop() });
                });
            });


            bridgePage.dialogSuccess = options.success;
            _this.dialogPages.push(bridgePage);
            _this.dialogEl.push(dialogEl);

            return dialogEl;

        },


        /**
         *对话框通讯事件
         */
        dialogBridge(data) {

            if (this.dialogPages.length > 0) {
                let page = this.dialogPages[this.dialogPages.length - 1];

                if (typeof page.dialogSuccess == 'function') {
                    page.dialogSuccess(data);
                };
            }
        },

        /**
         *返回数据并关闭弹窗
         */

        dialogSuccess() {
            if (this.dialogEl.length) {
                this.dialogEl[this.dialogEl.length - 1].close();
            };
        },

        /**
         *选择文件
         */

        chooseFile(obj) {

            if ($('#selectFileInput').length) {
                $('#selectFileInput').remove();
            };

            if (obj.mimeType && app.config.uploadFileType[obj.mimeType]) {

                obj.mimeType = obj.mimeType + '/*';
            };

            $('<input type="file" id="selectFileInput" ' + (obj.count != 1 ? 'multiple="multiple"' : '') + ' accept="' + obj.mimeType + '" required="required" style="display:none;" />').appendTo('body');
            $('#selectFileInput').change(function() {
                let files = this.files;
                if (files.length > obj.count) {
                    obj.fail({ errMsg: 'max_files_error' });
                    obj.complete();
                } else {
                    obj.success(files);
                    obj.complete();
                };
                $(this).remove();
            }).click();
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
                    let file = obj.file,
                        token = app.config.uptoken,
                        config = {
                            useCdnDomain: true,
                            disableStatisticsReport: true,
                            region: app.config.qiniuRegion && qiniu.region[app.config.qiniuRegion]
                        },
                        putExtra = {
                            fname: file.name,
                            params: {},
                            mimeType: obj.mimeType ? obj.mimeType.split(',') : null
                        },
                        key = (app.getNowRandom() + '.' + file.name.split('.')[file.name.split('.').length - 1]).toLowerCase(),
                        subObject = {
                            next: function(res) {
                                res.total.percent = Math.floor(res.total.percent);
                                console.log(app.toJSON(res.total));
                                obj.progress(res.total);
                            },
                            error: function(err) {
                                if (typeof err == 'object' && err.message) {
                                    if (err.message == 'file type doesn\'t match with what you specify') {
                                        app.alert(app.language.notSupportFileType);
                                    };
                                    err = {
                                        errMsg: err.message
                                    };
                                };
                                obj.fail(err);
                            },
                            complete: function(res) {
                                console.log(app.toJSON(res));
                                obj.success(res);
                            }
                        },
                        observable = qiniu.upload(file, key, token, putExtra, config),
                        subscription = observable.subscribe(subObject);
                    subscription.stop = subscription.unsubscribe;
                    obj.start({
                        task: subscription
                    });
                } else {
                    app.request('//upload/uptoken', function(backData) {
                        app.config.uptoken = backData;
                        start();
                    });
                }
            };

            if (obj.file) {
                if (typeof qiniu == 'undefined') {
                    xzSystem.loadSrc(app.config.staticPath + 'js/utils/qiniu.min.js', function() {
                        start();
                    });
                } else {
                    start();
                };
            }
        },

        /**
         *下载文件
         */

        downloadFile(obj) {
            /*$('<a href="'+obj.filePath+'" download="'+obj.filePath.split('/')[obj.filePath.split('/').length-1]+'" target="_blank">下载文件</a>').appendTo('body').click().remove();*/
            window.open(obj.filePath);
            app.trigger(obj.success);
            app.trigger(obj.complete);
        },

        /**
         *保存图片
         */

        saveImage(obj) {
            this.downloadFile(obj);
        },

        /**
         *微信登录
         */
        weixinLogin(obj) {

            let redirect_uri = encodeURIComponent(app.mixURL(window.location.href, { weixinLogin: 1 })),
                loginSrc = '/index/wxLogin?xzAppId=' + app.config.xzAppId + '&needBindAccount=' + app.config.needBindAccount + '&vcode=' + (app.session.get('vcode') || '') + '&userSession=' + (obj.userSession || '') + '&scan=' + (isWeixin ? 0 : 1) + '&clientKey=' + app.session.get('clientKey') + '&redirect_uri=';

            if (isWeixin) {
                loginSrc += redirect_uri+'&fail_uri='+encodeURIComponent(xzSystem.host + '/p/user/wxSuccess/wxSuccess?fail=1');
				window.location.href = loginSrc;
            } else {
                loginSrc += encodeURIComponent(xzSystem.host + '/p/user/wxSuccess/wxSuccess');
                let complete = false,
                    dialog = app.web.dialogBox({
                        title: app.language.weixinScan,
                        content: '<div style="text-align:center" class="pd20"><img src=/api/qrcode/?data=' + encodeURIComponent(xzSystem.host + loginSrc) + ' width="180" height="180" /></div>',
                        width: 320,
                        height: 300,
                        complete: function() {
                            complete = true;
                        }
                    }),
                    checkWeixinLogin = function() {
                        app.request('/user/userapi/checkWeixinLogin', function(backData) {
                            dialog.close();
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
                                            xzSystem.loadPage(redirect_uri);
                                        };
                                        break;
                                    case 'nickName':
                                        app.trigger(obj.success, backData.value);
                                        break;
                                }
                            };

                        }, function(msg) {
                            if (msg == '1') {
                                app.alert(app.language.weixinExists);
                            };
                            if (!complete) {
                                setTimeout(checkWeixinLogin, 2000);
                            };

                        })
                    };
                setTimeout(checkWeixinLogin, 5000);
            };

        },

        /**
         *支付
         */

        pay(obj) {

            if (!obj.redirect_uri) {
                obj.redirect_uri = app.mixURL(window.location.href, { paySuccess: 1 });
            } else {
                obj.redirect_uri = xzSystem.getFullUrl(obj.redirect_uri);
            };
            obj.redirect_uri = encodeURIComponent(obj.redirect_uri);

            if (isWeixin) {
                app.request(app.config.getPayUrl, {
                    paytype: 'weixin',
                    payNum: obj.payOrderNum,
                    redirect_uri: obj.redirect_uri,
                    client: 'web'
                }, function(backData) {
                    window.location.href = backData;
                });
            } else {
                app.dialog({
                    url: '../../finance/pay/pay?payNum=' + obj.payOrderNum + '&redirect_uri=' + obj.redirect_uri,
                    success: obj.success
                });
            };
        },

        /**
         *分享
         */

        share(obj) {
            if (!obj) return;

            let shareEl = obj.shareEl;
            shareEl.delegate('.xzui-share_bar', 'click', function(e) {
                    let role = $(this).attr('role');

                    switch (role) {
                        case 'weixin':
                            if (isWeixin) {
                                winxinShareFn();
                            } else {
                                eqCodeDialog(true);
                            }
                            break;
                        case 'moments':
                            if (isWeixin) {
                                winxinShareFn();
                            } else {
                                eqCodeDialog(true);
                            }
                            break;
                        case 'weibo':
                            if (isWeixin) {
                                e.preventDefault();
                                winxinShareFn();
                            };
                            break;
                        case 'qq':
                            if (isWeixin) {
                                e.preventDefault();
                                winxinShareFn();
                            };
                            break;
                        case 'qqZone':
                            if (isWeixin) {
                                e.preventDefault();
                                winxinShareFn();
                            };
                            break;
                        case 'qrCode':
                            eqCodeDialog()
                            break;
                        case 'copy':
                            let el = '<textarea class="xzui-textarea" style="line-height:1;height:50px;">' + obj.path + '</textarea>';
                            app.alert(el);
                            break;
						case 'saveImage':
							if(obj.img){
								console.log(obj.img);
								app.saveImage({
									filePath:obj.img,
									success: function() {
										app.tips('保存成功','success');
									}
								});
							}else{
								app.tips('没有可保存的图片','error');
							};
						break;
                    };
                    closeShare();
                })
                .delegate('.xzui-share_cancel', 'click', function(e) {
                    closeShare();
                });

            function closeShare() {
                shareEl.removeClass('show');
                setTimeout(function() {
                    shareEl.remove();
                }, 300);
            };

            function eqCodeDialog(wx) {
                var ewmDialog = (wx ? '<p class="h4 black">请打开微信扫描二维码进行分享</p>' : '') + '<div class="qrcodeBox mt10"><img style="width:200px;" src="' + app.getQrCodeImg(obj.path) + '"/></div>';
                app.alert(ewmDialog);
            };

            function winxinShareFn() {
                var dialogEl ='<div>请点击右上角菜单按钮进行分享</div>';
                app.alert(dialogEl);
            };
        }
    };


    /**
     *页面历史记录更新时处理事件
     */
    $(window).on('popstate', function(e) {
        global.xzSystem.loadPage(window.location.href);
    });


})(this, jQuery);