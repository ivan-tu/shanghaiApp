(function() {
    let app = getApp();
    app.Page({
        pageId: 'user-bindAccount',
        data: {
            systemId: 'user',
            moduleId: 'bindAccount',
            data: null,
            options: {},
            settings: {},
            language: {},
            form: {
                mobile: '',
                code: ''
            },
            checkMobile: false,
            isCode: false,
            countDownNum: 60,
            isSendCode: false,
            focusInput: false,
            checkLogin: false,
            isWeixinMini: app.config.client == 'wx' && !app.checkUser(),
            setCountDown: app.noop,
            client:app.config.client,
			bindType:'weixinPhone'
        },
        methods: {
            onLoad: function(options) {
                this.options = options;
            },
            onPullDownRefresh: function() {
                wx.stopPullDownRefresh();
            },
            isPhones: function(val) {
                if (val.length != 11) {
                    return false;
                } else {
                    return true;
                };
            },
            editMobile: function() {
                let setCountDown = this.getData().setCountDown;
                clearInterval(setCountDown);

                this.setData({ 'form.code': '', isCode: false, countDownNum: 60, isSendCode: false, checkLogin: false });
            },
            getCode: function(e) {
                let _this = this,
                    setCountDown,
                    countDownNum = _this.getData().countDownNum,
                    formData = _this.getData().form,
                    msg = '';

                if (!formData.mobile) {
                    msg = '请输入手机号码';
                } else if (!_this.isPhones(formData.mobile)) {
                    msg = '请输入正确的手机号码';
                };

                if (msg) {
                    app.tips(msg);
                    this.setData({ checkMobile: false, isCode: false, countDownNum: 60, isSendCode: false, checkLogin: false });
                } else {
                    _this.setData({
                        isSendCode: true
                    });

                    app.request('//userapi/securityCode', { mobile: formData.mobile }, function(backData) {
                        app.tips('验证码已经发送到您的手机，请注意查收');

                        setCountDown = setInterval(function() {
                            countDownNum--;
                            _this.setData({
                                countDownNum: countDownNum
                            });
                            if (countDownNum == 0) {
                                clearInterval(setCountDown);
                                _this.setData({
                                    countDownNum: 60,
                                    isSendCode: false
                                });
                            };
                        }, 1000);
                        _this.setData({ setCountDown: setCountDown });
                    }, function() {
                        app.tips('获取验证码失败', 'error');
                        _this.setData({
                            countDownNum: 60,
                            isSendCode: false
                        });
                    });
                };
            },
            submit: function(e) {
                let _this = this,
                    msg = '',
                    isApp = app.config.client == 'app',
                    api = _this.getData().isWeixinMini ? 'bindAccountWxapp' : isApp ? 'bindAccountApp' : 'bindAccount',
                    formData = _this.getData().form;

                if (!formData.mobile) {
                    msg = '请输入手机号码';
                } else if (!formData.mobile) {
                    msg = '请输入验证码';
                } else if (!_this.isPhones(formData.mobile)) {
                    msg = '请输入正确的手机号码';
                };

                if (msg) {
                    app.tips(msg);
                    this.setData({ checkMobile: false, isCode: false, countDownNum: 60, isSendCode: false, 'form.code': '', checkLogin: false });
                } else {
                    if (_this.getData().isWeixinMini) {
                        if (app.gData.userInfo) {
                            formData.userInfo = app.gData.userInfo;
                        };
                        if (app.session.get('sessionKey')) {
                            formData.sessionKey = app.session.get('sessionKey');
                        };
                    } else if (isApp) {
                        app.extend(formData, app.gData.weixinLoginData);
                    };
                    app.request('/user/userapi/' + api, formData, function(backData) {
                        // app.tips(app.toJSON(backData));
                        _this.successLogin(backData);
                    }, function(msg) {
                        _this.setData({ 'form.code': '', checkLogin: false });
                        switch (msg) {
                            case 2005: //验证码错误
                                app.tips(_this.language.errorCode, 'error');
                                break;
                            default:
                                app.tips(msg, 'error');
                        };
                    });
                };
            },
            successLogin: function(data) {
                if (app.checkUser()) {
                    if (this.options.dialogPage == '1') {
                        app.tips('手机号绑定成功');
                        app.dialogSuccess(data);
                    } else {
                        app.tips('手机号绑定成功');
                        app.navBack();
                    };
                } else {
                    app.setUserSession(data);

                    if (this.options.dialogPage == '1') {
                        app.dialogSuccess(data);
                    } else {
                        if (app.userLoginSuccess) {
                            if (this.options.back == '1') {
                                app.navBack();
                            };
                            app.userLoginSuccess();
                        } else if (this.options.redirect_uri) {
                            app.reLaunch(this.options.redirect_uri);
                        } else {
                            app.reLaunch('../index/index');
                        };
                    };
                };
            },
            inputMobile: function(e) {
                let value = app.eValue(e);

                this.setData({ 'form.mobile': value });

                if (value.length == 11) {
                    if (!this.isPhones(value)) {
                        app.tips('请输入正确的手机号码');
                        this.setData({ checkMobile: false });
                    } else {
                        this.setData({ checkMobile: true, focusInput: false });
                        //this.getCode();
                    };
                } else {
                    this.setData({ checkMobile: false });
                };
            },
            focusMobile: function() {
                this.setData({ focusInput: true });
            },
            blurMobile: function() {
                this.setData({ focusInput: false });
            },
            sendCode: function() {
                let mobile = this.getData().form.mobile;

                if (!this.isPhones(mobile)) {
                    app.tips('请输入正确的手机号码');
                } else {

                    this.setData({ isCode: true, focusInput: false });
                    this.getCode();
                };
            },
            weixinLogin: function() {
                app.weixinLogin();
            },
            inputCode: function(e) {
                let value = app.eValue(e),
                    isWeixinMini = this.getData().isWeixinMini;
				if(value.length>4){
					value = value.slice(0,4);
				};
                this.setData({ 'form.code': value });
                if (value.length == 4) {
                    // if (!isWeixinMini) {
                    //     this.submit();
                    // };
                    this.setData({ checkLogin: true });
                };
            },
            sendVoice: function() {
                let form = this.getData().form,
                    mobile = form.mobile;

                app.confirm('确认要发送语音验证码吗？', function() {
                    app.request('/user/userapi/getVoiceCode', { mobile: mobile }, function(res) {
                        app.confirm('已发送语音验证码，请注意查收您的手机来电。')
                    });
                });
            },
			selectOther:function(){
				this.setData({bindType:'otherPhone'});
			},
			getPhoneNumber: function (e) {
				let _this = this;
				if (e.detail.errMsg == 'getPhoneNumber:ok') {
					app.request('//userapi/wxGetPhoneNumber', { sessionKey: app.session.get('sessionKey'), detail: e.detail }, function (res) {
						if (res.phoneNumber) {
							app.request('//userapi/bindAccountWxapp', { sessionKey: app.session.get('sessionKey'),mobile: res.phoneNumber, webBind: 1 }, function (data) {
								_this.successLogin(data);
							});
						} else {
							app.tips('授权失败');
						};
					});
				} else {
					app.tips('授权失败');
				};
			}
        }
    });
})();