/**
 *模块组件构造器
 */
(function () {

	let app = getApp();

	app.Page({
		pageId: 'activity-ticketMyCode',
		data: {
			systemId: 'activity',
			moduleId: 'ticketMyCode',
			isUserLogin: app.checkUser(),
			options: {},
			settings: {},
			language: {},
			form: {code: ''},
			data: {},
			qrcodePic: '',
			client:app.config.client,
		},
		methods: {
			onLoad: function (options) {
				if (app.config.client == 'wx' && options.scene) {
					let scenes = options.scene.split('_');
					options.id = scenes[0];
					if (scenes.length > 1) {
						app.session.set('vcode', scenes[1]);
					};
					delete options.scene;
				};
				this.setData({
					options: options
				});
			},
			onShow: function () {
				let _this = this;
				app.checkUser(function () {
					_this.setData({
						isUserLogin: true
					});
					_this.load();
				});
			},
			onHide: function () {
				this.stopInterval();
			},
			stopInterval: function () {
				if (this.checkStatus) {
					clearInterval(this.checkStatus);
				};
			},
			onPullDownRefresh: function () {
				this.onShow();
				wx.stopPullDownRefresh();
			},
			load: function () {
				let _this = this,
					formData = this.getData().form,
					options = this.getData().options;
				this.stopInterval();
				app.request('//activityapi/getActivityDetail', {
					id: options.id
				}, function (res) {
					if(res){
						options.id = res._id;
						_this.setData({
							'options.id': res._id,
						});
					};
					if (res.pic) {
						res.topPic = app.image.crop(res.pic, _this.getData().topWidth, _this.getData().topHeight);
						res.pic = app.image.crop(res.pic, 160, 160);
					};
					if (res.grouppic) {
						res.grouppic = app.image.width(res.grouppic, 140);
					};
					if (res.clubInfo&&res.clubInfo.pic) {
						res.clubInfo.pic = app.image.crop(res.clubInfo.pic, 80, 80);
					};
					if (res.joinData&&res.myuid) {
						console.log('https://' + app.config.domain + '/p/activity/signed/signed?id=' + options.id+'&joinid='+ res.joinData._id + '&userid=' + res.myuid)
						_this.setData({
							qrcodePic: app.getQrCodeImg('https://' + app.config.domain + '/p/activity/signed/signed?id=' + options.id+'&joinid='+ res.joinData._id + '&userid=' + res.myuid)
						});
					};
					if (res.bDate) {
						res.activityTime = res.bDate + ' ' + res.bTime;
						if (res.eDate) {
							if ((res.eDate.split('-'))[0] == (res.bDate.split('-'))[0]) {
								res.activityTime += ' 至 ' + (res.eDate.split('-'))[1] + '-' + (res.eDate.split('-'))[2] + ' ' + (res.eTime || '');
							} else {
								res.activityTime += ' 至 ' + (res.eDate.split('-'))[0] + '-' + (res.eDate.split('-'))[1] + '-' + (res.eDate.split('-'))[2] + ' ' + (res.eTime || '');
							};
						};
					};
					res.btime = res.bDate+' '+res.bTime;
					res.etime = res.eDate+' '+res.eTime;
					if(app.config.client=='wx'){//小程序中要把-转换成/
						res.btime = res.btime.replace(/-/g,'/');
						res.etime = res.etime.replace(/-/g,'/');
					};
					res.btime = (new Date(res.btime)).getTime();
					res.etime = (new Date(res.etime)).getTime();
					if (res.area && res.area.length) {
						res.realAddress = res.area;
						if (res.realAddress[0] == res.realAddress[1]) {
							res.realAddress = res.realAddress[0] + '' + res.realAddress[2];
						} else {
							res.realAddress = res.realAddress[0] + '' + res.realAddress[1] + '' + res.realAddress[2];
						};
					};
					if (res.address) {
						res.realAddress += '' + res.address;
					};
					//已报名待签到的走轮循
					if (res.joinData && res.joinData.signstatus == 0) {
						_this.checkStatus = setInterval(function () {
							app.request('//activityapi/checkSignin', {
								id: res.joinData._id
							}, function (req) {
								if (req.signstatus == 1) {
									clearInterval(_this.checkStatus);
									res.joinData.signstatus = 1
									_this.setData({
										data:res
									});
								};
							},function(){});
						}, 3000);
					};
					_this.setData({
						data: res
					});
				});
			},
			toMyTicket: function () {
				let options = this.getData().options;
				this.stopInterval();
				app.navTo('../../activity/ticketMy/ticketMy?id=' + options.id);
			},
			viewThisImage: function (e) { //查看单张图片
				let _this = this,
					pic = app.eData(e).pic;
				pic = pic.split('?')[0];
				app.previewImage({
					current: pic,
					urls: [pic]
				})
			},
			submit: function () {//购买门票
				let _this = this,
					options = this.getData().options;
				app.navTo('../../activity/ticketBuy/ticketBuy?id=' + options.id);
			},
			toJoinInfo:function(){
				let options = this.getData().options;
				app.navTo('../../activity/submitInfo/submitInfo?id='+options.id);
			},
		}
	});
})();