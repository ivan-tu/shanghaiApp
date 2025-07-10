(function () {
	let app = getApp();
	app.Page({
		pageId: 'goods-index',
		data: {
			systemId: 'goods',
			moduleId: 'index',
			isUserLogin: app.checkUser(),
			client: app.config.client,
			data: [],
			options: {},
			settings: {bottomLoad:false},
			language: {},
			form: {
				page:1,
				size:10,
				goodsTypeid:'',
				allrecommend:'1',//推荐
				sort:'top',
			},
			//banner图片宽度
			bannerWidth:(app.system.windowWidth>480?480:app.system.windowWidth),
			//banner图片高度
			bannerHeight:((app.system.windowWidth>480?480:app.system.windowWidth))*0.4,
			bannerHeight2:((app.system.windowWidth>480?480:app.system.windowWidth))*0.4,
			//标签广告图片宽度
			tagsPicWidth:(app.system.windowWidth>480?480:app.system.windowWidth)-20,
			tagsPicWidth2:((app.system.windowWidth>480?480:app.system.windowWidth)-50)/2,
			//标签广告图片高度
			tagsPicHeight:((app.system.windowWidth>480?480:app.system.windowWidth)-20)/2,
			tagsPicHeight2:(((app.system.windowWidth>480?480:app.system.windowWidth)-50)/2)/2,
			columnWidth:'25%',
			settingData:{
				bannerList:[],//广告列表1
				bannerList2:[],//广告列表2
				menuList:[],//菜单列表
				column:'',//菜单一行多少个
				picsList:[],//图片列表
				picsColumn:'',//图片列数
				tagsList:[],//标签列表
			},
			menuListHeight:85,
			goodsPicWidth:((app.system.windowWidth>480?480:app.system.windowWidth)-30)/2,
			goodsPicHeight:((app.system.windowWidth>480?480:app.system.windowWidth)-30)/2,
			showLoading:false,
			showNoData:false,
			count:0,
			pageCount:0,
			goodsList:[],//推荐商品-无限
			hotGoodsList:[],//热门商品
			systemMenuUrl: ['/home/index/index','/suboffice/index/index','/goods/index/index', '/user/my/my'],
			keyword:'',
			//标签广告图片宽度
			tagsPicWidth:(app.system.windowWidth>480?480:app.system.windowWidth)-20,
			tagsPicWidth2:((app.system.windowWidth>480?480:app.system.windowWidth)-50)/2,
			//标签广告图片高度
			tagsPicHeight:((app.system.windowWidth>480?480:app.system.windowWidth)-20)/2,
			tagsPicHeight2:(((app.system.windowWidth>480?480:app.system.windowWidth)-50)/2)/2,
			solitaireList:[],//接龙购
		},
		methods: {
			onLoad: function (options) {
				let _this = this;
				console.log(app.toJSON(options));
				if (app.config.client == 'wx' && options.scene) {
					let scenes = options.scene.split('_');
					options.pocode = scenes[0];
					app.session.set('vcode', scenes[0]);
					delete options.scene;
				};
				_this.setData({
					options: options,
				});
				if(app.config.client!='wx'){
					let systemMenuUrl = this.getData().systemMenuUrl,
						swiperJs = xzSystem.getSystemDist('assets') + 'js/swiper.js',
						swiperCss = xzSystem.getSystemDist('assets') + 'css/swiper.css';
					xzSystem.loadSrcs([swiperJs, swiperCss],function(){
						_this.load();
					});
					$('body').undelegate('.openCustomLink','click');
					$('body').delegate('.openCustomLink','click',function(e){
						e.preventDefault();
						e.stopPropagation();
						let linktype = $(this).data('linktype'),
							urlLink = $(this).data('link');
						if(!urlLink){
							return false;
						};
						if (urlLink.indexOf('http') == 0&&app.config.client=='web'){
							window.location.href = urlLink;
						}else{
							let isTab = 0;
							app.each(systemMenuUrl, function (i, item) {
								if (urlLink.indexOf(item) >= 0) {
									isTab = 1;
								};
							});
							if (isTab == 1) {
								app.switchTab({
									url: urlLink
								});
							} else {
								app.navTo(urlLink);
							};
						};
					});
				}else{
					_this.load();
				};
			},
			onShow:function(){
				/*if(app.config.client=='app'){
					setTimeout(function(){
						let	systemWidth = $(window).width()>480?480:$(window).width(),
							bannerWidth = systemWidth,
							bannerHeight = bannerWidth*0.4,
							tagsPicWidth = systemWidth-20,
							tagsPicWidth2 = (systemWidth-50)/2,
							tagsPicHeight = (systemWidth-20)/2,
							tagsPicHeight2 = ((systemWidth-50)/2)/2;
						_this.setData({
							bannerWidth:bannerWidth,
							bannerHeight:bannerHeight,
							tagsPicWidth:tagsPicWidth,
							tagsPicWidth2:tagsPicWidth2,
							tagsPicHeight:tagsPicHeight,
							tagsPicHeight2:tagsPicHeight2
						});
						let bannerList = _this.getData().settingData.bannerList,
							bannerList2 = _this.getData().settingData.bannerList2;
						if(bannerList&&bannerList.length){
							app.each(bannerList,function(i,item){
								item.pic = app.image.crop(item.picUrl,bannerWidth,bannerHeight);
							});
							_this.setData({'settingData.bannerList':bannerList});
							if(_this.mySwiperA){
								_this.mySwiperA.updateSize();
							};
						};
						if(bannerList2&&bannerList2.length){
							app.each(bannerList2,function(i,item){
								item.pic = app.image.crop(item.picUrl,bannerWidth,bannerHeight);
							});
							_this.setData({'settingData.bannerList2':bannerList2});
							if(_this.mySwiperB){
								_this.mySwiperB.updateSize();
							};
						};
					},20);
				};*/
			},
			onPullDownRefresh: function () {
				this.setData({
					'form.page': 1
				});
				this.load();
				wx.stopPullDownRefresh()
			},
			load: function () {
				let _this = this,
					options = this.getData().options;
				//设置分享参数
				let newData = app.extend({}, options);
				newData = app.extend(newData, {
					pocode: app.storage.get('pocode')
				});
				let pathUrl = app.mixURL('/p/goods/index/index', newData), 
					sharePic = 'https://statics.tuiya.cc/17333689747996230.jpg',
					shareData = {
						shareData: {
							title: '快来一起入局，出门入局，乐在局中。',  
							content: '在局活动社交平台',
							path: 'https://' + app.config.domain + pathUrl,
							pagePath: pathUrl,
							img: sharePic,
							imageUrl: sharePic,
							weixinH5Image: sharePic,
							wxid: 'gh_601692a29862',
							showMini: false,
							hideCopy: app.config.client=='wx'?true:false,
						},
					}, 
					reSetData = function() {
						setTimeout(function() {
							if (_this.selectComponent('#newShareCon')) {
								_this.selectComponent('#newShareCon').reSetData(shareData)
							} else {
								reSetData();
							}
						}, 500)
					};
				reSetData();
				this.getSetting();//获取设置
				//this.getSolitaireList();
				this.getHotGoodsList();
				this.getList();
			},
			getSetting:function(){//获取首页所有广告设置
				let _this = this,
					bannerId_a = '#swiperBanner',
					bannerId_b = '#swiperBanner2';
				app.request('//set/get',{type:'goodsIndex',result:'data'},function(res){
					let backData = res.data;
					if(backData){
						if(backData.bannerList&&backData.bannerList.length){
							app.each(backData.bannerList,function(i,item){
								item.picUrl = item.pic;
								item.pic = item.pic?app.image.crop(item.pic,_this.getData().bannerWidth,_this.getData().bannerHeight):'';
							});
							_this.setData({'settingData.bannerList':backData.bannerList});
							//设置滑动块
							if(app.config.client!='wx'){
								setTimeout(function(){
									if(_this.mySwiperA){
										_this.mySwiperA.init();
									}else{
										var mySwiperA = new Swiper(bannerId_a, {
											pagination: bannerId_a + ' .pagination',
											paginationClickable: true,
											grabCursor: true,
											resizeReInit: true,
											loop: false,
											slidesPerView: 1,
											calculateHeight: true,
											autoplay: 4000,
											speed: 1000,
											autoplayDisableOnInteraction: false,
										});
										_this.mySwiperA = mySwiperA;
									};
								},500);
							};
						};
						if(backData.picsList&&backData.picsList.length&&backData.picsColumn){
							app.each(backData.picsList,function(i,item){
								item.pic = item.pic?app.image.width(item.pic,750):'';
							});
							let picsColumn = backData.picsColumn.split('-'),
								picsList = [];
							if(picsColumn.length){
								app.each(picsColumn,function(i,item){
									let itemJSON = backData.picsList.splice(0,Number(item));
									picsList.push({data:itemJSON});
								});
								_this.setData({'settingData.picsList':picsList});
							};
						};
						
						//菜单
						if(backData.menuList&&backData.menuList.length){
							let newList = [];
							if(!backData.column){
								backData.column = 4;//默认一行4个
							};
							_this.setData({columnWidth:1/backData.column*100+'%'});
							//[[],[]];
							app.each(backData.menuList,function(i,item){
								item.pic = item.pic?app.image.crop(item.pic,80,80):'';
								let index = Math.ceil((i+1)/(backData.column*2));
								if(newList[index-1]&&newList[index-1].length){
									newList[index-1].push(item);
								}else{
									newList[index-1] = [];
									newList[index-1].push(item);
								};
							});
							_this.setData({
								'settingData.menuList':newList,
								menuListHeight:Math.ceil(backData.menuList.length/backData.column)*85,
							});
							//设置滑动块
							if(app.config.client!='wx'){
								setTimeout(function(){
									if(_this.mySwiperE){
										_this.mySwiperE.init();
									}else{
										var mySwiperE = new Swiper('#swiperBannerE', {
											pagination: '#swiperBannerE .pagination',
											paginationClickable: true,
											grabCursor: true,
											resizeReInit: true,
											loop: false,
											slidesPerView: 1,
											calculateHeight: true,
											//autoplay: 3000,
											speed: 1000,
											autoplayDisableOnInteraction: false,
										});
										_this.mySwiperE = mySwiperE;
									};
								},500);
							};
						};
						//标签商品
						if(backData.tagsList&&backData.tagsList.length){
							app.each(backData.tagsList,function(i,item){
								/*if(item.ad&&item.ad.length){
									app.each(item.ad,function(l,g){
										if(item.ad.length>1){
											g.pic = g.pic?app.image.width(g.pic,_this.getData().tagsPicWidth2):'';
										}else{
											g.pic = g.pic?app.image.width(g.pic,_this.getData().tagsPicWidth):'';
										};
									});
								};*/
								item.goodsList = [];
								_this.getTagsList({
									page:1,
									size:4,
									tags:item.title,
									sort:'top',
								},function(data){
									let tagsList = _this.getData().settingData.tagsList;
									if(data&&data.length){
										app.each(data,function(a,b){
											b.pic = app.image.crop(b.pic,_this.getData().goodsPicWidth,_this.getData().goodsPicWidth);
										});
									};
									tagsList[i].goodsList = data;
									_this.setData({'settingData.tagsList':tagsList});
								});
							});
							_this.setData({'settingData.tagsList':backData.tagsList});
						};
					};
				},function(msg){
					console.log('/set/get：'+app.toJSON(msg));
				});
			},
			toSearch:function(){
				/*this.setData({
					'form.page':1
				});
				setTimeout(function(){
					wx.pageScrollTo({
						scrollTop:500
					});
				},300);
				this.getList();*/
				let keyword = this.getData().keyword;
				if(keyword){
					app.navTo('../../shop/goodsList/goodsList?keyword='+keyword);
				};
			},
			screenCategory:function(e){//筛选分类
				this.setData({
					'form.page':1,
					'settings.bottomLoad':true,
					'form.type':'',
				});
				if(app.eData(e).id=='recommend'){
					this.setData({
						'form.goodsTypeid':'',
						'form.recommend':'1',
					});
				}else{
					this.setData({
						'form.goodsTypeid':app.eData(e).id,
						'form.recommend':'',
					});
				};
				this.getList();
			},
			screenGiftType:function(e){
				this.setData({
					'form.page':1,
					'settings.bottomLoad':true,
					'form.type':app.eData(e).type,
				});
				this.getList();
			},
			toGoodsDetail:function(e){
				let id = app.eData(e).id;
				if(id){
					app.navTo('../../shop/goodsDetail/goodsDetail?id='+id);
				};
			},
			getHotGoodsList:function(){//获取热门商品列表
				let _this = this;
				app.request('//shopapi/getAllGoodsList',{page:1,size:4,sort:'top',allhot:1},function(backData){
					if(backData.data&&backData.data.length){
						app.each(backData.data,function(i,item){
							item.pic = app.image.crop(item.pic,_this.getData().goodsPicWidth,_this.getData().goodsPicHeight);
						});
						_this.setData({
							hotGoodsList:backData.data
						});
					}else{
						_this.setData({
							hotGoodsList:[]
						});
					};
				});
			},
			getList:function(loadMore){//获取无限滚动商品列表
				let _this = this,
					formData = _this.getData().form,
					pageCount = _this.getData().pageCount,
					ajaxURL = '//shopapi/getAllGoodsList';
				if(loadMore){
					if (formData.page >= pageCount) {
						_this.setData({'settings.bottomLoad':false});
					};
				};
				_this.setData({'showLoading':true});
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
							item.pic = app.image.crop(item.pic,_this.getData().goodsPicWidth,_this.getData().goodsPicHeight);
						});
					};
					if(loadMore){
						list = _this.getData().goodsList.concat(list);
					};
					_this.setData({
						goodsList:list,
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
			checkLogin:function(callback){
				let _this = this,
					options = this.getData().options;
				if(app.checkUser()){
					callback();
				}else{
					app.confirm({
						content:'您还没有登录',
						confirmText:'立即登录',
						success:function(res){
							if(res.confirm){
								app.userLogining = false;
								app.userLogin({
									success: function (){
										app.tips('登录成功','success');
										_this.setData({isUserLogin:true});
										callback();
									}
								});
							};
						}
					});
				};
			},
			toLogin:function(){
				app.userLogining = false;
				app.userLogin({
					success: function (){
						app.tips('登录成功','success');
						_this.setData({isUserLogin:true});
						callback();
					}
				});
			},
			openCustomLink:function(e){//打开自定义链接
				let _this = this,
					systemMenuUrl = this.getData().systemMenuUrl,
					linktype = app.eData(e).linktype,
					urlLink = app.eData(e).link;
				if(!urlLink){
					return false;
				};
				if (urlLink.indexOf('http') == 0&&app.config.client=='web'){
					window.location.href = urlLink;
				}else{
					let isTab = 0;
					app.each(systemMenuUrl, function (i, item) {
						if (urlLink.indexOf(item) >= 0) {
							isTab = 1;
						};
					});
					if (isTab == 1) {
						app.switchTab({
							url: urlLink
						});
					} else {
						app.navTo(urlLink);
					};
				};
			},
			toPage:function(e){
				if(app.eData(e).page){
					app.navTo(app.eData(e).page);
				};
			},
			toShare: function () {
				this.selectComponent('#newShareCon').openShare();
			},
			onShareAppMessage: function (){
				return app.shareData;
			},
			onShareTimeline: function () {
				let data = app.urlToJson(app.shareData.pagePath),
					shareData = {
						title: app.shareData.title,
						query: 'scene=' + data.pocode,
						imageUrl: app.shareData.imageUrl
					};
				return shareData;
			},
			getTagsList:function(formData,callback){
				let _this = this;
				app.request('//shopapi/getAllGoodsList',formData,function(backData){
					if(backData.data&&backData.data.length){
						
					}else{
						backData.data = [];
					};
					if(typeof callback =='function'){
						callback(backData.data);
					};
				});
			},
			toSolitaire:function(){
				app.switchTab({
					url:'../../solitaire/index/index'
				});
			},
			getSolitaireList:function(){//获取接龙
				let _this = this;
				app.request('//vshopapi/getSolitaireList', {page:1,size:1,order:'salecount'}, function(backData) {
					if (backData.data && backData.data.length) {
						app.each(backData.data, function(i, item) {
							if (item.goodsdata&&item.goodsdata.pic){
								item.goodsdata.pic = app.image.crop(item.goodsdata.pic, 140,140);
							};
							if (item.shopdata&&item.shopdata.logo){
								item.shopdata.logo = app.image.crop(item.shopdata.logo, 40,40);
							};
							if (item.userlist&&item.userlist.count){
								app.each(item.userlist.data,function(l,g){
									item.userlist.data[l].headpic = app.image.crop(g.headpic, 60,60);
								});
							};
							item.progress = item.nowpreferential&&item.maxprice?Math.floor(item.nowpreferential / item.maxprice * 100):0;
							item.endtimeText = ['00','00','00'];
						});
						_this.setData({
							solitaireList: backData.data
						});
					}else{
						_this.setData({
							solitaireList: []
						});
					};
					if(!backData.data.length&&_this.countDownFn){
						clearInterval(_this.countDownFn);
					}else{
						_this.countDown();
					};
				});
			},
			getDateTime:function(date){  
				//var hours = parseInt((date % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
				var hours = parseInt((date / (1000 * 60 * 60 * 24)) * 24);
				var minutes = parseInt((date % (1000 * 60 * 60)) / (1000 * 60));
				var seconds = parseInt((date % (1000 * 60)) / 1000);
				hours = hours<10?'0'+hours:hours;
				minutes = minutes<10?'0'+minutes:minutes;
				seconds = seconds<10?'0'+seconds:seconds;
				return [hours,minutes,seconds];
			},
			countDown:function(){//倒计时
				var _this = this,
					nowTime = (new Date(app.getNowDate(0,true).replace(/-/g, '/'))).getTime(),
					data = this.getData().solitaireList;
				if(!data.length)return;
				if(this.countDownFn){
					clearInterval(this.countDownFn);
				};
				this.countDownFn = setInterval(function(){
					nowTime = nowTime + 1000;
					app.each(data,function(i,item){
						if(item.endtime*1000 - nowTime <= 0){
							item.endtimeText = ['00','00','00'];
						}else{
							item.endtimeText = _this.getDateTime(item.endtime*1000 - nowTime);
						};
					});
					_this.setData({solitaireList:data});
				},1000);
			},
		}
	})
})();