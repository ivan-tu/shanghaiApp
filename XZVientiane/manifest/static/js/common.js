(function() {

    let v = '?' + (xzSystemConfig.environment == 'develop' ? Math.random() : xzSystemConfig.srcVersion || 1),
        commonSrc = '<script src="' + xzSystemConfig.staticPath + 'js/config.js' + v + '"><\/script>\
        <script src="' + xzSystemConfig.staticPath + 'js/jquery.js' + v + '"><\/script>';

    if (navigator.userAgent.toLowerCase().match(/MicroMessenger/i) == "micromessenger") {
        commonSrc += '<script src="' + xzSystemConfig.staticPath + 'web/wxSdk.js' + v + '"><\/script>';
    };

    commonSrc += '<script src="' + xzSystemConfig.staticPath + 'js/xzp.js' + v + '"><\/script>\
        <script src="' + xzSystemConfig.staticPath + 'js/xzSystem.js' + v + '"><\/script>\
        <script src="' + xzSystemConfig.staticPath + 'js/webApp.js' + v + '"><\/script>\
        <script src="' + xzSystemConfig.staticPath + 'common/xzApp.js' + v + '"><\/script>\
              <script src="' + xzSystemConfig.staticPath + 'common/xzImage.js' + v + '"><\/script>\
        <script src="' + xzSystemConfig.staticPath + 'language/zh-cn.js' + v + '"><\/script>\
        <script src="' + xzSystemConfig.staticPath + 'js/xzParse.js' + v + '"><\/script>\
        <script src="' + xzSystemConfig.staticPath + 'js/app.js' + v + '"><\/script>\
                <script src="' + xzSystemConfig.staticPath + 'js/xzWX.js' + v + '"><\/script>\
        <script src="' + xzSystemConfig.staticPath + 'web/xz-web.js' + v + '"><\/script>';
		
    document.write('<link href="' + xzSystemConfig.staticPath + 'css/skin.css' + v + '" rel="stylesheet" />\
				<link href="' + xzSystemConfig.staticPath + 'css/common.css' + v + '" rel="stylesheet" />\
				<link href="' + xzSystemConfig.staticPath + 'css/base64image.css' + v + '" rel="stylesheet" />\
				<link href="' + xzSystemConfig.staticPath + 'css/newfonts/iconfont.css' + v + '" rel="stylesheet" />\
              <link href="' + xzSystemConfig.staticPath + 'css/xzicon.css' + v + '" rel="stylesheet" />');
    document.write('<style>.page{display:none;}.page.active{display:block;}<\/style>');

    document.write(commonSrc);
})();