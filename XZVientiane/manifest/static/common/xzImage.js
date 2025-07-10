let xzImage;

(function(){
	
	let app;
	
	//屏幕的分辨率倍数，加载最优的图片
	let devicePixelRatio;
	
	//略缩图的质量
	let thumbnailQuality=95;
	
	//图片最大尺寸
	let maxImgSize=9999;
	
	let errorImgSrc,filePath;
	
	
	let xzImageClass={
		
		/**
		 *获取限定宽度的图片地址
		 console.log(app.image.width('149490447267076.jpg',320));
		 */
		width(file,w,quality){
			if(!w){
				w=app.system.windowWidth;
			};
			if(file!=errorImgSrc&&file.indexOf('/')<0){
				file=filePath+file;
			};
			if(file.indexOf('ico')>-1||file.indexOf('icon')>-1){
				return file;
			};
			file=file.split('?')[0];
			quality=quality||thumbnailQuality;
			file+='?imageMogr2/auto-orient/thumbnail/'+(Math.floor(w*devicePixelRatio))+'x'+maxImgSize+'%3E/quality/'+quality+'!';
			return file;
		},
		
		/**
		 *获取限定宽高的图片地址
		 console.log(app.image.thumb('149490447267076.jpg',320,160));
		 */
		thumb(file,w,h,quality){
			
			if(!file){
				file=errorImgSrc;
			};
			if(file!=errorImgSrc&&file.indexOf('//')<0){
				file=filePath+file;
			};
			if(file.indexOf('ico')>-1||file.indexOf('icon')>-1){
				return file;
			};
			file=file.split('?')[0];
			var _w=Math.floor(w*devicePixelRatio),
				_h=Math.floor(h*devicePixelRatio);
			if(_w>maxImgSize){
				_h=Math.floor(maxImgSize/w*_h);
				_w=maxImgSize;
			};
			if(_h>maxImgSize){
				_w=Math.floor(maxImgSize/_h*_w);
				_h=maxImgSize;
			};
			quality=quality||thumbnailQuality;
			if(_w<1||_h<1){
				return file;
			};
			file+='?imageMogr2/auto-orient/thumbnail/'+(_w)+'x'+(_h)+'%3E/quality/'+quality+'!';
			return file;
		},
		
		/**
		 *获取限定宽高裁切后的图片地址
		 console.log(app.image.crop('149490447267076.jpg',320,320));
		 */
		 crop(file,w,h,quality){
			
			if(!file){
				file=errorImgSrc;
			};
			if(file!=errorImgSrc&&file.indexOf('//')<0){
				file=filePath+file;
			};
			if(file.indexOf('ico')>-1||file.indexOf('icon')>-1){
				return file;
			};
			file=file.split('?')[0];
			var _w=Math.floor(w*devicePixelRatio),
				_h=Math.floor(h*devicePixelRatio);
			if(_w>maxImgSize){
				_h=Math.floor(maxImgSize/w*_h);
				_w=maxImgSize;
			};
			if(_h>maxImgSize){
				_w=Math.floor(maxImgSize/_h*_w);
				_h=maxImgSize;
			};
			quality=quality||thumbnailQuality;
			if(_w<1||_h<1){
				return file;
			};
			file+='?imageMogr2/auto-orient/thumbnail/!'+(_w)+'x'+(_h)+'r/gravity/Center/crop/'+(_w)+'x'+(_h)+'/quality/'+quality+'!';
			return file;
		}
		
	};
	
	xzImage={
		init(App){
			app=App;
			devicePixelRatio=app.system.pixelRatio;
			errorImgSrc=app.config.errorImgSrc;
			filePath=app.config.filePath;
			app.image=xzImageClass;
		}
	};
	
	module.exports=xzImage;
})();