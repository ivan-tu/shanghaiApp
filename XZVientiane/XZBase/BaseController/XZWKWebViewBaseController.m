//
//  XZWKWebViewBaseController.m
//  XZVientiane
//
//  Created by Assistant on 2024/12/19.
//  Copyright © 2024年 TuWeiA. All rights reserved.
//

#import "XZWKWebViewBaseController.h"
#import "XZFunctionDefine.h"
#import "WKWebView+XZAddition.h"
#import "BaseFileManager.h"
#import "AFHTTPSessionManager.h"
#import "NSString+addition.h"
#import "XZBaseHead.h"
#import "HTMLCache.h"
#import "XZOrderModel.h"
#import "RNCachingURLProtocol.h"
#import "UIView+AutoLayout.h"
#import "EGOCache.h"
#import "SVStatusHUD.h"
#import <Masonry.h>
#import <MJRefresh.h>
#import "XZPackageH5.h"
#import "LoadingView.h"
#import <HybridSDK/HybridSDK.h>
#import "CustomHybridProcessor.h"

// 导入WebViewJavascriptBridge
#import "WKWebViewJavascriptBridge.h"

// iPhone X系列检测
static inline BOOL isIPhoneXSeries() {
    BOOL iPhoneXSeries = NO;
    if (UIDevice.currentDevice.userInterfaceIdiom != UIUserInterfaceIdiomPhone) {
        return iPhoneXSeries;
    }
    
    if (@available(iOS 11.0, *)) {
        UIWindow *mainWindow = [[[UIApplication sharedApplication] delegate] window];
        if (mainWindow.safeAreaInsets.bottom > 0.0) {
            iPhoneXSeries = YES;
        }
    }
    
    return iPhoneXSeries;
}

// 兼容性常量定义（避免重复定义）
#ifndef GDPUSHTYPE_CONSTANTS_IMPLEMENTATION
#define GDPUSHTYPE_CONSTANTS_IMPLEMENTATION
// 枚举值已在头文件中定义，无需重复声明常量
#endif

@interface XZWKWebViewBaseController ()<WKNavigationDelegate, WKUIDelegate, UIScrollViewDelegate>
{
    __block int timeout; // 倒计时时间
    NSDate *lastLoadTime; // 上次加载时间，用于防止频繁重新加载
}

@property (nonatomic, strong) WKWebViewJavascriptBridge *bridge;  // 使用WebViewJavascriptBridge
@property (nonatomic, strong) UIActivityIndicatorView *activityIndicatorView; // 加载指示器
@property (nonatomic, strong) UIProgressView *progressView; // 进度条
@property (nonatomic, strong) NSString *currentTempFileName; // 当前临时文件名

@end

@implementation XZWKWebViewBaseController

@synthesize componentJsAndCs = _componentJsAndCs;
@synthesize componentDic = _componentDic;
@synthesize templateDic = _templateDic;
@synthesize nextPageData = _nextPageData;
@synthesize navDic = _navDic;
@synthesize isCheck = _isCheck;
@synthesize isTabbarShow = _isTabbarShow;
@synthesize pushType = _pushType;
@synthesize isExist = _isExist;
@synthesize replaceUrl = _replaceUrl;
@synthesize nextPageDataBlock = _nextPageDataBlock;

#pragma mark - Life Cycle

- (void)viewDidLoad {
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor whiteColor];
    
    // 初始化属性
    self.isWebViewLoading = NO;
    self.isLoading = NO;
    self.isCreat = NO;
    
    // 创建网络状态提示视图
    [self setupNetworkNoteView];
    
    // 创建WebView
    [self setupWebView];
    [self addWebView];
    
    // 创建加载指示器
    [self setupLoadingIndicators];
    
    // 添加通知监听
    [self addNotificationObservers];
    
    // 开始操作
    [self domainOperate];
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    self.lastSelectedIndex = self.tabBarController.selectedIndex;
}

- (void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];
    
    // 记录这一次选中的索引
    self.lastSelectedIndex = self.tabBarController.selectedIndex;
    
    // 启动网络监控
    [self listenToTimer];
    
    // 处理重复点击tabbar刷新
    if (self.lastSelectedIndex == self.tabBarController.selectedIndex && [self isShowingOnKeyWindow] && self.isWebViewLoading) {
        [self.webView.scrollView scrollRectToVisible:CGRectMake(0, 0, self.view.bounds.size.width, self.view.bounds.size.height) animated:YES];
    }
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];
    
    // 停止下拉刷新
    if ([self.webView.scrollView.mj_header isRefreshing]) {
        [self.webView.scrollView.mj_header endRefreshing];
    }
    
    // 停止loading指示器
    dispatch_async(dispatch_get_main_queue(), ^{
        [self.activityIndicatorView stopAnimating];
        self.progressView.hidden = YES;
        self.progressView.progress = 0.0;
    });
    
    // 停止网络监控
    self.lastSelectedIndex = 100;
    if (self.timer) {
        dispatch_source_cancel(self.timer);
        self.timer = nil;
    }
    
    // 清理临时HTML文件
    [self cleanupTempHtmlFiles];
}

- (void)cleanupTempHtmlFiles {
    // 只清理当前控制器的临时文件
    if (self.currentTempFileName) {
        BOOL fileRemoved = NO;
        
        // 首先尝试在Documents目录中查找
        NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
        NSString *documentsPath = [paths firstObject];
        NSString *documentsFilePath = [documentsPath stringByAppendingPathComponent:self.currentTempFileName];
        
        if ([[NSFileManager defaultManager] fileExistsAtPath:documentsFilePath]) {
            [[NSFileManager defaultManager] removeItemAtPath:documentsFilePath error:nil];
            NSLog(@"🗑️ 清理临时文件（Documents）: %@", self.currentTempFileName);
            fileRemoved = YES;
        }
        
        // 兼容旧版本，同时检查manifest目录
        NSString *manifestPath = [BaseFileManager appH5LocailManifesPath];
        NSString *manifestFilePath = [manifestPath stringByAppendingPathComponent:self.currentTempFileName];
        
        if ([[NSFileManager defaultManager] fileExistsAtPath:manifestFilePath]) {
            [[NSFileManager defaultManager] removeItemAtPath:manifestFilePath error:nil];
            NSLog(@"🗑️ 清理临时文件（Manifest）: %@", self.currentTempFileName);
            fileRemoved = YES;
        }
        
        if (!fileRemoved) {
            NSLog(@"⚠️ 未找到临时文件: %@", self.currentTempFileName);
        }
        
        self.currentTempFileName = nil;
    }
}

