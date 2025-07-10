(function() {
    let app = getApp();
    app.Page({
        pageId: 'user-login',
        data: {
            systemId: 'user',
            moduleId: 'login',
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
            setCountDown: app.noop,
            sendSuccess: '验证码已发送',
            hasWx: true,
            client: app.config.client,
			mobileLogin:false,
			agreeMement:false,//是否同意用户协议
        },
        methods: {
            onLoad: function(options) {
                let _this = this,
                    client = this.getData().client;
                app.config.needBindAccount=true;
				if(options.type&&options.type=='phone'){
					_this.setData({mobileLogin:true});
				};
                if (client == 'app') {
                    wx.app.call('hasWx', {
                        success: function(res) {
                            if (res.status != 1) {
                                _this.setData({ hasWx: false,mobileLogin:true});
                            };
                        }
                    });
                };
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
                this.setData({ 'form.code': '', isCode: false, countDownNum: 60, isSendCode: false });
            },
			setmobileLogin:function(){
				this.setData({mobileLogin:!this.getData().mobileLogin});
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
                    this.setData({ checkMobile: false, isCode: false, countDownNum: 60, isSendCode: false });
                } else {
                    _this.setData({
                        isSendCode: true
                    });

                    app.request('//userapi/securityCode', { mobile: formData.mobile }, function(backData) {
                        _this.setData({ sendSuccess: '验证码已发送' });

                        setTimeout(function() {
                            _this.setData({ sendSuccess: '重新发送' });
                        }, 5000);
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
                    formData = _this.getData().form,
                    msg = '';

                if (!formData.mobile) {
                    msg = '请输入手机号码';
                } else if (!formData.mobile) {
                    msg = '请输入验证码';
                } else if (!_this.isPhones(formData.mobile)) {
                    msg = '请输入正确的手机号码';
                };

                if (msg) {
                    app.tips(msg);
                    this.setData({ checkMobile: false, isCode: false, countDownNum: 60, isSendCode: false, 'form.code': '' });
                } else {
                    app.request('//userapi/mobileLogin', formData, function(backData) {
                        _this.successLogin(backData);
                    }, function(msg) {
                        _this.setData({ 'form.code': '' });
                        switch (msg) {
                            case 2005:
                                app.tips('验证码错误', 'error');
                                _this.setData({ 'form.code': '' });
                                break;
                            case '账号不存在，请使用微信登录':
                                app.tips('账号不存在，请使用微信登录', 'error');
                                _this.setData({ 'form.code': '', isCode: false, 'formData.mobile': '', checkMobile: false, isSendCode: false });
                                break;
                            default:
                                app.tips(msg, 'error');
                        };
                    });
                };
            },
            successLogin: function(data) {
                app.setUserSession(data);
                if (app.userLoginSuccess) {
                    app.userLoginSuccess();
                } else {
                    app.redirectTo('../../user/my/my');
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
            weixinLogin:function(){
				if(!this.getData().agreeMement){
					app.tips('请先同意用户协议','error');
				}else{
                	app.weixinLogin();
				};
            },
            inputCode: function(e) {
                let value = app.eValue(e);

                this.setData({ 'form.code': value });
                if (value.length == 4) {
                    this.submit();
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
			changeAgreeMement:function(){
				this.setData({
					agreeMement:!this.getData().agreeMement
				});
			},
        }
    });
})();