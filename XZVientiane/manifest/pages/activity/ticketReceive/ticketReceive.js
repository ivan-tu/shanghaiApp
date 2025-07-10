/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Page({
        pageId: 'activity-ticketReceive',
        data: {
            systemId: 'activity',
            moduleId: 'ticketReceive',
            data: {
				masterData:'',
				activity:''
			},
            options: {},
            settings: {},
            form: {},
			client:app.config.client,
			getStatus:0,
			goodsList:[],
			isUserLogin: app.checkUser(),
			contentImgWidth: (app.system.windowWidth > 480 ? 480 : app.system.windowWidth) - 30,
			contentData:[],
        },
        methods: {
            onLoad: function(options) {
				this.setData({
					options:options
				});
			},
			onShow: function() {
				let _this = this;
				app.checkUser(function () {
					_this.setData({
						isUserLogin: true
					});
					_this.load();
				});
			},
			onPullDownRefresh: function() {
				this.load();
				wx.stopPullDownRefresh();
			},
			toLogin:function(){
				app.userLogining = false;
				app.userLogin({
					success: function () {
						_this.setData({
							isUserLogin: true
						});
					}
				});
			},
			load:function(){
				let _this = this,
					options = this.getData().options;
				app.request('//activityapi/getTicketDetail',{ticketid:options.id},function(res){
					console.log(app.toJSON(res));
					if(res.masterData){
						res.masterData.headpic = app.image.crop(res.masterData.headpic,80,80);
					};
					if (res.activity.pics && res.activity.pics.length) {
						app.each(res.activity.pics, function (i, item) {
							res.activity.pics[i] = app.image.width(item, app.system.windowWidth - 30);
						});
					};
					if (res.activity.bDate) {
						res.activity.activityTime = res.activity.bDate + ' ' + res.activity.bTime;
						if (res.activity.eDate) {
							if ((res.activity.eDate.split('-'))[0] == (res.activity.bDate.split('-'))[0]) {
								res.activity.activityTime += ' 至 ' + (res.activity.eDate.split('-'))[1] + '-' + (res.activity.eDate.split('-'))[2] + ' ' + (res.activity.eTime || '');
							} else {
								res.activity.activityTime += ' 至 ' + (res.activity.eDate.split('-'))[0] + '-' + (res.activity.eDate.split('-'))[1] + '-' + (res.activity.eDate.split('-'))[2] + ' ' + (res.activity.eTime || '');
							};
						};
					};
					if (res.activity.area && res.activity.area.length) {
						res.activity.realAddress = res.activity.area;
						if (res.activity.realAddress[0] == res.activity.realAddress[1]) {
							res.activity.realAddress = res.activity.realAddress[0] + '' + res.activity.realAddress[2];
						} else {
							res.activity.realAddress = res.activity.realAddress[0] + '' + res.activity.realAddress[1] + '' + res.activity.realAddress[2];
						};
					};
					if (res.activity.address) {
						res.activity.realAddress += '' + res.activity.address;
					};
					if (res.activity.addressName) {
						res.activity.realAddress += ' | ' + res.activity.addressName;
					};
					if(res.activity.pic){
						res.activity.pic = app.image.crop(res.activity.pic, 160, 160);
					};
					
					//详情
					if (res.activity.content) {
						if (typeof res.activity.content == 'object' && res.activity.content.length) {
							app.each(res.activity.content, function (i, item) {
								if (item.type == 'image') {
									item.file = app.image.width(item.src, _this.getData().contentImgWidth)
								} else if (item.type == 'video') {
									item.file = app.config.filePath + '' + item.src;
									if (item.poster) {
										item.poster = app.image.width(item.poster, _this.getData().contentImgWidth)
									};
								};
							});
							_this.setData({
								contentData: res.activity.content
							});
						} else if (typeof res.content == 'string') {
							/*res.content = [{
								type: 'text',
								content: res.content
							}];*/
							_this.setData({
								contentData: []
							});
						};
					};
					_this.setData({data:res});
					
					if(res.sendstatus==1){
						setTimeout(function(){
							app.navTo('../../activity/detail/detail?id='+res.activity._id);
						},2000);
					};
					
					//设置分享参数
					let newData = {
						id: options.id,
						pocode: app.storage.get('pocode')
					};
					let pathUrl = app.mixURL('/p/activity/ticketReceive/ticketReceive', newData),
						shareData = {
							shareData: {
								title: res.activity.name||res.activity.title,
								content: res.activity.describe||res.activity.content,
								path: 'https://' + app.config.domain + pathUrl,
								pagePath: pathUrl,
								img: res.activity.pic,
								imageUrl: res.activity.pic,
								weixinH5Image: res.activity.pic,
								wxid:'',
							}
						},
						reSetData = function () {
							setTimeout(function () {
								if (_this.selectComponent('#newShareCon')) {
									_this.selectComponent('#newShareCon').reSetData(shareData);
								} else {
									reSetData();
								};
							}, 500);
						};
					reSetData();
					
				});
			},
			receiveThis:function(){
				let _this = this,
					data = this.getData().data,
					options = this.getData().options;
				if(!options.id)return;
				app.request('//activityapi/reviceTicket',{ticketid:options.id},function(res){
					app.tips('领取成功','success');
					_this.setData({
						'data.ismy':1,
						'data.sendstatus':1
					});
					setTimeout(function(){
						app.navTo('../../activity/detail/detail?id='+data.activity._id);
					},1000);
				});
			},
			onShareAppMessage: function () {
				return app.shareData;
			},
			onShareTimeline: function () {
				let data = app.urlToJson(app.shareData.pagePath),
					shareData = {
						title: app.shareData.title,
						query: 'scene=' + data.id + '_' + data.pocode,
						imageUrl: app.shareData.imageUrl
					};
				console.log(app.toJSON(shareData));
				return shareData;
			},
			//导航
			openLocation: function (e) {
				let address = app.eData(e).address;
				//根据地址获取经纬度
				var QQMapWX = require('../../../static/js/qqmap-wx-jssdk.min.js');
				var myAmapFun = new QQMapWX({
					key: 'GE2BZ-GNDHF-DPMJR-N32JG-7VYD3-B3BLY'
				});
				myAmapFun.geocoder({
					address: address,
					success: function (data) {
						if (data.result && data.result.location) {
							wx.openLocation({
								longitude: Number(data.result.location.lng),
								latitude: Number(data.result.location.lat),
								name: address
							});
						} else {
							app.tips('获取导航结果失败', 'error');
						};
					},
					fail: function (info) {
						app.tips('获取导航结果失败', 'error');
						console.log(app.toJSON(info));
					}
				});
			},
        }
    });
})();