- (void)dealloc {
    // 移除通知监听
    [[NSNotificationCenter defaultCenter] removeObserver:self];
    
    if (self.timer) {
        dispatch_source_cancel(self.timer);
        self.timer = nil;
    }
    
    // 根据资料建议，移除KVO观察者
    if (self.webView) {
        @try {
            [self.webView removeObserver:self forKeyPath:@"estimatedProgress"];
            [self.webView removeObserver:self forKeyPath:@"title"];
        } @catch (NSException *exception) {
            NSLog(@"⚠️ [WKWebView] 移除KVO观察者时发生异常: %@", exception.reason);
        }
    }
    
    // 清理临时HTML文件
    [self cleanupTempHtmlFiles];
    
    // 清理Bridge（根据资料，WebViewJavascriptBridge会自动清理）
    if (self.bridge) {
        [self.bridge reset];
        self.bridge = nil;
    }
    
    // 清理UserContentController
    if (self.userContentController) {
        [self.userContentController removeScriptMessageHandlerForName:@"consoleLog"];
        [self.userContentController removeAllUserScripts];
        self.userContentController = nil;
    }
    
    if (self.webView) {
        self.webView.navigationDelegate = nil;
        self.webView.UIDelegate = nil;
        self.webView.scrollView.delegate = nil;
        [self.webView stopLoading];
        self.webView = nil;
    }
}

#pragma mark - Setup Methods

- (void)setupNetworkNoteView {
    self.networkNoteView = [[UIView alloc] init];
    self.networkNoteView.backgroundColor = [UIColor colorWithRed:0.9 green:0.9 blue:0.9 alpha:1.0];
    self.networkNoteView.hidden = YES;
    [self.view addSubview:self.networkNoteView];
    
    self.networkNoteBt = [UIButton buttonWithType:UIButtonTypeCustom];
    [self.networkNoteBt setTitle:@"网络连接失败，点击重试" forState:UIControlStateNormal];
    [self.networkNoteBt setTitleColor:[UIColor blackColor] forState:UIControlStateNormal];
    [self.networkNoteBt addTarget:self action:@selector(networkNoteBtClick) forControlEvents:UIControlEventTouchUpInside];
    [self.networkNoteView addSubview:self.networkNoteBt];
    
    [self.networkNoteView mas_makeConstraints:^(MASConstraintMaker *make) {
        make.edges.equalTo(self.view);
    }];
    
    [self.networkNoteBt mas_makeConstraints:^(MASConstraintMaker *make) {
        make.center.equalTo(self.networkNoteView);
        make.height.mas_equalTo(40);
    }];
}

- (void)setupWebView {
    
    // 创建WKWebView配置
    WKWebViewConfiguration *configuration = [[WKWebViewConfiguration alloc] init];
    configuration.allowsInlineMediaPlayback = YES;
    configuration.mediaTypesRequiringUserActionForPlayback = WKAudiovisualMediaTypeNone;
    
    // 关键：配置WKWebView的安全策略，允许JavaScript执行
    configuration.preferences = [[WKPreferences alloc] init];
    configuration.preferences.javaScriptEnabled = YES;
    configuration.preferences.javaScriptCanOpenWindowsAutomatically = YES;
    
    // 关键：根据资料指导，WKWebView有更好的安全机制，不需要设置私有API
    // 注意：allowFileAccessFromFileURLs 和 allowUniversalAccessFromFileURLs 是私有API
    // WKWebView通过loadFileURL:allowingReadAccessToURL:来安全地加载本地文件
    
    // 根据资料建议，配置默认网页首选项
    if (@available(iOS 14.0, *)) {
        configuration.defaultWebpagePreferences.allowsContentJavaScript = YES;
    }
    
    // 配置安全设置，允许混合内容
    if (@available(iOS 10.0, *)) {
        configuration.mediaTypesRequiringUserActionForPlayback = WKAudiovisualMediaTypeNone;
    }
    
    // 允许任意加载（开发环境）
    if (@available(iOS 9.0, *)) {
        configuration.allowsAirPlayForMediaPlayback = YES;
        configuration.allowsPictureInPictureMediaPlayback = YES;
    }
    
    // 根据资料，确保正确配置数据存储
    configuration.websiteDataStore = [WKWebsiteDataStore defaultDataStore];
    
    // 创建UserContentController（WebViewJavascriptBridge会自动处理消息）
    self.userContentController = [[WKUserContentController alloc] init];
    configuration.userContentController = self.userContentController;
    
    // 根据资料建议，添加调试脚本（仅在Debug模式）
    #ifdef DEBUG
    NSString *debugScript = @"window.isWKWebView = true; console.log('WKWebView JavaScript环境已就绪');";
    WKUserScript *userScript = [[WKUserScript alloc] initWithSource:debugScript
                                                      injectionTime:WKUserScriptInjectionTimeAtDocumentStart 
                                                   forMainFrameOnly:NO];
    [self.userContentController addUserScript:userScript];
    #endif
    
    // 创建WKWebView
    self.webView = [[WKWebView alloc] initWithFrame:CGRectZero configuration:configuration];
    self.webView.navigationDelegate = self;
    self.webView.UIDelegate = self;
    self.webView.scrollView.delegate = self;
    self.webView.backgroundColor = [UIColor whiteColor];
    
    // 修复左滑返回手势冲突：禁用WKWebView的左滑后退手势
    if (@available(iOS 9.0, *)) {
        self.webView.allowsBackForwardNavigationGestures = NO;
    }
    
    // 配置滚动视图
    if (@available(iOS 11.0, *)) {
        self.webView.scrollView.contentInsetAdjustmentBehavior = UIScrollViewContentInsetAdjustmentNever;
    } else {
        self.automaticallyAdjustsScrollViewInsets = NO;
    }
    
    // 根据资料建议，添加进度监听
    [self.webView addObserver:self forKeyPath:@"estimatedProgress" options:NSKeyValueObservingOptionNew context:NULL];
    [self.webView addObserver:self forKeyPath:@"title" options:NSKeyValueObservingOptionNew context:NULL];
    
    // 配置滚动视图属性
    self.webView.scrollView.scrollsToTop = YES;
    self.webView.scrollView.showsVerticalScrollIndicator = NO;
    self.webView.scrollView.showsHorizontalScrollIndicator = NO;
    self.webView.scrollView.bounces = YES;
    self.webView.scrollView.decelerationRate = UIScrollViewDecelerationRateNormal;
    
    // 添加下拉刷新支持
    [self setupRefreshControl];
    
    // 设置用户代理
    [self setCustomUserAgent];
}

- (void)setupRefreshControl {
    // 配置下拉刷新控件
    __weak UIScrollView *scrollView = self.webView.scrollView;
    MJRefreshNormalHeader *header = [MJRefreshNormalHeader headerWithRefreshingTarget:self refreshingAction:@selector(loadNewData)];
    header.lastUpdatedTimeLabel.hidden = YES;
    header.stateLabel.hidden = YES;
    
    // 添加下拉刷新控件
    scrollView.mj_header = header;
}

- (void)setupLoadingIndicators {
    // 创建加载指示器
    self.activityIndicatorView = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleGray];
    self.activityIndicatorView.center = CGPointMake(self.view.bounds.size.width / 2, self.view.bounds.size.height / 2);
    self.activityIndicatorView.hidesWhenStopped = YES;
    [self.view addSubview:self.activityIndicatorView];
    
    // 创建进度条
    self.progressView = [[UIProgressView alloc] initWithProgressViewStyle:UIProgressViewStyleDefault];
    self.progressView.frame = CGRectMake(0, 0, self.view.bounds.size.width, 2);
    self.progressView.progressTintColor = [UIColor colorWithRed:0.2 green:0.6 blue:1.0 alpha:1.0];
    self.progressView.trackTintColor = [UIColor clearColor];
    self.progressView.hidden = YES;
    [self.view addSubview:self.progressView];
    
    // 调整进度条位置到导航栏下方
    if (self.navigationController && !self.navigationController.navigationBar.hidden) {
        CGFloat navBarMaxY = CGRectGetMaxY(self.navigationController.navigationBar.frame);
        self.progressView.frame = CGRectMake(0, navBarMaxY, self.view.bounds.size.width, 2);
    } else {
        // 如果没有导航栏，放在状态栏下方
        CGFloat statusBarHeight = [UIApplication sharedApplication].statusBarFrame.size.height;
        self.progressView.frame = CGRectMake(0, statusBarHeight, self.view.bounds.size.width, 2);
    }
}

