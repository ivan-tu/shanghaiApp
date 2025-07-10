//import TIM from 'tim-wx-sdk';
//import COS from 'cos-wx-sdk-v5';
(function() {
	let app = getApp();
	app.Page({
		pageId: 'user-chat',
		data: {
			systemId: 'user',
			moduleId: 'chat',
			data: [],
			options: {},
			settings: {},
			language: {},
			form: {},
			windowHeight:app.system.windowHeight,
			messageContentWidth:(app.system.windowWidth>480?480:app.system.windowWidth)-160,
			isUserLogin: app.checkUser(),
			client: app.config.client,
			showFace:false,//显示表情
			showFaceS:false,//显示表情内容
			faceUrl:'https://imgcache.qq.com/open/qcloud/tim/assets/emoji/',
			faceArray:{
			  '[NO]': 'emoji_0@2x.png',
			  '[OK]': 'emoji_1@2x.png',
			  '[下雨]': 'emoji_2@2x.png',
			  '[么么哒]': 'emoji_3@2x.png',
			  '[乒乓]': 'emoji_4@2x.png',
			  '[便便]': 'emoji_5@2x.png',
			  '[信封]': 'emoji_6@2x.png',
			  '[偷笑]': 'emoji_7@2x.png',
			  '[傲慢]': 'emoji_8@2x.png',
			  '[再见]': 'emoji_9@2x.png',
			  '[冷汗]': 'emoji_10@2x.png',
			  '[凋谢]': 'emoji_11@2x.png',
			  '[刀]': 'emoji_12@2x.png',
			  '[删除]': 'emoji_13@2x.png',
			  '[勾引]': 'emoji_14@2x.png',
			  '[发呆]': 'emoji_15@2x.png',
			  '[发抖]': 'emoji_16@2x.png',
			  '[可怜]': 'emoji_17@2x.png',
			  '[可爱]': 'emoji_18@2x.png',
			  '[右哼哼]': 'emoji_19@2x.png',
			  '[右太极]': 'emoji_20@2x.png',
			  '[右车头]': 'emoji_21@2x.png',
			  '[吐]': 'emoji_22@2x.png',
			  '[吓]': 'emoji_23@2x.png',
			  '[咒骂]': 'emoji_24@2x.png',
			  '[咖啡]': 'emoji_25@2x.png',
			  '[啤酒]': 'emoji_26@2x.png',
			  '[嘘]': 'emoji_27@2x.png',
			  '[回头]': 'emoji_28@2x.png',
			  '[困]': 'emoji_29@2x.png',
			  '[坏笑]': 'emoji_30@2x.png',
			  '[多云]': 'emoji_31@2x.png',
			  '[大兵]': 'emoji_32@2x.png',
			  '[大哭]': 'emoji_33@2x.png',
			  '[太阳]': 'emoji_34@2x.png',
			  '[奋斗]': 'emoji_35@2x.png',
			  '[奶瓶]': 'emoji_36@2x.png',
			  '[委屈]': 'emoji_37@2x.png',
			  '[害羞]': 'emoji_38@2x.png',
			  '[尴尬]': 'emoji_39@2x.png',
			  '[左哼哼]': 'emoji_40@2x.png',
			  '[左太极]': 'emoji_41@2x.png',
			  '[左车头]': 'emoji_42@2x.png',
			  '[差劲]': 'emoji_43@2x.png',
			  '[弱]': 'emoji_44@2x.png',
			  '[强]': 'emoji_45@2x.png',
			  '[彩带]': 'emoji_46@2x.png',
			  '[彩球]': 'emoji_47@2x.png',
			  '[得意]': 'emoji_48@2x.png',
			  '[微笑]': 'emoji_49@2x.png',
			  '[心碎了]': 'emoji_50@2x.png',
			  '[快哭了]': 'emoji_51@2x.png',
			  '[怄火]': 'emoji_52@2x.png',
			  '[怒]': 'emoji_53@2x.png',
			  '[惊恐]': 'emoji_54@2x.png',
			  '[惊讶]': 'emoji_55@2x.png',
			  '[憨笑]': 'emoji_56@2x.png',
			  '[手枪]': 'emoji_57@2x.png',
			  '[打哈欠]': 'emoji_58@2x.png',
			  '[抓狂]': 'emoji_59@2x.png',
			  '[折磨]': 'emoji_60@2x.png',
			  '[抠鼻]': 'emoji_61@2x.png',
			  '[抱抱]': 'emoji_62@2x.png',
			  '[抱拳]': 'emoji_63@2x.png',
			  '[拳头]': 'emoji_64@2x.png',
			  '[挥手]': 'emoji_65@2x.png',
			  '[握手]': 'emoji_66@2x.png',
			  '[撇嘴]': 'emoji_67@2x.png',
			  '[擦汗]': 'emoji_68@2x.png',
			  '[敲打]': 'emoji_69@2x.png',
			  '[晕]': 'emoji_70@2x.png',
			  '[月亮]': 'emoji_71@2x.png',
			  '[棒棒糖]': 'emoji_72@2x.png',
			  '[汽车]': 'emoji_73@2x.png',
			  '[沙发]': 'emoji_74@2x.png',
			  '[流汗]': 'emoji_75@2x.png',
			  '[流泪]': 'emoji_76@2x.png',
			  '[激动]': 'emoji_77@2x.png',
			  '[灯泡]': 'emoji_78@2x.png',
			  '[炸弹]': 'emoji_79@2x.png',
			  '[熊猫]': 'emoji_80@2x.png',
			  '[爆筋]': 'emoji_81@2x.png',
			  '[爱你]': 'emoji_82@2x.png',
			  '[爱心]': 'emoji_83@2x.png',
			  '[爱情]': 'emoji_84@2x.png',
			  '[猪头]': 'emoji_85@2x.png',
			  '[猫咪]': 'emoji_86@2x.png',
			  '[献吻]': 'emoji_87@2x.png',
			  '[玫瑰]': 'emoji_88@2x.png',
			  '[瓢虫]': 'emoji_89@2x.png',
			  '[疑问]': 'emoji_90@2x.png',
			  '[白眼]': 'emoji_91@2x.png',
			  '[皮球]': 'emoji_92@2x.png',
			  '[睡觉]': 'emoji_93@2x.png',
			  '[磕头]': 'emoji_94@2x.png',
			  '[示爱]': 'emoji_95@2x.png',
			  '[礼品袋]': 'emoji_96@2x.png',
			  '[礼物]': 'emoji_97@2x.png',
			  '[篮球]': 'emoji_98@2x.png',
			  '[米饭]': 'emoji_99@2x.png',
			  '[糗大了]': 'emoji_100@2x.png',
			  '[红双喜]': 'emoji_101@2x.png',
			  '[红灯笼]': 'emoji_102@2x.png',
			  '[纸巾]': 'emoji_103@2x.png',
			  '[胜利]': 'emoji_104@2x.png',
			  '[色]': 'emoji_105@2x.png',
			  '[药]': 'emoji_106@2x.png',
			  '[菜刀]': 'emoji_107@2x.png',
			  '[蛋糕]': 'emoji_108@2x.png',
			  '[蜡烛]': 'emoji_109@2x.png',
			  '[街舞]': 'emoji_110@2x.png',
			  '[衰]': 'emoji_111@2x.png',
			  '[西瓜]': 'emoji_112@2x.png',
			  '[调皮]': 'emoji_113@2x.png',
			  '[象棋]': 'emoji_114@2x.png',
			  '[跳绳]': 'emoji_115@2x.png',
			  '[跳跳]': 'emoji_116@2x.png',
			  '[车厢]': 'emoji_117@2x.png',
			  '[转圈]': 'emoji_118@2x.png',
			  '[鄙视]': 'emoji_119@2x.png',
			  '[酷]': 'emoji_120@2x.png',
			  '[钞票]': 'emoji_121@2x.png',
			  '[钻戒]': 'emoji_122@2x.png',
			  '[闪电]': 'emoji_123@2x.png',
			  '[闭嘴]': 'emoji_124@2x.png',
			  '[闹钟]': 'emoji_125@2x.png',
			  '[阴险]': 'emoji_126@2x.png',
			  '[难过]': 'emoji_127@2x.png',
			  '[雨伞]': 'emoji_128@2x.png',
			  '[青蛙]': 'emoji_129@2x.png',
			  '[面条]': 'emoji_130@2x.png',
			  '[鞭炮]': 'emoji_131@2x.png',
			  '[风车]': 'emoji_132@2x.png',
			  '[飞吻]': 'emoji_133@2x.png',
			  '[飞机]': 'emoji_134@2x.png',
			  '[饥饿]': 'emoji_135@2x.png',
			  '[香蕉]': 'emoji_136@2x.png',
			  '[骷髅]': 'emoji_137@2x.png',
			  '[麦克风]': 'emoji_138@2x.png',
			  '[麻将]': 'emoji_139@2x.png',
			  '[鼓掌]': 'emoji_140@2x.png',
			  '[龇牙]': 'emoji_141@2x.png'
			},
			imForm:{content:''},
			messageList:[],//消息列表
			showLoading:false,//显示加载更多
			showNoData:false,
			windowHeight:app.system.windowHeight,
		},
		methods: {
			onLoad: function(options) {
				let _this = this;
				_this.setData({
					options: options
				});
				app.checkUser(function() {
					_this.setData({
						isUserLogin: true
					});
					_this.load();
				});
			},
			onUnload: function () {
			},
			onShow: function() {
				let isUserLogin = app.checkUser();
				if (isUserLogin != this.getData().isUserLogin) {
					this.setData({
						isUserLogin: isUserLogin
					});
					if (isUserLogin) {
						this.load()
					};
				};
			},
			onPullDownRefresh: function() {
				wx.stopPullDownRefresh();
			},
			load: function() {
				
			},
			submitMessage:function(){
			},
			toShowFace:function(){//显示表情
				let _this = this;
				this.setData({showFace:true,showMenu:false,showMenuS:false});
				setTimeout(function(){
					_this.setData({showFaceS:true});
				},100);
			},
			toHideFace:function(){//关闭表情
				let _this = this;
				this.setData({showFaceS:false});
				setTimeout(function(){
					_this.setData({showFace:false});
				},100);
			},
			sendFace:function(e){//输入表情
				let faceArray = this.getData().faceArray,
					imForm = this.getData().imForm,
					name = app.eData(e).name;
				this.setData({
					'imForm.content':imForm.content+''+name
				});
			},
			deleteFace:function(){//删除表情
				this.setData({
					'imForm.content':''
				});
			},
			viewImage:function(e){
				let _this = this,
					pic = app.eData(e).src;
				app.previewImage({
				   current: pic,
				   urls: [pic]
				})
			},
			getRealTime:function(date){//时间戳转日期
				var date = new Date(date*1000);
				var YY = date.getFullYear() + '-';
				var MM = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
				var DD = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate());
				var hh = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
				var mm = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
				var ss = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
				return MM + DD +" "+hh + mm + ss;
			},
			parseText:function(payload) {//解析文字信息
			  let emojiUrl = this.getData().faceUrl,
			  	  emojiMap = this.getData().faceArray,
			  	  renderDom = [];
			  // 文本消息
				let temp = payload.text
				let left = -1
				let right = -1
				while (temp !== '') {
				  left = temp.indexOf('[')
				  right = temp.indexOf(']')
				  switch (left) {
					case 0:
					  if (right === -1) {
						renderDom.push({
						  name: 'text',
						  text: temp
						})
						temp = ''
					  } else {
						let _emoji = temp.slice(0, right + 1)
						if (emojiMap[_emoji]) {    // 如果您需要渲染表情包，需要进行匹配您对应[呲牙]的表情包地址
						  renderDom.push({
							name: 'img',
							src: emojiUrl + emojiMap[_emoji]
						  })
						  temp = temp.substring(right + 1)
						} else {
						  renderDom.push({
							name: 'text',
							text: '['
						  })
						  temp = temp.slice(1)
						}
					  }
					  break
					case -1:
					  renderDom.push({
						name: 'text',
						text: temp
					  })
					  temp = ''
					  break
					default:
					  renderDom.push({
						name: 'text',
						text: temp.slice(0, left)
					  })
					  temp = temp.substring(left)
					  break
				  }
				}
			  return renderDom;
			}
		}
	});
})();