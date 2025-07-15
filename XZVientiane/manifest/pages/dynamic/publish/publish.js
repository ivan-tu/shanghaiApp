/**
 *模块组件构造器
 */
(function() {
    let app = getApp();
    app.Page({
        pageId: 'dynamic-publish',
        data: {
            systemId: 'dynamic',
            moduleId: 'publish',
            data: [],
            options: {},
            settings: {},
            language: {},
            form: {
				content:'',
				pics:'',
				videos:'',
				clubid:[],
				activityid:'',
			},
			client:app.config.client,
			selectName:'',
			isUserLogin: app.checkUser(),
			files:[],
			uploadSuccess:true,
			showAboutDialog:false,
			windowWidth:app.system.windowWidth,
			imageWidth: ((app.system.windowWidth > 480 ? 480 : app.system.windowWidth) - 45) / 4,
			videoWidth: (app.system.windowWidth > 480 ? 480 : app.system.windowWidth) - 30,
			videoData:{
				uploadStatus:0,
				file:'',
				error:'',
				poster:'',
				percent:0,
				w_h:0,//宽高比
			},
			clubList:[],
			dynamicPublishWX:0,
			ajaxLoading:true,
        },
        methods: {
            onLoad: function(options) {
				let _this = this;
                this.setData({
					options: options
				});
				if(options.activityid){
					this.setData({
						'form.activityid':options.activityid
					});
				};
				this.load();
				if(app.config.client=='wx'){
					app.request('//set/get', {type: 'homeSet'}, function (res) {
						_this.setData({ajaxLoading:false});
						let backData = res.data||{};
						let wxVersion = app.config.wxVersion;
						if(backData){
							backData.wxVersion = backData.wxVersion?Number(backData.wxVersion):1;
							if(wxVersion>backData.wxVersion){//如果当前版本大于老版本，就要根据设置来
								_this.setData({
									dynamicPublishWX:backData.dynamicPublishWX||0,
								});
							}else{
								_this.setData({
									dynamicPublishWX:1
								});
							};
						}else{
							_this.setData({
								dynamicPublishWX:1
							});
						};
					},function(){
						_this.setData({
							ajaxLoading:false,
							dynamicPublishWX:1
						});
					});
				}else{
					this.setData({
						ajaxLoading:false,
						dynamicPublishWX:1
					});
				};
            },
            onPullDownRefresh:function() {
                wx.stopPullDownRefresh();
            },
			onShow:function(){
				//检查用户登录状态改变
				let isUserLogin = app.checkUser();
				if (isUserLogin != this.getData().isUserLogin) {
					this.setData({
						isUserLogin:isUserLogin
					});
					this.load();
				};
			},
            load:function(){
				let _this = this,
					options = this.getData().options;
					////homeapi/getMyClubs 只获取我加入的
					////clubapi/getMyClubs 获取我加入的+我创建的
				app.request('//clubapi/getMyClubs',{},function(res){
					let newArray = [];
					if(res.myclubs&&res.myclubs.length){
						app.each(res.myclubs,function(i,item){
							if(options.clubid&&options.clubid==item._id){
								item.active = 1;
							}else{
								item.active = 0;
							};
						});
						newArray = newArray.concat(res.myclubs);
					};
					if(res.joinclubs&&res.joinclubs.length){
						app.each(res.joinclubs,function(i,item){
							if(options.clubid&&options.clubid==item._id){
								item.active = 1;
							}else{
								item.active = 0;
							};
						});
						newArray = newArray.concat(res.joinclubs);
					};
					_this.setData({clubList:newArray});
				});
            },
			selectThis:function(e){
				let index = Number(app.eData(e).index),
					clubList = this.getData().clubList;
				clubList[index].active = clubList[index].active==1?0:1;
				this.setData({clubList:clubList});
			},
			uploadPics: function (e) {
				let _this = this,
					imageWidth = _this.getData().imageWidth,
					index = _this.getData().files.length,
					files = _this.getData().files,
					uploadSuccess = _this.getData().uploadSuccess;
				if(_this.getData().videoData.file){
					app.tips('图片和视频只能上传一种','error');
				}else if (!uploadSuccess) {
					app.tips('还有文件正在上传', 'error');
				}else if (index>=9) {
					app.tips('最多上传9张', 'error');
				}else {
					app.upload({
						count: 9-files.length,
						mimeType: 'image',
						choose: function (res) {
							app.each(res, function () {
								files.push({
									src: '',
									percent: '',
									id: ''
								});
							});
							_this.setData({
								files: files,
								uploadSuccess: false
							})
						},
						progress: function (res) {
							files[index + res.index].hidePercent = false;
							files[index + res.index].percent = res.percent;
							_this.setData({
								files: files
							})
						},
						success: function (res) {
							//添加
							files[index + res.index].key = res.key;
							files[index + res.index].hidePercent = true;
							files[index + res.index].src = app.image.crop(res.key, imageWidth, imageWidth);
						},
						fail: function (msg) {
							if (msg.errMsg && msg.errMsg == 'max_files_error') {
								app.tips('一次最多只能上传' + (9-files.length) + '张图片', 'error')
							}
						},
						complete: function () {
							_this.setData({
								files: files,
								uploadSuccess: true
							})
						}
					});
				}
			},
			showMenu: function (e) {
				let _this = this,
					index = Number(app.eData(e).index),
					files = this.getData().files,
					list = ['查看', '前移', '后移', '删除'];
				app.actionSheet(list, function (res) {
					switch (list[res]) {
						case '查看':
							let windowWidth = _this.getData().windowWidth,
								viewSrc = [];
							app.each(files, function (i, item) {
								viewSrc.push(app.image.width(item.key, windowWidth));
							});
							app.previewImage({
								current: viewSrc[index],
								urls: viewSrc
							});
							break;
						case '前移':
							if (index != 0) {
								let first_files = files[index],
									last_files = files[index - 1];
								files.splice(index, 1);
								files.splice(index - 1, 0, first_files);
								_this.setData({
									files: files
								});
							};
							break;
						case '后移':
							if (index != files.length - 1) {
								let first_files = files[index],
									last_files = files[index + 1];
								files.splice(index, 1);
								files.splice(index + 1, 0, first_files);
								_this.setData({
									files: files
								});
							};
							break;
						case '删除':
							files.splice(index, 1);
							_this.setData({
								files: files
							});
							break;
					};
				});
			},
			getPosition: function() { //自动定位获取经纬度
                let _this = this,
                    client = app.config.client;
                if (client == 'web') {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                            function(position) {
                                let location = position.coords.longitude + ',' + position.coords.latitude;
                                _this.getAddress(location);
                            },
                            function(e) {
                                let location = app.storage.get('position') || '121.502500,31.237015';
                               _this.getAddress(location);
                            }
                        );
                    };
                } else if (client == 'wx') {
                    wx.getLocation({
                        type: 'wgs84',
                        success: function(res) {
							if(res.longitude&&res.latitude){
								let location = res.longitude + ',' + res.latitude;
								_this.getAddress(location);
							}else{
								let location = app.storage.get('position') || '121.502500,31.237015';
                                _this.getAddress(location);
							};
                        }
                    });
                } else if (client == 'app') {
                    wx.app.call('getLocation', {
                        success: function(res) {
							if(res.lng&&res.lat){
								if(res.area){
									let location = res.lng + ',' + res.lat;
									res.area = res.area.split('-');
									res.cityName = res.area[1]||'';
									_this.setData({
										'form.cityname': res.cityName||''
									});
									app.storage.set('cityname', res.cityName||'');
									app.storage.set('location', location);
								};
							}else{
								let location = app.storage.get('position') || '121.502500,31.237015';
                                _this.getAddress(location);
							};
                        }
                    });
                };
            },
			getAddress:function(location){//通过经纬度解析地址
				if(!location){
					return;
				};
				app.storage.set('location',location);
                let _this = this,
                    client = app.config.client;
                if (client == 'wx') {
                    let amapFile = require('../../../static/js/amap-wx.js');
                    let myAmapFun = new amapFile.AMapWX({
                        key: '8f6ea2deba4a18e930935eef4377bb96'
                    });
                    myAmapFun.getRegeo({
                        location: location,
                        success: function(data) {
							let cityName = data[0].regeocodeData.addressComponent.city;
							if(cityName.length==0){
								cityName = data[0].regeocodeData.addressComponent.province;
							};
							_this.setData({
								'form.cityname': cityName
							});
							app.storage.set('cityname', cityName);
                        },
                        fail: function(info) {
							console.log('通过经纬度解析地址失败');
                        }
                    });
                } else {
                    let amapFile = require(app.config.staticPath + 'js/amap-wx.js');
                    register('AMapWX', () => {
                        let myAmapFun = new AMapWX({ key: '8f6ea2deba4a18e930935eef4377bb96' });
                        myAmapFun.getRegeo({
                            location: location,
                            success: function(data) {
								let cityName = data[0].regeocodeData.addressComponent.city;
								if(cityName.length==0){
									cityName = data[0].regeocodeData.addressComponent.province;
								};
                                _this.setData({
                                    'form.cityname': cityName
                                });
                                app.storage.set('cityname', cityName);
                            },
                            fail: function(info) {
                               console.log('通过经纬度解析地址失败');
                            }
                        });
                    });
                };
			},
			uploadVideo:function(){//上传视频
				let _this = this,
					videoData = this.getData().videoData,
					uploadSuccess = this.getData().uploadSuccess;
				if(_this.getData().files.length){
					app.tips('图片和视频只能上传一种','error');
				}else if (!uploadSuccess) {
					app.tips('还有文件正在上传', 'error');
				} else{
					app.upload({
						count:1,
						mimeType:'video',
						choose:function(res){
							console.log(app.toJSON(res));
							
							_this.setData({
								uploadSuccess:false,
								'videoData.error':true,
								'videoData.percent':0,
								'videoData.uploadStatus':1
							});
						},
						progress:function(res){
							_this.setData({
								'videoData.percent':res.percent
							});
						},
						success:function(res){
							_this.setData({
								'videoData.src':res.key,
								'videoData.file':app.config.filePath + '' + res.key,
								'videoData.cover':res.cover,
								'videoData.poster':res.cover?app.image.width(res.cover, 120):'',
								uploadSuccess:true,
							});
							_this.updateVideoStatus();
						},
						fail:function(){
							if (msg.errMsg && msg.errMsg == 'max_files_error') {
							  app.tips('出错了');
							  _this.setData({'videoData.uploadStatus':0});
							};
						}
					});
				};
			},
			updateVideoStatus:function(){
				let _this = this,
					videoWidth = this.getData().videoWidth,
          			videoData = _this.getData().videoData,
					src = videoData.src;
				if(!src)return;         
				app.request('//api/checkVideoPrefop',{file:src},function(res){
					if(res.status=='0'){
						videoData.error = false;         
              			videoData.poster = app.image.width(videoData.cover,videoWidth);
					}else{
						videoData.error = true;
						setTimeout(function(){
							_this.updateVideoStatus();
						},2000);
					};
					_this.setData({
						videoData:videoData
					});
				});	
			},
			resetVideoData:function(){
				this.setData({
					videoData:{
						uploadStatus:0,
						file:'',
						error:'',
						poster:'',
						percent:0,
					}
				});
			},
			menuVideo:function(){//修改视频
				let _this = this,
					videoWidth = this.getData().videoWidth;
				app.actionSheet(['修改视频','修改封面','删除'],function(req){
					switch(req){
						case 0:
						_this.uploadVideo();
						break;
						case 1:
						app.upload({
							count:1,
							mimeType:'image',
							choose:function(res){
								
							},
							progress:function(res){
								
							},
							success:function(res){
								_this.setData({
									'videoData.cover':res.key,
									'videoData.poster':app.image.width(res.key, videoWidth),
								});
							},
							fail:function(){
								if (msg.errMsg && msg.errMsg == 'max_files_error') {
									app.tips('出错了');
								};
							}
						});
						break;
						case 2:
						_this.resetVideoData();
						break;
					};
				});
			},
			submit:function(){
				let _this = this,
					formData = this.getData().form,
					location = app.storage.get('location'),
					files = this.getData().files,
					videoData = this.getData().videoData,
					clubList = this.getData().clubList,
					msg = '';
				formData.content = formData.content.trim();
				if(!formData.content){
					msg = '请输入内容';
				};
				/*if(location){
					location = location.split(',');
					this.setData({
						'form.lng':location[0],
						'form.lat':location[1]
					});
				};*/
				if(videoData&&videoData.src){
					if(videoData.error){
						app.tips('视频转码中','error');
						return;
					};
					formData.videos = {
						file:videoData.src,
						pic:videoData.cover,
					};
				}else{
					formData.videos = '';
				};
				if(files&&files.length){
					let pics = [];
					app.each(files,function(i,item){
						pics.push(item.key);
					});
					formData.pics = pics;
				}else{
					formData.pics = '';
				};
				if(clubList&&clubList.length){
					let clubid = [];
					app.each(clubList,function(i,item){
						if(item.active==1){
							clubid.push(item._id);
						};
					});
					formData.clubid = clubid;
				}else{
					formData.clubid = '';
				};
				console.log(app.toJSON(formData));
				if(msg){
					app.tips(msg,'error');
				}else{
					let checkInfoData = [formData.content];
					app.wxSecCheck(checkInfoData,3,function(){
						app.request('//homeapi/addDynamic',formData,function(){
							app.storage.set('reload',1);
							app.confirm({
								content:'发布成功',
								confirmText:'继续发布',
								cancelText:'返回',
								success:function(res){
									if(res.confirm){
										_this.setData({
											files:[],
											'form.pics':'',
											'form.content':'',
											'form.videos':'',
										});
										_this.resetVideoData();
									}else if(res.cancel){
										app.navBack();
									};
								},
							});
						});
					});
				};
			},
			copyLink:function(){
				let url = app.mixURL('https://' + app.config.domain +'/p/dynamic/publish/publish', this.getData().options);
				if (app.config.client == 'wx') {
					wx.setClipboardData({
						data: url,
						success: function() {
							app.tips('复制成功', 'success');
						},
					});
				} else if (app.config.client == 'app') {
					wx.app.call('copyLink', {
						data: {
							url: url
						},
						success: function(res) {
							app.tips('复制成功', 'success');
						}
					});
				} else {
					$('body').append('<input class="readonlyInput" value="' + url + '" id="readonlyInput" readonly />');
					var originInput = document.querySelector('#readonlyInput');
					originInput.select();
					if (document.execCommand('copy')) {
						document.execCommand('copy');
						app.tips('复制成功', 'error');
					} else {
						app.tips('浏览器不支持，请手动复制', 'error');
					};
					originInput.remove();
				};
			},
			reback:function(){
				app.navBack();
			},
        }
    });
})();