- (void)loadNewData {
    
    // 调用JavaScript的下拉刷新事件
    NSDictionary *callJsDic = [[HybridManager shareInstance] objcCallJsWithFn:@"pagePullDownRefresh" data:nil];
    [self objcCallJs:callJsDic];
    
    // 如果没有网络，直接停止刷新
    if (NoReachable) {
        if ([self.webView.scrollView.mj_header isRefreshing]) {
            [self.webView.scrollView.mj_header endRefreshing];
        }
        return;
    }
    
    // 设置一个10秒的超时，避免刷新一直显示
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(10.0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        if ([self.webView.scrollView.mj_header isRefreshing]) {
            [self.webView.scrollView.mj_header endRefreshing];
            NSLog(@"🔄 下拉刷新超时，强制结束");
        }
    });
}

- (void)addNotificationObservers {
    WEAK_SELF;
    
    // 监听TabBar重复点击刷新
    [[NSNotificationCenter defaultCenter] addObserverForName:@"refreshCurrentViewController" object:nil queue:[NSOperationQueue mainQueue] usingBlock:^(NSNotification *note) {
        STRONG_SELF;
        if (self.lastSelectedIndex == self.tabBarController.selectedIndex && [self isShowingOnKeyWindow] && self.isWebViewLoading) {
            if ([AFNetworkReachabilityManager manager].networkReachabilityStatus == AFNetworkReachabilityStatusNotReachable) {
                return;
            }
            
            // 如果当前已经在刷新中，先停止
            if ([self.webView.scrollView.mj_header isRefreshing]) {
                [self.webView.scrollView.mj_header endRefreshing];
            }
            
            // 开始刷新
            [self.webView.scrollView.mj_header beginRefreshing];
        }
        
        // 记录这一次选中的索引
        self.lastSelectedIndex = self.tabBarController.selectedIndex;
    }];
    
    // 监听其他页面登录/退出后的刷新
    [[NSNotificationCenter defaultCenter] addObserverForName:@"RefreshOtherAllVCNotif" object:nil queue:[NSOperationQueue mainQueue] usingBlock:^(NSNotification *note) {
        STRONG_SELF;
        UIViewController *vc = note.object;
        if (self == vc) {
            return;
        }
        [self domainOperate];
    }];
}

- (void)setCustomUserAgent {
    NSString *customUserAgent = @"Mozilla/5.0 (iPhone; CPU iPhone OS 13_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Mobile/15E148 Safari/604.1 XZApp/1.0";
    [self.webView evaluateJavaScript:@"navigator.userAgent" completionHandler:^(id result, NSError *error) {
        if (!error && result) {
            NSString *existingUserAgent = (NSString *)result;
            if (![existingUserAgent containsString:@"XZApp"]) {
                self.webView.customUserAgent = [NSString stringWithFormat:@"%@ XZApp/1.0", existingUserAgent];
            }
        } else {
            self.webView.customUserAgent = customUserAgent;
        }
    }];
}

#pragma mark - WebView Management

- (void)addWebView {
    [self.view addSubview:self.webView];
    
    if (self.navigationController.viewControllers.count > 1) {
        [self.webView mas_makeConstraints:^(MASConstraintMaker *make) {
            make.left.equalTo(self.view);
            make.right.equalTo(self.view);
            make.bottom.equalTo(self.view);
            make.top.equalTo(self.view);
        }];
    } else {
        if ([[NSUserDefaults standardUserDefaults] boolForKey:@"NoTabBar"]) {
            // 如果没有tabbar，将tabbar的frame设为0
            self.tabBarController.tabBar.frame = CGRectZero;
            [self.webView mas_makeConstraints:^(MASConstraintMaker *make) {
                make.left.equalTo(self.view);
                make.right.equalTo(self.view);
                make.bottom.equalTo(self.view);
                make.top.equalTo(self.view);
            }];
        } else {
            [self.webView mas_makeConstraints:^(MASConstraintMaker *make) {
                make.left.equalTo(self.view);
                make.right.equalTo(self.view);
                if (@available(iOS 11.0, *)) {
                    make.bottom.equalTo(self.view.mas_safeAreaLayoutGuideBottom);
                } else {
                    make.bottom.equalTo(self.view);
                }
                make.top.equalTo(self.view);
            }];
        }
    }
}

- (void)loadWebBridge {
    NSLog(@"🚀 开始建立WKWebView JavaScript桥接...");
    
    // 使用成熟的WebViewJavascriptBridge库
    #ifdef DEBUG
    [WKWebViewJavascriptBridge enableLogging];
    #endif
    
    WEAK_SELF;
    self.bridge = [WKWebViewJavascriptBridge bridgeForWebView:self.webView];
    [self.bridge setWebViewDelegate:self];
    
    // 注册xzBridge处理器，和UIWebView版本保持一致
    [self.bridge registerHandler:@"xzBridge" handler:^(id data, WVJBResponseCallback responseCallback) {
        STRONG_SELF;
        if ([data isKindOfClass:[NSDictionary class]]) {
            [self jsCallObjc:data jsCallBack:responseCallback];
        }
    }];
    
    // 注册独立的pageReady处理器
    [self.bridge registerHandler:@"pageReady" handler:^(id data, WVJBResponseCallback responseCallback) {
        STRONG_SELF;
        NSLog(@"🎯 [pageReady Handler] 直接pageReady调用");
        
        // 调用相同的pageReady处理逻辑
        NSDictionary *pageReadyData = @{@"action": @"pageReady", @"data": data ?: @{}};
        [self jsCallObjc:pageReadyData jsCallBack:responseCallback];
    }];
    
    NSLog(@"✅ WKWebView JavaScript桥接设置完成");
}



- (void)domainOperate {
    NSLog(@"🌐 domainOperate 被调用");
    
    // 防止频繁调用（与loadHTMLContent共享时间检查）
    NSDate *now = [NSDate date];
    if (lastLoadTime && [now timeIntervalSinceDate:lastLoadTime] < 2.0) {
        NSLog(@"⚠️ domainOperate 调用过于频繁，跳过（间隔: %.2f秒）", [now timeIntervalSinceDate:lastLoadTime]);
        return;
    }
    
    self.isLoading = NO;
    self.isWebViewLoading = NO; // 重置WebView加载标志
    
    // 显示loading指示器
    dispatch_async(dispatch_get_main_queue(), ^{
        [self.activityIndicatorView startAnimating];
    });
    
    [self listenToTimer];
    
    // 读取本地HTML文件
    NSString *filepath = [[BaseFileManager appH5LocailManifesPath] stringByAppendingPathComponent:@"app.html"];
    if ([[NSFileManager defaultManager] fileExistsAtPath:filepath]) {
        NSError *error;
        self.htmlStr = [NSString stringWithContentsOfURL:[NSURL fileURLWithPath:filepath] encoding:NSUTF8StringEncoding error:&error];
        if (!error && self.htmlStr) {
            [self loadHTMLContent];
        } else {
            NSLog(@"读取HTML文件失败: %@", error.localizedDescription);
        }
    } else {
        NSLog(@"HTML文件不存在: %@", filepath);
    }
}

