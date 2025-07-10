/*!
 * xzWX.js v2.0.1-beta.0
 * (c) 2018-20@2 Sean lee
 */

(function(global, $) {

    let app = global.getApp();

    /**
     *定义wxapi
     */
    if (!global.wx) {
        global.wx = {};
    };
    $.extend(wx, {

        /**
         *将页面滚动到目标位置
         */

        pageScrollTo(obj) {
            $(window).scrollTo(obj.scrollTop, obj.duration || 500);
        },

        /**
         *显示 loading 提示框
         */

        showLoading(obj) {
            let options = $.extend(true, {
                title: app.language.loading || 'loading',
                mask: false,
                success: $.noop,
                fail: $.noop,
                complete: $.noop
            }, obj);

            if (app.loadingEl) {
                app.loadingEl.task++;
            } else {
                app.loadingEl = $('<div style="z-index:' + global.xzSystem.getTopIndex() + ';position:absolute;top:0;left:0;width:100%;height:100%"></div>');
                if (options.mask) {
                    global.xzSystem.getMaskEl().appendTo(app.loadingEl);
                };
                $('<div class="xzui-mask_transparent"  style="z-index:' + global.xzSystem.getTopIndex() + '";></div>\
                        <div class="xzui-toast">\
                                <i class="xzicon-loading xzui-icon_toast"></i>\
                                <p class="xzui-toast__content">' + options.title + '</p>\
                        </div>').appendTo(app.loadingEl);
                app.loadingEl.appendTo('body');
                app.loadingEl.task = 1;
            };


        },

        /**
         *隐藏 loading 提示框
         */

        hideLoading() {
            if (app.loadingEl) {
                app.loadingEl.task--;
                if (app.loadingEl.task == 0) {
                    app.loadingEl.remove();
                };
            };
        },

        /**
         *显示消息提示框
         */
        showToast(obj) {
            let options = $.extend(true, {
                title: '',
                icon: 'success',
                mask: false,
                duration: 1500,
                success: $.noop,
                fail: $.noop,
                complete: $.noop
            }, obj);

            if (!options.title) {
                options.fail();
                return;
            };

            if (app.toastEl) {
                app.toastEl.remove();
            };
            app.toastEl = $('<div style="z-index:' + global.xzSystem.getTopIndex() + ';position:absolute;top:0;left:0;width:100%;height:100%"></div>');
            if (options.mask) {
                global.xzSystem.getMaskEl().appendTo(app.toastEl);
            };
            $('<div class="xzui-mask_transparent"  style="z-index:' + global.xzSystem.getTopIndex() + '";></div>\
                        <div class="xzui-toast">' +
                (options.icon == 'none' ? '' : '<i class="xzicon-' + options.icon + ' xzui-icon_toast"></i>') +
                '<p class="xzui-toast__content">' + options.title + '</p>\
                        </div>').appendTo(app.toastEl);
            app.toastEl.appendTo('body');

            setTimeout(function() {
                wx.hideToast();
                options.complete();
            }, options.duration);
        },

        /**
         *显示消息提示框
         */
        hideToast(obj) {
            app.toastEl.remove();
        },


        /**
         *将 data 存储在本地缓存中指定的 key 中
         */
        setStorageSync(key, data) {
            try {
                if (typeof data == 'object') {
                    data = 'json__' + app.toJSON(data);
                };
                localStorage.setItem(key, data);
            } catch (e) {}

        },

        /**
         *从本地缓存中同步获取指定 key 对应的内容
         */
        getStorageSync(key) {
            try {
                let value = localStorage.getItem(key);
                if (value && value.indexOf('json__') == 0) {
                    value = $.parseJSON(value.substr(6));
                };
                return value;
            } catch (e) {}
        },

        /**
         *从本地缓存中同步移除指定 key
         */
        removeStorageSync(key) {
            try {
                localStorage.removeItem(key);
            } catch (e) {}
        },

        /**
         *同步清理本地数据缓存
         */
        clearStorageSync() {
            try {
                localStorage.clear();
            } catch (e) {}
        },

        /**
         *终止下拉
         */
        stopPullDownRefresh() {
            if (isApp) {
                wx.app.call('stopPullDownRefresh');
            }
        },

        /**
         *简洁弹窗
         */
        webDialog(obj) {
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
                    scroll: true,
                    success: app.noop,
                    fail: app.noop,
                    complete: app.noop
                }, obj);

            let xid = 'xzui-dialogModal-' + xzSystem.getTopId();
            let maskEl = xzSystem.getMaskEl();
            let html = '<div id="' + xid + '" class="xzui-dialog ' + (options.side ? 'xzui-dialog-side' : '') + '" style="z-index:' + xzSystem.getTopIndex() + ';';

            if (options.width) {
                html += 'width:' + options.width + 'px;';
            };

            if (options.height) {
                html += 'height:' + options.height + 'px;';
            };

            html += '"><div class="xzui-dialog_head">\
                                <a href="javascript:;" class="xzui-dialog_close" role="cancel"';
            if (options.cancelColor) {
                html += 'style="color:' + options.cancelColor + ';"';
            };
            html += '>' + app.stringToIcon(options.cancelText) + '</a>\
                                <p class="xzui-dialog_title">' + options.title + '</p>';
            html += '<a href="javascript:;" class="xzui-dialog_confirm" role="confirm" ';
            if (options.confirmColor) {
                html += 'style="color:' + options.confirmColor + ';"';
            };
            html += '>' + app.stringToIcon(options.confirmText) + '</a>';
            html += '       </div>\
                        <div class="xzui-dialog_body">\
                                <div class="xzui-dialog_main" ' + (!options.scroll ? 'style="overflow:hidden"' : '') + '>\
                                        <div id="' + xid + '_content">' + obj.content + '</div>\
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
                        app.trigger(options.success, backData);
                        app.trigger(options.complete);
                    }, 300);
                };
                fn();

                if ($.isFunction(options.beforeClose)) {
                    options.beforeClose(backData, fn);
                } else {
                    fn();
                };
            };

            return dialogEl;
        },

        /**
         *使用富文本编辑器
         */

        htmlEditor(obj) {

            let _this = this,
                editor;

            obj = app.extend(true, {
                title: '',
                content: '',
                success: app.noop,
                fail: app.noop,
                complete: app.noop
            }, obj);

            let dialogEl = _this.webDialog({
                    content: '<div class="xzui-loadmore">\
                            <div class="xzicon-loading"></div>\
                            <div class="xzui-loadmore__tips">' + app.language.loading + '</div>\
                        </div>',
                    side: true,
                    scroll: false,
                    title: obj.title,
                    confirmText: app.language.save,
                    beforeClose: function(res, fn) {
                        if (editor) {
                            if (res.confirm) {
                                obj.success(parseHtml(editor.getData()));
                            };
                            editor.destroy();
                        } else {
                            obj.fail();
                        };
                        fn();
                    },
                    fail: obj.fail,
                    complete: obj.complete
                }),
                parseHtml = function(html) {
                    let newHtml = $('<div>' + html + '</div>');
                    newHtml.find('img').each(function() {
                        let $this = $(this),
                            src = $this.attr('src');
                        if (src && src.indexOf(filePath) > -1) {
                            src = src.split('?')[0] + '?imagesrc';

                            $this.css({
                                height: 'auto',
                                width: 'auto'
                            }).attr('data-imagesrc', src).attr('data-autoheight', 1).removeAttr('src');
                            if (!$this.hasClass('responsiveImage')) {
                                $this.addClass('responsiveImage');
                            };
                        };
                        $this.attr('mode', 'widthFix');
                    });
                    html = newHtml.html();
                    newHtml.remove();
                    return html;
                },
                start = function() {
                    let eid = dialogEl.attr('id') + '_content';
                    setTimeout(function() {
                        $('#' + eid).html(obj.content).attr('contenteditable', 'true');

                        editor = CKEDITOR.replace(eid, {
                            resize_enabled: false,
                            height: dialogEl.height() - 130
                        });
                    }, 500);

                };
            if (typeof CKEDITOR == 'undefined') {
                top.xzUpload = function(opts) {
                    app.upload({
                        success: function(res) {
                            opts.callBack([{
                                src: res.key
                            }]);
                        }
                    });
                };
                top.getThumbImageView = app.image.thumb;
                xzSystem.loadSrcs([staticPath + 'plugins/ckeditor/ckeditor.js'], start);
            } else {
                start();
            };
        },

        /**
         *打开分享界面
         */

        openShare(obj) {
            let html = '<div class="xzui-share">\
                    <div class="xzui-share_body"><div class="xzui-share_wrap"><div class="xzui-share_list">';

            app.each(obj.type, function(i, item) {
                html += '<div class="xzui-share_item">';
                
                    app.dialog(item.type);
                switch (item.type) {
                    case 'weixin':
                        html += '<a class="xzui-share_bar" role="' + item.type + '" href="javascript:;">';
                        break;
                    case 'moments':
                        html += '<a class="xzui-share_bar" role="' + item.type + '" href="javascript:;">';
                        break;
                    case 'qq':
                        if (client == 'web') {
                            html += '<a class="xzui-share_bar" role="' + item.type + '" href="http://connect.qq.com/widget/shareqq/index.html?url=' + obj.path + '&title=' + obj.title + '&source=&desc=' + (obj.content || '') + '&pics=' + obj.img + '&summary=" target="_blank">';
                        } else {
                            html += '<a class="xzui-share_bar" role="' + item.type + '" href="javascript:;">';
                        };
                        break;
                    case 'weibo':
                        if (client == 'web') {
                            html += '<a class="xzui-share_bar" role="' + item.type + '" href="http://service.weibo.com/share/share.php?url=' + obj.path + '&title=' + obj.title + '&source=&pic=' + obj.img + '" target="_blank">';
                        } else {
                            html += '<a class="xzui-share_bar" role="' + item.type + '" href="javascript:;">';
                        };
                        break;
                    case 'qqZone':
                        if (client == 'web') {
                            html += '<a class="xzui-share_bar" role="' + item.type + '" href="http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=' + obj.path + '&title=' + obj.title + '&desc=' + (obj.content || '') + '&summary=&site=&pics=' + obj.img + '" target="_blank">';
                        } else {
                            html += '<a class="xzui-share_bar" role="' + item.type + '" href="javascript:;">';
                        };
                        break;
                    case 'copy':
                        html += '<a class="xzui-share_bar" role="' + item.type + '" href="javascript:;">';
                        break;
                    case 'qrCode':
                        html += '<a class="xzui-share_bar" role="' + item.type + '" href="javascript:;">';
                        break;
					case 'saveImage':
                        html += '<a class="xzui-share_bar" role="' + item.type + '" href="javascript:;">';
                        break;
                };
                html += '<div class="xzui-share_icon"></div><p class="xzui-share_title">' + item.title + '</p></a> </div>';
            });

            html += '</div></div><button class="xzui-share_cancel" type="button">取消</button></div></div>';

            let shareEl = $(html).appendTo('body');
            setTimeout(function() {
                shareEl.addClass('show');
            }, 50);

            obj.shareEl = shareEl;
            app[client].share(obj);
        },
		/*设置微信config*/
		setWxConfig:function(jsApiList,callback){
			
			app.request('/index/index/getSignPackage', {url: pageURL}, function(res) {
				wx.config({
					debug: false,
					appId: res.appId,
					timestamp: parseInt(res.timestamp),
					nonceStr: res.nonceStr,
					signature: res.signature,
					jsApiList: jsApiList,//['checkJsApi', 'scanQRCode']
				});
				wx.ready(function() {
					 if(typeof callback=='function'){
						 callback();
					 };
				});
				wx.error(function(res) { });
			});
		}
    });



    /**
     *扩展jQuery
     */

    (function($) {

        $.easing.elasout = function(x, t, b, c, d) {
            var s = 1.70158;
            var p = 0;
            var a = c;
            if (t == 0) return b;
            if ((t /= d) == 1) return b + c;
            if (!p) p = d * .3;
            if (a < Math.abs(c)) { a = c; var s = p / 4; } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
        };


        var $scrollTo = $.scrollTo = function(target, duration, settings) {
            return $(window).scrollTo(target, duration, settings);
        };

        $scrollTo.defaults = {
            axis: 'xy',
            duration: 0,
            limit: true
        };

        function isWin(elem) {
            return !elem.nodeName ||
                $.inArray(elem.nodeName.toLowerCase(), ['iframe', '#document', 'html', 'body']) !== -1;
        }

        $.fn.scrollTo = function(target, duration, settings) {
            if (typeof duration === 'object') {
                settings = duration;
                duration = 0;
            }
            if (typeof settings === 'function') {
                settings = { onAfter: settings };
            }
            if (target === 'max') {
                target = 9e9;
            }

            settings = $.extend({}, $scrollTo.defaults, settings);
            // Speed is still recognized for backwards compatibility
            duration = duration || settings.duration;
            // Make sure the settings are given right
            var queue = settings.queue && settings.axis.length > 1;
            if (queue) {
                // Let's keep the overall duration
                duration /= 2;
            }
            settings.offset = both(settings.offset);
            settings.over = both(settings.over);

            return this.each(function() {
                // Null target yields nothing, just like jQuery does
                if (target === null) return;

                var win = isWin(this),
                    elem = win ? this.contentWindow || window : this,
                    $elem = $(elem),
                    targ = target,
                    attr = {},
                    toff;

                switch (typeof targ) {
                    // A number will pass the regex
                    case 'number':
                    case 'string':
                        if (/^([+-]=?)?\d+(\.\d+)?(px|%)?$/.test(targ)) {
                            targ = both(targ);
                            // We are done
                            break;
                        }
                        // Relative/Absolute selector
                        targ = win ? $(targ) : $(targ, elem);
                        /* falls through */
                    case 'object':
                        if (targ.length === 0) return;
                        // DOMElement / jQuery
                        if (targ.is || targ.style) {
                            // Get the real position of the target
                            toff = (targ = $(targ)).offset();
                        }
                }

                var offset = $.isFunction(settings.offset) && settings.offset(elem, targ) || settings.offset;

                $.each(settings.axis.split(''), function(i, axis) {
                    var Pos = axis === 'x' ? 'Left' : 'Top',
                        pos = Pos.toLowerCase(),
                        key = 'scroll' + Pos,
                        prev = $elem[key](),
                        max = $scrollTo.max(elem, axis);

                    if (toff) { // jQuery / DOMElement
                        attr[key] = toff[pos] + (win ? 0 : prev - $elem.offset()[pos]);

                        // If it's a dom element, reduce the margin
                        if (settings.margin) {
                            attr[key] -= parseInt(targ.css('margin' + Pos), 10) || 0;
                            attr[key] -= parseInt(targ.css('border' + Pos + 'Width'), 10) || 0;
                        }

                        attr[key] += offset[pos] || 0;

                        if (settings.over[pos]) {
                            // Scroll to a fraction of its width/height
                            attr[key] += targ[axis === 'x' ? 'width' : 'height']() * settings.over[pos];
                        }
                    } else {
                        var val = targ[pos];

                        // Handle percentage values
                        attr[key] = val.slice && val.slice(-1) === '%' ?
                            parseFloat(val) / 100 * max :
                            val;
                    }

                    // Number or 'number'
                    if (settings.limit && /^\d+$/.test(attr[key])) {
                        // Check the limits
                        attr[key] = attr[key] <= 0 ? 0 : Math.min(attr[key], max);
                    }

                    // Don't waste time animating, if there's no need.
                    if (!i && settings.axis.length > 1) {
                        if (prev === attr[key]) {
                            // No animation needed
                            attr = {};
                        } else if (queue) {
                            // Intermediate animation
                            animate(settings.onAfterFirst);
                            // Don't animate this axis again in the next iteration.
                            attr = {};
                        }
                    }
                });

                animate(settings.onAfter);

                function animate(callback) {
                    var opts = $.extend({}, settings, {
                        // The queue setting conflicts with animate()
                        // Force it to always be true
                        queue: true,
                        duration: duration,
                        complete: callback && function() {
                            callback.call(elem, targ, settings);
                        }
                    });
                    $elem.animate(attr, opts);
                }
            });
        };

        // Max scrolling position, works on quirks mode
        // It only fails (not too badly) on IE, quirks mode.
        $scrollTo.max = function(elem, axis) {
            var Dim = axis === 'x' ? 'Width' : 'Height',
                scroll = 'scroll' + Dim;

            if (!isWin(elem))
                return elem[scroll] - $(elem)[Dim.toLowerCase()]();

            var size = 'client' + Dim,
                doc = elem.ownerDocument || elem.document,
                html = doc.documentElement,
                body = doc.body;

            return Math.max(html[scroll], body[scroll]) - Math.min(html[size], body[size]);
        };

        function both(val) {
            return $.isFunction(val) || $.isPlainObject(val) ? val : { top: val, left: val };
        }

        // Add special hooks so that window scroll properties can be animated
        $.Tween.propHooks.scrollLeft =
            $.Tween.propHooks.scrollTop = {
                get: function(t) {
                    return $(t.elem)[t.prop]();
                },
                set: function(t) {
                    var curr = this.get(t);
                    // If interrupt is true and user scrolled, stop animating
                    if (t.options.interrupt && t._last && t._last !== curr) {
                        return $(t.elem).stop();
                    }
                    var next = Math.round(t.now);
                    // Don't waste CPU
                    // Browsers don't render floating point scroll
                    if (curr !== next) {
                        $(t.elem)[t.prop](next);
                        t._last = this.get(t);
                    }
                }
            };

        $.fn.hideRemove = function(opts) {
            if ($.isFunction(opts)) {
                opts = {
                    onRemove: opts
                }
            };
            let options = $.extend({}, { easing: 'linear', speed: 'normal', onRemove: $.noop }, opts);
            return this.each(function(i) {
                let end = { opacity: 0 };
                if (options.height != undefined) {
                    end.height = options.height;
                };

                $(this).animate(end, options.speed, options.easing, function() {
                    $(this).remove();
                    options.onRemove();
                });
            });
        };
    })($);

})(this, jQuery);