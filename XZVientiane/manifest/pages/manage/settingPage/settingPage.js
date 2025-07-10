/**
 *模块组件构造器
 */
(function() {

	let app = getApp();

	app.Page({
		pageId: 'manage-settingPage',
		data: {
			systemId: 'manage',
			moduleId: 'settingPage',
			isUserLogin: app.checkUser(),
			data: [],
			options: {},
			form:{
				tempversion:1,
				showypstatus:0,
				page:1,
				size:10
			},
			settings: {
				bottomLoad:true,
				noMore:false
			},
			language: {},
			myAuthority:app.storage.get('myAuthority'),
			windowWidth: (app.system.windowWidth > 480 ? 480 : app.system.windowWidth),
	  		imgHeight:(app.system.windowWidth > 480 ? 480 : app.system.windowWidth)/2,
			modules:[],
			shopInfo:'',
			editType:1,
			pid:'',
			pageid:'',
			reloadIndex:-1,//重载模块
			showLoading:false,
			showNoData:false,
			showModel:false,
			newData:[],
			pageCount:0,
		},
		methods: {
			onLoad:function(options){
				if(app.config.client!='wx'){
					xzSystem.loadSrcs([app.config.staticPath + 'css/shopIndex.css'], function () {});
				};
				this.setData({
					myAuthority:app.storage.get('myAuthority'),
					options:options
				});
				if(!this.getData().myAuthority){
					app.navTo('../../manage/index/index');
				};
				let _this=this;
				app.checkUser(function(){
					_this.setData({isUserLogin:true});
					_this.load();
				});
			},
			onShow: function(){
				//检查用户登录状态
				let isUserLogin=app.checkUser();
				if(isUserLogin!=this.getData().isUserLogin){
					this.setData({isUserLogin:isUserLogin});
					if(isUserLogin){
						this.load();	
					};
				}else if(this.getData().reloadIndex!='-1'){
					this.freshModule(this.getData().reloadIndex);
					this.setData({reloadIndex:-1});
				};
			},
			onPullDownRefresh: function() {
			   //this.load();
			   wx.stopPullDownRefresh();
			},
			selectThis:function(e){
				let _this = this,
					type = app.eData(e).type,
					formData = this.getData().form;
				if(type=='tempversion'){
					formData[type] = formData[type]==1?2:1;
				}else if(type=='showypstatus'){
					formData[type] = formData[type]==1?0:1;
				};
				app.request('//shopapi/saveShopBasicinfo',formData,function(){
					_this.setData({
						form:formData
					});
				});
			},
			toShowModel:function(){
				let formData = this.getData().form;
				this.getModules();
				this.setData({showModel:true});
			},
			submitVersion:function(){
				let _this = this,
					formData = this.getData().form,
					msg = '';
				if(msg){
					app.tips(msg,'error');
				}else{
					app.request('//shopapi/saveShopBasicinfo',formData,function(){
						_this.toShowModel();
					});
				};
			},
			load:function(){
				let _this=this,
					options = this.getData().options,
					formData = this.getData().form;
				app.request('//shopapi/getShopBasicinfo',{shopid:app.session.get('manageShopId')},function(req){
					req.cover=req.cover||req.logo;
					if(req.logo){
						req.logo=app.image.crop(req.logo,80,80);
					};
					if(req.cover){
						req.cover=app.image.width(req.cover,_this.getData().windowWidth);
					};
					_this.setData({
						shopInfo:req,
						'form.tempversion':1,
						'form.showypstatus':req.showypstatus||0,
					});
					_this.toShowModel();
				});
			},
			getModules:function(){
				let _this = this;
				app.request('//shopapi/getShopPageSettingsTemp',{type:'home'},function(res){
					if(res&&res.settings&&res.settings.length){
						let data=_this.resetModules(res.settings);
						_this.setData({modules:data});
						let items=[];
						app.each(data,function(i,item){
							if(item.type=='article'||item.type=='goods'){
								items.push(i);
							};
						});
						if(items.length){
							let index=0,
								getData=function(){
									_this.freshModule(items[index],function(){
										index++;
										if(index!=items.length){
											getData();
										};
									});
								};
							getData();
						};
						_this.setData({pid:res.id,pageid:res.pageid});
					};
				});
			},
			//设置模块数据
			resetModules:function(data){
				let _this=this,
					filePath=app.config.filePath,
					windowWidth=_this.getData().windowWidth;
				app.each(data,function(i,item){
					let addClass='';
					if(!item.settings){
						item.settings={};
					};
					if(item.content==undefined){
						item.content='';
					}else if(item.content){
						switch(item.type){
							case 'text':
								item.fontStyle='';
								if(item.settings.fontSize){
									item.fontStyle+='font-size:'+item.settings.fontSize+'px;';
								};
								if(item.settings.fontWeight=='1'){
									item.fontStyle+='font-weight:bold;';
								}else if(item.settings.fontWeight=='2'){
									item.fontStyle+='font-weight:bolder;';
								};
								if(item.settings.color){
									item.fontStyle+='color:'+item.settings.color+';';
								};
							break;
							
							case 'image':
								if(item.content.length){
									let column=item.settings.column||1,
										picWdith=windowWidth/column;
									app.each(item.content, function (j, item1) {
										if(item.settings.showType == 1){
											let widthScale = Number(item.settings.widthScale)?Number(item.settings.widthScale):2,
												heightScale = Number(item.settings.heightScale)?Number(item.settings.heightScale):1,
												imageHeight = _this.getData().windowWidth/widthScale*heightScale;
											item1.file = app.image.crop(item1.src, _this.getData().windowWidth,imageHeight);
										}else{
											item1.file = app.image.width(item1.src, picWdith);
										};
										item.imageView = item.settings.imageView==1?1:0;
									});
								};
								if(item.settings.imageMargin==1){
									item.imageMarginClass='pl5 pt5';
									item.imageMarginStyle='margin-top:-5px;margin-left:-5px';
								}else if(item.settings.imageMargin==2){
									item.imageMarginClass='pl10 pt10';
									item.imageMarginStyle='margin-top:-10px;margin-left:-10px';
								}else if(item.settings.imageMargin==3){
									item.imageMarginClass='pl15 pt15';
									item.imageMarginStyle='margin-top:-15px;margin-left:-15px';
								}else{
									item.imageMarginClass='';
									item.imageMarginStyle='';
								};
								item.showType = item.settings.showType?item.settings.showType:0;
								if(item.settings.showType==2){//左一右多
									item.imageLeftWidth = item.settings.imageLeftWidth?item.settings.imageLeftWidth+'px':'50%';
									
									if(item.settings.picsColumnMarginlr){
										item.picsColumnMarginlr = item.settings.imageLeftWidth?Number(item.settings.imageLeftWidth)+Number(item.settings.picsColumnMarginlr)+'px':'50%';
									}else{
										item.picsColumnMarginlr = item.settings.imageLeftWidth?item.settings.imageLeftWidth+'px':'50%';
									};
									item.picsColumnMargintb = (item.settings.picsColumnMargintb?Number(item.settings.picsColumnMargintb):0)+'px';
								}else if(item.settings.showType==3){//左多右一
									item.imageRightWidth = item.settings.imageRightWidth?item.settings.imageRightWidth+'px':'50%';
									
									if(item.settings.picsColumnMarginlr){
										item.picsColumnMarginlr = item.settings.imageRightWidth?Number(item.settings.imageRightWidth)+Number(item.settings.picsColumnMarginlr)+'px':'50%';
									}else{
										item.picsColumnMarginlr = item.settings.imageRightWidth?item.settings.imageRightWidth+'px':'50%';
									};
									item.picsColumnMargintb = (item.settings.picsColumnMargintb?Number(item.settings.picsColumnMargintb):0)+'px';
								}else if(item.settings.showType==4){//自定义
									let newContent = app.deepCopy(item.content),
										picsColumn = item.settings.picsColumn?item.settings.picsColumn.split('-'):'',
										picsList = [];
									if(!picsColumn.length){
										for(var a=0;a<item.content.length;a++){
											picsColumn.push(1);
										};
									};
									app.each(picsColumn, function (l, g) {
										let itemJSON = newContent.splice(0, Number(g));
										picsList.push({
											data: itemJSON
										});
									});
									item.picsList = picsList;
									item.picsColumnMargintb = (item.settings.picsColumnMargintb?Number(item.settings.picsColumnMargintb):0)+'px';
									item.picsColumnMarginlr = (item.settings.picsColumnMarginlr?Number(item.settings.picsColumnMarginlr):0)+'px';
								};
							break;
							
							case 'video':
								item.file = filePath + item.content.src;
								let w=windowWidth;
								if(item.settings.marginLeft){
									windowWidth-=15;
								};
								if(item.settings.marginRight){
									windowWidth-=15;
								};
								item.width=windowWidth;
								if (item.content.poster) {
									item.posterFile = app.image.width(item.content.poster, w);
								};
								
							break;
							default :
							if(typeof item.content=='object'){
								if(!item.settings.template){
									item.settings.template=1;
								};
								app.each(item.content,function(j,item1){
									let c=item.settings.column||2,
											w=item.settings.picWidth||windowWidth/c,
											h=item.settings.picHeight||windowWidth/c;
									if(item1.pic){
										if(item.type=='goods'){
											item1.pic_3 = app.image.crop(item1.pic,100,100);
											item1.pic_4 = app.image.crop(item1.pic,108,78);
											item1.pic_5 = app.image.crop(item1.pic,150,150);
										};
										item1.pic = app.image.crop(item1.pic,w,h);
									}
								});
							};
						};
						
					};
					if(item.settings.backgroundColor){
						item.style='background-color:'+item.settings.backgroundColor+';';
					};
					if(item.settings.marginSize){
						if(item.settings.marginTop=='1'){
							addClass+=' mt'+item.settings.marginSize;
						};
						if(item.settings.marginRight=='1'){
							addClass+=' mr'+item.settings.marginSize;
						};
						if(item.settings.marginBottom=='1'){
							addClass+=' mb'+item.settings.marginSize;
						};
						if(item.settings.marginLeft=='1'){
							addClass+=' ml'+item.settings.marginSize;
						};
					};
					if(item.settings.paddingSize){
						if(item.settings.paddingTop=='1'){
							addClass+=' pt'+item.settings.paddingSize;
						};
						if(item.settings.paddingRight=='1'){
							addClass+=' pr'+item.settings.paddingSize;
						};
						if(item.settings.paddingBottom=='1'){
							addClass+=' pb'+item.settings.paddingSize;
						};
						if(item.settings.paddingLeft=='1'){
							addClass+=' pl'+item.settings.paddingSize;
						};
					};
					if(item.settings.bottomLine=='1'){
						addClass+=' hasBorder bottom';
					};
					if(item.settings.radiusTopLeft){
						item.style+=' border-top-left-radius:'+item.settings.radiusTopLeft+'px;';
					};
					if(item.settings.radiusTopRight){
						item.style+=' border-top-right-radius:'+item.settings.radiusTopRight+'px;';
					};
					if(item.settings.radiusBottomRight){
						item.style+=' border-bottom-right-radius:'+item.settings.radiusBottomRight+'px;';
					};
					if(item.settings.radiusBottomLeft){
						item.style+=' border-bottom-left-radius:'+item.settings.radiusBottomLeft+'px;';
					};
					if(item.type=='service'){
						item.settings.serviceBtnPic = app.image.crop(item.settings.serviceBtnPic||'16412827297502232.png',60,60);
					};	
					if(item.settings.moduleTitleIcon&&item.settings.moduleTitleIcon.indexOf('http')==-1){
						item.settings.moduleTitleIcon = app.config.filePath+''+item.settings.moduleTitleIcon;
					};	
					item.addClass=addClass;
				});
				return data;
			},
			
			//刷新数据
			freshModule:function(index,callback){
				let _this=this,
						modules=_this.getData().modules,
						data=modules[index],
						parms='',
						set=function(res){
							data.content=res.data;
							data=_this.resetModules([data])[0];
							modules[index]=data;
							_this.setData({modules:modules});
							if(typeof callback=='function'){
								callback();
							}
						};
				switch(data.type){
					case 'info':
						app.request('//shopapi/getShopBasicinfo',function(req){
							req.cover=req.cover||req.logo;
							if(req.logo){
								req.logo=app.image.crop(req.logo,80,80);
							};
							if(req.cover){
								req.cover=app.image.width(req.cover,_this.getData().windowWidth);
							};
							_this.setData({shopInfo:req});
							set('');
						},function(){
							if(typeof callback=='function'){
								callback();
							}
						});
					break;
					case 'goods':
						parms={
							size:data.settings.size||6,
							goodsCategoryId:data.settings.goodsCategoryId||'',
							dataLimit:data.settings.dataLimit,
							tags:data.settings.tags,
							pointTag:data.settings.pointTag,
							sort:'top'
						};
						if(data.settings.dataLimit==3){//项目商品
							parms.shopid = data.settings.projectShopid;
							app.request('//vshopapi/getShopGoodsListByShopid',parms,function(res){
								set(res);
							},function(){
								if(typeof callback=='function'){
									callback();
								};
							});
						}else if(data.settings.dataLimit==4){//入驻商品
							parms.shopid = data.settings.settledShopid;
							app.request('//vshopapi/getEnterGoodsList',parms,function(res){
								set(res);
							},function(){
								if(typeof callback=='function'){
									callback();
								};
							});
						}else{
							app.request('//vshopapi/getShopGoodsList',parms,function(res){
								set(res);
							},function(){
								if(typeof callback=='function'){
									callback();
								};
							});
						};
					break;
					case 'article':
						parms={
							size:data.settings.size||6,
							categoryid:data.settings.categoryid||'',
							dataLimit:data.settings.dataLimit,
							sort:'top'
						};
						app.request('//vshopapi/getShopArticleList',parms,function(res){
							set(res);
						},function(){
							if(typeof callback=='function'){
								callback();
							}
						})
					break
				};
			},
			//搜索事件
			searchSubmit:function(e){
				let _this=this,
					index=app.eData(e).index,
					modules=_this.getData().modules;
				app.navTo('../../shop/goods/goods?keyword='+modules[index].value);
				if(app.config.client=='web'||app.config.client=='app'){
					e.preventDefault();
				};
			},
			//搜索框事件
			searchInput:function(e){
				let _this=this,
						index=app.eData(e).index,
						value=app.eValue(e),
						modules=_this.getData().modules;
				modules[index].value=value;
				_this.setData({modules:modules});
			},
			
			//查看图片
			tapImage:function(e){
				let _this=this,
					index=app.eData(e).index,
					index1=app.eData(e).index1,
					itemData=_this.getData().modules[index],
					module=_this.getData().modules[index].content;
				if(module[index1].link){
					if(app.config.client=='web'){
						window.open(module[index1].link);
					}else{
						app.navTo(module[index1].link);
					}
				}else{
					let newSrc = [];
					app.each(module, function(i, item) {
						if(item.src){
							newSrc.push(app.image.width(item.src, 480));
						};
					});
					if(!itemData.imageView){
						app.previewImage({
							current: newSrc[index1],
							urls: newSrc
						});
					};
				};
			},
			viewImage:function(e){
				let _this=this,
					image=app.eData(e).image;
				
				if(image){
					image=image.split('?')[0];
					image=app.image.width(image, 480);
					app.previewImage({
						current: image,
						urls: [image]
					});
				};
				
			},
			//设置
			setModule:function(e){
				let _this = this,
          			index = Number(app.eData(e).index),
          			dataArray = this.getData().modules,
					cData=app.extend({},dataArray[index]);
				
				app.storage.set('pageModuleData',{type:cData.type,settings:cData.settings});
				
				_this.dialog({
					title:'模块设置',
					url:'../../manage/settingPageModule/settingPageModule',
					success:function(res){
						app.storage.remove('pageModuleData');
						cData.settings=res.settings;
						cData=_this.resetModules([cData])[0];
						dataArray.splice(index,1);
						dataArray.splice(index,0,cData);
						_this.setData({modules:dataArray});
						_this.freshModule(index);
						_this.save();
					}
				});	
			},
			editModule:function(e){
				this.editModuleContent(Number(app.eData(e).index));
			},
			editModuleContent:function(index){
				let _this = this,
            		modules = this.getData().modules,
					module=modules[index],
					inputData={},
					saveEdit=function(){
						modules[index]=module;
						_this.setData({modules:modules});
						_this.freshModule(index);
						_this.save();
					};
				switch(module.type){
					//编辑文字
					case 'text':
						inputData.value=module.content||'';
						inputData.type='textarea';
						//app.storage.set('textInputData',inputData);
						_this.dialog({
							url: '../../home/textInput/textInput?content='+inputData.value,
							title: inputData.title||'编辑文字',
							success: function (res) {
								//app.storage.remove('textInputData');
								if (res) {
									module.content = res.content;
									saveEdit();
								};
							}
						});	
					break;
					
					//编辑图片
					case 'image':
						app.storage.set('settingImageData',module.content);
						_this.dialog({
								title:'编辑图片',
								url:'../../home/setImage/setImage?key=settingImageData',
								success:function(res){
									app.storage.remove('settingImageData');
									if (res&&res.length) {
										module.content = res;
										module=_this.resetModules([module])[0];
								
										saveEdit();
									};
								}
						});
					break;
					
					
					//编辑搜索提示文字
					case 'search':
						inputData.value=module.content||'';
						inputData.empty=true;
						app.storage.set('textInputData',inputData);
						_this.dialog({
							url: '../../home/textInput/textInput',
							title: inputData.title||'编辑提示文字',
							success: function (res) {
								app.storage.remove('textInputData');
								if (res) {
									module.content = res.value;
									saveEdit();
								};
							}
						});
					break;
					
					//文章
					case 'article':
						_this.setData({reloadIndex:index});
						app.navTo('../../manage/article/article');
					break;
					
					//商品
					case 'goods':
						_this.setData({reloadIndex:index});
						app.navTo('../../manage/goods/goods');
					break
					
					//编辑视频
					case 'info':
						_this.setData({reloadIndex:index});
						app.navTo('../../manage/settingInfo/settingInfo');      
					break;
					//编辑css
					case 'style':
						inputData.value=module.content||'';
						inputData.type='textarea';
						app.storage.set('textInputData',inputData);
						_this.dialog({
							url: '../../home/textInput/textInput',
							title: '自定义css',
							success: function (res) {
								app.storage.remove('textInputData');
								if (res) {
									module.content = res.value;
									saveEdit();
								};
							}
						});	
					break;
				};	
			},
	
			//删除模块
			delModule:function(e){
				let _this = this,
				  index = Number(app.eData(e).index),
				  dataArray = this.getData().modules;
				if(dataArray.length>1){
					app.confirm('删除模块不可恢复，确定要删除吗？', function() {
						dataArray.splice(index, 1);
						_this.setData({
							modules: dataArray
						});
						_this.save();
					});
				}else{
					app.tips('至少要保留一个模块','error');
				};
			},
			//排序模块
			sortModule:function(e){
				let _this = this,
				  index = Number(app.eData(e).index),
				  dataArray = this.getData().modules,
				  list = ['置顶', '置底', '上移', '下移'];
				app.actionSheet(list, function(res) {
				  switch (list[res]) {
		
					case '置顶':
					  if (index != 0) {
						let firstData = dataArray[index];
						dataArray.splice(index, 1);
						dataArray.unshift(firstData);
		
						_this.setData({
						  modules: dataArray
						});
					  };
					  break;
					case '置底':
					  if (index != dataArray.length - 1) {
						let firstData = dataArray[index];
						dataArray.splice(index, 1);
						dataArray.push(firstData);
		
						_this.setData({
						  modules: dataArray
						});
					  };
					  break;
					case '上移':
					  if (index != 0) {
						let firstData = dataArray[index],
						  lastData = dataArray[index - 1];
		
						dataArray.splice(index, 1);
						dataArray.splice(index - 1, 0, firstData);
						_this.setData({
						  modules: dataArray
						});
					  };
					  break;
					case '下移':
					  if (index != dataArray.length - 1) {
						let firstData = dataArray[index],
						  lastData = dataArray[index + 1];
		
						dataArray.splice(index, 1);
						dataArray.splice(index + 1, 0, firstData);
						_this.setData({
						  modules: dataArray
						});
					  };
					  break;
		
				  };
					_this.save();
				});
			},
			//添加模块
			addModule:function(e){
				let _this=this,
					index=Number(app.eData(e).index),
					newIndex=index+1,
					modules=_this.getData().modules,
					insertModule=function(cData){
						cData=_this.resetModules([cData])[0];
						modules.splice(newIndex,0,cData);
						_this.setData({modules:modules});
						_this.freshModule(newIndex);
						if(!cData.needEdit){
							_this.save();
						};
					};
				_this.dialog({
					title:'选择模块',
					url:'../../manage/settingPageModuleSelect/settingPageModuleSelect',
					success:function(res){
						insertModule(res);
						if(res.needEdit){
							setTimeout(function(){
								_this.editModuleContent(newIndex);
							},500);
						};
					}
				});	
				//_this.save();
			},
			//保存设置
			save:function(publish){
				let _this=this,
					modules=_this.getData().modules,
					id=_this.getData().pid,
					pageid=_this.getData().pageid,
					pData=[];
				app.each(modules,function(i,item){
					let data={
						type:item.type,
						settings:item.settings,
						content:[]
					};
					if(item.type!='article'&&item.type!='goods'){
						let content=[];
						if(item.type=='image'){
							app.each(item.content,function(j,item1){
								content.push({
									link:item1.link,
									linkName:item1.linkName,
									src:item1.src
								});
							});
						}else{
							content=item.content;
						};
						data.content=content;
					};
					pData.push(data);
				});
				let url=publish?'//shopapi/saveShopPageSettings':'//shopapi/saveShopPageSettingsTemp',
					cData={settings:pData.length?pData:''};
				if(publish){
					cData.pageid=pageid;
				}else{
					cData.pageid=id;
				};
				app.request(url,cData,function(){
					if(publish){
						app.tips('发布成功');
					};
				});
			},
			//发布
			publish:function(e){
				let _this=this;
				app.confirm('发布后将覆盖店铺首页，确定要发布吗？',function(){
					_this.save(true);
				});
				
			},
			//选择设置模式
			selecteditType: function(e) {
				let value = app.eValue(e);
				this.setData({
				  editType: Number(value)
				});
			},
			toPage:function(e){
				let page=app.eData(e).page;
				if(page){
					app.navTo(page);
				};
			},
		}
	});
})();