- (void)loadHTMLContent {
    
    // 防止频繁重新加载（2秒内只允许加载一次）
    NSDate *now = [NSDate date];
    if (lastLoadTime && [now timeIntervalSinceDate:lastLoadTime] < 2.0) {
        return;
    }
    lastLoadTime = now;
    
    // 重置加载标志，准备处理新的页面加载
    self.isWebViewLoading = NO;
    self.isLoading = NO; // 同时重置页面就绪标志
    
    // 立即取消可能存在的计时器，避免干扰
    if (self.timer) {
        dispatch_source_cancel(self.timer);
        self.timer = nil;
    }
    
    if (self.htmlStr) {
        // 确保JavaScript桥接已建立
        if (!self.bridge) {
            [self loadWebBridge];
        }
        
        if (self.pinDataStr) {
            // 直接数据模式
            NSLog(@"📄 使用直接数据模式加载页面");
            if (self.pagetitle) {
                [self getnavigationBarTitleText:self.pagetitle];
            }
            
            NSString *allHtmlStr = [self.htmlStr stringByReplacingOccurrencesOfString:@"{{body}}" withString:self.pinDataStr];
            
            if ([self isHaveNativeHeader:self.pinUrl]) {
                allHtmlStr = [allHtmlStr stringByReplacingOccurrencesOfString:@"{{phoneClass}}" withString:isIPhoneXSeries() ? @"iPhoneLiuHai" : @"iPhone"];
            }
            
            NSLog(@"🌐 开始加载HTML字符串...");
            
            // 关键修复：直接使用loadHTMLString方法，避免沙盒问题
            NSLog(@"📄 [WKWebView-Direct] 使用HTML字符串加载方式");
            
            // 使用manifest目录作为baseURL，确保资源正确加载
            NSString *manifestPath = [BaseFileManager appH5LocailManifesPath];
            NSURL *baseURL = [NSURL fileURLWithPath:manifestPath isDirectory:YES];
            
            NSLog(@"📁 [WKWebView-Direct] BaseURL: %@", baseURL);
            
            [self.webView loadHTMLString:allHtmlStr baseURL:baseURL];
        } else {
            // 使用CustomHybridProcessor处理
            NSLog(@"🔄 使用CustomHybridProcessor处理页面 - URL: %@", self.pinUrl);
            [CustomHybridProcessor custom_LocialPathByUrlStr:self.pinUrl
                                                 templateDic:self.templateDic
                                            componentJsAndCs:self.componentJsAndCs
                                              componentDic:self.componentDic
                                                     success:^(NSString *filePath, NSString *templateStr, NSString *title, BOOL isFileExsit) {
                
                NSLog(@"📋 CustomHybridProcessor处理完成 - 文件存在: %@, 标题: %@", isFileExsit ? @"是" : @"否", title);
                [self getnavigationBarTitleText:title];
                NSString *allHtmlStr = [self.htmlStr stringByReplacingOccurrencesOfString:@"{{body}}" withString:templateStr];
                
                if ([self isHaveNativeHeader:self.pinUrl]) {
                    allHtmlStr = [allHtmlStr stringByReplacingOccurrencesOfString:@"{{phoneClass}}" withString:isIPhoneXSeries() ? @"iPhoneLiuHai" : @"iPhone"];
                }
                
                NSLog(@"🌐 开始加载处理后的HTML内容...");
                
                // 关键调试：检查实际的HTML内容
                NSLog(@"📄 [HTML-DEBUG] HTML长度: %lu", (unsigned long)allHtmlStr.length);
                NSLog(@"📄 [HTML-DEBUG] HTML前1000字符: %@", allHtmlStr.length > 1000 ? [allHtmlStr substringToIndex:1000] : allHtmlStr);
                NSLog(@"📄 [HTML-DEBUG] BaseURL: %@", [HTMLCache sharedCache].noHtmlBaseUrl);
                
                // 关键修复：直接使用loadHTMLString方法，避免沙盒问题
                NSLog(@"📄 [WKWebView-CustomHybrid] 使用HTML字符串加载方式");
                
                // 使用manifest目录作为baseURL，确保资源正确加载
                NSString *manifestPath = [BaseFileManager appH5LocailManifesPath];
                NSURL *baseURL = [NSURL fileURLWithPath:manifestPath isDirectory:YES];
                
                NSLog(@"📁 [WKWebView-CustomHybrid] BaseURL: %@", baseURL);
                
                [self.webView loadHTMLString:allHtmlStr baseURL:baseURL];
            }];
        }
        
    }
}

#pragma mark - Navigation

- (void)getnavigationBarTitleText:(NSString *)title {
    self.navigationItem.title = title;
}

#pragma mark - Network Monitoring

- (void)listenToTimer {
    if (self.networkNoteView.hidden) {
        if (self.timer) {
            dispatch_source_cancel(self.timer);
            self.timer = nil;
        }
        
        dispatch_queue_t queue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0);
        self.timer = dispatch_source_create(DISPATCH_SOURCE_TYPE_TIMER, 0, 0, queue);
        dispatch_source_set_timer(self.timer, dispatch_walltime(NULL, 0), 1.0 * NSEC_PER_SEC, 0);
        timeout = 10; // 增加超时时间到10秒
        
        // 添加重试次数限制
        static NSInteger retryCount = 0;
        static NSString *lastFailedUrl = nil;
        
        __weak typeof(self) weakSelf = self;
        dispatch_source_set_event_handler(self.timer, ^{
            __strong typeof(weakSelf) strongSelf = weakSelf;
            if (!strongSelf) return;
            
            if (timeout <= 0) {
                if (strongSelf.isLoading || strongSelf.isWebViewLoading) {
                    NSLog(@"🔥 [Timer] 页面已就绪(pageReady: %@, WebView: %@)，取消计时器", 
                          strongSelf.isLoading ? @"YES" : @"NO", 
                          strongSelf.isWebViewLoading ? @"YES" : @"NO");
                    dispatch_source_cancel(strongSelf.timer);
                    strongSelf.timer = nil;
                    retryCount = 0; // 重置重试次数
                    lastFailedUrl = nil;
                } else {
                    // 检查重试次数限制
                    NSString *currentUrl = strongSelf.pinUrl ?: @"";
                    if ([currentUrl isEqualToString:lastFailedUrl]) {
                        retryCount++;
                    } else {
                        retryCount = 1;
                        lastFailedUrl = currentUrl;
                    }
                    
                    if (retryCount > 3) {
                        NSLog(@"❌ [Timer] 重试次数超过限制(%ld次)，停止重新加载", (long)retryCount);
                        dispatch_source_cancel(strongSelf.timer);
                        strongSelf.timer = nil;
                        
                        // 显示错误提示
                        dispatch_async(dispatch_get_main_queue(), ^{
                            [strongSelf.activityIndicatorView stopAnimating];
                            strongSelf.progressView.hidden = YES;
                            strongSelf.networkNoteView.hidden = NO;
                        });
                        return;
                    }
                    
                    NSLog(@"⏰ [Timer] 页面加载超时，准备重新加载 (第%ld次重试)", (long)retryCount);
                    dispatch_async(dispatch_get_main_queue(), ^{
                        // 检查网络状态
                        if (NoReachable) {
                            NSLog(@"❌ [Timer] 网络不可达，取消重新加载");
                            return;
                        }
                        [[HTMLCache sharedCache] removeObjectForKey:strongSelf.webViewDomain];
                        [strongSelf domainOperate];
                    });
                }
            } else {
                if (strongSelf.isLoading || strongSelf.isWebViewLoading) {
                    dispatch_source_cancel(strongSelf.timer);
                    strongSelf.timer = nil;
                    retryCount = 0; // 重置重试次数
                    lastFailedUrl = nil;
                } else {
                    timeout--;
                }
            }
        });
        
        dispatch_resume(self.timer);
    }
}

