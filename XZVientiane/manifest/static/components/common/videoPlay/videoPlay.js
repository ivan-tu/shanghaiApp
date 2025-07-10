/**
 *模块组件构造器
 */
(function () {

   let app = getApp();

   app.Component({

      //组件名称，不需要改变
      comName: 'videoPlay',

      /**
       * 组件的属性列表
       */
      properties: {
         list: {
            type: String,
            value: ''
         },
         property: {
            type: String,
            value: ''
         }
      },

      /**
       * 组件的初始数据
       */
      data: {
         open: false,
		 isLoaded:false,
		 videoShow:false,
         client: app.config.client,
         title:'',
		 src:'',
		 poster:'',
		 windowWidth:app.system.windowWidth,
		 windowHeight:app.system.windowHeight,
		 videoWidth:'',
		 videoHeight:'',
		 styleCss:'',
      },

      /**
       *组件布局完成时执行
       */

      ready: function () {},
      /**
       * 组件的函数列表
       */
      methods: {
         openVideo: function (data) {
			 let _this = this,
			 	windowWidth = this.getData().windowWidth,
				windowHeight = this.getData().windowHeight,
				myVideo = document.getElementById("videoPlay_video");
			 this.setData({
				 videoShow:false,
				 title:data.title||'',
				 src:data.src||'',
				 poster:data.poster||'',
				 property:data.property||'',
			 });
			 if(data.src){
				 _this.start();
			 };
         },
		 start:function(){
			 let _this = this;
			 _this.setData({open:true,isLoaded:true});
			 setTimeout(function(){
				_this.reSetWh();
			 },800);
		 },
		 closeVideo:function(){
			 let myVideo = document.getElementById("videoPlay_video");
			 myVideo.pause();
			 this.setData({open:false,isLoaded:false});
			 this.pEvent('close', this.getData());
		 },
		 reSetWh:function(){
			 let myVideo = document.getElementById("videoPlay_video"),
			 	 windowWidth = this.getData().windowWidth,
				 windowHeight = this.getData().windowHeight,
			 	 poster = this.getData().poster,
			 	 w = myVideo.clientWidth,//可视宽度
				 h = myVideo.clientHeight;//可视高度
			 if(h>w){//是竖屏
			 	let realH = windowHeight-120,
				  	realW = Math.floor(realH/h*w);
			  	this.setData({
				  	poster:app.image.crop(poster,realW,realH),
				  	videoWidth:'auto',
				  	videoHeight:realH+'px',
				  	styleCss:'',
			  	});
			 }else{//是横屏
			 	let realH = Math.floor(windowWidth/(w/h)),
					realW = windowWidth,
					top = (realH+120)*-0.5+'px';
				this.setData({
					poster:app.image.crop(poster,realW,realH),
					videoWidth:'100%',
					videoHeight:'auto',
					styleCss:'top:50%;margin-top:'+top,
				});
			 };
			 this.setData({videoShow:true});
			 myVideo.play();
		 },
      }
   });
})();