/**
 *模块组件构造器
 */
(function() {

  let app = getApp();

  app.Page({
    pageId: 'manage-settingPageModule',
    data: {
      systemId: 'manage',
      moduleId: 'settingPageModule',
			isUserLogin: app.checkUser(),
      data: {},
      options: {},
      settings: {
      },
      language: {},
      form: {
		  column:1,
		  showType:0,
		  imageMargin:0,
		  marginSize:'',
		  marginTop:0,
		  marginLeft:0,
		  marginBottom:0,
		  marginRight:0,	
		  paddingSize:'',
		  paddingTop:0,
		  paddingLeft:0,
		  paddingBottom:0,
		  paddingRight:0,	
		  dataLimit:0,
		  bottomLine:0,
		  template:1,
		  tags:'',
		  pointTag:'',
		  categoryName:'',
		  size:6,
		  fontSize:'',
		  fontWeight:'',
		  color:'#333333',
		  backgroundColor:'#ffffff',
		  widthScale:2,
		  heightScale:1,
		  hideCover:0,//隐藏封面图片
		  hideStoreInfo:0,//隐藏店铺信息
		  hideStoreFocus:0,//隐藏关注按钮
		  hideStoreShare:0,//隐藏分享按钮
		  showStoreService:0,//显示客服按钮
		  radiusTopLeft:'',
		  radiusTopRight:'',
		  radiusBottomRight:'',
		  radiusBottomLeft:'',
		  moduleTitle:'',//模块标题
		  moduleTitleIcon:'',//模块标题icon
		  moduleTips:'',//模块副标题
		  moduleMoreText:'',//更多按钮
		  moduleMoreLink:'',//更多链接
		  moduleTitleColor:'',
		  moduleTipsColor:'',
		  moduleMoreTextColor:'',
		  customCss:'',//自定义css
		  imageView:0,//图片是否可点击放大0-可以 1-不可以
		  imageLeftWidth:'',
		  imageRightWidth:'',
		  picsColumn:'',
		  picsColumnMargintb:'',
		  picsColumnMarginlr:'',
		  projectShopid:'',//项目店铺id
		  serviceBtnPic:'16412827297502232.png',//客服联系图片
		  settledShopid:'',//入驻店铺id
		  tabOptions:'',//选项卡列表
	  },
	  type:'',
	  fontSizeIndex:0,
	  fontSizeList:['默认','10','12','14','16','18','24','32','48','72'],
	  colorList:['#ffffff','#f4f4f4','#cccccc','#999999','#333333','#000000','#279eff','#00f0d2','#3fe247','#f1e739','#ff0022','#ff3ca3'],
	  myAuthority:app.storage.get('myAuthority'),
	  client: app.config.client,
	  myProjectList:[],//我的项目
	  mySettledShopList:[],//我的入驻店铺
    },
    methods: {
		onLoad:function(options){
			this.setData({myAuthority:app.storage.get('myAuthority')});
			if(!this.getData().myAuthority){
				app.navTo('../../manage/index/index');
			};

			let _this=this;
			this.setData({options:options});
			app.checkUser(function(){
				_this.setData({isUserLogin:true});
				_this.load();
			});
			
		},
		onShow: function(){
			let _this=this;
			//检查用户登录状态
			let isUserLogin=app.checkUser();
			if(isUserLogin!=this.getData().isUserLogin){
				this.setData({isUserLogin:isUserLogin});
				this.load();
			};
			
		},
		onPullDownRefresh: function() {
			this.onShow();
			wx.stopPullDownRefresh();
		},
		load: function() {
			let _this=this;
			if(_this.getData().myAuthority.setting){
				let pageModuleData=app.storage.get('pageModuleData');
				console.log(app.toJSON(pageModuleData));
				if(pageModuleData.settings){
					let data={
						form:app.extend(_this.getData().form,pageModuleData.settings),
						type:pageModuleData.type
					};
					if(data.type=='text'){
						if(!data.form.fontSize){
							data.fontSizeIndex=0;
						}else{
							data.fontSizeIndex=app.inArray(data.form.fontSize,_this.getData().fontSizeList);
							console.log(data.form.fontSize);
							console.log(data.fontSizeIndex);
							if(data.fontSizeIndex<0){
								data.fontSizeIndex=0;
							}
						};
					}else if(data.type=='goods'){
						//获取项目
						app.request('//projectapi/getMyJoinProjectList',{},function(res){
							console.log('项目:'+app.toJSON(res))
							if(res&&res.length){
								_this.setData({myProjectList:res});
							}else{
								_this.setData({myProjectList:[]});
							};
						},function(){
							_this.setData({myProjectList:[]});
						});
						//获取入驻店铺
						app.request('//shopapi/getEnterShopList',{page:1,size:999,getCount:1},function(res){
							console.log('入驻店铺:'+app.toJSON(res))
							if(res.data&&res.data.length){
								_this.setData({mySettledShopList:res.data});
							}else{
								_this.setData({mySettledShopList:[]});
							};
						},function(){
							_this.setData({mySettledShopList:[]});
						});
					}else if(data.type=='service'){
						setTimeout(function(){
							_this.selectComponent('#upload_serviceBtnPic').reset(data.form.serviceBtnPic);
						},500);
					};
					_this.setData(data);
					if(data.form.moduleTitleIcon){
						setTimeout(function(){
							_this.selectComponent('#uploadTitleIcon').reset(data.form.moduleTitleIcon);
						},500);
					};
				}
			};
     	},
		//设置文字大小
		setFontSize:function(){
			let _this=this,
					 list=['默认',10,12,14,16,18,24,32];
			app.actionSheet(list, function(res) {
				_this.setData({'form.fontSize':list[res]});
			});
		},
		//设置文字颜色
		selectColor:function(e){
			let _this=this,
					color=app.eData(e).color;
			_this.setData({'form.color':color});		
		},
		//设置背景颜色
		selectBackgroundColor:function(e){
			let _this=this,
					color=app.eData(e).color;
			_this.setData({'form.backgroundColor':color});		
		},
		//设置图片一行个数
		setColumn:function(){
			let _this=this,
					list=['1','2','3','4','5'];
			app.actionSheet(list, function(res) {
				_this.setData({'form.column':list[res]});
			});
		},
		//选择分类
		selectCategory:function(){
			let _this=this,
				type=_this.getData().type,
				formData=_this.getData().form,
				key=type=='goods'?'goodsCategoryId':'categoryid',
				title=type=='goods'?'商品':'文章',
				url='../../manage/';
				
			if(type=='goods'){
				url+='goodsCategory/goodsCategory';
			}else{
				url+='articleCategory/articleCategory';
			};
			url+='?select=1';
			_this.dialog({
				title:'选择'+title+'分类',
				url:url,
				success:function(res){
					formData[key]=res.id;
					formData['categoryName']=res.title;
					_this.setData({
						form:formData
					});
				}
			});			
		},
		//选择更多按钮的链接
		selectModuleLink:function(){
			let _this = this;
			_this.dialog({
				title:'选择链接',
				url:'../../manage/linkSelect/linkSelect',
				success:function(res){
					_this.setData({'form.moduleMoreLink':res.link||''});
				}
			});
		},
		selectThisProject:function(e){//选择这个项目
			this.setData({'form.projectShopid':app.eData(e).id});
		},
		selectThisStore:function(e){//选择这个店铺
			this.setData({'form.settledShopid':app.eData(e).id});
		},
		uploadServiceBtnPic: function(e) {
			let _this = this,
				file = e.detail.src[0];
			this.setData({'form.serviceBtnPic':file});
        },
		uploadTitleIcon: function(e) {
			let _this = this,
				file = e.detail.src[0];
			this.setData({'form.moduleTitleIcon':file});
        },
		addTabOptions:function(){//添加选项卡列表
			let formData = this.getData().form;
			if(!formData.tabOptions){
				formData.tabOptions = [];
			};
			formData.tabOptions.push('');
			this.setData({form:formData});
		},
		changeTabInput:function(e){//修改选项卡名称
			let index = Number(app.eData(e).index),
				value = app.eValue(e),
				formData = this.getData().form;
			formData.tabOptions[index] = value;
			this.setData({form:formData});
		},
		delTabOptions:function(e){
			let index = Number(app.eData(e).index),
				formData = this.getData().form;
			formData.tabOptions.splice(index,1);
			this.setData({form:formData});
		},
      	submit: function() {
        	let _this = this,
				id=_this.getData().options.id,
				type=_this.getData().type,
          		formData = _this.getData().form,
				cData={
					marginSize:formData.marginSize,
					paddingSize:formData.paddingSize,
					radiusTopLeft:formData.radiusTopLeft,
					radiusTopRight:formData.radiusTopRight,
					radiusBottomRight:formData.radiusBottomRight,
					radiusBottomLeft:formData.radiusBottomLeft,
					moduleTitle:formData.moduleTitle||'',//模块标题
		  			moduleTips:formData.moduleTips||'',//模块副标题
					moduleTitleIcon:formData.moduleTitleIcon||'',//模块标题icon
		  			moduleMoreText:formData.moduleMoreText||'',//更多按钮
		  			moduleMoreLink:formData.moduleMoreLink||'',//更多链接
					moduleTitleColor:formData.moduleTitleColor||'',//模块标题颜色
		  			moduleTipsColor:formData.moduleTipsColor||'',//模块副标题颜色
		  			moduleMoreTextColor:formData.moduleMoreTextColor||'',//更多按钮颜色
					customCss:formData.customCss||'',//自定义css
				},
         		msg = '';
			if(formData.bottomLine){
				cData.bottomLine=formData.bottomLine=='1'?1:0;
			};
			if(formData.size){
				cData.size=formData.size;
			};
			if(formData.backgroundColor){
				cData.backgroundColor=formData.backgroundColor;
			};
			if(formData.marginSize){
				cData.marginTop=formData.marginTop=='1'?1:0;
				cData.marginLeft=formData.marginLeft=='1'?1:0;
				cData.marginBottom=formData.marginBottom=='1'?1:0;
				cData.marginRight=formData.marginRight=='1'?1:0;
			};
			if(formData.paddingSize){
				cData.paddingTop=formData.paddingTop=='1'?1:0;
				cData.paddingLeft=formData.paddingLeft=='1'?1:0;
				cData.paddingBottom=formData.paddingBottom=='1'?1:0;
				cData.paddingRight=formData.paddingRight=='1'?1:0;
			};
			if(type=='text'){
				let fontSizeIndex=_this.getData().fontSizeIndex;
				cData.fontSize=fontSizeIndex==0?'':_this.getData().fontSizeList[fontSizeIndex];
				if(formData.color.indexOf('#')!=0||!(formData.color.length==4||formData.color.length==7)){
					msg='请输入正确的颜色值';
				}else{
					cData.color=formData.color;
				};
				if(formData.fontWeight){
					cData.fontWeight=formData.fontWeight;
				};
			}else if(type=='image'){
				let isPrice = /^[0-9]+.?[0-9]*$/;
				cData.column=formData.column;
				cData.imageMargin=formData.column==1?0:formData.imageMargin;
				cData.showType=formData.showType?formData.showType:0;
				cData.widthScale=formData.widthScale?formData.widthScale:2;
				cData.heightScale=formData.heightScale?formData.heightScale:1;
				cData.imageView=formData.imageView;//图片是否可点击放大
				cData.imageLeftWidth=formData.imageLeftWidth;
				cData.imageRightWidth=formData.imageRightWidth;
				cData.picsColumn=formData.picsColumn;//自定义排列
				cData.picsColumnMargintb=formData.picsColumnMargintb;//图片上下间距
				cData.picsColumnMarginlr=formData.picsColumnMarginlr;//图片左右间距
				if(!isPrice.test(formData.widthScale)||formData.widthScale>30){
					msg='请输入正确的轮播图宽比';
				}else if(!isPrice.test(formData.heightScale)||formData.heightScale>30){
					msg='请输入正确的轮播图高比';
				}else if(formData.showType==2&&!formData.imageLeftWidth){
					msg='请输入左边宽度';
				}else if(formData.showType==3&&!formData.imageRightWidth){
					msg='请输入右边宽度';
				};
			}else if(type=='goods'||type=='article'){
				cData.template=formData.template;
				cData.dataLimit=formData.dataLimit;
				if(cData.dataLimit==1){
					cData.categoryName=formData.categoryName;
					if(type=='goods'){
						cData.goodsCategoryId=formData.goodsCategoryId;
					}else{
						cData.categoryid=formData.categoryid;
					};
				}else if(cData.dataLimit==2){
					cData.tags=formData.tags;
				}else if(cData.dataLimit==3){
					if(!formData.projectShopid){
						msg='请选择项目';
					};
					cData.projectShopid=formData.projectShopid;
				}else if(cData.dataLimit==3){
					if(!formData.projectShopid){
						msg='请选择店铺';
					};
					cData.projectShopid=formData.projectShopid;
				}else if(cData.dataLimit==4){
					if(!formData.settledShopid){
						msg='请选择入驻店铺';
					};
					cData.settledShopid=formData.settledShopid;
				}else if(cData.dataLimit==5){
					cData.pointTag=formData.pointTag;
				};
			}else if(type=='info'){
				cData.hideCover=formData.hideCover==1?1:0;
				cData.hideStoreInfo=formData.hideStoreInfo==1?1:0;
				cData.hideStoreFocus=formData.hideStoreFocus==1?1:0;
				cData.hideStoreShare=formData.hideStoreShare==1?1:0;
				cData.showStoreService=formData.showStoreService==1?1:0;
			}else if(type=='service'){
				cData.serviceBtnPic=formData.serviceBtnPic;
			}else if(type=='tab'){
				cData.tabOptions=formData.tabOptions;
			};
			console.log(app.toJSON(cData));
			if(msg){
				app.tips(msg,'error');
			}else{
				app.dialogSuccess({settings:cData});
			};
		}
    }
  });
})();