- (void)networkNoteBtClick {
    self.networkNoteView.hidden = YES;
    [self domainOperate];
}

#pragma mark - Page State Management

- (BOOL)isShowingOnKeyWindow {
    // 判断控件是否真正显示在主窗口
    UIWindow *keyWindow = [UIApplication sharedApplication].keyWindow;
    CGRect newFrame = [keyWindow convertRect:self.view.frame fromView:self.view.superview];
    CGRect winBounds = keyWindow.bounds;
    BOOL intersects = CGRectIntersectsRect(newFrame, winBounds);
    return !self.view.isHidden && self.view.alpha > 0.01 && self.view.window == keyWindow && intersects;
}

- (BOOL)isHaveNativeHeader:(NSString *)url {
    if ([[XZPackageH5 sharedInstance].ulrArray containsObject:url]) {
        return YES;
    }
    return NO;
}

#pragma mark - Status Bar

- (BOOL)prefersStatusBarHidden {
    NSNumber *statusBarStatus = [[NSUserDefaults standardUserDefaults] objectForKey:@"StatusBarStatus"];
    if (statusBarStatus.integerValue == 1) {
        return NO;
    } else {
        return YES;
    }
}

- (UIStatusBarStyle)preferredStatusBarStyle {
    NSString *statusBarTextColor = [[NSUserDefaults standardUserDefaults] objectForKey:@"StatusBarTextColor"];
    if ([statusBarTextColor isEqualToString:@"#000000"] || [statusBarTextColor isEqualToString:@"black"]) {
        return UIStatusBarStyleDefault;
    } else {
        return UIStatusBarStyleLightContent;
    }
}

#pragma mark - JavaScript Bridge

- (void)userContentController:(WKUserContentController *)userContentController didReceiveScriptMessage:(WKScriptMessage *)message {
    // 保留方法以防其他地方需要使用
    NSLog(@"📨 [WKWebView] 收到未处理的JavaScript消息 - name: %@", message.name);
}

- (void)jsCallObjc:(NSDictionary *)jsData jsCallBack:(WVJBResponseCallback)jsCallBack {
    NSDictionary *jsDic = (NSDictionary *)jsData;
    NSString *function = [jsDic objectForKey:@"action"];
    NSDictionary *dataDic = [jsDic objectForKey:@"data"];
    
    if ([function isEqualToString:@"request"]) {
        [self rpcRequestWithJsDic:dataDic completion:^(id result) {
            if (jsCallBack) {
                jsCallBack(result);
            }
        }];
    } else if ([function isEqualToString:@"pageReady"]) {
        self.isLoading = YES;
        
        // 立即取消计时器，防止重复调用domainOperate
        if (self.timer) {
            dispatch_source_cancel(self.timer);
            self.timer = nil;
        }
        
        // 确保所有loading指示器都被隐藏
        dispatch_async(dispatch_get_main_queue(), ^{
            [self.activityIndicatorView stopAnimating];
            if (!self.progressView.hidden) {
                [UIView animateWithDuration:0.3 animations:^{
                    self.progressView.alpha = 0.0;
                } completion:^(BOOL finished) {
                    self.progressView.hidden = YES;
                    self.progressView.alpha = 1.0;
                    self.progressView.progress = 0.0;
                }];
            }
        });
        
        // 处理下拉刷新
        @try {
            if (self.webView && self.webView.scrollView) {
                UIScrollView *scrollView = self.webView.scrollView;
                
                if ([scrollView respondsToSelector:@selector(mj_header)]) {
                    id mj_header = [scrollView valueForKey:@"mj_header"];
                    if (mj_header) {
                        NSNumber *isRefreshing = [mj_header valueForKey:@"isRefreshing"];
                        if (isRefreshing && [isRefreshing boolValue]) {
                            [mj_header performSelector:@selector(endRefreshing) withObject:nil];
                        }
                    }
                }
            }
        } @catch (NSException *exception) {
            NSLog(@"处理下拉刷新时发生异常: %@", exception.reason);
        }
        
        // 通知页面显示完成
        [[NSNotificationCenter defaultCenter] postNotificationName:@"showTabviewController" object:self];
        
        // 调用页面显示的JS事件
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.1 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
            if (self.isExist) {
                NSDictionary *callJsDic = [[HybridManager shareInstance] objcCallJsWithFn:@"pageShow" data:nil];
                [self objcCallJs:callJsDic];
            }
        });
        
        // 设置页面已存在标志
        self.isExist = YES;
        
        // 返回成功响应给前端
        if (jsCallBack) {
            jsCallBack(@{
                @"success": @"true",
                @"data": @{},
                @"errorMessage": @"",
                @"code": @0
            });
        }
    } else if ([function isEqualToString:@"showToast"]) {
        dispatch_async(dispatch_get_main_queue(), ^{
            NSString *title = [dataDic objectForKey:@"title"] ?: @"";
            [SVStatusHUD showWithMessage:title];
        });
        
        // 返回成功响应
        if (jsCallBack) {
            jsCallBack(@{
                @"success": @"true",
                @"data": @{},
                @"errorMessage": @"",
                @"code": @0
            });
        }
    } else if ([function isEqualToString:@"stopPullDownRefresh"]) {
        // 停止下拉刷新
        dispatch_async(dispatch_get_main_queue(), ^{
            @try {
                if (self.webView && self.webView.scrollView) {
                    UIScrollView *scrollView = self.webView.scrollView;
                    
                    if ([scrollView respondsToSelector:@selector(mj_header)]) {
                        id mj_header = [scrollView valueForKey:@"mj_header"];
                        if (mj_header) {
                            NSNumber *isRefreshing = [mj_header valueForKey:@"isRefreshing"];
                            if (isRefreshing && [isRefreshing boolValue]) {
                                [mj_header performSelector:@selector(endRefreshing) withObject:nil];
                            }
                        }
                    }
                }
            } @catch (NSException *exception) {
                NSLog(@"处理下拉刷新时发生异常: %@", exception.reason);
            }
        });
        
        // 返回成功响应
        if (jsCallBack) {
            jsCallBack(@{
                @"success": @"true",
                @"data": @{},
                @"errorMessage": @"",
                @"code": @0
            });
        }
    } else if ([function isEqualToString:@"getLocation"]) {
        // 从NSUserDefaults获取缓存的位置信息
        NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
        id currentLatObj = [defaults objectForKey:@"currentLat"];
        id currentLngObj = [defaults objectForKey:@"currentLng"];
        NSString *currentCity = [defaults objectForKey:@"currentCity"];
        NSString *currentAddress = [defaults objectForKey:@"currentAddress"];
        
        // 安全地转换为字符串
        NSString *currentLat = nil;
        NSString *currentLng = nil;
        
        if ([currentLatObj isKindOfClass:[NSString class]]) {
            currentLat = (NSString *)currentLatObj;
        } else if ([currentLatObj isKindOfClass:[NSNumber class]]) {
            currentLat = [(NSNumber *)currentLatObj stringValue];
        }
        
        if ([currentLngObj isKindOfClass:[NSString class]]) {
            currentLng = (NSString *)currentLngObj;
        } else if ([currentLngObj isKindOfClass:[NSNumber class]]) {
            currentLng = [(NSNumber *)currentLngObj stringValue];
        }
        
        // 如果有缓存的位置信息且不为空
        if (currentLat && currentLng && currentCity && 
            ![currentLat isEqualToString:@"0"] && ![currentLng isEqualToString:@"0"] && 
            ![currentCity isEqualToString:@"请选择"]) {
            
            NSDictionary *locationData = @{
                @"latitude": currentLat,
                @"longitude": currentLng,
                @"city": currentCity ?: @"",
                @"area": currentCity ?: @"",
                @"address": currentAddress ?: currentCity ?: @""
            };
            
            if (jsCallBack) {
                jsCallBack(@{
                    @"success": @"true",
                    @"data": locationData,
                    @"errorMessage": @"",
                    @"code": @0
                });
            }
        } else {
            // 没有缓存或缓存无效，返回默认位置（可以根据需要改为请求定位）
            NSDictionary *locationData = @{
                @"latitude": @"37.78583400",
                @"longitude": @"-122.40641700",
                @"city": @"上海市",
                @"area": @"徐汇区",
                @"address": @"上海市徐汇区"
            };
            
            if (jsCallBack) {
                jsCallBack(@{
                    @"success": @"true",
                    @"data": locationData,
                    @"errorMessage": @"",
                    @"code": @0
                });
            }
        }
    } else if ([function isEqualToString:@"navigateTo"]) {
        // navigateTo应该由子类CFJClientH5Controller处理，这里返回未实现
        if (jsCallBack) {
            jsCallBack(@{
                @"success": @"false",
                @"message": @"navigateTo should be handled by subclass",
                @"errorMessage": @"navigateTo should be handled by subclass",
                @"code": @(-1)
            });
        }
    } else {
        // 处理其他类型的调用
        if (jsCallBack) {
            jsCallBack(@{
                @"success": @NO,
                @"message": @"Unknown action",
                @"errorMessage": @"Unknown action",
                @"code": @(-1)
            });
        }
    }
}

