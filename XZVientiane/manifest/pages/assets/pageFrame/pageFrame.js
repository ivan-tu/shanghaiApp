 $(function() {
     let app = getApp(),
         url = window.location.href;
         
     $('.xzui-tabbar_item').each(function() {
         var eUrl = $(this).attr('href').replace('../../', '');

         if (url.indexOf(eUrl)!=-1) {
             $(this).addClass('xzui-bar_item_on').siblings().removeClass('xzui-bar_item_on');
         };
     });
     $('.xzui-tabbar_item').click(function() {
         $(this).addClass('xzui-bar_item_on').siblings().removeClass('xzui-bar_item_on');
     });
 });