/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'user-myFriend',
        data: {
            systemId: 'user',
            moduleId: 'myFriend',
            data: [],
            options: {},
            settings: {
				bottomLoad:false,
			},
            form: {
				page:1,
				size:10,
				keyword:'',
			},
			client:app.config.client,
			showLoading:false,
			showNoData:false,
			count:0,
			pageCount:0,
			picWidth:((app.system.windowWidth>480?480:app.system.windowWidth)-40)*0.5,
			picHeight:((app.system.windowWidth>480?480:app.system.windowWidth)-40)*0.5/0.875,
			getType:'my',
			sendForm:{
				show:false,
				index:'',
				total:'',
				vcode:'',
				frienduid:'',
				countDownNum:60,
				getCodeText:'获取验证码',
				wallte:0,
			},
        },
        methods: {
            onLoad: function(options) {
				let _this = this,
					alertArray = app.storage.get('alertArray')||{};
				app.checkUser({
					success: function () {
						_this.setData({
							isUserLogin: true
						});
						_this.load();
					}
				});
            },
            onPullDownRefresh: function() {
                this.load();
                wx.stopPullDownRefresh();
            },
            load: function() {
				this.getList();
            },
			changeKeyword: function(e) {
				let keyword = e.detail.keyword;
				this.setData({
					'form.keyword': e.detail.keyword,
					'form.page': 1
				});
				this.getList();
			},
			closeKeyword: function(e) {
				let keyword = e.detail.keyword;
				this.setData({
					'form.keyword': '',
					'form.page': 1
				});
				this.getList();
			},
			screenType:function(e){
				this.setData({
					getType:app.eData(e).type,
					'data':[],
					'form.page':1,
				});
				this.getList();
			},
			getList:function(loadMore){
				let _this = this,
					formData = _this.getData().form,
					pageCount = _this.getData().pageCount,
					ajaxURL = '//homeapi/getMyFriendList',
					getType = this.getData().getType;
				if(loadMore){
					if (formData.page >= pageCount) {
						_this.setData({'settings.bottomLoad':false});
					};
				};
				_this.setData({'showLoading':true});
				if(getType=='apply'){
					ajaxURL = '//homeapi/getFriendApply';
				};
				app.request(ajaxURL,formData,function(backData){
					if(!backData||!backData.data){
						backData = {data:[],count:0};
					};
					if(!loadMore){
						if(backData.count){
							pageCount = Math.ceil(backData.count / formData.size);
							_this.setData({'pageCount':pageCount});
							if(pageCount > 1){
								_this.setData({'settings.bottomLoad':true});
							}else{
								_this.setData({'settings.bottomLoad':false});
							};
							_this.setData({'showNoData':false});
						}else{
							_this.setData({
								'settings.bottomLoad':false,
								'showNoData':true
							});
						};
					};
					let list = backData.data;
					if(list&&list.length){
						app.each(list,function(i,item){
							item.id = item.id||item._id;
							if(item.myheadpic){
								item.myheadpic = app.image.crop(item.myheadpic,45,45);
							};
							if(item.friendheadpic){
								item.friendheadpic = app.image.crop(item.friendheadpic,45,45);
							};
						});
					};
					if(loadMore){
						list = _this.getData().data.concat(list);
					};
					_this.setData({
						data:list,
						count:backData.count||0,
					});
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
			toDetail:function(e){
				let _this = this,
					uid = app.eData(e).uid,
					getType = this.getData().getType,
					data = this.getData().data,
					index = Number(app.eData(e).index),
					listArray;
				if(getType=='apply'){
					listArray = ['查看名片','通过好友','拒绝好友'];
				}else if(getType=='my'){
					//listArray = ['查看名片','移除好友','赠送友币'];
					listArray = ['查看名片','移除好友'];
				};
				app.actionSheet(listArray,function(num){
					switch(listArray[num]){
						case '查看名片':
						if(uid){
							app.navTo('../../user/businessCard/businessCard?id='+uid);
						};
						break;
						case '通过好友':
						app.confirm('确定通过吗?',function(){
							app.request('//homeapi/doFriendApply',{id:data[index]._id,status:1},function(){
								app.tips('通过成功','success');
								data.splice(index,1);
								_this.setData({data:data});
								if(data.length==0){
									_this.setData({'form.page':1});
									_this.getList();
								};
							});
						});
						break;
						case '拒绝好友':
						app.confirm('确定拒绝吗?',function(){
							app.request('//homeapi/doFriendApply',{id:data[index]._id,status:2},function(){
								app.tips('拒绝成功','success');
								data.splice(index,1);
								_this.setData({data:data});
								if(data.length==0){
									_this.setData({'form.page':1});
									_this.getList();
								};
							});
						});
						break;
						case '移除好友':
						app.confirm('确定移除好友吗?',function(){
							app.request('//homeapi/delFriend',{id:data[index]._id},function(){
								app.tips('删除成功','success');
								data.splice(index,1);
								_this.setData({data:data});
								if(data.length==0){
									_this.setData({'form.page':1});
									_this.getList();
								};
							});
						});
						break;
						case '赠送友币':
						app.request('//homeapi/getMyInfo',{},function(res){
							_this.setData({
								'sendForm.show':true,
								'sendForm.index':index,
								'sendForm.total':'',
								'sendForm.vcode':'',
								'sendForm.countDownNum':60,
								'sendForm.getCodeText':'获取验证码',
								'sendForm.wallte':res.wallte||0,
							});
						});
						break;
					};
				});
			},
			getCode:function(e){
                let _this = this,
					setCountDown,
                    sendForm = this.getData().sendForm,
                    countDownNum = sendForm.countDownNum;
                if(sendForm.wallte<1){
					app.tips('您的友币不足','error');
				}else if(countDownNum<60){
                }else{
                   app.request('//userapi/securityCodeToLoginUser', {}, function(backData) {
                        setCountDown = setInterval(function() {
                            countDownNum--;
                            _this.setData({
                                'sendForm.countDownNum':countDownNum,
								'sendForm.getCodeText':countDownNum+'s后重新获取',
                            });
                            if(countDownNum == 0){
                                clearInterval(setCountDown);
                                _this.setData({
                                    'sendForm.countDownNum': 60,
                                    'sendForm.getCodeText': '重新发送'
                                });
                            };
                        }, 1000);
                    }, function() {
                        app.tips('获取验证码失败', 'error');
                        _this.setData({
                            'sendForm.countDownNum': 60
                        });
                    });
                };
            },
			toHideDialog:function(){
				this.setData({'sendForm.show':false});
			},
			toConfirmDialog:function(){
				let _this = this,
					isNum = /^[1-9]\d*$/,
					data = this.getData().data,
					formData = this.getData().sendForm,
					msg = '';
				formData.frienduid = data[formData.index].frienduid;
				if(!formData.frienduid){
					msg = '缺少赠送对象';
				}else if(!isNum.test(formData.total)){
					msg = '请输入正确的数量'
				}else if(!formData.vcode){
					msg = '请输入验证码';
				};
				console.log(app.toJSON(formData));
				if(msg){
					app.tips(msg,'error');
				}else{
					app.request('//homeapi/sendWallte',{frienduid:formData.frienduid,total:formData.total,vcode:formData.vcode},function(){
						app.tips('赠送成功','success');
						_this.toHideDialog();
					});
				};
			},
        }
    });
})();