// 根据资料建议改进的objcCallJs方法
- (void)objcCallJs:(NSDictionary *)dic {
    if (!dic) {
        return;
    }
    
    NSString *action = dic[@"action"];
    id data = dic[@"data"];
    
    // 确保在主线程执行
    dispatch_async(dispatch_get_main_queue(), ^{
        // 检查WebView和Bridge状态
        if (!self.webView || !self.bridge) {
            return;
        }
        
        // 使用WebViewJavascriptBridge调用JavaScript，添加错误处理
        [self.bridge callHandler:@"xzBridge" data:dic responseCallback:^(id responseData) {
            // 静默处理响应
        }];
    });
}

- (void)handleJavaScriptCall:(NSDictionary *)data completion:(XZWebViewJSCallbackBlock)completion {
    // 兼容性方法，转发给jsCallObjc
    [self jsCallObjc:data jsCallBack:^(id responseData) {
        if (completion) {
            completion(responseData);
        }
    }];
}

- (void)callJavaScript:(NSString *)script completion:(XZWebViewJSCallbackBlock)completion {
    // 确保在主线程执行并添加完整错误处理
    dispatch_async(dispatch_get_main_queue(), ^{
        // 检查WebView状态
        if (!self.webView) {
            if (completion) {
                completion(nil);
            }
            return;
        }
        
        // 检查脚本有效性
        if (!script || script.length == 0) {
            if (completion) {
                completion(nil);
            }
            return;
        }
        
        [self.webView evaluateJavaScript:script completionHandler:^(id result, NSError *error) {
            if (error) {
                if (completion) {
                    completion(nil);
                }
            } else {
                if (completion) {
                    completion(result);
                }
            }
        }];
    });
}

#pragma mark - Network Request

- (void)rpcRequestWithJsDic:(NSDictionary *)dataDic completion:(void(^)(id result))completion {
    dispatch_async(dispatch_get_global_queue(0, 0), ^{
        NSString *dataJsonString = @"";
        if ([dataDic isKindOfClass:[NSDictionary class]]) {
            NSData *data = [NSJSONSerialization dataWithJSONObject:dataDic options:NSJSONWritingPrettyPrinted error:nil];
            dataJsonString = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
        }
        AFHTTPSessionManager *manager = [AFHTTPSessionManager manager];
        manager.responseSerializer = [AFJSONResponseSerializer serializer];
        manager.requestSerializer = [AFJSONRequestSerializer serializer];
            
        if(ISIPAD) {
            [manager.requestSerializer setValue:@"iospad" forHTTPHeaderField:@"from"];
        } else {
            [manager.requestSerializer setValue:@"ios" forHTTPHeaderField:@"from"];
        }
        manager.requestSerializer.timeoutInterval = 45;
        manager.responseSerializer.acceptableContentTypes = [NSSet setWithObjects:@"application/json", @"text/plain", @"text/javascript", @"text/json", @"text/html", nil];
        [manager.requestSerializer setValue:[[NSUserDefaults standardUserDefaults] objectForKey:@"User_Token_String"] forHTTPHeaderField:@"AUTHORIZATION"];
        NSDictionary *header = [dataDic objectForKey:@"header"];
        for (NSString *key in [header allKeys]) {
            [manager.requestSerializer setValue:[header objectForKey:key] forHTTPHeaderField:key];
        }
        
        NSString *requestUrl = [CustomHybridProcessor custom_getRequestLinkUrl:[dataDic objectForKey:@"url"]];
        
        [manager POST:requestUrl parameters:[dataDic objectForKey:@"data"] headers:nil progress:nil success:^(NSURLSessionDataTask * _Nonnull task, id  _Nullable responseObject) {
            if (completion) {
                dispatch_async(dispatch_get_main_queue(), ^{
                    // 构造JavaScript期望的响应格式
                    NSDictionary *serverResponse = responseObject;
                    
                    // 检查服务器响应的成功状态
                    BOOL isSuccess = NO;
                    NSNumber *codeValue = [serverResponse objectForKey:@"code"];
                    if (codeValue && [codeValue intValue] == 0) {
                        isSuccess = YES;
                    }
                    
                    // 构造JavaScript期望的响应格式
                    NSDictionary *jsResponse = @{
                        @"success": isSuccess ? @"true" : @"false",
                        @"data": @{
                            @"code": isSuccess ? @"0" : [NSString stringWithFormat:@"%@", codeValue ?: @(-1)],
                            @"data": [serverResponse objectForKey:@"data"] ?: @{},
                            @"errorMessage": [serverResponse objectForKey:@"errorMessage"] ?: @""
                        },
                        @"errorMessage": [serverResponse objectForKey:@"errorMessage"] ?: @"",
                        @"code": codeValue ?: @(-1)
                    };
                    
                    completion(jsResponse);
                });
            }
        } failure:^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull error) {
            if (completion) {
                dispatch_async(dispatch_get_main_queue(), ^{
                    // 失败时也使用JavaScript期望的格式
                    NSDictionary *errorResponse = @{
                        @"success": @"false",
                        @"data": @{
                            @"code": @"-1",
                            @"data": @{},
                            @"errorMessage": error.localizedDescription ?: @"网络请求失败"
                        },
                        @"errorMessage": error.localizedDescription ?: @"网络请求失败",
                        @"code": @(-1)
                    };
                    completion(errorResponse);
                });
            }
        }];
    });
}

