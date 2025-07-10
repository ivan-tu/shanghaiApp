//
//  CFJWebViewBaseController.h
//  XiangZhanBase
//
//  Created by cuifengju on 2017/10/13.
//  Copyright © 2017年 TuWeiA. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "WebViewJavascriptBridge.h"


typedef NS_ENUM(NSInteger, GDpushType) {
    isPushNormal     = 0,
    isPushPresent    = 1,
    isPushAlert      = 2
};

typedef void(^DownloadBodyFinish)(void);
typedef void(^NextPageDataBlock)(NSDictionary *dic);

@interface CFJWebViewBaseController : UIViewController
@property (strong, nonatomic) WebViewJavascriptBridge* bridge;
@property (strong, nonatomic) UIWebView *webView;
@property (strong, nonatomic) NSString *webViewDomain;
@property (copy, nonatomic) WVJBResponseCallback webviewBackCallBack;
@property (assign, nonatomic) BOOL isWebViewLoading;
//判断页面是否已经存在
@property (assign, nonatomic) BOOL isExist;

@property (assign, nonatomic) BOOL isCreat;//是否创建通知
@property (copy, nonatomic) NSString * pinUrl;//用于拼接的url
@property (copy, nonatomic) NSString * replaceUrl;//用于替换url
@property (copy, nonatomic) NSString * pinDataStr;//跳转前拼接好的页面str
@property (copy, nonatomic) NSString * pagetitle;//页面标题

///导航条配置字典
@property (nonatomic, strong) NSDictionary *navDic;
@property (nonatomic, assign) BOOL isCheck;//是否是首页
@property (assign, nonatomic) BOOL isTabbarShow;     //Tabbar是否显示
/**
 存储下个页面传来的数据
 */
@property (nonatomic, strong) NSDictionary *nextPageData;
@property (nonatomic, copy) NextPageDataBlock nextPageDataBlock;

@property (nonatomic, assign) GDpushType pushType;//跳转类型

//js和cs数组
@property (nonatomic,strong)NSMutableArray *ComponentJsAndCs;
//组件字典
@property (nonatomic,strong)NSMutableDictionary *ComponentDic;
//初始模板
@property (nonatomic,copy)NSString *templateStr;
//html 字典
@property (nonatomic,strong)NSMutableDictionary *templateDic;
/**
 js 调用 objc 方法
 @param jsData js通过桥传递过来的数据
 @param jsCallBack 可以通过此block回调给js数据
 */
- (void)jsCallObjc:(id)jsData jsCallBack:(WVJBResponseCallback)jsCallBack;

/**
 objc 调用 js 方法
 
 @param dic oc传递给js的数据
 */
- (void)objcCallJs:(NSDictionary *)dic;

/**
 加载h5页面方法
 */
- (void)domainOperate;


/**
 加载交互桥
 */
- (void)loadWebBridge;
@end
