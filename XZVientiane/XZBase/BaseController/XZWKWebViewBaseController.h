//
//  XZWKWebViewBaseController.h
//  XZVientiane
//
//  Created by Assistant on 2024/12/19.
//  Copyright © 2024年 TuWeiA. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <WebKit/WebKit.h>
#import "XZViewController.h"
#import "WKWebViewJavascriptBridge.h"

NS_ASSUME_NONNULL_BEGIN

typedef NS_ENUM(NSUInteger, GDpushType) {
    GDpushTypeNormal = 0,
    GDpushTypePresent,
    GDpushTypeAlert
};

// 保持与原有UIWebView代码的兼容性
typedef NS_ENUM(NSInteger, GDpushTypeCompat) {
    isPushNormal     = 0,
    isPushPresent    = 1,
    isPushAlert      = 2
};

// JavaScript回调块类型定义
typedef void(^XZWebViewJSCallbackBlock)(id result);
typedef void(^NextPageDataBlock)(NSDictionary *dic);

// 枚举值已在GDpushTypeCompat中定义，无需额外的extern声明

@interface XZWKWebViewBaseController : XZViewController

// WebView相关属性
@property (strong, nonatomic) WKWebView *webView;
@property (strong, nonatomic) WKUserContentController *userContentController;

// 页面数据属性
@property (strong, nonatomic) NSString *pinUrl;
@property (strong, nonatomic) NSString *pinDataStr;
@property (strong, nonatomic) NSString *pagetitle;
@property (strong, nonatomic) NSString *webViewDomain;
@property (strong, nonatomic) NSString *templateStr;
@property (strong, nonatomic) NSString *nextPageData;
@property (strong, nonatomic) NSString *replaceUrl;
@property (copy, nonatomic) NextPageDataBlock nextPageDataBlock;

// 组件相关属性
@property (strong, nonatomic) NSDictionary *templateDic;
@property (strong, nonatomic) NSDictionary *componentJsAndCs;
@property (strong, nonatomic) NSDictionary *componentDic;

// 兼容性属性（原有代码使用大写开头）
@property (strong, nonatomic, readonly) NSDictionary *ComponentJsAndCs;
@property (strong, nonatomic, readonly) NSDictionary *ComponentDic;

// 状态属性
@property (assign, nonatomic) BOOL isCreat;
@property (assign, nonatomic) BOOL isWebViewLoading;
@property (assign, nonatomic) BOOL isLoading;
@property (assign, nonatomic) int lastSelectedIndex;
@property (assign, nonatomic) GDpushType pushType;

// 导航和页面状态属性
@property (strong, nonatomic) NSDictionary *navDic;
@property (assign, nonatomic) BOOL isCheck;
@property (assign, nonatomic) BOOL isTabbarShow;
@property (assign, nonatomic) BOOL isExist;

// 网络监控相关属性
@property (strong, nonatomic) dispatch_source_t timer;
@property (strong, nonatomic) UIView *networkNoteView;
@property (strong, nonatomic) UIButton *networkNoteBt;

// HTML模板相关属性
@property (strong, nonatomic) NSString *htmlStr;
@property (strong, nonatomic) NSString *appsourceBasePath;

// 基础方法
- (void)addWebView;
- (void)loadWebBridge;
- (void)domainOperate;
- (void)loadHTMLContent;

// JavaScript交互方法
- (void)jsCallObjc:(NSDictionary *)jsData completion:(void(^)(id result))completion;
- (void)jsCallObjc:(NSDictionary *)jsData jsCallBack:(WVJBResponseCallback)jsCallBack;
- (void)objcCallJs:(NSDictionary *)dic;
- (void)handleJavaScriptCall:(NSDictionary *)data completion:(XZWebViewJSCallbackBlock)completion;
- (void)callJavaScript:(NSString *)script completion:(XZWebViewJSCallbackBlock)completion;

// 网络监控方法
- (void)listenToTimer;
- (void)networkNoteBtClick;

// 页面状态管理
- (BOOL)isShowingOnKeyWindow;
- (BOOL)isHaveNativeHeader:(NSString *)url;

// 状态栏管理
- (BOOL)prefersStatusBarHidden;
- (UIStatusBarStyle)preferredStatusBarStyle;

// 页面导航
- (void)getnavigationBarTitleText:(NSString *)title;

// 工具方法
- (NSString *)jsonStringFromObject:(id)object;

@end

NS_ASSUME_NONNULL_END 