#pragma mark - Payment

- (void)payRequest:(NSDictionary *)payDic {
    // 具体支付过程在子类中实现
}

#pragma mark - Utility Methods

- (NSString *)jsonStringFromObject:(id)object {
    if (!object) return @"{}";
    
    NSError *error;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:object
                                                       options:NSJSONWritingPrettyPrinted
                                                         error:&error];
    if (error) {
        NSLog(@"JSON序列化失败: %@", error.localizedDescription);
        return @"{}";
    }
    
    return [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
}

#pragma mark - Compatibility Properties

- (NSDictionary *)ComponentJsAndCs {
    if (!_componentJsAndCs) {
        _componentJsAndCs = [NSDictionary dictionary];
    }
    return _componentJsAndCs;
}

- (NSDictionary *)ComponentDic {
    if (!_componentDic) {
        _componentDic = [NSDictionary dictionary];
    }
    return _componentDic;
}

- (NSDictionary *)templateDic {
    if (!_templateDic) {
        _templateDic = [NSDictionary dictionary];
    }
    return _templateDic;
}

- (void)titleLableTapped:(UIGestureRecognizer *)gesture {
    [self.webView.scrollView scrollRectToVisible:CGRectMake(0, 0, self.view.bounds.size.width, self.view.bounds.size.height) animated:YES];
}

#pragma mark - WKNavigationDelegate

- (void)webView:(WKWebView *)webView didFinishNavigation:(WKNavigation *)navigation {
    NSLog(@"✅ WKWebView页面加载完成 - URL: %@", webView.URL.absoluteString);
    
    // 隐藏loading指示器
    dispatch_async(dispatch_get_main_queue(), ^{
        [self.activityIndicatorView stopAnimating];
    });
    
    if (!self.isWebViewLoading) {
        // 处理loading视图
        if ([[UIApplication sharedApplication].keyWindow viewWithTag:2001] && [self isShowingOnKeyWindow]) {
            if (![[NSUserDefaults standardUserDefaults] boolForKey:@"isFirst"]) {
                [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"isFirst"];
            } else {
                LoadingView *view = [[UIApplication sharedApplication].keyWindow viewWithTag:2001];
                [[UIApplication sharedApplication].keyWindow bringSubviewToFront:view];
            }
            
            [[NSNotificationCenter defaultCenter] postNotificationName:@"showTabviewController" object:self];
        }
        
        // 禁用选择和长按（保持与UIWebView一致）
        [self.webView evaluateJavaScript:@"document.documentElement.style.webkitUserSelect='none';" completionHandler:nil];
        [self.webView evaluateJavaScript:@"document.documentElement.style.webkitTouchCallout='none';" completionHandler:nil];
        
        // JavaScript调试已移除
        
        // 设置加载完成标志
        self.isWebViewLoading = YES;
        NSLog(@"✅ 页面加载处理完成，设置 isWebViewLoading = YES");
        
    } else {
        NSLog(@"⚠️ 页面加载完成事件已经处理过，跳过重复处理");
    }
}

- (void)webView:(WKWebView *)webView didFailNavigation:(WKNavigation *)navigation withError:(NSError *)error {
    NSLog(@"❌ WebView加载失败: %@", error.localizedDescription);
    NSLog(@"❌ 错误码: %ld, 域: %@", (long)error.code, error.domain);
    NSLog(@"❌ URL: %@", webView.URL);
    
    // 隐藏loading指示器
    dispatch_async(dispatch_get_main_queue(), ^{
        [self.activityIndicatorView stopAnimating];
        self.progressView.hidden = YES;
        self.progressView.progress = 0.0;
    });
    
    self.networkNoteView.hidden = NO;
}

- (void)webView:(WKWebView *)webView didFailProvisionalNavigation:(WKNavigation *)navigation withError:(NSError *)error {
    NSLog(@"❌ WebView预加载失败: %@", error.localizedDescription);
    NSLog(@"❌ 错误码: %ld, 域: %@", (long)error.code, error.domain);
    NSLog(@"❌ URL: %@", webView.URL);
    
    // 隐藏loading指示器
    dispatch_async(dispatch_get_main_queue(), ^{
        [self.activityIndicatorView stopAnimating];
        self.progressView.hidden = YES;
        self.progressView.progress = 0.0;
    });
    
    self.networkNoteView.hidden = NO;
}

- (void)webView:(WKWebView *)webView didCommitNavigation:(WKNavigation *)navigation {
    NSLog(@"📄 WebView开始加载内容: %@", webView.URL);
}

- (void)webView:(WKWebView *)webView didStartProvisionalNavigation:(WKNavigation *)navigation {
    NSLog(@"📄 WebView开始导航: %@", webView.URL);
    
    // 显示loading指示器
    dispatch_async(dispatch_get_main_queue(), ^{
        [self.activityIndicatorView startAnimating];
        self.progressView.hidden = NO;
        self.progressView.progress = 0.0;
    });
}

- (void)webView:(WKWebView *)webView decidePolicyForNavigationAction:(WKNavigationAction *)navigationAction decisionHandler:(void (^)(WKNavigationActionPolicy))decisionHandler {
    NSURL *url = navigationAction.request.URL;
    NSString *scheme = url.scheme.lowercaseString;
    
    // 关键：允许WebViewJavascriptBridge的wvjbscheme://连接
    if ([scheme isEqualToString:@"wvjbscheme"]) {
        NSLog(@"🔗 [WKWebView] 检测到WebViewJavascriptBridge连接: %@", url.absoluteString);
        decisionHandler(WKNavigationActionPolicyAllow);
        return;
    }
    
    // 处理电话客服按钮
    if ([scheme isEqualToString:@"tel"]) {
        NSLog(@"📞 [WKWebView] 检测到电话链接: %@", url.absoluteString);
        // 在iOS 10.0以上使用新的API
        if (@available(iOS 10.0, *)) {
            [[UIApplication sharedApplication] openURL:url options:@{} completionHandler:^(BOOL success) {
                if (success) {
                    NSLog(@"✅ [WKWebView] 电话拨打成功");
                } else {
                    NSLog(@"❌ [WKWebView] 电话拨打失败");
                }
            }];
        } else {
            // iOS 10.0以下使用旧API
            [[UIApplication sharedApplication] openURL:url];
        }
        decisionHandler(WKNavigationActionPolicyCancel);
        return;
    }
    
    // 允许file://和http/https协议
    if ([scheme isEqualToString:@"file"] || [scheme isEqualToString:@"http"] || [scheme isEqualToString:@"https"]) {
        decisionHandler(WKNavigationActionPolicyAllow);
        return;
    }
    
    NSLog(@"🚫 [WKWebView] 阻止未知URL scheme: %@", url.absoluteString);
    decisionHandler(WKNavigationActionPolicyCancel);
}

#pragma mark - WKUIDelegate

- (void)webView:(WKWebView *)webView runJavaScriptAlertPanelWithMessage:(NSString *)message initiatedByFrame:(WKFrameInfo *)frame completionHandler:(void (^)(void))completionHandler {
    UIAlertController *alertController = [UIAlertController alertControllerWithTitle:@"提示" message:message preferredStyle:UIAlertControllerStyleAlert];
    [alertController addAction:[UIAlertAction actionWithTitle:@"确定" style:UIAlertActionStyleDefault handler:^(UIAlertAction *action) {
        completionHandler();
    }]];
    [self presentViewController:alertController animated:YES completion:nil];
}

- (void)webView:(WKWebView *)webView runJavaScriptConfirmPanelWithMessage:(NSString *)message initiatedByFrame:(WKFrameInfo *)frame completionHandler:(void (^)(BOOL))completionHandler {
    UIAlertController *alertController = [UIAlertController alertControllerWithTitle:@"确认" message:message preferredStyle:UIAlertControllerStyleAlert];
    [alertController addAction:[UIAlertAction actionWithTitle:@"确定" style:UIAlertActionStyleDefault handler:^(UIAlertAction *action) {
        completionHandler(YES);
    }]];
    [alertController addAction:[UIAlertAction actionWithTitle:@"取消" style:UIAlertActionStyleCancel handler:^(UIAlertAction *action) {
        completionHandler(NO);
    }]];
    [self presentViewController:alertController animated:YES completion:nil];
}

// 根据资料建议，添加KVO监听方法
- (void)observeValueForKeyPath:(NSString *)keyPath ofObject:(id)object change:(NSDictionary *)change context:(void *)context {
    if ([keyPath isEqualToString:@"estimatedProgress"]) {
        // 更新进度条
        float progress = [[change objectForKey:NSKeyValueChangeNewKey] floatValue];
        
        dispatch_async(dispatch_get_main_queue(), ^{
            if (progress > 0.0 && progress < 1.0) {
                // 显示进度条并更新进度
                self.progressView.hidden = NO;
                [self.progressView setProgress:progress animated:YES];
            } else if (progress >= 1.0) {
                // 加载完成，隐藏进度条
                [UIView animateWithDuration:0.3 animations:^{
                    self.progressView.alpha = 0.0;
                } completion:^(BOOL finished) {
                    self.progressView.hidden = YES;
                    self.progressView.alpha = 1.0;
                    self.progressView.progress = 0.0;
                }];
            }
        });
        
    } else if ([keyPath isEqualToString:@"title"]) {
        // 更新标题
        NSString *title = [change objectForKey:NSKeyValueChangeNewKey];
        if (title && title.length > 0) {
            // 可以更新导航栏标题
            // self.navigationItem.title = title;
        }
    } else {
        [super observeValueForKeyPath:keyPath ofObject:object change:change context:context];
    }
}

- (void)debugJavaScriptCallback {
    NSLog(@"🔍 [JavaScript回调调试] 开始检查JavaScript回调问题...");
    
    // 1. 检查WebViewJavascriptBridge是否正常工作
    [self.webView evaluateJavaScript:@"typeof WebViewJavascriptBridge !== 'undefined' && WebViewJavascriptBridge.callHandler ? 'WebViewJavascriptBridge正常' : 'WebViewJavascriptBridge异常'" completionHandler:^(id result, NSError *error) {
        NSLog(@"🔍 [JavaScript回调调试] WebViewJavascriptBridge状态: %@", result ?: @"检查失败");
        
        // 2. 检查app.request方法是否存在
        [self.webView evaluateJavaScript:@"typeof app !== 'undefined' && typeof app.request === 'function' ? 'app.request方法存在' : 'app.request方法不存在'" completionHandler:^(id result, NSError *error) {
            NSLog(@"🔍 [JavaScript回调调试] app.request状态: %@", result ?: @"检查失败");
            
            // 3. 检查app.tips方法是否存在
            [self.webView evaluateJavaScript:@"typeof app !== 'undefined' && typeof app.tips === 'function' ? 'app.tips方法存在' : 'app.tips方法不存在'" completionHandler:^(id result, NSError *error) {
                NSLog(@"🔍 [JavaScript回调调试] app.tips状态: %@", result ?: @"检查失败");
                
                // 4. 手动测试app.tips是否能正常工作
                [self.webView evaluateJavaScript:@"try { if(typeof app !== 'undefined' && typeof app.tips === 'function') { app.tips('JavaScript回调测试'); return 'app.tips调用成功'; } else { return 'app.tips不可用'; } } catch(e) { return 'app.tips调用失败: ' + e.message; }" completionHandler:^(id result, NSError *error) {
                    NSLog(@"🔍 [JavaScript回调调试] app.tips测试结果: %@", result ?: @"测试失败");
                    
                    // 5. 手动测试一个简单的app.request调用
                    [self.webView evaluateJavaScript:@"try { if(typeof app !== 'undefined' && typeof app.request === 'function') { app.request('//test/callback', {}, function(res) { console.log('手动测试回调成功:', res); app.tips('手动测试回调成功!'); }); return 'app.request手动测试已发起'; } else { return 'app.request不可用'; } } catch(e) { return 'app.request手动测试失败: ' + e.message; }" completionHandler:^(id result, NSError *error) {
                        NSLog(@"🔍 [JavaScript回调调试] app.request手动测试: %@", result ?: @"测试失败");
                        
                        // 6. 检查是否有JavaScript错误
                        [self.webView evaluateJavaScript:@"(function() { var errors = []; try { if(window.console && window.console.log) { var originalLog = console.log; var originalError = console.error; var logMessages = []; var errorMessages = []; console.log = function(...args) { logMessages.push(args.join(' ')); originalLog.apply(console, args); }; console.error = function(...args) { errorMessages.push(args.join(' ')); originalError.apply(console, args); }; return 'JavaScript错误监听已启动'; } else { return '控制台不可用'; } } catch(e) { return '错误监听设置失败: ' + e.message; } })()" completionHandler:^(id result, NSError *error) {
                            NSLog(@"🔍 [JavaScript回调调试] JavaScript错误监听: %@", result ?: @"监听失败");
                        }];
                    }];
                }];
            }];
        }];
    }];
}

@end