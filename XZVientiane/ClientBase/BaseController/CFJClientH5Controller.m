//
//  CFJClientH5Controller.m
//  XiangZhanClient
//
//  Created by cuifengju on 2017/10/13.
//  Copyright © 2017年 TuWeiA. All rights reserved.
//
#import "CFJClientH5Controller.h"
#import "WKWebView+XZAddition.h"
#import "UIWebView+addition.h"
#import "HTMLWebViewController.h"
#import "WKWebViewJavascriptBridge.h"
//model
#import "XZOrderModel.h"
#import "ClientSettingModel.h"
//view
#import "UIBarButtonItem+DCBarButtonItem.h"
#import "DCNavSearchBarView.h"
#import "PPBadgeView.h"
#import "CustomTabBar.h"
#import "YBPopupMenu.h"
#import "DHGuidePageHUD.h"
#import "ShowAlertView.h"
#import "UITabBar+badge.h"
//tool
#import "NSString+MD5.h"
#import "WXApi.h"
#import "HTMLCache.h"
#import "UIView+Layout.h"
#import "AppDelegate.h"
#import "SDWebImageManager.h"
#import "UIView+AutoLayout.h"
#import "BaseFileManager.h"
#import "SVStatusHUD.h"
#import <UMShare/UMShare.h>
#import "JHSysAlertUtil.h"
#import "AppDelegate.h"
#import "XZPackageH5.h"
#import "MOFSPickerManager.h"
#import "XZIcomoonDefine.h"
#import "ClientNetInterface.h"
#import "ManageCenter.h"
#import <Masonry.h>
#import <QiniuSDK.h>
#import <Photos/Photos.h>
#import "UIImage+tool.h"
#import "JFLocation.h"
#import "LBPhotoBrowserManager.h"
#import "LBAlbumManager.h"
#import <HybridSDK/HybridSDK.h>
#import "NSString+addition.h"
#import <UMCommon/MobClick.h>
#import <Photos/Photos.h>
#import <AlipaySDK/AlipaySDK.h>
#import <AMapFoundationKit/AMapFoundationKit.h>
#import <AMapLocationKit/AMapLocationKit.h>
//viewController
#import "XZNavigationController.h"
#import "TZImagePickerController.h"
#import "HTMLWebViewController.h"
#import "XZTabBarController.h"
#import "CFJScanViewController.h"
#import "AddressFromMapViewController.h"
#import "JFCityViewController.h"
#import <JavaScriptCore/JavaScriptCore.h>
#import "CustomHybridProcessor.h"

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
#define JDomain  [NSString stringWithFormat:@"https://%@",[[NSUserDefaults standardUserDefaults] objectForKey:@"kUserDefaults_domainStr"]]
#define ScreenWidth [UIScreen mainScreen].bounds.size.width
#define TITLES @[@"登录", @"注册"]
#define ICONS  @[@"login",@"regist"]
@interface CFJClientH5Controller ()<TZImagePickerControllerDelegate,YBPopupMenuDelegate,JFLocationDelegate,JFCityViewControllerDelegate>
{
    NSMutableArray *_selectedPhotos;
    NSMutableArray *_selectedAssets;
    BOOL _isSelectOriginalPhoto;
    NSMutableArray *_selectedVideo;
    NSString *_videoPath;
    NSString *bgColor;
    NSString *color;
    AVPlayer *play;
    AVPlayerItem *playItem;
    
    CGFloat _itemWH;
    CGFloat _margin;
}

@property (strong, nonatomic) NSString *orderNum; //订单号，银联支付拿订单号去后台验证是否支付成功
@property (assign, nonatomic) NSInteger lastPosition;
@property (strong, nonatomic) NSArray *viewImageAry;
@property (strong, nonatomic) NSLock *lock;
@property (assign, nonatomic) BOOL leftMessage;
@property (assign, nonatomic) BOOL rightMessage;
@property (assign, nonatomic) BOOL leftShop;
@property (assign, nonatomic) BOOL rightShop;
@property (copy, nonatomic) NSString *backStr;
@property (nonatomic, strong) QNUpCancellationSignal cancelSignal;
@property (nonatomic, assign) BOOL isCancel;
// 恢复定位管理器属性
@property (strong,nonatomic)AMapLocationManager *locationManager;
@property (nonatomic, strong) JFLocation *JFlocationManager;

@property (assign, nonatomic)CGPoint timePosition;
@property (assign, nonatomic)CGPoint currentPosition;

// 添加回调方法声明
- (void)callBack:(NSString *)type params:(NSDictionary *)params;

@end

// 添加 GeDianUserInfo 类声明
@interface GeDianUserInfo : NSObject
@property (nonatomic, copy) NSString *nickname;
@property (nonatomic, copy) NSString *userId;
@property (nonatomic, copy) NSString *headpic;
@end

@implementation GeDianUserInfo
@end

@implementation CFJClientH5Controller

// 智能检测并处理登录状态变化
- (void)detectAndHandleLoginStateChange:(void(^)(NSDictionary*))completion {
    if (!self.webView || ![self.webView isKindOfClass:[WKWebView class]]) {
        return;
    }
    
    WKWebView *wkWebView = (WKWebView *)self.webView;
    
    // 获取JavaScript端的userSession
    [wkWebView evaluateJavaScript:@"(function(){ try { return app.session.get('userSession') || ''; } catch(e) { return ''; } })()" 
                completionHandler:^(id jsUserSession, NSError *error) {
        
        // 获取iOS端的登录状态
        BOOL iosLoginState = [[NSUserDefaults standardUserDefaults] boolForKey:@"isLogin"];
        BOOL jsHasSession = jsUserSession && [jsUserSession isKindOfClass:[NSString class]] && [(NSString*)jsUserSession length] > 0;
        
        NSLog(@"🔍 [状态检测] JS有Session: %@, iOS登录状态: %@", jsHasSession ? @"是" : @"否", iosLoginState ? @"是" : @"否");
        
        dispatch_async(dispatch_get_main_queue(), ^{
            if (jsHasSession && !iosLoginState) {
                // JS有session但iOS端未登录 -> 执行登录逻辑
                NSLog(@"✅ [状态同步] 检测到用户登录，同步iOS端状态");
                [self syncLoginState];
            } else if (!jsHasSession && iosLoginState) {
                // JS无session但iOS端已登录 -> 执行退出登录逻辑  
                NSLog(@"✅ [状态同步] 检测到用户退出，同步iOS端状态");
                [self syncLogoutState];
            }
            // 其他情况：状态一致，无需处理
        });
    }];
}

// 同步登录状态
- (void)syncLoginState {
    // 设置iOS端登录状态
    [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"isLogin"];
    [[NSUserDefaults standardUserDefaults] synchronize];
    
    // 清除HTML缓存，确保页面能正确刷新
    [[HTMLCache sharedCache] removeAllCache];
    
    NSLog(@"🎯 [syncLoginState] 已同步登录状态");
    
    // 执行登录成功后的处理
    dispatch_async(dispatch_get_main_queue(), ^{
        // 跳转到首页并选中第一个tab
        if (self.tabBarController && [self.tabBarController isKindOfClass:[UITabBarController class]]) {
            self.tabBarController.selectedIndex = 0;
            NSLog(@"🎯 [syncLoginState] 切换到TabBar第0个Tab（首页）");
            
            // 延迟一点再发送backToHome通知，确保tab切换完成
            dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.1 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                NSDictionary *setDic = @{@"selectNumber": @"0"};
                [[NSNotificationCenter defaultCenter] postNotificationName:@"backToHome" object:setDic];
            });
        }
    });
}

// 同步退出登录状态
- (void)syncLogoutState {
    // 设置iOS端退出登录状态
    [[NSUserDefaults standardUserDefaults] setBool:NO forKey:@"isLogin"];
    [[NSUserDefaults standardUserDefaults] synchronize];
    
    // 清除HTML缓存和Cookie，确保页面能正确刷新
    [[HTMLCache sharedCache] removeAllCache];
    [UIWebView cookieDeleteAllCookie];
    
    // 重置所有tab页面到初始状态，清除内页导航历史
    [self resetAllTabsToInitialState];
    
    //隐藏底部角标
    dispatch_async(dispatch_get_main_queue(), ^{
        [self.tabBarController.tabBar hideBadgeOnItemIndex:3];
    });
    [[NSUserDefaults standardUserDefaults] setInteger:0 forKey:@"clinetMessageNum"];
    [[NSUserDefaults standardUserDefaults] setInteger:0 forKey:@"shoppingCartNum"];
    [[NSUserDefaults standardUserDefaults] synchronize];
    
    NSLog(@"🎯 [syncLogoutState] 已同步退出登录状态");
    
    // 执行退出登录后的处理
    dispatch_async(dispatch_get_main_queue(), ^{
        // 跳转到首页并选中第一个tab
        if (self.tabBarController && [self.tabBarController isKindOfClass:[UITabBarController class]]) {
            self.tabBarController.selectedIndex = 0;
            NSLog(@"🎯 [syncLogoutState] 切换到TabBar第0个Tab（首页）");
            
            // 发送backToHome通知，传递正确的NSDictionary格式
            NSDictionary *setDic = @{@"selectNumber": @"0"};
            [[NSNotificationCenter defaultCenter] postNotificationName:@"backToHome" object:setDic];
        }
    });
}

// 重置所有tab页面到初始状态，清除内页导航历史
- (void)resetAllTabsToInitialState {
    if (!self.tabBarController) {
        NSLog(@"⚠️ [resetAllTabsToInitialState] 未找到TabBarController");
        return;
    }
    
    NSLog(@"🔄 [resetAllTabsToInitialState] 开始重置所有tab页面");
    
    dispatch_async(dispatch_get_main_queue(), ^{
        NSArray *viewControllers = self.tabBarController.viewControllers;
        
        for (NSInteger i = 0; i < viewControllers.count; i++) {
            UIViewController *viewController = viewControllers[i];
            NSLog(@"🔍 [resetAllTabsToInitialState] 处理第%ld个tab: %@", (long)i, NSStringFromClass([viewController class]));
            
            // 如果是导航控制器，pop到根视图控制器
            if ([viewController isKindOfClass:[UINavigationController class]]) {
                UINavigationController *navController = (UINavigationController *)viewController;
                if (navController.viewControllers.count > 1) {
                    NSLog(@"📤 [resetAllTabsToInitialState] 导航控制器有%ld个页面，pop到根页面", (long)navController.viewControllers.count);
                    [navController popToRootViewControllerAnimated:NO];
                }
            }
            // 如果是WebView控制器（继承自CFJClientH5Controller或XZWKWebViewBaseController）
            else if ([viewController isKindOfClass:[CFJClientH5Controller class]] || 
                     [viewController respondsToSelector:@selector(webView)]) {
                
                NSLog(@"🌐 [resetAllTabsToInitialState] 重置WebView控制器");
                [self resetWebViewControllerState:viewController];
            }
        }
        
        NSLog(@"✅ [resetAllTabsToInitialState] 所有tab页面重置完成");
    });
}

// 重置WebView控制器状态
- (void)resetWebViewControllerState:(UIViewController *)controller {
    // 尝试获取WebView
    WKWebView *webView = nil;
    
    if ([controller respondsToSelector:@selector(webView)]) {
        webView = [controller performSelector:@selector(webView)];
    }
    
    if (!webView || ![webView isKindOfClass:[WKWebView class]]) {
        NSLog(@"⚠️ [resetWebViewControllerState] 未找到有效的WebView");
        return;
    }
    
    NSLog(@"🧹 [resetWebViewControllerState] 清理WebView状态");
    
    // 停止当前加载
    [webView stopLoading];
    
    // 彻底清理JavaScript状态和存储
    [webView evaluateJavaScript:@"try { localStorage.clear(); sessionStorage.clear(); if(window.app && window.app.storage) { window.app.storage.clear(); } if(window.history) { while(window.history.length > 1) { window.history.back(); } } } catch(e) { console.log('清理状态时出错:', e); }" completionHandler:nil];
    
    // 清理WKWebView数据存储
    NSSet *websiteDataTypes = [NSSet setWithArray:@[
        WKWebsiteDataTypeDiskCache,
        WKWebsiteDataTypeMemoryCache,
        WKWebsiteDataTypeLocalStorage,
        WKWebsiteDataTypeSessionStorage
    ]];
    NSDate *dateFrom = [NSDate dateWithTimeIntervalSince1970:0];
    [[WKWebsiteDataStore defaultDataStore] removeDataOfTypes:websiteDataTypes 
                                               modifiedSince:dateFrom 
                                           completionHandler:^{
        NSLog(@"✅ [resetWebViewControllerState] WebView数据清理完成");
    }];
    
    // 延迟重新加载，确保清理完成
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.2 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        if ([controller respondsToSelector:@selector(domainOperate)]) {
            NSLog(@"🔄 [resetWebViewControllerState] 调用domainOperate重新加载");
            [controller performSelector:@selector(domainOperate)];
        }
    });
}

- (NSLock *)lock {
    if (_lock == nil) {
        _lock = [[NSLock alloc]init];
    }
    return _lock;
}

- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)addNotif {
    WEAK_SELF;
    
    [[NSNotificationCenter defaultCenter] addObserverForName:@"payresultnotif" object:nil queue:[NSOperationQueue mainQueue] usingBlock:^(NSNotification *note) {
        STRONG_SELF;
        [self handlePayResult:note.object];
    }];
    
    [[NSNotificationCenter defaultCenter] addObserverForName:@"weixinPay" object:nil queue:[NSOperationQueue mainQueue] usingBlock:^(NSNotification *note) {
        STRONG_SELF;
        [self handleweixinPayResult:note.object];
    }];
    
    [[NSNotificationCenter defaultCenter] addObserverForName:@"HideTabBarNotif" object:nil queue:[NSOperationQueue mainQueue] usingBlock:^(NSNotification *note) {
        STRONG_SELF;
        [UIView animateWithDuration:0.5 animations:^{
            UIView *qrView = [self.view viewWithTag:1001];
            qrView.frame = CGRectMake(15, [UIScreen mainScreen].bounds.size.height, 40, 40);
        }];
    }];
    
    [[NSNotificationCenter defaultCenter] addObserverForName:@"ShowTabBarNotif" object:nil queue:[NSOperationQueue mainQueue] usingBlock:^(NSNotification *note) {
        STRONG_SELF;
        [UIView animateWithDuration:0.5 animations:^{
            UIView *qrView = [self.view viewWithTag:1001];
            qrView.frame = CGRectMake(15, [UIScreen mainScreen].bounds.size.height - 100, 40, 40);
        }];
    }];
    
    //变更消息数量
    [[NSNotificationCenter defaultCenter] addObserverForName:@"changeMessageNum" object:nil queue:[NSOperationQueue mainQueue] usingBlock:^(NSNotification *note) {
        STRONG_SELF;
        UIViewController *VC = [self currentViewController];
        if ([VC isEqual:self]) {
            NSInteger num = [[NSUserDefaults standardUserDefaults] integerForKey:@"clinetMessageNum"];
            if (num) {
                //设置底部角标
                dispatch_async(dispatch_get_main_queue(), ^{
                    [self.tabBarController.tabBar showBadgeOnItemIndex:3 withNum:num];
                });
            }
            else {
                //隐藏底部角标
                dispatch_async(dispatch_get_main_queue(), ^{
                    [self.tabBarController.tabBar hideBadgeOnItemIndex:3];
                });
            }
        }
    }];
    
    //刷新页面触发请求
    [[NSNotificationCenter defaultCenter] addObserverForName:@"reloadMessage" object:nil queue:[NSOperationQueue mainQueue] usingBlock:^(NSNotification *note) {
        STRONG_SELF;
        UIViewController *VC = [self currentViewController];
        if ([VC isEqual:self]) {
            if (NoReachable) {
                return;
            }
        }
    }];
    
    //返回到首页
    [[NSNotificationCenter defaultCenter] addObserverForName:@"backToHome" object:nil queue:[NSOperationQueue mainQueue] usingBlock:^(NSNotification *note) {
        STRONG_SELF;
        UIViewController *VC = [self currentViewController];
        if ([VC isEqual:self]) {
            if (self.presentingViewController) {
                [self dismissViewControllerAnimated:NO completion:^{
                    if ([VC isEqual:self]) {
                        NSDictionary *dic = note.object;
                        NSInteger number = [[dic objectForKey:@"selectNumber"] integerValue];
                        AppDelegate *delegate = (AppDelegate *)[[UIApplication sharedApplication] delegate];
                        XZTabBarController *tab = (XZTabBarController *)delegate.window.rootViewController;
                        tab.selectedIndex = number;
                    }
                }];
            } else {
                if ([VC isEqual:self]) {
                    NSDictionary *dic = note.object;
                    NSInteger number = [[dic objectForKey:@"selectNumber"] integerValue];
                    AppDelegate *delegate = (AppDelegate *)[[UIApplication sharedApplication] delegate];
                    XZTabBarController *tab = (XZTabBarController *)delegate.window.rootViewController;
                    tab.selectedIndex = number;
                }
            }
        }
    }];
}

- (void)loadView {
    self.webView.backgroundColor = [UIColor whiteColor];
    //     self.webView.opaque = NO;
    //    self.webView.backgroundColor = [UIColor colorWithPatternImage:[UIImage imageNamed:@"Moon.png"]];
    [super loadView];
}

#pragma mark 调用js弹出属性窗口

- (void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];
    if (self.isCheck) {
        self.isCheck = NO;
        //        dispatch_async(dispatch_get_global_queue(0, 0), ^{
        //            //版本更新提示
        //        });
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(3.0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
            //版本更新提示
            [[XZPackageH5 sharedInstance] checkVersion];

        });
//                        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(3.0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
//                            //版本更新提示
//                            [[PgyUpdateManager sharedPgyManager] startManagerWithAppId:@"11dc0d780559c80853a4a42041ce88c1"];   // 请将 PGY_APP_ID 换成应用的 App Key
//                            [[PgyUpdateManager sharedPgyManager] checkUpdate];
//                        });
        
    }
    //是否添加引导页
    //    if (![[NSUserDefaults standardUserDefaults] boolForKey:BOOLFORKEY]) {
    //        [[NSUserDefaults standardUserDefaults] setBool:YES forKey:BOOLFORKEY];
    //        NSArray *imageNameArray = @[@"guideImage1",@"guideImage2",@"guideImage3",@"guideImage4",@"guideImage5"];
    //        DHGuidePageHUD *guidePage = [[DHGuidePageHUD alloc] dh_initWithFrame:[UIApplication sharedApplication].keyWindow.bounds imageNameArray:imageNameArray buttonIsHidden:NO];
    //        guidePage.slideInto = YES;
    //        [[UIApplication sharedApplication].keyWindow addSubview:guidePage];
    //    }
    if (self.removePage.length) {
        NSMutableArray *marr = [[NSMutableArray alloc]initWithArray:self.navigationController.viewControllers];
        for (CFJClientH5Controller *vc in marr) {
            if ([vc.webViewDomain containsString:self.removePage]) {
                [marr removeObject:vc];
                break;
            }
        }
        self.navigationController.viewControllers = marr;
    }
    //友盟页面统计
    NSString* cName = [NSString stringWithFormat:@"%@",self.navigationItem.title, nil];
    [MobClick beginLogPageView:cName];
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];
    self.isCancel = YES;
    if (self.cancelSignal) {
        self.cancelSignal();
    }
    NSArray *viewControllers = self.navigationController.viewControllers;//获取当前的视图控制其
    if ([viewControllers indexOfObject:self] == NSNotFound) {
        //页面卸载
        NSDictionary *callJsDic = [[HybridManager shareInstance] objcCallJsWithFn:@"pageUnload" data:nil];
        [self objcCallJs:callJsDic];
    }
    else {
        //页面隐藏
        NSDictionary *callJsDic = [[HybridManager shareInstance] objcCallJsWithFn:@"pageHide" data:nil];
        [self objcCallJs:callJsDic];
    }
    //友盟页面统计
    NSString* cName = [NSString stringWithFormat:@"%@",self.navigationItem.title, nil];
    [MobClick endLogPageView:cName];
}

- (void)viewDidDisappear:(BOOL)animated {
    [super viewDidDisappear:animated];
}

- (void)viewDidLoad {
    [super viewDidLoad];
    if (self.isCheck) {
        self.JFlocationManager = [[JFLocation alloc] init];
        _JFlocationManager.delegate = self;
    }
    //获取配置
    [self setNavMessage];
    [self addNotif];
    self.view.backgroundColor = [UIColor tyBgViewColor];
    switch (self.pushType) {
        case isPushPresent:
        {
            self.view.backgroundColor = [UIColor clearColor];
            [self.webView mas_remakeConstraints:^(MASConstraintMaker *make) {
                make.left.equalTo(self.view);
                make.right.equalTo(self.view);
                make.bottom.equalTo(self.view);
                make.top.equalTo(self.view).offset(200);
            }];
        }
            break;
        case isPushAlert:
        {
            self.view.backgroundColor = [UIColor clearColor];
            [self.webView setBackgroundColor:[UIColor clearColor]];
            [self.webView  setOpaque:NO];
            [self.webView mas_remakeConstraints:^(MASConstraintMaker *make) {
                make.left.equalTo(self.view);
                make.right.equalTo(self.view);
                make.bottom.equalTo(self.view);
                make.top.equalTo(self.view).offset(0);
            }];
        }
            break;
            
        default:
            break;
    }
    // 注意：不要重复调用domainOperate，父类已经调用了
}

- (void)setNavMessage {
    [self setUpNavWithDic:self.navDic];
}

#pragma mark - 导航条处理

- (void)setUpNavWithDic:(NSDictionary *)dic {
    self.navigationController.navigationBar.tintColor = [UIColor whiteColor];
    if (self.navigationController.childViewControllers.count >= 1) {
        UIBarButtonItem *backButtonItem = [[UIBarButtonItem alloc] initWithTitle:@"" style:UIBarButtonItemStylePlain target:nil action:nil];
        [self.navigationItem setBackBarButtonItem:backButtonItem];
    }
    NSDictionary *Dic = [dic objectForKey:@"nav"];
    color = [dic objectForKey:@"textColor"];
    bgColor = [dic objectForKey:@"navBgcolor"];
    NSDictionary *leftDic = [Dic objectForKey:@"leftItem"];
    NSDictionary *rightDic = [Dic objectForKey:@"rightItem"];
    NSDictionary *middleDic = [Dic objectForKey:@"middleItem"];
    //todo 待修改
    if (color && color.length) {
        self.navigationController.navigationBar.titleTextAttributes = [NSDictionary dictionaryWithObject:[UIColor colorWithHexString:color] forKey:NSForegroundColorAttributeName];
        self.navigationController.navigationBar.tintColor = [UIColor colorWithHexString:color];
    }
    if (bgColor && bgColor.length) {
        self.navigationController.navigationBar.barTintColor = [UIColor colorWithHexString:bgColor];
    } else {
        NSString *statusBarBackgroundColor = [[NSUserDefaults standardUserDefaults] objectForKey:@"StatusBarBackgroundColor"];
        self.navigationController.navigationBar.barTintColor = [UIColor colorWithHexString:statusBarBackgroundColor];
    }
    if (leftDic) {
        if (![[leftDic objectForKey:@"buttonPicture"] length] && ![[leftDic objectForKey:@"text"] length]){
            UIBarButtonItem *backButtonItem = [[UIBarButtonItem alloc] initWithTitle:@"" style:UIBarButtonItemStylePlain target:nil action:nil];
            [self.navigationItem setBackBarButtonItem:backButtonItem];
        } else {
            if (self.navigationController.childViewControllers.count < 2) {
                self.navigationItem.leftBarButtonItem = [UIBarButtonItem leftItemWithDic:leftDic Color:color Target:self action:@selector(leftItemClickWithDic:)];
            }
            if ([[leftDic objectForKey:@"type"] isEqualToString:@"msg"]) {
                self.leftMessage = YES;
                if (self.leftMessage) {
                    NSInteger num = [[NSUserDefaults standardUserDefaults] integerForKey:@"clinetMessageNum"];
                    [self.navigationItem.leftBarButtonItem pp_addBadgeWithNumber:num];
                    // 调整badge大小
                    //    [self.navigationItem.leftBarButtonItem pp_setBadgeHeightPoints:25];
                    // 调整badge的位置
                    [self.navigationItem.leftBarButtonItem pp_moveBadgeWithX:0 Y:4];
                    // 自定义badge的属性: 字体大小/颜色, 背景颜色...(默认系统字体13,白色,背景色为系统badge红色)
                    [self.navigationItem.leftBarButtonItem pp_setBadgeLabelAttributes:^(PPBadgeLabel *badgeLabel) {
                        badgeLabel.backgroundColor = [UIColor redColor];
                        //        badgeLabel.font =  [UIFont systemFontOfSize:13];
                        //        badgeLabel.textColor = [UIColor blueColor];
                    }];
                }
            }
            if ([[leftDic objectForKey:@"type"] isEqualToString:@"shopCart"]) {
                self.leftShop = YES;
                if (self.leftShop) {
                    NSInteger num = [[NSUserDefaults standardUserDefaults] integerForKey:@"shoppingCartNum"];
                    [self.navigationItem.leftBarButtonItem pp_addBadgeWithNumber:num];
                    // 调整badge大小
                    //    [self.navigationItem.leftBarButtonItem pp_setBadgeHeightPoints:25];
                    // 调整badge的位置
                    [self.navigationItem.leftBarButtonItem pp_moveBadgeWithX:0 Y:4];
                    // 自定义badge的属性: 字体大小/颜色, 背景颜色...(默认系统字体13,白色,背景色为系统badge红色)
                    [self.navigationItem.leftBarButtonItem pp_setBadgeLabelAttributes:^(PPBadgeLabel *badgeLabel) {
                        badgeLabel.backgroundColor = [UIColor redColor];
                        //        badgeLabel.font =  [UIFont systemFontOfSize:13];
                        //        badgeLabel.textColor = [UIColor blueColor];
                    }];
                }
            }
            
            
        }
    } else {
        UIBarButtonItem *backButtonItem = [[UIBarButtonItem alloc] initWithTitle:@"" style:UIBarButtonItemStylePlain target:nil action:nil];
        [self.navigationItem setBackBarButtonItem:backButtonItem];
    }
    if (rightDic) {
        self.navigationItem.rightBarButtonItem = [UIBarButtonItem rightItemWithDic:rightDic Color:color Target:self action:@selector(rightItemClickWithDic)];
        if ([[rightDic objectForKey:@"type"] isEqualToString:@"msg"]) {
            self.rightMessage = YES;
            if (self.rightMessage) {
                NSInteger num = [[NSUserDefaults standardUserDefaults] integerForKey:@"clinetMessageNum"];
                [self.navigationItem.rightBarButtonItem pp_addBadgeWithNumber:num];
                // 调整badge大小
                //    [self.navigationItem.leftBarButtonItem pp_setBadgeHeightPoints:25];
                // 调整badge的位置
                [self.navigationItem.rightBarButtonItem pp_moveBadgeWithX: 0 Y:8];
                // 自定义badge的属性: 字体大小/颜色, 背景颜色...(默认系统字体13,白色,背景色为系统badge红色)
                [self.navigationItem.rightBarButtonItem pp_setBadgeLabelAttributes:^(PPBadgeLabel *badgeLabel) {
                    badgeLabel.backgroundColor = [UIColor redColor];
                    //        badgeLabel.font =  [UIFont systemFontOfSize:13];
                    //        badgeLabel.textColor = [UIColor blueColor];
                }];
            }
        }
        if ([[rightDic objectForKey:@"type"] isEqualToString:@"shopCart"]) {
            self.rightShop = YES;
            if (self.rightShop) {
                NSInteger num = [[NSUserDefaults standardUserDefaults] integerForKey:@"shoppingCartNum"];
                [self.navigationItem.rightBarButtonItem pp_addBadgeWithNumber:num];
                // 调整badge大小
                //    [self.navigationItem.leftBarButtonItem pp_setBadgeHeightPoints:25];
                // 调整badge的位置
                [self.navigationItem.rightBarButtonItem pp_moveBadgeWithX: 0 Y:8];
                // 自定义badge的属性: 字体大小/颜色, 背景颜色...(默认系统字体13,白色,背景色为系统badge红色)
                [self.navigationItem.rightBarButtonItem pp_setBadgeLabelAttributes:^(PPBadgeLabel *badgeLabel) {
                    badgeLabel.backgroundColor = [UIColor redColor];
                    //        badgeLabel.font =  [UIFont systemFontOfSize:13];
                    //        badgeLabel.textColor = [UIColor blueColor];
                }];
            }
        }
        
    }
    if (middleDic) {
        if ([[middleDic objectForKey:@"type"] isEqualToString:@"title"]) {
            self.navigationItem.title = [dic objectForKey:@"title"];
        } else {
            DCNavSearchBarView *searchBarVc = [[DCNavSearchBarView alloc] init];
            searchBarVc.placeholdLabel.text = [middleDic objectForKey:@"title"];
            searchBarVc.frame = CGRectMake(60, 25, ScreenWidth - 120, 30);
            searchBarVc.voiceButtonClickBlock = ^{
                NSLog(@"搜索点击回调");
            };
            searchBarVc.searchViewBlock = ^{
                NSDictionary *settingDic = [NSKeyedUnarchiver unarchiveObjectWithFile:KNavSettingPath];
                NSString *urlstr = [middleDic objectForKey:@"url"];
                if (urlstr.length) {
                    urlstr = [urlstr containsString:@"http"] ? [middleDic objectForKey:@"url"]  : [NSString stringWithFormat:@"%@%@",JDomain,[middleDic objectForKey:@"url"]];
                }
                NSString *urlWithoutHttp = [[urlstr componentsSeparatedByString:@"://"] safeObjectAtIndex:1];
                NSArray *httpArray = [urlWithoutHttp componentsSeparatedByString:@"/"];
                NSString *adressPath = [httpArray safeObjectAtIndex:1];
                NSDictionary *setting = [NSDictionary dictionary];
                if ([adressPath isEqualToString:@"t"]) {
                    if ([httpArray safeObjectAtIndex:2] &&  [[httpArray safeObjectAtIndex:2] isEqualToString:@"index"]) {
                        setting = [settingDic objectForKey:@"index"];
                    } else {
                        NSString *pjStr = [NSString stringWithFormat:@"/t/%@",[httpArray safeObjectAtIndex:2]];
                        setting = [settingDic objectForKey:pjStr];
                    }
                } else {//需要判断是否拼接有参数
                    if ([adressPath containsString:@".html"]) {
                        NSRange range = [adressPath rangeOfString:@".html"];
                        adressPath = [adressPath substringToIndex:range.location];
                        if ([adressPath containsString:@"?"]) {
                            adressPath = [[adressPath componentsSeparatedByString:@"?"] objectAtIndex:0];
                        }
                        setting = [settingDic objectForKey:adressPath] ;
                    } else {
                        if ([adressPath containsString:@"?"]) {
                            adressPath = [[adressPath componentsSeparatedByString:@"?"] objectAtIndex:0];
                        }
                        setting = [settingDic objectForKey:adressPath] ;
                    }
                }
                if ([[setting objectForKey:@"showTop"] boolValue]) {
                    CFJClientH5Controller *appH5VC = [[CFJClientH5Controller alloc] initWithNibName:nil bundle:nil];
                    appH5VC.webViewDomain = urlstr;
                    appH5VC.navDic = setting;
                    appH5VC.hidesBottomBarWhenPushed = YES;
                    [self.navigationController pushViewController:appH5VC animated:YES];
                } else {
                    NSLog(@"暂不处理");
                }
            };
            self.navigationItem.titleView = searchBarVc;
        }
    }
}
//左侧按钮执行方法
- (void)leftItemClickWithDic:(UIButton *)sender{
    NSDictionary *Dic = [self.navDic objectForKey:@"nav"];
    NSDictionary *leftDic = [Dic objectForKey:@"leftItem"];
    NSDictionary *settingDic = [NSKeyedUnarchiver unarchiveObjectWithFile:KNavSettingPath];
    NSString *urlstr = [leftDic objectForKey:@"url"];
    if (urlstr.length) {
        urlstr = [urlstr containsString:@"https"] ? [leftDic objectForKey:@"url"]  : [NSString stringWithFormat:@"%@%@",JDomain,[leftDic objectForKey:@"url"]];
    } else if ([[leftDic objectForKey:@"type"] isEqualToString:@"msg"]) {
        urlstr = [NSString stringWithFormat:@"%@%@",JDomain,@"/p-noticemsg_category.html"];
    } else if ([[leftDic objectForKey:@"type"] isEqualToString:@"shopCart"]) {
        urlstr = [NSString stringWithFormat:@"%@%@",JDomain,@"/p-shop_cart.html"];
    } else if ([[leftDic objectForKey:@"type"] isEqualToString:@"share"]) {
        //执行js方法
        NSDictionary *dic = @{@"sharePic":[leftDic objectForKey:@"sharePic"],@"shareText":[leftDic objectForKey:@"shareText"]};
        NSDictionary *callJsDic = [[HybridManager shareInstance] objcCallJsWithFn:@"headShare" data:dic];
        [self objcCallJs:callJsDic];
        return;
    } else if ([[leftDic objectForKey:@"type"] isEqualToString:@"jsApi"]) {
        //执行js方法
        NSDictionary *callJsDic = [[HybridManager shareInstance] objcCallJsWithFn:[leftDic objectForKey:@"jsApi"] data:nil];
        [self objcCallJs:callJsDic];
        return;
    } else if ([[leftDic objectForKey:@"type"] isEqualToString:@"backToHome"]) {
        [self.navigationController popToRootViewControllerAnimated:YES];
        NSString *number = [leftDic objectForKey:@"selectNumber"];
        NSDictionary *setDic = @{
            @"selectNumber": number
        };
        dispatch_time_t when = dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.1 * NSEC_PER_SEC));
        dispatch_after(when, dispatch_get_main_queue(), ^{
            [[NSNotificationCenter defaultCenter] postNotificationName:@"backToHome" object:setDic];
        });
        return;
    } else if ([[leftDic objectForKey:@"type"] isEqualToString:@"popAlert"]) {
        [YBPopupMenu showRelyOnView:sender titles:TITLES icons:ICONS menuWidth:120 delegate:self];
        return;
    }
    //判断页面是否隐藏头部
    NSString *adressPath = [[urlstr componentsSeparatedByString:[NSString stringWithFormat:@"://%@",MainDomain]] safeObjectAtIndex:1];
    NSDictionary *setting = [NSDictionary dictionary];
    if ([adressPath containsString:@".html"]) {
        NSRange range = [adressPath rangeOfString:@".html"];
        adressPath = [adressPath substringToIndex:range.location];
        if ([adressPath containsString:@"?"]) {
            adressPath = [[adressPath componentsSeparatedByString:@"?"] objectAtIndex:0];
        }
        setting = [settingDic objectForKey:adressPath] ;
    } else {
        if ([adressPath containsString:@"?"]) {
            adressPath = [[adressPath componentsSeparatedByString:@"?"] objectAtIndex:0];
        }
        setting = [settingDic objectForKey:adressPath] ;
    }
    if ([[leftDic objectForKey:@"type"] isEqualToString:@"return"]) {
        if (self.presentingViewController) {
            [self dismissViewControllerAnimated:YES completion:nil];
        } else {
            [self.navigationController popViewControllerAnimated:YES];
        }
    } else if ([[setting objectForKey:@"showTop"] boolValue]) {
        CFJClientH5Controller *appH5VC = [[CFJClientH5Controller alloc] initWithNibName:nil bundle:nil];
        appH5VC.webViewDomain = urlstr;
        appH5VC.navDic = setting;
        appH5VC.hidesBottomBarWhenPushed = YES;
        [self.navigationController pushViewController:appH5VC animated:YES];
    } else {
        NSLog(@"暂不处理");
    }
}

//右侧按钮执行方法
- (void)rightItemClickWithDic{
    NSDictionary *Dic = [self.navDic objectForKey:@"nav"];
    NSDictionary *rightDic = [Dic objectForKey:@"rightItem"];
    NSDictionary *settingDic = [NSKeyedUnarchiver unarchiveObjectWithFile:KNavSettingPath];
    NSString *urlstr = [rightDic objectForKey:@"url"];
    if (urlstr.length) {
        urlstr = [urlstr containsString:@"http"] ? [rightDic objectForKey:@"url"]  : [NSString stringWithFormat:@"%@%@",JDomain,[rightDic objectForKey:@"url"]];
    } else if ([[rightDic objectForKey:@"type"] isEqualToString:@"msg"]) {
        urlstr = [NSString stringWithFormat:@"%@%@",JDomain,@"/p-noticemsg_category.html"];
    } else if ([[rightDic objectForKey:@"type"] isEqualToString:@"shopCart"]) {
        urlstr = [NSString stringWithFormat:@"%@%@",JDomain,@"/p-shop_cart.html"];
    } else if ([[rightDic objectForKey:@"type"] isEqualToString:@"share"]) {
        //执行js方法
        NSDictionary *dic = @{@"sharePic":[rightDic objectForKey:@"sharePic"],@"shareText":[rightDic objectForKey:@"shareText"]};
        NSDictionary *callJsDic = [[HybridManager shareInstance] objcCallJsWithFn:@"headShare" data:dic];
        [self objcCallJs:callJsDic];
        return;
    } else if ([[rightDic objectForKey:@"type"] isEqualToString:@"jsApi"]) {
        //执行js方法
        NSDictionary *callJsDic = [[HybridManager shareInstance] objcCallJsWithFn:[rightDic objectForKey:@"jsApi"] data:nil];
        [self objcCallJs:callJsDic];
        return;
    } else if ([[rightDic objectForKey:@"type"] isEqualToString:@"backToHome"]) {
        [self.navigationController popToRootViewControllerAnimated:YES];
        NSString *number = [rightDic objectForKey:@"selectNumber"];
        NSDictionary *setDic = @{
            @"selectNumber": number
        };
        dispatch_time_t when = dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.1 * NSEC_PER_SEC));
        dispatch_after(when, dispatch_get_main_queue(), ^{
            [[NSNotificationCenter defaultCenter] postNotificationName:@"backToHome" object:setDic];
        });
        return;
    }
    //判断页面是否隐藏头部
    NSString *adressPath = [[urlstr componentsSeparatedByString:[NSString stringWithFormat:@"://%@",MainDomain]] safeObjectAtIndex:1];
    NSDictionary *setting = [NSDictionary dictionary];
    if ([adressPath containsString:@".html"]) {
        NSRange range = [adressPath rangeOfString:@".html"];
        adressPath = [adressPath substringToIndex:range.location];
        if ([adressPath containsString:@"?"]) {
            adressPath = [[adressPath componentsSeparatedByString:@"?"] objectAtIndex:0];
        }
        setting = [settingDic objectForKey:adressPath] ;
    } else {
        if ([adressPath containsString:@"?"]) {
            adressPath = [[adressPath componentsSeparatedByString:@"?"] objectAtIndex:0];
        }
        setting = [settingDic objectForKey:adressPath] ;
    }
    if ([[setting objectForKey:@"showTop"] boolValue]) {
        CFJClientH5Controller *appH5VC = [[CFJClientH5Controller alloc] initWithNibName:nil bundle:nil];
        appH5VC.webViewDomain = urlstr;
        appH5VC.navDic = setting;
        appH5VC.hidesBottomBarWhenPushed = YES;
        [self.navigationController pushViewController:appH5VC animated:YES];
    } else {
        NSLog(@"暂不处理");
    }
}

//页面出现
- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    
    // 确保系统的返回手势是启用的
    if (self.navigationController && self.navigationController.viewControllers.count > 1) {
        self.navigationController.interactivePopGestureRecognizer.enabled = YES;
    }
    
    if (!(self.pushType == isPushNormal)) {
        dispatch_async(dispatch_get_main_queue(), ^{
            //设置边角
            UIBezierPath *maskPath = [UIBezierPath bezierPathWithRoundedRect:self.webView.bounds byRoundingCorners:UIRectCornerTopLeft | UIRectCornerTopRight  cornerRadii:CGSizeMake(10, 10)];
            CAShapeLayer *maskLayer = [[CAShapeLayer alloc] init];
            maskLayer.frame = self.webView.bounds;
            maskLayer.path = maskPath.CGPath;
            self.webView.layer.mask = maskLayer;
        });
    }

#pragma mark ----- 隐藏某些页面
    if ([self isHaveNativeHeader:self.pinUrl]) {
        [self.navigationController setNavigationBarHidden:YES animated:NO];
    } else {
        [self.navigationController setNavigationBarHidden:NO animated:NO];
    }
    //隐藏导航条黑线
    if (self.navigationController && self.navigationController.navigationBar && 
        self.navigationController.navigationBar.subviews.count > 0 && 
        [self.navigationController.navigationBar.subviews[0] subviews].count > 0) {
        self.navigationController.navigationBar.subviews[0].subviews[0].hidden = YES;
    }
    
    NSInteger num = [[NSUserDefaults standardUserDefaults] integerForKey:@"clinetMessageNum"];
    NSInteger shop = [[NSUserDefaults standardUserDefaults] integerForKey:@"shoppingCartNum"];
    if (self.rightMessage) {
        [self.navigationItem.rightBarButtonItem pp_addBadgeWithNumber:num];
    }
    if (self.leftMessage) {
        [self.navigationItem.leftBarButtonItem pp_addBadgeWithNumber:num];
    }
    if (self.rightShop) {
        [self.navigationItem.rightBarButtonItem pp_addBadgeWithNumber:shop];
    }
    if (self.leftShop) {
        [self.navigationItem.leftBarButtonItem pp_addBadgeWithNumber:shop];
    }
    NSString *statusBarBackgroundColor = [[NSUserDefaults standardUserDefaults] objectForKey:@"StatusBarBackgroundColor"];
    if (bgColor && bgColor.length) {
        self.navigationController.navigationBar.barTintColor = [UIColor colorWithHexString:bgColor];
    } else {
        self.navigationController.navigationBar.barTintColor = [UIColor colorWithHexString:statusBarBackgroundColor];
    }
    if (color && color.length) {
        self.navigationController.navigationBar.tintColor = [UIColor colorWithHexString:color];
        self.navigationController.navigationBar.titleTextAttributes = [NSDictionary dictionaryWithObject:[UIColor colorWithHexString:color] forKey:NSForegroundColorAttributeName];
    } else {
        if ([statusBarBackgroundColor isEqualToString:@"#000000"] || [statusBarBackgroundColor isEqualToString:@"black"]) {
            self.navigationController.navigationBar.tintColor = [UIColor whiteColor];
            self.navigationController.navigationBar.titleTextAttributes = [NSDictionary dictionaryWithObject:[UIColor whiteColor] forKey:NSForegroundColorAttributeName];
        } else {
            //TODO  设置返回按钮颜色
            self.navigationController.navigationBar.tintColor = [UIColor blackColor];
            self.navigationController.navigationBar.titleTextAttributes = [NSDictionary dictionaryWithObject:[UIColor blackColor] forKey:NSForegroundColorAttributeName];
        }
    }
    //若果没有tabbar,做如下处理
    NSArray*arrController =self.navigationController.viewControllers;
    NSInteger VcCount = arrController.count;
    if ([[NSUserDefaults standardUserDefaults] boolForKey:@"NoTabBar"]) {
        if (VcCount < 2) {
            self.tabBarController.tabBar.hidden = YES;
        }
    } else {
        if (VcCount < 2) {
            self.tabBarController.tabBar.hidden = NO;
        }
    }
}

- (void)scrollViewDidScroll:(UIScrollView *)scrollView{
    int currentPostion = scrollView.contentOffset.y;
    if (currentPostion - self.lastPosition > 25) {
        self.lastPosition = currentPostion;
        if (self.isTabbarShow) {
            [[NSNotificationCenter defaultCenter] postNotificationName:@"HideTabBarNotif" object:nil];
        }
    }
    else if (self.lastPosition - currentPostion > 25)
    {
        self.lastPosition = currentPostion;
        if (self.isTabbarShow) {
            [[NSNotificationCenter defaultCenter] postNotificationName:@"ShowTabBarNotif" object:nil];
        }
    }
}

- (void)handleJavaScriptCall:(NSDictionary *)data completion:(XZWebViewJSCallbackBlock)completion {
    NSDictionary *jsDic = data;
    NSString *function = [jsDic objectForKey:@"action"];
    NSDictionary *dataDic = [jsDic objectForKey:@"data"];
    
    NSLog(@"🎯 [handleJavaScriptCall] 被调用，function: %@, dataDic: %@", function, dataDic);
    
    // 优先处理网络请求
    if ([function isEqualToString:@"request"]) {
        [self rpcRequestWithJsDic:dataDic completion:completion];
        return;
    }
    
    // 兼容原有的webviewBackCallBack
    self.webviewBackCallBack = ^(id responseData) {
        if (completion) {
            completion(responseData);
        }
    };
#pragma mark  -----------  2.0方法开始
    if ([function isEqualToString:@"nativeGet"]) {
        NSString *myData = jsDic[@"data"];
        self.webviewBackCallBack = completion;
        NSString *filepath=[[BaseFileManager appH5LocailManifesPath] stringByAppendingPathComponent:myData];
        NSString *myStr = [NSString stringWithContentsOfURL:[NSURL fileURLWithPath:filepath] encoding:NSUTF8StringEncoding error:nil];
        
        // 确保myStr不为nil，避免[object object]问题
        if (!myStr) {
            myStr = @"";
        }
        
        if (self.webviewBackCallBack) {
            // 使用新的格式化方法，返回JavaScript端期望的格式
            NSDictionary *response = [self formatCallbackResponse:@"nativeGet" 
                                                           data:myStr 
                                                        success:YES 
                                                   errorMessage:nil];
            self.webviewBackCallBack(response);
        }
        return;
    }
    
    //判断是否安装了微信客户端
    if ([function isEqualToString:@"hasWx"]) {
        self.webviewBackCallBack = completion;
        BOOL ische = [XZPackageH5 sharedInstance].isWXAppInstalled;
        if (self.webviewBackCallBack) {
            // 使用新的格式化方法，返回JavaScript端期望的格式
            NSDictionary *response = [self formatCallbackResponse:@"hasWx" 
                                                           data:@{@"status": ische ? @(1) : @(0)} 
                                                        success:YES 
                                                   errorMessage:nil];
            self.webviewBackCallBack(response);
        }
        return;
    }
    //判断是否是流海屏
    if ([function isEqualToString:@"isiPhoneX"]) {
        self.webviewBackCallBack = completion;
        if (self.webviewBackCallBack) {
            // 使用新的格式化方法，返回JavaScript端期望的格式
            NSDictionary *response = [self formatCallbackResponse:@"isiPhoneX" 
                                                           data:@{@"status": isIPhoneXSeries() ? @(1) : @(0)} 
                                                        success:YES 
                                                   errorMessage:nil];
            self.webviewBackCallBack(response);
        }
        return;
    }
    if ([function isEqualToString:@"readMessage"]) {
        NSInteger number =[[jsDic objectForKey:@"data"] integerValue];;
        NSInteger num = [[NSUserDefaults standardUserDefaults] integerForKey:@"clinetMessageNum"];
        NSInteger newNum = num - number;
        if (newNum > 0) {
            [[NSUserDefaults standardUserDefaults] setInteger:newNum forKey:@"clinetMessageNum"];
            [[NSUserDefaults standardUserDefaults]synchronize];
            WEAK_SELF;
            dispatch_async(dispatch_get_main_queue(), ^{
                STRONG_SELF;
                [self.tabBarController.tabBar showBadgeOnItemIndex:3 withNum:newNum];
            });
        }
        else {
            [[NSUserDefaults standardUserDefaults] setInteger:0 forKey:@"clinetMessageNum"];
            [[NSUserDefaults standardUserDefaults]synchronize];
            //隐藏底部角标
            WEAK_SELF;
            dispatch_async(dispatch_get_main_queue(), ^{
                STRONG_SELF;
                [self.tabBarController.tabBar hideBadgeOnItemIndex:3];
            });
        }
        return;
    }
    //设置底部角标
    if ([function isEqualToString:@"setTabBarBadge"]) {
        dispatch_async(dispatch_get_main_queue(), ^{
            [self.tabBarController.tabBar showBadgeOnItemIndex:3 withNum:1];
        });
        return;
    }
    //隐藏底部角标
    if ([function isEqualToString:@"removeTabBarBadge"]) {
        dispatch_async(dispatch_get_main_queue(), ^{
            [self.tabBarController.tabBar hideBadgeOnItemIndex:3];
        });
        return;
    }
    
    //设置底部红点
    if ([function isEqualToString:@"showTabBarRedDot"]) {
        dispatch_async(dispatch_get_main_queue(), ^{
            [self.tabBarController.tabBar showRedDotOnItemIndex:1];
        });
        return;
    }
    //移除底部红点
    if ([function isEqualToString:@"hideTabBarRedDot"]) {
        dispatch_async(dispatch_get_main_queue(), ^{
            [self.tabBarController.tabBar hideRedDotOnItemIndex:1];
        });
        return;
    }
    
    //跳转
       if ([function isEqualToString:@"navigateTo"]) {
           dispatch_async(dispatch_get_main_queue(), ^{
               NSString * Url = (NSString *)dataDic;
               NSLog(@"原始URL: %@", Url);
               if (![Url containsString:@"https://"]) {
                   Url = [NSString stringWithFormat:@"%@%@", JDomain, Url];
                   NSLog(@"拼接后的URL: %@", Url);
               }
               
               // 检查是否为配置域名的内部链接
               NSString *configuredDomain = [[NSUserDefaults standardUserDefaults] objectForKey:@"kUserDefaults_domainStr"];
               BOOL isInternalLink = NO;
               if (configuredDomain && configuredDomain.length > 0) {
                   isInternalLink = [Url containsString:configuredDomain];
               } else {
                   // 如果没有配置域名，默认使用hi3.tuiya.cc作为内部域名
                   configuredDomain = @"hi3.tuiya.cc";
                   isInternalLink = [Url containsString:configuredDomain];
               }
               NSLog(@"配置域名: %@, 是否内部链接: %d", configuredDomain, isInternalLink);
               
               if (!isInternalLink) {
                   // 外部链接，直接用HTMLWebViewController加载
                   NSLog(@"外部链接，直接加载: %@", Url);
                   HTMLWebViewController *htmlWebVC = [[HTMLWebViewController alloc] init];
                   htmlWebVC.webViewDomain = Url;
                   htmlWebVC.hidesBottomBarWhenPushed = YES;
                   [self.navigationController pushViewController:htmlWebVC animated:YES];
                   return;
               }
               
               // 内部链接，使用CustomHybridProcessor处理
//               [[HybridManager shareInstance] LocialPathByUrlStr:Url templateDic:self.templateDic templateStr:self.templateStr componentJsAndCs:self.ComponentJsAndCs componentDic:self.ComponentDic success:^(NSString * _Nonnull filePath, NSString * _Nonnull templateStr, NSString * _Nonnull title, BOOL isFileExsit) {
                   [CustomHybridProcessor custom_LocialPathByUrlStr:Url
                                                        templateDic:self.templateDic
                                                   componentJsAndCs:self.ComponentJsAndCs
                                                       componentDic:self.ComponentDic
                                                            success:^(NSString * _Nonnull filePath, NSString * _Nonnull templateStr, NSString * _Nonnull title, BOOL isFileExsit) {
                   NSLog(@"处理结果 - 文件路径: %@, 标题: %@, 是否存在: %d", filePath, title, isFileExsit);
                   if (isFileExsit) {
                       CFJClientH5Controller *appH5VC = [[CFJClientH5Controller alloc] initWithNibName:nil bundle:nil];
                       appH5VC.hidesBottomBarWhenPushed = YES;
                       [self.navigationController pushViewController:appH5VC animated:YES];
                       appH5VC.pinUrl = filePath;
                       appH5VC.replaceUrl = Url;
                       appH5VC.pinDataStr = templateStr;
                       appH5VC.pagetitle = title;
                       WEAK_SELF;
                       appH5VC.nextPageDataBlock = ^(NSDictionary *dic) {
                           STRONG_SELF;
                           NSLog(@"nextPageData:%@",dic);
                           self.nextPageData = dic;
                           NSDictionary *callJsDic = [[HybridManager shareInstance] objcCallJsWithFn:@"dialogBridge" data:dic];
                           [self objcCallJs:callJsDic];
                       };
                   } else {
                       if ([filePath containsString:@"http"]) {
                           HTMLWebViewController *htmlWebVC = [[HTMLWebViewController alloc] init];
                           htmlWebVC.webViewDomain = Url;
                           htmlWebVC.hidesBottomBarWhenPushed = YES;
                           [self.navigationController pushViewController:htmlWebVC animated:YES];
                       }
                       else {
                           [JHSysAlertUtil presentAlertViewWithTitle:@"温馨提示" message:@"正在开发中" confirmTitle:@"确定" handler:nil];
                       }
                   }
               }];
           });
           return;
       }
    //给上个页面传值操作,data是{delta:1}，返回几层 ,如果没传data，就是返回1层
    if ([function isEqualToString:@"navigateBack"]) {
        if ([[jsDic objectForKey:@"data"] isKindOfClass:[NSString class]]) {
            dispatch_async(dispatch_get_main_queue(), ^{
                [self.navigationController popViewControllerAnimated:NO];
            });
        }
        else {
            dispatch_async(dispatch_get_main_queue(), ^{
                if ([[dataDic objectForKey:@"delta"] integerValue]) {
                    NSInteger index = [[dataDic objectForKey:@"delta"] integerValue];
                    NSInteger count = self.navigationController.viewControllers.count;
                    if (index < 0) {
                        if ([self.navigationController.viewControllers[-index] isKindOfClass:[CFJClientH5Controller class]]) {
                            [self.navigationController popToViewController:self.navigationController.viewControllers[-index] animated:YES];
                        }
                    }
                    else {
                        if ([self.navigationController.viewControllers[count - index - 1] isKindOfClass:[CFJClientH5Controller class]]) {
                            [self.navigationController popToViewController:self.navigationController.viewControllers[count - index - 1] animated:NO];
                        }
                    }
                    
                }
            });
        }
        return;
    }
    //返回首页(目前处理返回顶层控制器)
    if ([function isEqualToString:@"reLaunch"]) {
        NSLog(@"🎯 [reLaunch] 被调用，数据: %@", dataDic);
        dispatch_async(dispatch_get_main_queue(), ^{
            // 在TabBar应用中，应该切换到第一个Tab（首页）
            if (self.tabBarController) {
                NSLog(@"🎯 [reLaunch] 切换到TabBar第0个Tab（首页）");
                self.tabBarController.selectedIndex = 0; // 切换到首页
            } else {
                NSLog(@"🎯 [reLaunch] 使用popToRootViewController");
                // 如果不是TabBar应用，则使用原来的逻辑
                [self.navigationController popToRootViewControllerAnimated:YES];
            }
        });
        
        // 返回成功响应
        if (completion) {
            completion(@{
                @"success": @"true",
                @"data": @{},
                @"errorMessage": @"",
                @"code": @0
            });
        }
        return;
    }
    //刷新当前页以外页面
    if ([function isEqualToString:@"reloadOtherPages"]) {
        NSLog(@"🔄 [handleJavaScriptCall] 被调用，function: reloadOtherPages, dataDic:");
        
        // 智能检测登录状态变化
        [self detectAndHandleLoginStateChange:completion];
        
        [[NSNotificationCenter defaultCenter]postNotificationName:@"RefreshOtherAllVCNotif" object:self];
        
        // WKWebView升级后需要给JS端明确的回调响应
        if (completion) {
            completion(@{
                @"success": @"true",
                @"data": @{},
                @"errorMessage": @"",
                @"code": @0
            });
        }
        return;
    }
    if ([function isEqualToString:@"dialogBridge"]) {
        //将数据传给上个页面
        self.nextPageDataBlock(dataDic);
        return;
    }
    //显示模态弹窗
    if ([function isEqualToString:@"showModal"]) {
        NSString *title = [[dataDic objectForKey:@"title"] length] ?  [dataDic objectForKey:@"title"] : @"";
        NSString *cancleText = [[dataDic objectForKey:@"cancelText"] length] ?  [dataDic objectForKey:@"cancelText"] : @"取消";
        NSString *confirmText = [[dataDic objectForKey:@"confirmText"] length] ?  [dataDic objectForKey:@"confirmText"] : @"确认";
        ShowAlertView  *alert = [ShowAlertView showAlertWithTitle:title message:[dataDic objectForKey:@"content"]];
        
        // 创建独立的回调处理，避免被后续调用覆盖
        XZWebViewJSCallbackBlock modalCallback = completion;
        
        WEAK_SELF;
        [alert addItemWithTitle:cancleText itemType:(ShowAlertItemTypeBlack) callback:^(ShowAlertView *showview) {
            STRONG_SELF;
            NSLog(@"🔄 [showModal] 用户点击取消按钮");
            if (modalCallback) {
                // 使用新的格式化方法，返回JavaScript端期望的格式
                NSDictionary *response = [self formatCallbackResponse:@"showModal" 
                                                               data:@{@"cancel": @"true"} 
                                                            success:YES 
                                                       errorMessage:nil];
                modalCallback(response);
            }
        }];
        [alert addItemWithTitle:confirmText itemType:(ShowStatusTextTypeCustom) callback:^(ShowAlertView *showview) {
            STRONG_SELF;
            NSLog(@"🔄 [showModal] 用户点击确认按钮");
            if (modalCallback) {
                // 使用新的格式化方法，返回JavaScript端期望的格式
                NSDictionary *response = [self formatCallbackResponse:@"showModal" 
                                                               data:@{@"confirm": @"true"} 
                                                            success:YES 
                                                       errorMessage:nil];
                modalCallback(response);
            }
        }];
        [alert show];
        return;
    }
    
    //显示Toast提示
    if ([function isEqualToString:@"showToast"]) {
        dispatch_async(dispatch_get_main_queue(), ^{
            NSString *title = [dataDic objectForKey:@"title"] ?: @"";
            NSString *icon = [dataDic objectForKey:@"icon"] ?: @"none";
            NSTimeInterval duration = [[dataDic objectForKey:@"duration"] doubleValue] / 1000.0 ?: 1.0; // 转换为秒
            
            if (title.length > 0) {
                // 使用SVStatusHUD显示Toast提示
                if ([icon isEqualToString:@"success"]) {
                    // 显示成功图标（可以使用系统的勾号图标）
                    UIImage *successImage = [UIImage imageNamed:@"success_icon"] ?: [UIImage systemImageNamed:@"checkmark.circle.fill"];
                    [SVStatusHUD showWithImage:successImage status:title duration:duration];
                } else if ([icon isEqualToString:@"loading"]) {
                    // 显示加载信息
                    [SVStatusHUD showWithMessage:title];
                } else {
                    // 显示普通信息
                    [SVStatusHUD showWithMessage:title];
                    
                    // 设置自动消失时间
                    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(duration * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                        // SVStatusHUD可能没有dismiss方法，让视图自然消失
                    });
                }
            }
        });
        
        // 返回成功响应
        if (completion) {
            completion(@{
                @"success": @"true",
                @"data": @{},
                @"errorMessage": @"",
                @"code": @0
            });
        }
        return;
    }
    if ([function isEqualToString:@"showActionSheet"]) {
        self.webviewBackCallBack = completion;
        ShowAlertView  *alert = [ShowAlertView showActionSheet];
        NSArray *items = [dataDic objectForKey:@"itemList"];
        for (NSInteger i = 0; i <items.count; i++) {
            WEAK_SELF;
            [alert addItemWithTitle:items[i] itemType:(ShowAlertItemTypeBlack) callback:^(ShowAlertView *showview) {
                STRONG_SELF;
                if (self.webviewBackCallBack) {
                    // 使用新的格式化方法，返回JavaScript端期望的格式
                    NSDictionary *response = [self formatCallbackResponse:@"showActionSheet" 
                                                                   data:@{@"tapIndex": @(i)} 
                                                                success:YES 
                                                           errorMessage:nil];
                    self.webviewBackCallBack(response);
                }
            }];
        }
        [alert addItemWithTitle:@"取消" itemType:(ShowStatusTextTypeCustom) callback:nil];
        [alert show];
        return;
    }
    //消息,角标数变更操作
    if ([function isEqualToString:@"changeMessageNum"]) {
        NSInteger number = [[dataDic objectForKey:@"number"] integerValue];
        NSInteger num = [[NSUserDefaults standardUserDefaults] integerForKey:@"clinetMessageNum"];
        NSInteger newNum = num - number;
        if (newNum > 0) {
            [[NSUserDefaults standardUserDefaults] setInteger:newNum forKey:@"clinetMessageNum"];
            [[NSUserDefaults standardUserDefaults]synchronize];
            WEAK_SELF;
            dispatch_async(dispatch_get_main_queue(), ^{
                STRONG_SELF;
                [self.tabBarController.tabBar showBadgeOnItemIndex:3 withNum:newNum];
            });
        }
        else {
            [[NSUserDefaults standardUserDefaults] setInteger:0 forKey:@"clinetMessageNum"];
            [[NSUserDefaults standardUserDefaults]synchronize];
            //隐藏底部角标
            WEAK_SELF;
            dispatch_async(dispatch_get_main_queue(), ^{
                STRONG_SELF;
                [self.tabBarController.tabBar hideBadgeOnItemIndex:3];
            });
        }
        return;
    }
    if ([function isEqualToString:@"copyLink"]) {
        self.webviewBackCallBack = completion;
        UIPasteboard *pasteboard = [UIPasteboard generalPasteboard];
        pasteboard.string = [NSString stringWithFormat:@"%@",[dataDic objectForKey:@"url"]];
        if (self.webviewBackCallBack) {
            self.webviewBackCallBack(@{@"data":@"",
                                       @"success":@"true",
                                       @"errorMassage":@""
            });
        }
        return;
    }
    
    //停止下拉刷新
    if ([function isEqualToString:@"stopPullDownRefresh"]) {
        dispatch_async(dispatch_get_main_queue(), ^{
            @try {
                if (self.webView && self.webView.scrollView) {
                    UIScrollView *scrollView = self.webView.scrollView;
                    
                    // 更安全的方式检查和使用MJRefresh
                    if ([scrollView respondsToSelector:@selector(mj_header)]) {
                        id mj_header = [scrollView valueForKey:@"mj_header"];
                        if (mj_header) {
                            // 使用KVC更安全
                            NSNumber *isRefreshing = [mj_header valueForKey:@"isRefreshing"];
                            if (isRefreshing && [isRefreshing boolValue]) {
                                [mj_header performSelector:@selector(endRefreshing) withObject:nil];
                                NSLog(@"🔄 [stopPullDownRefresh] 下拉刷新已停止");
                            }
                        }
                    }
                }
            } @catch (NSException *exception) {
                NSLog(@"❌ [stopPullDownRefresh] 处理下拉刷新时发生异常: %@", exception.reason);
            }
        });
        
        // 返回成功响应
        if (completion) {
            completion(@{
                @"success": @"true",
                @"data": @{},
                @"errorMessage": @"",
                @"code": @0
            });
        }
        return;
    }
    
    //第三方分享
    if ([function isEqualToString:@"share"]) {
        self.webviewBackCallBack = completion;
        [self shareContent:dataDic presentedVC:self];
    }
    //保存图片
    if ([function isEqualToString:@"saveImage"]) {
        self.webviewBackCallBack = completion;
        PHAuthorizationStatus author = [PHPhotoLibrary authorizationStatus];
        if (author == kCLAuthorizationStatusRestricted || author ==kCLAuthorizationStatusDenied){
            //无权限
            NSString *tips = [NSString stringWithFormat:@"请在设备的设置-隐私-照片选项中，允许应用访问你的照片"];
            [JHSysAlertUtil presentAlertViewWithTitle:@"温馨提示" message:tips confirmTitle:@"确定" handler:nil];
            return;
        }
        else {
            NSString *imageStr = dataDic[@"filePath"];
            [self saveImageToPhotos:[self getImageFromURL:imageStr]];
        }
    }
    
   
    //关闭模态弹窗
    if ([function isEqualToString:@"closePresentWindow"]) {
        [self dismissViewControllerAnimated:YES completion:nil];
        return;
    }
    
    //更换页面标题
    if ([function isEqualToString:@"setNavigationBarTitle"]) {
        self.navigationItem.title = [dataDic objectForKey:@"title"];
        return;
    }
    if ([function isEqualToString:@"weixinLogin"]) {
        self.webviewBackCallBack = completion;
        [self thirdLogin:@{@"type":@"weixin"}];
    }
    //微信支付
    if ([function isEqualToString:@"weixinPay"]) {
        self.webviewBackCallBack = completion;
        [self payRequest:jsDic withPayType:@"weixin"];
    }
    //支付宝支付
    if ([function isEqualToString:@"aliPay"]) {
        self.webviewBackCallBack = completion;
        [self payRequest:jsDic withPayType:@"alipay"];
    }
    //选择文件
    if ([function isEqualToString:@"chooseFile"]) {
        self.webviewBackCallBack = completion;
        [self pushTZImagePickerControllerWithDic:dataDic];
    }
    //上传文件
    if ([function isEqualToString:@"uploadFile"]) {
        [self QiNiuUploadImageWithData:dataDic];
    }
    //扫描二维码
    if ([function isEqualToString:@"QRScan"]) {
        CFJScanViewController *qrVC = [[CFJScanViewController alloc]init];
        qrVC.hidesBottomBarWhenPushed = YES;
        [self.navigationController pushViewController:qrVC animated:YES];
        return;
    }
#pragma mark ----CFJ修改浏览图片
    if ([function isEqualToString:@"previewImage"]) {
        self.viewImageAry = [dataDic objectForKey:@"urls"];
        NSInteger currentIndex = [self getIndexByUrl:[dataDic objectForKey:@"current"] : self.viewImageAry];
        [[LBPhotoBrowserManager defaultManager] showImageWithURLArray:self.viewImageAry fromImageViewFrames:nil selectedIndex:currentIndex imageViewSuperView:self.view];
        [[[LBPhotoBrowserManager.defaultManager addLongPressShowTitles:@[@"保存",@"取消"]] addTitleClickCallbackBlock:^(UIImage *image, NSIndexPath *indexPath, NSString *title, BOOL isGif, NSData *gifImageData) {
            LBPhotoBrowserLog(@"%@",title);
            if(![title isEqualToString:@"保存"]) return;
            if (!isGif) {
                [[LBAlbumManager shareManager] saveImage:image];
            }
            else {
                [[LBAlbumManager shareManager] saveGifImageWithData:gifImageData];
            }
        }]addPhotoBrowserWillDismissBlock:^{
            LBPhotoBrowserLog(@"即将销毁");
        }];
    }
    //登录
    if ([function isEqualToString:@"userLogin"]) {
        [self RequestWithJsDic:dataDic type:@"1"];
        [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"isLogin"];
        [[NSUserDefaults standardUserDefaults]synchronize];
        
        // 清除HTML缓存，确保页面能正确刷新
        [[HTMLCache sharedCache] removeAllCache];
        
        NSDictionary *imData = [dataDic objectForKey:@"imData"];
        GeDianUserInfo *userInfo = [[GeDianUserInfo alloc] init];
        userInfo.nickname = getSafeString([imData objectForKey:@"username"]);
        userInfo.userId = getSafeString([imData objectForKey:@"_id"]);
        userInfo.headpic = [NSString stringWithFormat:@"%@%@",QiNiuChace,getSafeString([imData objectForKey:@"headpic"])];
        
        // 登录成功后的处理
        dispatch_async(dispatch_get_main_queue(), ^{
            // 刷新所有页面
            [[NSNotificationCenter defaultCenter] postNotificationName:@"RefreshOtherAllVCNotif" object:self];
            
            // 跳转到首页并选中第一个tab
            if (self.tabBarController) {
                self.tabBarController.selectedIndex = 0; // 切换到首页tab
                NSLog(@"🎯 [userLogin] 切换到TabBar第0个Tab（首页）");
            }
            
            // 延迟一点再发送backToHome通知，确保tab切换完成
            dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.1 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                NSDictionary *setDic = @{@"selectNumber": @"0"};
                [[NSNotificationCenter defaultCenter] postNotificationName:@"backToHome" object:setDic];
                NSLog(@"🎯 [userLogin] 发送backToHome通知完成");
            });
        });
    }
    //退出登录
    if ([function isEqualToString:@"userLogout"]) {
        [self RequestWithJsDic:dataDic type:@"2"];
        [[NSUserDefaults standardUserDefaults] setBool:NO forKey:@"isLogin"];
        [[NSUserDefaults standardUserDefaults]synchronize];
        
        // 重置所有tab页面到初始状态，清除内页导航历史
        [self resetAllTabsToInitialState];
        
        // 清除HTML缓存和Cookie，确保页面能正确刷新
        [[HTMLCache sharedCache] removeAllCache];
        [UIWebView cookieDeleteAllCookie];
        
        // 清理WKWebView的导航历史，解决页面状态残留问题
        if (self.webView && [self.webView isKindOfClass:[WKWebView class]]) {
            WKWebView *wkWebView = (WKWebView *)self.webView;
            // 停止所有加载
            [wkWebView stopLoading];
            
            // 强制清理JavaScript全局状态和本地存储
            [wkWebView evaluateJavaScript:@"try { localStorage.clear(); sessionStorage.clear(); if(window.app && window.app.storage) { window.app.storage.clear(); } } catch(e) { console.log('清理存储时出错:', e); }" completionHandler:nil];
            
            // 延迟清理，避免与当前操作冲突
            dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.1 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                // 清理所有非持久化数据存储
                NSSet *websiteDataTypes = [NSSet setWithArray:@[
                    WKWebsiteDataTypeDiskCache,
                    WKWebsiteDataTypeMemoryCache,
                    WKWebsiteDataTypeLocalStorage,
                    WKWebsiteDataTypeSessionStorage
                ]];
                NSDate *dateFrom = [NSDate dateWithTimeIntervalSince1970:0];
                [[WKWebsiteDataStore defaultDataStore] removeDataOfTypes:websiteDataTypes 
                                                           modifiedSince:dateFrom 
                                                       completionHandler:^{
                    NSLog(@"✅ WKWebView数据清理完成");
                }];
            });
            
            NSLog(@"🧹 [userLogout] WKWebView状态清理开始");
        }
        
        //隐藏底部角标
        dispatch_async(dispatch_get_main_queue(), ^{
            [self.tabBarController.tabBar hideBadgeOnItemIndex:3];
        });
        [[NSUserDefaults standardUserDefaults] setInteger:0 forKey:@"clinetMessageNum"];
        [[NSUserDefaults standardUserDefaults] setInteger:0 forKey:@"shoppingCartNum"];
        [[NSUserDefaults standardUserDefaults] synchronize];
        
        // 退出登录后的处理
        dispatch_async(dispatch_get_main_queue(), ^{
            // 刷新所有页面
            [[NSNotificationCenter defaultCenter] postNotificationName:@"RefreshOtherAllVCNotif" object:self];
            
            // 跳转到首页并选中第一个tab
            if (self.tabBarController && [self.tabBarController isKindOfClass:[UITabBarController class]]) {
                self.tabBarController.selectedIndex = 0;
                NSLog(@"🎯 [reLaunch] 切换到TabBar第0个Tab（首页）");
                
                // 发送backToHome通知，传递正确的NSDictionary格式
                NSDictionary *setDic = @{@"selectNumber": @"0"};
                [[NSNotificationCenter defaultCenter] postNotificationName:@"backToHome" object:setDic];
            }
        });
        
        // 延迟一点再次强制刷新，确保状态完全重置
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
            [[NSNotificationCenter defaultCenter] postNotificationName:@"RefreshOtherAllVCNotif" object:self];
            NSLog(@"🔄 [userLogout] 延迟刷新执行完成");
        });
    }
    
    //返回首层页面
    if ([function isEqualToString:@"switchTab"]) {
        [self.navigationController popToRootViewControllerAnimated:YES];
        NSString *number  =[[XZPackageH5 sharedInstance] getNumberWithLink:(NSString *)dataDic];
        NSDictionary *setDic = @{
            @"selectNumber": number
        };
        dispatch_time_t when = dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.1 * NSEC_PER_SEC));
        dispatch_after(when, dispatch_get_main_queue(), ^{
            [[NSNotificationCenter defaultCenter] postNotificationName:@"backToHome" object:setDic];
        });
        return;
    }
    //获取当前定位城市
       if ([function isEqualToString:@"getLocation"]) {
           NSLog(@"getCurrentPosition");
           //        if ([self.pinUrl isEqualToString:@"https://test.mendianquan.com/p/mdq/index/index"]) {
           //            [self location];
           //        }
           self.webviewBackCallBack = completion;
           NSUserDefaults *Defaults = [NSUserDefaults standardUserDefaults];
           if (([[Defaults objectForKey:@"currentLat"] integerValue] != 0 || [[Defaults objectForKey:@"currentLng"] integerValue] != 0) && ![[Defaults objectForKey:@"currentCity"] isEqualToString:@"请选择"]) {
               NSDictionary *localDic = @{
                                          @"lat":[Defaults objectForKey:@"currentLat"],
                                          @"lng":[Defaults objectForKey:@"currentLng"],
                                          @"city":[Defaults objectForKey:@"currentCity"],
                                          @"address":[Defaults objectForKey:@"currentAddress"]
                                          };
               // 使用新的格式化方法，返回JavaScript端期望的格式
               NSDictionary *response = [self formatCallbackResponse:@"getLocation" 
                                                              data:localDic 
                                                           success:YES 
                                                      errorMessage:nil];
               self.webviewBackCallBack(response);
               return;
               
           }
           else {
               if ([self isLocationServiceOpen]) {
                   // 带逆地理信息的一次定位（返回坐标和地址信息）
                   self.locationManager = [[AMapLocationManager alloc] init];
                   // 带逆地理信息的一次定位（返回坐标和地址信息）
                   [_locationManager setDesiredAccuracy:kCLLocationAccuracyHundredMeters];
                   //   定位超时时间，最低2s，此处设置为2s
                   _locationManager.locationTimeout =2;
                   //   逆地理请求超时时间，最低2s，此处设置为2s
                   _locationManager.reGeocodeTimeout = 2;
                   [_locationManager requestLocationWithReGeocode:YES completionBlock:^(CLLocation *location, AMapLocationReGeocode *regeocode, NSError *error) {
                       if (error)
                       {
                           NSLog(@"locError:{%ld - %@};", (long)error.code, error.localizedDescription);
                           
                           if (error.code == AMapLocationErrorLocateFailed)
                           {
                               return;
                           }
                       }
                       NSLog(@"location:%@", location);
                       
                       if (regeocode)
                       {
                           NSLog(@"reGeocode:%@", regeocode);
                       }
                       CLLocationCoordinate2D coordinate = location.coordinate;
                       if (coordinate.latitude == 0 && coordinate.longitude == 0) {
                           [Defaults setObject:@(0) forKey:@"currentLat"];
                           [Defaults setObject:@(0) forKey:@"currentLng"];
                           [Defaults setObject:@"请选择" forKey:@"currentCity"];
                           [Defaults setObject:@"请选择" forKey:@"currentAddress"];
                       }
                       else {
                           [Defaults setObject:@(coordinate.latitude) forKey:@"currentLat"];
                           [Defaults setObject:@(coordinate.longitude) forKey:@"currentLng"];
                           
                           // 检查逆地理编码是否有效（海外或模拟器可能没有数据）
                           BOOL hasValidGeocode = regeocode && 
                               (regeocode.formattedAddress.length > 0 || 
                                regeocode.city.length > 0 || 
                                regeocode.district.length > 0 || 
                                regeocode.POIName.length > 0);
                           
                           NSString *cityName = @"请选择";
                           NSString *addressName = @"请选择";
                           
                           if (hasValidGeocode) {
                               // 有效的逆地理编码数据
                               if (regeocode.city.length > 0) {
                                   cityName = regeocode.city;
                               } else if (regeocode.district.length > 0) {
                                   cityName = regeocode.district;
                               } else if (regeocode.POIName.length > 0) {
                                   cityName = regeocode.POIName;
                               }
                               addressName = regeocode.formattedAddress.length > 0 ? regeocode.formattedAddress : cityName;
                           } else {
                               // 逆地理编码失败，可能在海外或模拟器
                               NSLog(@"⚠️ 逆地理编码失败，可能在海外或模拟器环境");
                               // 检查是否是模拟器的默认坐标（旧金山）
                               if (fabs(coordinate.latitude - 37.7858) < 0.01 && fabs(coordinate.longitude - (-122.4064)) < 0.01) {
                                   // 模拟器环境，提供测试数据
                                   cityName = @"北京市";
                                   addressName = @"北京市朝阳区";
                                   NSLog(@"🧪 检测到模拟器环境，使用测试城市: %@", cityName);
                               } else {
                                   // 真实设备在海外，提示用户手动选择
                                   cityName = @"位置服务不可用";
                                   addressName = @"请手动选择城市";
                                   NSLog(@"🌍 检测到海外位置，建议手动选择城市");
                               }
                           }
                           
                           [Defaults setObject:cityName forKey:@"currentCity"];
                           [Defaults setObject:addressName forKey:@"currentAddress"];
                       }
                       [Defaults synchronize];
                       // 使用与存储相同的逻辑处理返回数据
                       NSString *cityName = [Defaults objectForKey:@"currentCity"] ?: @"请选择";
                       NSString *addressName = [Defaults objectForKey:@"currentAddress"] ?: @"请选择";
                       NSDictionary *localDic = @{
                                                  @"lat":@(coordinate.latitude),
                                                  @"lng":@(coordinate.longitude),
                                                  @"city":cityName,
                                                  @"address":addressName
                                                  };
                       // 使用新的格式化方法，返回JavaScript端期望的格式
                       NSDictionary *response = [self formatCallbackResponse:@"getLocation" 
                                                                      data:localDic 
                                                                   success:YES 
                                                              errorMessage:nil];
                       self.webviewBackCallBack(response);
                       
                   }];
               }
               else {
                   [JHSysAlertUtil presentAlertViewWithTitle:@"温馨提示" message:@"该功能需要使用定位功能,请先开启定位权限" cancelTitle:@"取消" defaultTitle:@"去设置" distinct:YES cancel:nil confirm:^{
                       NSURL *url = [NSURL URLWithString:UIApplicationOpenSettingsURLString];
                       if ([[UIApplication sharedApplication] canOpenURL:url]) {
                           [[UIApplication sharedApplication] openURL:url];
                       }
                   }];
               }
               
           }
           return;
           
       }
       //选择poi数据
       if ([function isEqualToString:@"selectLocation"]) {
           self.webviewBackCallBack = completion;
           AddressFromMapViewController *vc = [[AddressFromMapViewController alloc] init];
           vc.addressList = nil;
           WEAK_SELF;
           vc.selectedEvent = ^(CLLocationCoordinate2D coordinate, NSString *addressName,NSString *formattedAddress) {
               STRONG_SELF;
               self.webviewBackCallBack(
                                        @{@"data": @{@"lat":@(coordinate.latitude),
                                                     @"lng":@(coordinate.longitude),
                                                     @"city":addressName,
                                                     @"address":formattedAddress
                                                     },
                                          @"success":@"true",
                                          @"errorMessage":@""
                                          });
               [[NSUserDefaults standardUserDefaults] setObject:@(coordinate.latitude) forKey:@"currentLat"];
               [[NSUserDefaults standardUserDefaults] setObject:@(coordinate.longitude) forKey:@"currentLng"];
               [[NSUserDefaults standardUserDefaults] setObject:addressName forKey:@"currentCity"];
               [[NSUserDefaults standardUserDefaults] setObject:addressName forKey:@"currentAddress"];

               [[NSUserDefaults standardUserDefaults] synchronize];
           };
           vc.hidesBottomBarWhenPushed = YES;
           [self.navigationController pushViewController:vc animated:YES];
       }

       //选择城市
       if ([function isEqualToString:@"selectLocationCity"]) {
           self.webviewBackCallBack = completion;
           if (!self.isCreat) {
               self.isCreat = YES;
               WEAK_SELF;
               [[NSNotificationCenter defaultCenter] addObserverForName:@"cityLocation" object:nil queue:[NSOperationQueue mainQueue] usingBlock:^(NSNotification * _Nonnull note) {
                   STRONG_SELF;
                   NSDictionary *dic = note.object;
                   self.webviewBackCallBack(
                                            @{@"data": @{@"currentLat":[dic objectForKey:@"currentLat"],
                                                         @"currentLng":[dic objectForKey:@"currentLng"]
                                                         },
                                              @"success":@"true",
                                              @"errorMessage":@""
                                              });
               }];
           }
           JFCityViewController *cityViewController = [[JFCityViewController alloc] init];
           cityViewController.delegate = self;
           cityViewController.title = @"选择城市";
           UINavigationController *navigationController = [[UINavigationController alloc] initWithRootViewController:cityViewController];
           [self presentViewController:navigationController animated:YES completion:nil];
       }
    
#pragma mark --------  2.0 方法结束
    
    if ([function isEqualToString:@"hideNavationbar"]) {
        [self hideNavatinBar];
        self.webView.scrollView.bounces = NO;
    }
    if ([function isEqualToString:@"showNavationbar"]) {
        [self showNavatinBar];
        self.webView.scrollView.bounces = YES;
    }
    if ([function isEqualToString:@"reload"]) {
        if (NoReachable) {
            return;
        }
        [[HTMLCache sharedCache] removeObjectForKey:self.webViewDomain];
        [self domainOperate];
        if (self.rightMessage) {
            [ManageCenter requestMessageNumber:^(id aResponseObject, NSError *anError) {
                NSInteger num = [[aResponseObject objectForKey:@"data"] integerValue];
                if (num == 0 || !num) {
                    num = 0;
                }
                [self.navigationItem.rightBarButtonItem pp_addBadgeWithNumber:num];
            }];
        }
        if (self.leftMessage) {
            [ManageCenter requestMessageNumber:^(id aResponseObject, NSError *anError) {
                NSInteger num = [[aResponseObject objectForKey:@"data"] integerValue];
                if (num == 0 || !num) {
                    num = 0;
                }
                [self.navigationItem.leftBarButtonItem pp_addBadgeWithNumber:num];
            }];
        }
        if (self.rightShop) {
            [ManageCenter requestshoppingCartNumber:^(id aResponseObject, NSError *anError) {
                NSInteger num = [[aResponseObject objectForKey:@"data"] integerValue];
                if (num == 0 || !num) {
                    num = 0;
                }
                [self.navigationItem.rightBarButtonItem pp_addBadgeWithNumber:num];
            }];
        }
        if (self.leftShop) {
            [ManageCenter requestshoppingCartNumber:^(id aResponseObject, NSError *anError) {
                NSInteger num = [[aResponseObject objectForKey:@"data"] integerValue];
                if (num == 0 || !num) {
                    num = 0;
                }
                [self.navigationItem.leftBarButtonItem pp_addBadgeWithNumber:num];
            }];
        }
    }
    if ([function isEqualToString:@"closeCurrentTab"]) {
        if (self.navigationController.viewControllers.count > 1) {
            [self.navigationController popViewControllerAnimated:YES];
        }
        else {
            [self dismissViewControllerAnimated:YES completion:nil];
        }
        return;
    }
    if ([function isEqualToString:@"customReturn"]) {
        self.backStr = [dataDic objectForKey:@"url"];
        return;
    }
    
    //弹出滚轮选择器
    if ([function isEqualToString:@"fancySelect"]) {
        self.webviewBackCallBack = completion;
        NSArray *array = [dataDic objectForKey:@"value"];
        WEAK_SELF;
        [[MOFSPickerManager shareManger]showPickerViewWithData:array tag:1 title:nil cancelTitle:@"取消" commitTitle:@"确认" commitBlock:^(NSString *string) {
            STRONG_SELF;
            NSArray *indexArr = [string componentsSeparatedByString:@","];
            // 使用新的格式化方法，返回JavaScript端期望的格式
            NSDictionary *response = [self formatCallbackResponse:@"fancySelect" 
                                                           data:@{@"value": indexArr[0]} 
                                                        success:YES 
                                                   errorMessage:nil];
            self.webviewBackCallBack(response);
            
        } cancelBlock:^{
        }];
        return;
    }
    if ([function isEqualToString:@"areaSelect"]) {
        self.webviewBackCallBack = completion;
        NSString *string = [dataDic objectForKey:@"id"] ? [dataDic objectForKey:@"id"] : @"";
        WEAK_SELF;
        [[MOFSPickerManager shareManger] showMOFSAddressPickerWithDefaultZipcode:string title:@"" cancelTitle:@"取消" commitTitle:@"确定" commitBlock:^(NSString *address, NSString *zipcode) {
            STRONG_SELF;
            // 使用新的格式化方法，返回JavaScript端期望的格式
            NSDictionary *response = [self formatCallbackResponse:@"areaSelect" 
                                                           data:@{@"code": zipcode ?: @"", @"value": address ?: @""} 
                                                        success:YES 
                                                   errorMessage:nil];
            self.webviewBackCallBack(response);
        } cancelBlock:^{
            STRONG_SELF;
            // 取消时也要回调
            NSDictionary *response = [self formatCallbackResponse:@"areaSelect" 
                                                           data:@{@"code": @"-1", @"value": @""} 
                                                        success:NO 
                                                   errorMessage:@"用户取消"];
            self.webviewBackCallBack(response);
        }];
        return;
    }
    if ([function isEqualToString:@"areaSecondarySelect"]) {
        self.webviewBackCallBack = completion;
        NSString *string = [dataDic objectForKey:@"id"] ? [dataDic objectForKey:@"id"] : @"";
        WEAK_SELF;
        [[MOFSPickerManager shareManger] showCFJAddressPickerWithDefaultZipcode:string title:@"" cancelTitle:@"取消" commitTitle:@"确定" commitBlock:^(NSString *address, NSString *zipcode) {
            STRONG_SELF;
            // 使用新的格式化方法，返回JavaScript端期望的格式
            NSDictionary *response = [self formatCallbackResponse:@"areaSelect" 
                                                           data:@{@"code": zipcode ?: @"", @"value": address ?: @""} 
                                                        success:YES 
                                                   errorMessage:nil];
            self.webviewBackCallBack(response);
        } cancelBlock:^{
            STRONG_SELF;
            // 取消时也要回调
            NSDictionary *response = [self formatCallbackResponse:@"areaSelect" 
                                                           data:@{@"code": @"-1", @"value": @""} 
                                                        success:NO 
                                                   errorMessage:@"用户取消"];
            self.webviewBackCallBack(response);
        }];
        return;
    }
    if ([function isEqualToString:@"dateSelect"]) {
        self.webviewBackCallBack = completion;
        NSDateFormatter *df = [NSDateFormatter new];
        df.dateFormat = @"yyyy-MM-dd";
        NSString *string = [dataDic objectForKey:@"value"] ? [dataDic objectForKey:@"value"] : @"";
        NSDate *newdate = [self stringToDate:string withDateFormat:@"yyyy-MM-dd"];
        //最小可选日期
        NSDate *min = [NSDate date];
        BOOL isMin = [[dataDic objectForKey:@"future"] boolValue];
        WEAK_SELF;
        [[MOFSPickerManager shareManger]showDatePickerWithfirstDate:newdate minDate:isMin ? min : nil maxDate:nil datePickerMode:UIDatePickerModeDate commitBlock:^(NSDate *date) {
            STRONG_SELF;
            self.webviewBackCallBack(
                                     @{@"data":@{@"value":[df stringFromDate:date]},
                                       @"success":@"true",
                                       @"errorMessage":@""
                                     });
        } cancelBlock:^{
            
        }];
        return;
    }
    if ([function isEqualToString:@"dateAndTimeSelect"]) {
        self.webviewBackCallBack = completion;
        NSDateFormatter *df = [NSDateFormatter new];
        df.dateFormat = @"yyyy-MM-dd HH:mm";
        NSString *string = [dataDic objectForKey:@"value"] ? [dataDic objectForKey:@"value"] : @"";
        NSDate *newdate = [self stringToDate:string withDateFormat:@"yyyy-MM-dd"];
        //最小可选日期
        NSDate *min = [NSDate date];
        BOOL isMin = [[dataDic objectForKey:@"future"] boolValue];
        WEAK_SELF;
        [[MOFSPickerManager shareManger]showDatePickerWithfirstDate:newdate minDate:isMin ? min : nil maxDate:nil datePickerMode:UIDatePickerModeDateAndTime commitBlock:^(NSDate *date) {
            STRONG_SELF;
            self.webviewBackCallBack(
                                     @{@"data":@{@"value":[df stringFromDate:date]},
                                       @"success":@"true",
                                       @"errorMessage":@""
                                     });
        } cancelBlock:^{
            
        }];
        return;
    }
    if ([function isEqualToString:@"timeSelect"]) {
        self.webviewBackCallBack = completion;
        NSDateFormatter *df = [NSDateFormatter new];
        df.dateFormat = @"HH:mm";
        NSString *string = [dataDic objectForKey:@"value"] ? [dataDic objectForKey:@"value"] : @"";
        NSDate *newdate = [self stringToDate:string withDateFormat:@"HH:mm"];
        WEAK_SELF;
        [[MOFSPickerManager shareManger]showDatePickerWithfirstDate:newdate minDate:nil maxDate:nil datePickerMode:UIDatePickerModeTime commitBlock:^(NSDate *date) {
            STRONG_SELF;
            self.webviewBackCallBack(
                                     @{@"data":@{@"value":[df stringFromDate:date]},
                                       @"success":@"true",
                                       @"errorMessage":@""
                                     });        } cancelBlock:^{
                
            }];
        return;
    }
    //    if ([function isEqualToString:@"userSignin"]) {
    //        //刷新其他页面
    //        [[HTMLCache sharedCache] removeAllCache];
    //        NSString *portrait = [NSString stringWithFormat:@"%@%@",@"http://gdstatic.naddn.com/",[dataDic objectForKey:@"portrait"]];
    //        [[NSUserDefaults standardUserDefaults] setObject:dataDic[@"loginUid"] forKey:@"loginUid"];
    //        [[NSUserDefaults standardUserDefaults] setObject:dataDic[@"userName"] forKey:@"userName"];
    //        [[NSUserDefaults standardUserDefaults] setObject:dataDic[@"userPhone"] forKey:@"userPhone"];
    //
    //        [[NSUserDefaults standardUserDefaults] setObject:portrait forKey:@"avatarURLPath"];
    //        [[NSUserDefaults standardUserDefaults] synchronize];
    //        [[NSNotificationCenter defaultCenter] postNotificationName:@"RefreshOtherAllVCNotif" object:self];
    //        [ManageCenter requestMessageNumber:^(id aResponseObject, NSError *anError) {
    //        }];
    //        [ManageCenter requestshoppingCartNumber:^(id aResponseObject, NSError *anError) {
    //        }];
    //    }
    //录音
    //    if ([function isEqualToString:@"soundRecording"]) {
    //        self.webviewBackCallBack = completion;
    //        RecordMangerView *view = [[RecordMangerView alloc]initWithFrame:CGRectMake(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)];
    //        view.delegate = self;
    //        UIWindow *window = [UIApplication sharedApplication].keyWindow;
    //        [window addSubview:view];
    //    }
    //播放网络录音
    if ([function isEqualToString:@"soundPlay"]) {
        NSString *urlstr = [dataDic objectForKey:@"data"];
        //        NSData *data = [NSData dataWithContentsOfURL:[NSURL URLWithString:urlstr]];
        //        if ([urlstr containsString:@".amr"]) {
        //            [data writeToFile:[self amrPath] atomically:YES];
        //            [self convertAMR:[self amrPath] toWAV:[self wavPath]];
        //        }
        //        else {
        //            [data writeToFile:[self wavPath] atomically:YES];
        //        }
        //        NSError *error;
        //        play = [[AVAudioPlayer alloc]initWithData:[NSData dataWithContentsOfFile:[self wavPath]] error:&error];
        //        play.volume = 1.0f;
        //        [play play];
        AVPlayerItem *item = [[AVPlayerItem alloc] initWithURL:[NSURL URLWithString:urlstr]];
        play = [[AVPlayer alloc] initWithPlayerItem:item];
        [play play];
        if (!self.isCreat) {
            self.isCreat = YES;
            //监听音频播放结束
            [[NSNotificationCenter defaultCenter] addObserver:self
             
                                                     selector:@selector(playerItemDidReachEnd)
             
                                                         name:AVPlayerItemDidPlayToEndTimeNotification
             
                                                       object:playItem];
        }
    }
    if ([function isEqualToString:@"openQRCode"]) {
        self.webviewBackCallBack = completion;
    }
    
    
    
    /*
     消息系统
     js call app时：
     noticemsg_setNumber：监听js传过来的消息数，保存起来
     noticemsg_addMsg：监听js传过来的改变消息数要求，需要的操作：
     1、计算出总的消息数，把总消息数call给js（所有界面都要）;
     2、把收到的信息通过noticemsg_addMsg接口call给js（所有界面都要）.
     app call js时：
     noticemsg_setNumber这个方法只在此处用到
     noticemsg_addMsg这个方法除了在此用到，还要就是在接到推送通知的时候需要.
     */
    if ([function isEqualToString:@"noticemsg_setNumber"]) {
        NSInteger num = [[dataDic objectForKey:@"num"] integerValue];
        [[NSUserDefaults standardUserDefaults] setInteger:num forKey:@"clinetMessageNum"];
        [[NSUserDefaults standardUserDefaults] synchronize];
        
        // 确保回调成功
        if (completion) {
            completion(@{@"success": @"true", @"data": @{}, @"errorMessage": @""});
        }
        return;
    }
    
    // 处理完成，返回成功
    NSLog(@"✅ [CFJClientH5Controller] 默认处理完成 - action: %@", function);
    if (completion) {
        completion(@{@"success": @"true", @"data": @{}, @"errorMessage": @""});
    }
}

//第三方登录授权
- (void)thirdLogin:(NSDictionary *)dic {
    NSString *type = [dic objectForKey:@"type"];
    UMSocialPlatformType snsName = [self thirdPlatform:type];
    if(snsName == UMSocialPlatformType_UnKnown) {
        return;
    }
    NSString *dataType;
    if ([type isEqualToString:@"weixin"]) {
        dataType = @"1";
        //TODO 是否有微信验证
        if(![WXApi isWXAppInstalled]) {
            //[SVStatusHUD showWithMessage:@"您没有安装微信"];
            return;
        }
        if (![WXApi isWXAppSupportApi]) {
            //[SVStatusHUD showWithMessage:@"您的微信版本太低"];
            return;
        }
    } else if ([type isEqualToString:@"qq"]) {
        dataType = @"2";
    } else if ([type isEqualToString:@"weibo"]) {
        dataType = @"3";
    }
    NSString *deviceTokenStr = [[NSUserDefaults standardUserDefaults] objectForKey:@"User_ChannelId"];
    deviceTokenStr = deviceTokenStr ? deviceTokenStr : @"";
    [[UMSocialManager defaultManager] getUserInfoWithPlatform:snsName currentViewController:self completion:^(id result, NSError *error) {
        
        NSString *message = nil;
        
        if (error) {
            message = [NSString stringWithFormat:@"Get info fail:\n%@", error];
            UMSocialLogInfo(@"Get info fail with error %@",error);
        }
        else{
            if ([result isKindOfClass:[UMSocialUserInfoResponse class]]) {
                UMSocialUserInfoResponse *resp = result;
                NSDictionary *daraDic = @{
                    @"avatarUrl": resp.iconurl,
                    @"nickName": resp.name
                };
                if (self.webviewBackCallBack) {
                    self.webviewBackCallBack(@{@"data":@{@"userInfo":daraDic,
                                                         @"openId":resp.usid,
                                                         //TODO 微信 app 和 pc 生成同一个账户
                                                         @"unionid":resp.unionId.length ? resp.unionId : @"",
                                                         @"channel":deviceTokenStr
                    },
                                               @"success":@"true",
                                               @"errorMassage":@""
                    });
                }
                
            }
            else{
                message = @"Get info fail";
            }
        }
    }];
}

//清除授权
- (void)cancelThirdAuthorize:(NSDictionary *)dic {
    NSString *type = [dic objectForKey:@"type"];
    NSInteger snsName = [self thirdPlatform:type];
    if((snsName = UMSocialPlatformType_UnKnown)) {
        return;
    }
}
//通过URL获取图片
- (UIImage *)getImageFromURL:(NSString *)fileURL {
    UIImage * result;
    NSData * data = [NSData dataWithContentsOfURL:[NSURL URLWithString:fileURL]];
    result = [UIImage imageWithData:data];
    return result;
}
- (void)saveImageToPhotos:(UIImage *)savedImage
{
    
    UIImageWriteToSavedPhotosAlbum(savedImage, self, @selector(image:didFinishSavingWithError:contextInfo:), NULL);
    
}

//指定回调方法
- (void)image: (UIImage *) image didFinishSavingWithError: (NSError *) error contextInfo: (void *) contextInfo
{
    if(error != NULL){
        if (self.webviewBackCallBack) {
            self.webviewBackCallBack(
                                     @{@"data":@"",
                                       @"success":@"failure",
                                       @"errorMessage":@""
                                     });        }
    }else{
        if (self.webviewBackCallBack) {
            self.webviewBackCallBack(
                                     @{@"data":@"",
                                       @"success":@"true",
                                       @"errorMessage":@""
                                     });        }
        
    }
}

//第三方分享
- (void)shareContent:(NSDictionary *)dic presentedVC:(UIViewController *)vc {
    NSString *type = [dic objectForKey:@"type"];
    NSInteger shareType = [[dic objectForKey:@"shareType"] integerValue];
    if ([type isEqualToString:@"copy"]) {
        //复制内容到粘贴板
        UIPasteboard *pasteboard = [UIPasteboard generalPasteboard];
        pasteboard.string = [dic objectForKey:@"url"];;
        [SVStatusHUD showWithMessage:@"复制链接成功"];
    }
    else {
        UMSocialPlatformType snsName = [self thirdPlatform:type];
        if(snsName == UMSocialPlatformType_UnKnown) {
            return;
        }
        if (snsName == UMSocialPlatformType_WechatSession && shareType == 1) {
            [self shareMiniProgramToPlatformType:snsName dataDic:dic];
        }
        else {
            [self shareWebPageToPlatformType:snsName dataDic:dic];
        }
    }
    
}
//分享小程序
//- (void)shareMiniProgramToPlatformType:(UMSocialPlatformType)platformType dataDic:(NSDictionary *)dataDic
//{
//    NSString *titleStr = [dataDic objectForKey:@"title"];
//    NSString *shareText = [dataDic objectForKey:@"content"];
//    NSString *imgStr = [dataDic objectForKey:@"img"];
//    NSString *url = [dataDic objectForKey:@"url"];
//    NSString *userName = Xiaochengxu;
//    NSString *pagePath = [dataDic objectForKey:@"pagePath"];
//    //创建分享消息对象
//    UMSocialMessageObject *messageObject = [UMSocialMessageObject messageObject];
//    UMShareMiniProgramObject *shareObject = [UMShareMiniProgramObject shareObjectWithTitle:titleStr descr:shareText thumImage:imgStr];
//    shareObject.webpageUrl = url;
//    shareObject.userName = userName;
//    shareObject.path = pagePath;
//    //先下载图片
//    SDWebImageManager *manager = [SDWebImageManager sharedManager];
//    [manager loadImageWithURL:[NSURL URLWithString:imgStr] options:0 progress:^(NSInteger receivedSize, NSInteger expectedSizem, NSURL *targetUrl) {
//        //NSLog(@"receiveSize:%ld,expectedSize:%ld",(long)receivedSize,(long)expectedSize);
//    } completed:^(UIImage *image,NSData *data, NSError *error, SDImageCacheType cacheType, BOOL finished, NSURL *imageURL) {
//        if (image) {
//            if (![[NSString contentTypeForImageData:data] isEqualToString:@"png"]) {
//              shareObject.hdImageData = UIImageJPEGRepresentation(image, 0.1);
//            }
//            else {
//                shareObject.hdImageData = data;
//            }
//        }
//        //打开注释hdImageData展示高清大图
//        //   shareObject.hdImageData = [NSData dataWithContentsOfURL:[NSURL URLWithString:imgStr]];
//        //TODO  发布版小程序
//        shareObject.miniProgramType = UShareWXMiniProgramTypeRelease;
//        messageObject.shareObject = shareObject;
//        [[UMSocialManager defaultManager] shareToPlatform:platformType messageObject:messageObject currentViewController:self completion:^(id data, NSError *error) {
//            if (error) {
//                UMSocialLogInfo(@"************Share fail with error %@*********",error);
//            }else{
//                if ([data isKindOfClass:[UMSocialShareResponse class]]) {
//                    UMSocialShareResponse *resp = data;
//                    //分享结果消息
//                    UMSocialLogInfo(@"response message is %@",resp.message);
//                    //第三方原始返回的数据
//                    UMSocialLogInfo(@"response originalResponse data is %@",resp.originalResponse);
//
//                }else{
//                    UMSocialLogInfo(@"response data is %@",data);
//                }
//            }
//        }];
//    }];
//    }
- (void)shareMiniProgramToPlatformType:(UMSocialPlatformType)platformType dataDic:(NSDictionary *)dataDic
{
    NSString *titleStr = [dataDic objectForKey:@"title"];
    NSString *shareText = [dataDic objectForKey:@"content"];
    NSString *imgStr = [dataDic objectForKey:@"img"];
    NSString *url = [dataDic objectForKey:@"url"];
    NSString *userName = [dataDic objectForKey:@"wxid"];;
    NSString *pagePath = [dataDic objectForKey:@"pagePath"];
    //创建分享消息对象
    UMSocialMessageObject *messageObject = [UMSocialMessageObject messageObject];
    UMShareMiniProgramObject *shareObject = [UMShareMiniProgramObject shareObjectWithTitle:titleStr descr:shareText thumImage:imgStr];
    shareObject.webpageUrl = url;
    shareObject.userName = userName;
    shareObject.path = pagePath;
    //打开注释hdImageData展示高清大图
    UIImage *img = [self getImageFromURL:imgStr];
    NSData *newData = [UIImage compressImage:img toByte:131072];
    shareObject.hdImageData = newData;
    //TODO  发布版小程序
    shareObject.miniProgramType = UShareWXMiniProgramTypeRelease;
    messageObject.shareObject = shareObject;
    [[UMSocialManager defaultManager] shareToPlatform:platformType messageObject:messageObject currentViewController:self completion:^(id data, NSError *error) {
        if (error) {
            UMSocialLogInfo(@"************Share fail with error %@*********",error);
        }
        else{
            if ([data isKindOfClass:[UMSocialShareResponse class]]) {
                UMSocialShareResponse *resp = data;
                //分享结果消息
                UMSocialLogInfo(@"response message is %@",resp.message);
                //第三方原始返回的数据
                UMSocialLogInfo(@"response originalResponse data is %@",resp.originalResponse);
                
            }else{
                UMSocialLogInfo(@"response data is %@",data);
            }
        }
    }];
}
//分享网页
- (void)shareWebPageToPlatformType:(UMSocialPlatformType)platformType dataDic:(NSDictionary *)dataDic
{
    NSString *titleStr = [dataDic objectForKey:@"title"];
    NSString *shareText = [dataDic objectForKey:@"content"];
    NSString *imgStr = [dataDic objectForKey:@"img"];
    NSString *url = [dataDic objectForKey:@"url"];
    //创建分享消息对象
    UMSocialMessageObject *messageObject = [UMSocialMessageObject messageObject];
    //创建网页内容对象
    UMShareWebpageObject *shareObject = [UMShareWebpageObject shareObjectWithTitle:titleStr descr:shareText thumImage:imgStr];
    //设置网页地址
    shareObject.webpageUrl = url;
    //分享消息对象设置分享内容对象
    messageObject.shareObject = shareObject;
    
    //调用分享接口
    [[UMSocialManager defaultManager] shareToPlatform:platformType messageObject:messageObject currentViewController:self completion:^(id data, NSError *error) {
        if (error) {
            UMSocialLogInfo(@"************Share fail with error %@*********",error);
        }else{
            if ([data isKindOfClass:[UMSocialShareResponse class]]) {
                UMSocialShareResponse *resp = data;
                //分享结果消息
                UMSocialLogInfo(@"response message is %@",resp.message);
                //第三方原始返回的数据
                UMSocialLogInfo(@"response originalResponse data is %@",resp.originalResponse);
                
            }else{
                UMSocialLogInfo(@"response data is %@",data);
            }
        }
    }];
}
//根据web传过来的类型对第三方平台类型赋值
- (UMSocialPlatformType )thirdPlatform:(NSString *)type {
    UMSocialPlatformType snsName;
    if ([type isEqualToString:@"weibo"]) {
        snsName = UMSocialPlatformType_Sina;
    } else if ([type isEqualToString:@"weixin"]) {
        snsName = UMSocialPlatformType_WechatSession;
    } else if ([type isEqualToString:@"moments"]) {
        snsName = UMSocialPlatformType_WechatTimeLine;
    }
    else if ([type isEqualToString:@"qq"]) {
        snsName = UMSocialPlatformType_QQ;
    } else if ([type isEqualToString:@"qqZone"]) {
        snsName = UMSocialPlatformType_Qzone;
    }
    else if ([type isEqualToString:@"twitter"]) {
        snsName = UMSocialPlatformType_Twitter;
    } else if ([type isEqualToString:@"facebook"]) {
        snsName = UMSocialPlatformType_Facebook;
    } else if ([type isEqualToString:@"message"]) {
        snsName = UMSocialPlatformType_Sms;
    }
    else {
        snsName = UMSocialPlatformType_UnKnown;
    }
    return snsName;
}

//支付
- (void)payRequest:(NSDictionary *)dic withPayType:(NSString *)payType{
    /*scheme修改
     info—url types里面进行修改
     PublicSetting.plist里面修改
     */
    NSString *appScheme = [[PublicSettingModel sharedInstance] app_Scheme];
    //支付宝
    if ([payType isEqualToString:@"alipay"]) {
        NSString *sign = [dic objectForKey:@"data"];
        if (!sign || sign.length <= 0) {
            NSLog(@"支付宝支付信息出错");
            return;
        }
        [[AlipaySDK defaultService] payOrder:sign fromScheme:appScheme callback:^(NSDictionary *resultDic) {
        }];
    }
    //微信
    else if ([payType isEqualToString:@"weixin"]) {
        NSDictionary *messageDic = [dic objectForKey:@"data"];
        if (messageDic && [messageDic isKindOfClass:[NSDictionary class]]) {
            PayReq *request = [[PayReq alloc] init];
            request.partnerId = [messageDic objectForKey:@"partnerid"];
            request.prepayId = [messageDic objectForKey:@"prepayid"];
            request.package = [messageDic objectForKey:@"package"];
            request.nonceStr = [messageDic objectForKey:@"noncestr"];
            request.timeStamp = (UInt32)[messageDic objectForKey:@"timestamp"];
            
            NSString *appid = [[PublicSettingModel sharedInstance] weiXin_AppID];
            NSString *stringA = [NSString stringWithFormat:@"appid=%@&noncestr=%@&package=%@&partnerid=%@&prepayid=%@&timestamp=%u",appid,request.nonceStr,request.package,request.partnerId,request.prepayId,(unsigned int)request.timeStamp];
            NSString *appKey = [[PublicSettingModel sharedInstance] weiXin_Key];
            NSString *stringSignTemp = [NSString stringWithFormat:@"%@&key=%@",stringA,appKey];
            NSString *sign = [stringSignTemp MD5];
            request.sign = [sign uppercaseString];
            
            if(![WXApi isWXAppInstalled]) {
                return;
                
            }
            if (![WXApi isWXAppSupportApi]) {
                return;
            }
            [WXApi sendReq:request completion:nil];
        }
    }
}


- (void)handlePayResult:(NSURL *)resultUrl {
    NSURL *url = resultUrl;
    __block NSString *payResultStr = @"";
    if ([url.host isEqualToString:@"safepay"] || [url.host isEqualToString:@"platformapi"]) {
        [[AlipaySDK defaultService] processOrderWithPaymentResult:url standbyCallback:^(NSDictionary *resultDic) {
            //由于在跳转支付宝客户端支付的过程中，商户app在后台很可能被系统kill了，所以pay接口的callback就会失效，请商户对standbyCallback返回的回调结果进行处理,就是在这个方法里面处理跟callback一样的逻辑
            if ([[[resultDic objectForKey:@"resultStatus"] class] isSubclassOfClass:[NSNull class]]) {
                payResultStr = @"failure";
            }
            if([[resultDic objectForKey:@"resultStatus"] integerValue] == 9000){
                payResultStr = @"success";
            }
            else {
                payResultStr = @"failure";
            }
        }];
    }
    else {
        if ([url.absoluteString isEqualToString:@"success"]) {
            payResultStr = @"success";
        }
        else {
            payResultStr = @"failure";
        }
    }
    
    if ([url.host isEqualToString:@"uppayresult"] && ![payResultStr isEqualToString:@"failure"]) {
        return;
    }
    //通知h5支付结果
    NSDictionary *payresult = @{@"payresult" : payResultStr};
    
    if (self.webviewBackCallBack) {
        if ([[payresult objectForKey:@"payresult"] isEqualToString:@"success"]) {
            self.webviewBackCallBack(@{
                                       @"success":@"true",
                                       @"errorMassage":@""
                                       });
        }
        else {
            self.webviewBackCallBack(@{
                                       @"success":@"false",
                                       @"errorMassage":@""
                                       });
            
        }
    }
}
//微信支付回调
- (void)handleweixinPayResult:(NSString *)success {
    if (self.webviewBackCallBack) {
        self.webviewBackCallBack(@{
                                   @"success":success,
                                   @"errorMassage":@""
                                   });
    }
}

#pragma mark - TZImagePickerController
- (void)pushTZImagePickerControllerWithDic:(NSDictionary *)dataDic {
    NSString *maxCount = [dataDic objectForKey:@"count"];
    if ([maxCount integerValue] <= 0) {
        return;
    }
    TZImagePickerController *imagePickerVc = [[TZImagePickerController alloc] initWithMaxImagesCount:maxCount.integerValue columnNumber:4 delegate:self pushPhotoPickerVc:YES];
    // imagePickerVc.navigationBar.translucent = NO;
    
#pragma mark - 五类个性化设置，这些参数都可以不传，此时会走默认设置
    imagePickerVc.isSelectOriginalPhoto = _isSelectOriginalPhoto;
    imagePickerVc.allowTakePicture = YES; // 在内部显示拍照按钮
    imagePickerVc.allowTakeVideo = NO;   // 在内部显示拍视频按
    imagePickerVc.videoMaximumDuration = 10; // 视频最大拍摄时间
    [imagePickerVc setUiImagePickerControllerSettingBlock:^(UIImagePickerController *imagePickerController) {
        imagePickerController.videoQuality = UIImagePickerControllerQualityTypeHigh;
    }];
    
    // imagePickerVc.photoWidth = 1000;
    
    // 2. Set the appearance
    // 2. 在这里设置imagePickerVc的外观
    // if (iOS8Later) {
    // imagePickerVc.navigationBar.barTintColor = [UIColor greenColor];
    // }
    // imagePickerVc.oKButtonTitleColorDisabled = [UIColor lightGrayColor];
    // imagePickerVc.oKButtonTitleColorNormal = [UIColor greenColor];
    // imagePickerVc.navigationBar.translucent = NO;
    imagePickerVc.iconThemeColor = [UIColor colorWithRed:31 / 255.0 green:185 / 255.0 blue:34 / 255.0 alpha:1.0];
    imagePickerVc.showPhotoCannotSelectLayer = YES;
    imagePickerVc.cannotSelectLayerColor = [[UIColor whiteColor] colorWithAlphaComponent:0.8];
    __weak typeof(imagePickerVc)weakImagePickerVc = imagePickerVc;
    [imagePickerVc setPhotoPickerPageUIConfigBlock:^(UICollectionView *collectionView, UIView *bottomToolBar, UIButton *previewButton, UIButton *originalPhotoButton, UILabel *originalPhotoLabel, UIButton *doneButton, UIImageView *numberImageView, UILabel *numberLabel, UIView *divideLine) {
        [doneButton setTitleColor:weakImagePickerVc.oKButtonTitleColorNormal forState:UIControlStateNormal];
    }];
    /*
     [imagePickerVc setAssetCellDidSetModelBlock:^(TZAssetCell *cell, UIImageView *imageView, UIImageView *selectImageView, UILabel *indexLabel, UIView *bottomView, UILabel *timeLength, UIImageView *videoImgView) {
     cell.contentView.clipsToBounds = YES;
     cell.contentView.layer.cornerRadius = cell.contentView.tz_width * 0.5;
     }];
     */
    
    // 3. Set allow picking video & photo & originalPhoto or not
    // 3. 设置是否可以选择视频/图片/原图
    if ([[dataDic objectForKey:@"mimeType"] isEqualToString:@"video"]) {
        imagePickerVc.allowPickingVideo = YES;
        imagePickerVc.allowPickingImage = NO;
    }
    else {
        imagePickerVc.allowPickingVideo = NO;
        imagePickerVc.allowPickingImage = YES;
    }
    imagePickerVc.allowPickingOriginalPhoto = YES;
    imagePickerVc.allowPickingGif = NO;
    imagePickerVc.allowPickingMultipleVideo = NO; // 是否可以多选视频
    
    // 4. 照片排列按修改时间升序
    imagePickerVc.sortAscendingByModificationDate = YES;
    
    // imagePickerVc.minImagesCount = 3;
    // imagePickerVc.alwaysEnableDoneBtn = YES;
    
    // imagePickerVc.minPhotoWidthSelectable = 3000;
    // imagePickerVc.minPhotoHeightSelectable = 2000;
    
    /// 5. Single selection mode, valid when maxImagesCount = 1
    /// 5. 单选模式,maxImagesCount为1时才生效
    imagePickerVc.showSelectBtn = NO;
    imagePickerVc.allowCrop = NO;
    imagePickerVc.needCircleCrop =NO;
    // 设置竖屏下的裁剪尺寸
    NSInteger left = 30;
    NSInteger widthHeight = self.view.tz_width - 2 * left;
    NSInteger top = (self.view.tz_height - widthHeight) / 2;
    imagePickerVc.cropRect = CGRectMake(left, top, widthHeight, widthHeight);
    // 设置横屏下的裁剪尺寸
    // imagePickerVc.cropRectLandscape = CGRectMake((self.view.tz_height - widthHeight) / 2, left, widthHeight, widthHeight);
    /*
     [imagePickerVc setCropViewSettingBlock:^(UIView *cropView) {
     cropView.layer.borderColor = [UIColor redColor].CGColor;
     cropView.layer.borderWidth = 2.0;
     }];*/
    
    //imagePickerVc.allowPreview = NO;
    // 自定义导航栏上的返回按钮
    /*
     [imagePickerVc setNavLeftBarButtonSettingBlock:^(UIButton *leftButton){
     [leftButton setImage:[UIImage imageNamed:@"back"] forState:UIControlStateNormal];
     [leftButton setImageEdgeInsets:UIEdgeInsetsMake(0, -10, 0, 20)];
     }];
     imagePickerVc.delegate = self;
     */
    
    //设置状态栏风格
    imagePickerVc.statusBarStyle = UIStatusBarStyleLightContent;
    
    // 设置是否显示图片序号
    imagePickerVc.showSelectedIndex = YES;
    // 设置首选语言 / Set preferred language
    // imagePickerVc.preferredLanguage = @"zh-Hans";
    
    // 设置languageBundle以使用其它语言 / Set languageBundle to use other language
    // imagePickerVc.languageBundle = [NSBundle bundleWithPath:[[NSBundle mainBundle] pathForResource:@"tz-ru" ofType:@"lproj"]];
    
#pragma mark - 到这里为止
    
    // You can get the photos by block, the same as by delegate.
    // 你可以通过block或者代理，来得到用户选择的照片.
    [imagePickerVc setDidFinishPickingPhotosHandle:^(NSArray<UIImage *> *photos, NSArray *assets, BOOL isSelectOriginalPhoto) {
        
    }];
    
    [self presentViewController:imagePickerVc animated:YES completion:nil];
}

#pragma mark - TZImagePickerControllerDelegate

/// User click cancel button
/// 用户点击了取消
- (void)tz_imagePickerControllerDidCancel:(TZImagePickerController *)picker {
    NSLog(@"=====================用户点击了取消");
}

// 这个照片选择器会自己dismiss，当选择器dismiss的时候，会执行下面的代理方法
// 如果isSelectOriginalPhoto为YES，表明用户选择了原图
// 你可以通过一个asset获得原图，通过这个方法：[[TZImageManager manager] getOriginalPhotoWithAsset:completion:]
// photos数组里的UIImage对象，默认是828像素宽，你可以通过设置photoWidth属性的值来改变它
- (void)imagePickerController:(TZImagePickerController *)picker didFinishPickingPhotos:(NSArray<UIImage *> *)photos sourceAssets:(NSArray *)assets isSelectOriginalPhoto:(BOOL)isSelectOriginalPhoto infos:(NSArray<NSDictionary *> *)infos {
    _isSelectOriginalPhoto = isSelectOriginalPhoto;
    _selectedAssets = [assets mutableCopy];
    if (!_isSelectOriginalPhoto) {
        _selectedPhotos = [NSMutableArray arrayWithArray:photos];
        NSMutableArray *dataArray = [NSMutableArray arrayWithCapacity:0];
        for (NSInteger i = 0; i < _selectedPhotos.count; i++) {
            UIImage *image = _selectedPhotos[i];
            NSData *imageData = UIImagePNGRepresentation(image);
            NSDictionary *dic = @{@"name":[NSString stringWithFormat:@"%ld",(long)i],
                                  @"size":[self getBytesFromDataLength:imageData.length],
                                  @"type":@"image/jpeg",
                                  @"lastModified":@""
            };
            [dataArray addObject:dic];
        }
        if (self.webviewBackCallBack) {
            // 使用新的格式化方法，返回JavaScript端期望的格式
            NSDictionary *response = [self formatCallbackResponse:@"chooseFile" 
                                                           data:dataArray 
                                                        success:YES 
                                                   errorMessage:nil];
            self.webviewBackCallBack(response);
        }
    } else {
        // 3. 获取原图的示例，这样一次性获取很可能会导致内存飙升，建议获取1-2张，消费和释放掉，再获取剩下的
        __block NSMutableArray *originalPhotos = [NSMutableArray array];
        __block NSInteger finishCount = 0;
        for (NSInteger i = 0; i < assets.count; i++) {
            [originalPhotos addObject:@1];
        }
        for (NSInteger i = 0; i < assets.count; i++) {
            PHAsset *asset = assets[i];
            WEAK_SELF;
            [[TZImageManager manager] getOriginalPhotoWithAsset:asset completion:^(UIImage *photo, NSDictionary *info) {
                STRONG_SELF;
                finishCount += 1;
                [originalPhotos replaceObjectAtIndex:i withObject:photo];
                if (finishCount >= assets.count) {
                    NSLog(@"All finished.");
                    self->_selectedPhotos = originalPhotos;
                    NSMutableArray *dataArray = [NSMutableArray arrayWithCapacity:0];
                    for (NSInteger i = 0; i < self->_selectedPhotos.count; i++) {
                        UIImage *image = self->_selectedPhotos[i];
                        NSData *imageData = UIImagePNGRepresentation(image);
                        NSDictionary *dic = @{@"name":[NSString stringWithFormat:@"%ld",(long)i],
                                              @"size":[self getBytesFromDataLength:imageData.length],
                                              @"type":@"image/jpeg",
                                              @"lastModified":@""
                        };
                        [dataArray addObject:dic];
                    }
                    if (self.webviewBackCallBack) {
                        // 使用新的格式化方法，返回JavaScript端期望的格式
                        NSDictionary *response = [self formatCallbackResponse:@"chooseFile" 
                                                                       data:dataArray 
                                                                    success:YES 
                                                               errorMessage:nil];
                        self.webviewBackCallBack(response);
                    }
                }
            }];
        }
    }
}

// If user picking a video, this callback will be called.
// If system version > iOS8,asset is kind of PHAsset class, else is ALAsset class.
// 如果用户选择了一个视频，下面的handle会被执行
// 如果系统版本大于iOS8，asset是PHAsset类的对象，否则是ALAsset类的对象
- (void)imagePickerController:(TZImagePickerController *)picker didFinishPickingVideo:(UIImage *)coverImage sourceAssets:(PHAsset *)asset {
    // open this code to send video / 打开这段代码发送视频
    [[TZImageManager manager] getVideoOutputPathWithAsset:asset presetName:AVAssetExportPreset640x480 success:^(NSString *outputPath) {
        NSLog(@"视频导出到本地完成,沙盒路径为:%@",outputPath);
        // Export completed, send video here, send by outputPath or NSData
        // 导出完成，在这里写上传代码，通过路径或者通过NSData上传
        NSData *data = [NSData dataWithContentsOfFile:outputPath options:(NSDataReadingUncached) error:nil];
        NSMutableArray *dataArray = [NSMutableArray arrayWithCapacity:0];
        NSDictionary *dic = @{@"name":[NSString stringWithFormat:@"%d",0],
                              @"size":[self getBytesFromDataLength:data.length],
                              @"type":@"video/mpeg",
                              @"lastModified":@""
        };
        [dataArray addObject:dic];
        if (self.webviewBackCallBack) {
            self.webviewBackCallBack(
                                     @{@"data":dataArray,
                                       @"success":@"true",
                                       @"errorMessage":@""
                                     }
                                     );
        }
        self->_selectedVideo = [NSMutableArray arrayWithCapacity:1];
        [self->_selectedVideo addObject:data];
        self-> _videoPath = outputPath;
    } failure:^(NSString *errorMessage, NSError *error) {
        NSLog(@"视频导出失败:%@,error:%@",errorMessage, error);
    }];
    // _collectionView.contentSize = CGSizeMake(0, ((_selectedPhotos.count + 2) / 3 ) * (_margin + _itemWH));
}

// If user picking a gif image, this callback will be called.
// 如果用户选择了一个gif图片，下面的handle会被执行
- (void)imagePickerController:(TZImagePickerController *)picker didFinishPickingGifImage:(UIImage *)animatedImage sourceAssets:(PHAsset *)asset {
    _selectedPhotos = [NSMutableArray arrayWithArray:@[animatedImage]];
}

// Decide album show or not't
// 决定相册显示与否
- (BOOL)isAlbumCanSelect:(NSString *)albumName result:(PHFetchResult *)result {
    /*
     if ([albumName isEqualToString:@"个人收藏"]) {
     return NO;
     }
     if ([albumName isEqualToString:@"视频"]) {
     return NO;
     }*/
    return YES;
}

// Decide asset show or not't
// 决定asset显示与否
- (BOOL)isAssetCanSelect:(PHAsset *)asset {
    /*
     if (iOS8Later) {
     PHAsset *phAsset = asset;
     switch (phAsset.mediaType) {
     case PHAssetMediaTypeVideo: {
     // 视频时长
     // NSTimeInterval duration = phAsset.duration;
     return NO;
     } break;
     case PHAssetMediaTypeImage: {
     // 图片尺寸
     if (phAsset.pixelWidth > 3000 || phAsset.pixelHeight > 3000) {
     // return NO;
     }
     return YES;
     } break;
     case PHAssetMediaTypeAudio:
     return NO;
     break;
     case PHAssetMediaTypeUnknown:
     return NO;
     break;
     default: break;
     }
     } else {
     ALAsset *alAsset = asset;
     NSString *alAssetType = [[alAsset valueForProperty:ALAssetPropertyType] stringValue];
     if ([alAssetType isEqualToString:ALAssetTypeVideo]) {
     // 视频时长
     // NSTimeInterval duration = [[alAsset valueForProperty:ALAssetPropertyDuration] doubleValue];
     return NO;
     } else if ([alAssetType isEqualToString:ALAssetTypePhoto]) {
     // 图片尺寸
     CGSize imageSize = alAsset.defaultRepresentation.dimensions;
     if (imageSize.width > 3000) {
     // return NO;
     }
     return YES;
     } else if ([alAssetType isEqualToString:ALAssetTypeUnknown]) {
     return NO;
     }
     }*/
    return YES;
}

#pragma mark ----- 获取当前显示控制器

- (UIViewController*) findBestViewController:(UIViewController*)vc {
    
    if (vc.presentedViewController) {
        
        // Return presented view controller
        return [self findBestViewController:vc.presentedViewController];
        
    } else if ([vc isKindOfClass:[UISplitViewController class]]) {
        
        // Return right hand side
        UISplitViewController* svc = (UISplitViewController*) vc;
        if (svc.viewControllers.count > 0) {
            return [self findBestViewController:svc.viewControllers.lastObject];
        } else {
            return vc;
        }
        
    } else if ([vc isKindOfClass:[UINavigationController class]]) {
        
        // Return top view
        UINavigationController* svc = (UINavigationController*) vc;
        if (svc.viewControllers.count > 0) {
            return [self findBestViewController:svc.topViewController];
        } else {
            return vc;
        }
    } else if ([vc isKindOfClass:[UITabBarController class]]) {
        
        // Return visible view
        UITabBarController* svc = (UITabBarController*) vc;
        if (svc.viewControllers.count > 0) {
            return [self findBestViewController:svc.selectedViewController];
        }
        else {
            return vc;
        }
        
    } else {
        // Unknown view controller type, return last child view controller
        return vc;
        
    }
    
}

- (UIViewController*) currentViewController {
    
    // Find best view controller
    UIViewController* viewController = [UIApplication sharedApplication].keyWindow.rootViewController;
    return [self findBestViewController:viewController];
    
}

//字符串转日期格式
- (NSDate *)stringToDate:(NSString *)dateString withDateFormat:(NSString *)format {
    NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
    [dateFormatter setDateFormat:format];
    
    NSDate *date = [dateFormatter dateFromString:dateString];
    return date;
}

//将世界时间转化为中国区时间
- (NSDate *)worldTimeToChina:(NSDate *)date {
    NSTimeZone *timeZone = [NSTimeZone systemTimeZone];
    NSInteger interval = [timeZone secondsFromGMTForDate:date];
    NSDate *localeDate = [date  dateByAddingTimeInterval:interval];
    return localeDate;
}

//判断是否开启定位权限
- (BOOL)isLocationServiceOpen {
    if ([ CLLocationManager authorizationStatus] == kCLAuthorizationStatusDenied) {
        return NO;
    } else
        return YES;
}

#pragma mark -------- 设置状态条

- (UIStatusBarStyle)preferredStatusBarStyle {
    NSString *statusBarTextColor = [[NSUserDefaults standardUserDefaults] objectForKey:@"StatusBarTextColor"];
    NSString *bgcolor = [self.navDic objectForKey:@"navBgcolor"];
    if ([bgcolor isEqualToString:@"#FFFFFF"] || [bgcolor isEqualToString:@"white"]) {
        return UIStatusBarStyleDefault;
    }
    if ([statusBarTextColor isEqualToString:@"#000000"] || [statusBarTextColor isEqualToString:@"black"]) {
        return UIStatusBarStyleDefault;
    } else {
        return UIStatusBarStyleLightContent;
    }
}

//隐藏导航
- (void)hideNavatinBar {
    [self.navigationController setNavigationBarHidden:YES animated:YES];
    [self.webView mas_updateConstraints:^(MASConstraintMaker *make) {
        make.left.equalTo(self.view);
        make.right.equalTo(self.view);
        make.bottom.equalTo(self.view);
        make.top.equalTo(self.view.mas_top).offset(isIPhoneXSeries() ? 44 : 20);
    }];
    [self.view layoutIfNeeded];
}

//显示导航
- (void)showNavatinBar {
    [self.navigationController setNavigationBarHidden:NO animated:YES];
    if ([[NSUserDefaults standardUserDefaults] boolForKey:@"NoTabBar"]) {
        [self.webView mas_makeConstraints:^(MASConstraintMaker *make) {
            make.left.equalTo(self.view);
            make.right.equalTo(self.view);
            make.bottom.equalTo(self.view).offset(49);
            make.top.equalTo(self.view);
        }];
    } else {
        [self.webView mas_makeConstraints:^(MASConstraintMaker *make) {
            make.left.equalTo(self.view);
            make.right.equalTo(self.view);
            make.bottom.equalTo(self.view);
            make.top.equalTo(self.view);
        }];
        
    }
    [self.view layoutIfNeeded];
}

#pragma mark - YBPopupMenuDelegate

- (void)ybPopupMenu:(YBPopupMenu *)ybPopupMenu didSelectedAtIndex:(NSInteger)index {
    //YBPopupMenu  代理方法
}

//播放完成回调
- (void)playerItemDidReachEnd {
    NSDictionary *callJsDic = [[HybridManager shareInstance] objcCallJsWithFn:@"playEnd" data:nil];
    [self objcCallJs:callJsDic];
}

#pragma mark   2.0  方法

// 重写父类的rpcRequestWithJsDic方法
- (void)rpcRequestWithJsDic:(NSDictionary *)dataDic completion:(void(^)(id result))completion {
    [self rpcRequestWithJsDic:dataDic jsCallBack:completion];
}

//2.0  request方法执行请求
- (void)rpcRequestWithJsDic:(NSDictionary *)dataDic
                 jsCallBack:(XZWebViewJSCallbackBlock)jsCallBack {
    
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
            if (jsCallBack) {
                // 获取服务器响应数据
                NSDictionary *serverResponse = responseObject;
                
                // 检查服务器响应的成功状态
                BOOL isSuccess = NO;
                NSNumber *codeValue = [serverResponse objectForKey:@"code"];
                if (codeValue && [codeValue intValue] == 0) {
                    isSuccess = YES;
                }
                
                // 使用formatCallbackResponse方法保持格式一致
                NSDictionary *jsResponse = [self formatCallbackResponse:@"request" 
                                                                  data:serverResponse 
                                                               success:isSuccess 
                                                          errorMessage:[serverResponse objectForKey:@"errorMessage"] ?: @""];
                
                jsCallBack(jsResponse);
            }
        } failure:^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull error) {
            if (jsCallBack) {
                // 使用formatCallbackResponse方法保持格式一致
                NSDictionary *errorResponse = [self formatCallbackResponse:@"request" 
                                                                      data:@{} 
                                                                   success:NO 
                                                              errorMessage:error.localizedDescription ?: @"网络请求失败"];
                jsCallBack(errorResponse);
            }
        }];
    });
}

//2.0登录/退出调用方法
- (void)RequestWithJsDic:(NSDictionary *)dataDic type:(NSString *)type{
    dispatch_async(dispatch_get_global_queue(0, 0), ^{
        AFHTTPSessionManager *manager = [AFHTTPSessionManager manager];
        AFSecurityPolicy *securityPolicy =  [AFSecurityPolicy defaultPolicy];
        // 客户端是否信任非法证书
        securityPolicy.allowInvalidCertificates = YES;
        // 是否在证书域字段中验证域名
        securityPolicy.validatesDomainName = NO;
        manager.securityPolicy = securityPolicy;
        manager.responseSerializer = [AFJSONResponseSerializer serializer];
        manager.requestSerializer = [AFHTTPRequestSerializer serializer];
        manager.requestSerializer.timeoutInterval = 45;
        //CFJ新加
        manager.responseSerializer.acceptableContentTypes = [NSSet setWithObjects:@"application/json", @"text/plain", @"text/javascript", @"text/json", @"text/html", nil];
        NSDictionary *header = [dataDic objectForKey:@"header"];
        for (NSString *key in [header allKeys]) {
            [manager.requestSerializer setValue:[header objectForKey:key] forHTTPHeaderField:key];
        }
        NSString *deviceTokenStr = [[NSUserDefaults standardUserDefaults] objectForKey:@"User_ChannelId"];
        deviceTokenStr = deviceTokenStr ? deviceTokenStr : @"";
        NSDictionary *parameters = @{@"from":@"1",
                                     @"type":type,
                                     @"channel":deviceTokenStr};
        NSLog(@"xxxxgetloginLinkUrl:%@",[[HybridManager shareInstance] getloginLinkUrl]);
        [manager POST:[CustomHybridProcessor custom_getloginLinkUrl] parameters:parameters headers:nil progress:nil success:^(NSURLSessionDataTask * _Nonnull task, id  _Nonnull responseObject) {
            NSLog(@"成功");
        } failure:^(NSURLSessionDataTask * _Nonnull task, NSError * _Nonnull error) {
            NSLog(@"失败");
        }];
    });
}

#pragma mark ------ 七牛上传

- (void)QiNiuUploadImageWithData:(NSDictionary *)datadic{
    // 修复：nameIndex实际上是文件名，不是数组索引
    // 我们需要找到对应的文件索引，或者使用第一个文件（单文件上传场景）
    NSInteger index = 0; // 默认使用第一个文件
    NSString *nameIndex = [datadic objectForKey:@"nameIndex"];
    
    // 如果nameIndex是数字字符串，则使用它作为索引
    if (nameIndex && [nameIndex rangeOfCharacterFromSet:[[NSCharacterSet decimalDigitCharacterSet] invertedSet]].location == NSNotFound) {
        NSInteger providedIndex = [nameIndex integerValue];
        if (providedIndex >= 0 && providedIndex < _selectedAssets.count) {
            index = providedIndex;
        }
    }
    
    // 安全检查：确保索引在有效范围内
    if (index >= _selectedAssets.count || index >= _selectedPhotos.count) {
        index = 0;
    }
    
    NSString *qiniuToken = [datadic objectForKey:@"token"];
    PHAsset *asset = _selectedAssets[index];
    UIImage *image = _selectedPhotos[index];
    WEAK_SELF;
    self.isCancel = NO;
    self.cancelSignal = ^BOOL {
        STRONG_SELF;
        return self.isCancel;
    };
    QNUploadOption *opt = [[QNUploadOption alloc] initWithMime:nil progressHandler:^(NSString *key, float percent) {
        STRONG_SELF;
        dispatch_async(dispatch_get_main_queue(), ^{
            // 修复：确保进度值是数字类型，且字段名匹配JavaScript端期望
            NSInteger percentValue = (NSInteger)(percent * 100);
            
            NSDictionary *data = @{@"progress": @(percentValue)};  // 使用NSNumber而不是字符串
            NSDictionary *callJsDic = [[HybridManager shareInstance] objcCallJsWithFn:@"uploadFile" data:data];
            [self objcCallJs:callJsDic];
        });
    } params:nil checkCrc:NO cancellationSignal:self.cancelSignal];
    NSData *data;
    if ([[datadic objectForKey:@"type"] isEqualToString:@"video/mpeg"]) {
        data = [_selectedVideo objectAtIndex:0];
        [self QiNiuUploadData:data andAsset:asset qiniuToken:qiniuToken option:opt isVideo:YES];
        
    } else {
        data = [UIImage compressImage:image toByte:1024 * 1024 * 2.0];
        [self QiNiuUploadData:data andAsset:asset qiniuToken:qiniuToken option:opt isVideo:NO];
        
    }
}

- (void)QiNiuUploadData:(NSData *)imgData andAsset:(PHAsset *)asset qiniuToken:(NSString *)qiniuToken option:(QNUploadOption *)opt isVideo:(BOOL)isVideo{
    NSString *name = [asset valueForKey:@"filename"];
    NSString *extensions = [[name pathExtension] lowercaseString];
    NSString *fileName = [NSString stringWithFormat:@"%@.%@",[self getFileName],extensions ? extensions : @"mp4"];
    WEAK_SELF;
    [[QNUploadManager sharedInstanceWithConfiguration:nil] putData:imgData key:fileName token:qiniuToken complete:^(QNResponseInfo *info, NSString *key, NSDictionary *resp) {
        if (![[resp class] isSubclassOfClass:[NSDictionary class]]) {
            return ;
        }
        STRONG_SELF;
        dispatch_async(dispatch_get_main_queue(), ^{
            // 修复：上传完成时只发送key，不发送progress
            NSDictionary *data = @{@"key": key ?: @""};
            NSDictionary *callJsDic = [[HybridManager shareInstance] objcCallJsWithFn:@"uploadFile" data:data];
            [self objcCallJs:callJsDic];
            if (isVideo) {
                NSFileManager *fileManager = [NSFileManager defaultManager];
                if (self->_videoPath) {
                    [fileManager removeItemAtPath:self->_videoPath error:nil];
                }
            }
        });
    } option:opt];
}

- (NSString *)getFileName {
    NSTimeInterval interval = [[NSDate date] timeIntervalSince1970];
    int y = (arc4random() % 10000) + 11111;
    NSString *file = [NSString stringWithFormat:@"%.f%d",interval,y];
    return file;
}

//根据链接获取角标
- (NSInteger)getIndexByUrl:(NSString *)currentUrl :(NSArray *)urls {
    return  [urls indexOfObject:currentUrl] ? [urls indexOfObject:currentUrl] : 0;
}

//获取图片大小
- (NSString *)getBytesFromDataLength:(NSInteger)dataLength {
    NSString *bytes;
    bytes = [NSString stringWithFormat:@"%ld",(long)dataLength];
    return bytes;
}

#pragma mark - JFCityViewControllerDelegate

- (void)cityName:(NSString *)name cityCode:(NSString *)code {
    self.webviewBackCallBack(
                             @{@"data": @{@"cityTitle":name,
                                          @"cityCode":code
                             },
                               @"success":@"true",
                               @"errorMessage":@""
                             });
    
}

#pragma mark --- JFLocationDelegate

//定位中...
- (void)locating {
    NSLog(@"定位中...");
}

//定位成功
- (void)currentLocation:(NSDictionary *)locationDictionary {
    NSString *city = [locationDictionary valueForKey:@"City"];
    NSString *currentLat = [locationDictionary valueForKey:@"currentLat"];
    NSString *currentLng = [locationDictionary valueForKey:@"currentLng"];
    [KCURRENTCITYINFODEFAULTS setObject:city forKey:@"locationCity"];
    [KCURRENTCITYINFODEFAULTS setObject:city forKey:@"SelectCity"];
    [KCURRENTCITYINFODEFAULTS setObject:currentLat forKey:@"currentLat"];
    [KCURRENTCITYINFODEFAULTS setObject:currentLng forKey:@"currentLng"];
    [KCURRENTCITYINFODEFAULTS synchronize];
}

/// 拒绝定位
- (void)refuseToUsePositioningSystem:(NSString *)message {
    NSLog(@"%@",message);
}

/// 定位失败
- (void)locateFailure:(NSString *)message {
    NSLog(@"%@",message);
}

//处理定位原生头部
- (void)location {
    NSString *title = [[[NSUserDefaults standardUserDefaults] objectForKey:@"currentCity"] length] ? [[NSUserDefaults standardUserDefaults] objectForKey:@"currentCity"] : @"请选择";
    self.navigationItem.leftBarButtonItem = [UIBarButtonItem leftItemWithtitle:title Color:@"#000000" Target:self action:@selector(selectLocation:)];
}

//处理扫描二维码
- (void)QrScan {
    self.navigationItem.rightBarButtonItem = [UIBarButtonItem rightItemTarget:self action:@selector(QrScanAction:)];
}

- (void)QrScanAction:(UIButton *)sender {
    CFJScanViewController *qrVC = [[CFJScanViewController alloc]init];
    qrVC.hidesBottomBarWhenPushed = YES;
    [self.navigationController pushViewController:qrVC animated:YES];
}

//判断是否开启定位权限
- (BOOL)isHaveNativeHeader:(NSString *)url{
    if ([[XZPackageH5 sharedInstance].ulrArray containsObject:url]) {
        return YES;
    }
    return NO;
}

- (void)handleJsCallNative:(NSDictionary *)jsDic {
    NSString *function = [jsDic objectForKey:@"function"];
    NSDictionary *dataDic = [jsDic objectForKey:@"data"];
    NSString *callbackId = [jsDic objectForKey:@"callbackId"];
    
    // 将回调适配为新的格式
    XZWebViewJSCallbackBlock callback = ^(id responseData) {
        if (callbackId) {
                         NSString *jsCode = [NSString stringWithFormat:@"window.xzBridgeCallbackHandler('%@', %@)", 
                                callbackId, [self jsonStringFromObject:responseData]];
            [self callJavaScript:jsCode completion:nil];
        }
    };
    
    //保存图片
    if ([function isEqualToString:@"saveImage"]) {
        self.webviewBackCallBack = callback;
        PHAuthorizationStatus author = [PHPhotoLibrary authorizationStatus];
        if (author == kCLAuthorizationStatusRestricted || author ==kCLAuthorizationStatusDenied){
            //无权限
            NSString *tips = [NSString stringWithFormat:@"请在设备的设置-隐私-照片选项中，允许应用访问你的照片"];
            [JHSysAlertUtil presentAlertViewWithTitle:@"温馨提示" message:tips confirmTitle:@"确定" handler:nil];
            return;
        }
        else {
            NSString *imageStr = dataDic[@"filePath"];
            [self saveImageToPhotos:[self getImageFromURL:imageStr]];
        }
    }
    
    //关闭模态弹窗
    if ([function isEqualToString:@"closePresentWindow"]) {
        [self dismissViewControllerAnimated:YES completion:nil];
        return;
    }
    
    //更换页面标题
    if ([function isEqualToString:@"setNavigationBarTitle"]) {
        self.navigationItem.title = [dataDic objectForKey:@"title"];
        return;
    }
    if ([function isEqualToString:@"weixinLogin"]) {
        self.webviewBackCallBack = callback;
        [self thirdLogin:@{@"type":@"weixin"}];
    }
    //微信支付
    if ([function isEqualToString:@"weixinPay"]) {
        self.webviewBackCallBack = callback;
        [self payRequest:jsDic withPayType:@"weixin"];
    }
    //支付宝支付
    if ([function isEqualToString:@"aliPay"]) {
        self.webviewBackCallBack = callback;
        [self payRequest:jsDic withPayType:@"alipay"];
    }
    //选择文件
    if ([function isEqualToString:@"chooseFile"]) {
        self.webviewBackCallBack = callback;
        [self pushTZImagePickerControllerWithDic:dataDic];
    }
    //上传文件
    if ([function isEqualToString:@"uploadFile"]) {
        [self QiNiuUploadImageWithData:dataDic];
    }
    //扫描二维码
    if ([function isEqualToString:@"QRScan"]) {
        CFJScanViewController *qrVC = [[CFJScanViewController alloc]init];
        qrVC.hidesBottomBarWhenPushed = YES;
        [self.navigationController pushViewController:qrVC animated:YES];
        return;
    }
#pragma mark ----CFJ修改浏览图片
    if ([function isEqualToString:@"previewImage"]) {
        self.viewImageAry = [dataDic objectForKey:@"urls"];
        NSInteger currentIndex = [self getIndexByUrl:[dataDic objectForKey:@"current"] : self.viewImageAry];
        [[LBPhotoBrowserManager defaultManager] showImageWithURLArray:self.viewImageAry fromImageViewFrames:nil selectedIndex:currentIndex imageViewSuperView:self.view];
        [[[LBPhotoBrowserManager.defaultManager addLongPressShowTitles:@[@"保存",@"取消"]] addTitleClickCallbackBlock:^(UIImage *image, NSIndexPath *indexPath, NSString *title, BOOL isGif, NSData *gifImageData) {
            LBPhotoBrowserLog(@"%@",title);
            if(![title isEqualToString:@"保存"]) return;
            if (!isGif) {
                [[LBAlbumManager shareManager] saveImage:image];
            }
            else {
                [[LBAlbumManager shareManager] saveGifImageWithData:gifImageData];
            }
        }]addPhotoBrowserWillDismissBlock:^{
            LBPhotoBrowserLog(@"即将销毁");
        }];
    }
    //登录
    if ([function isEqualToString:@"userLogin"]) {
        [self RequestWithJsDic:dataDic type:@"1"];
        [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"isLogin"];
        [[NSUserDefaults standardUserDefaults]synchronize];
    }
    //退出登录
    if ([function isEqualToString:@"userLogout"]) {
        [self RequestWithJsDic:dataDic type:@"2"];
        [[NSUserDefaults standardUserDefaults] setBool:NO forKey:@"isLogin"];
        [[NSUserDefaults standardUserDefaults]synchronize];
    }
    
    //返回首层页面
    if ([function isEqualToString:@"switchTab"]) {
        [self.navigationController popToRootViewControllerAnimated:YES];
        NSString *number  =[[XZPackageH5 sharedInstance] getNumberWithLink:(NSString *)dataDic];
        NSDictionary *setDic = @{
            @"selectNumber": number
        };
        [[NSNotificationCenter defaultCenter] postNotificationName:@"switchTab" object:setDic];
    }
}

// 添加回调方法实现
- (void)callBack:(NSString *)type params:(NSDictionary *)params {
    if (self.webviewBackCallBack) {
        self.webviewBackCallBack(@{
            @"type": type,
            @"data": params,
            @"success": @"true",
            @"errorMessage": @""
        });
    }
}

#pragma mark - Utility Methods

- (NSString *)jsonStringFromObject:(id)object {
    if (!object) return @"null";
    
    NSError *error;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:object 
                                                       options:0 
                                                         error:&error];
    if (error) {
        NSLog(@"JSON serialization error: %@", error.localizedDescription);
        return @"{}";
    }
    
    return [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
}

// 重写父类的jsCallObjc方法，调用子类的业务逻辑
- (void)jsCallObjc:(NSDictionary *)jsData jsCallBack:(WVJBResponseCallback)jsCallBack {
    NSString *action = jsData[@"action"];
    
    NSLog(@"🎯 [CFJClientH5Controller] jsCallObjc被调用，action: %@, 完整数据: %@", action, jsData);
    
    // 定义子类特有的action列表 (注意：不包括pageReady，它由父类处理)
    NSSet *childActions = [NSSet setWithArray:@[
        @"request", @"nativeGet", @"hasWx", @"isiPhoneX", @"readMessage", @"setTabBarBadge", 
        @"removeTabBarBadge", @"showTabBarRedDot", @"hideTabBarRedDot", @"navigateTo", @"getLocation",
        @"pageShow", @"pageHide", @"pageUnload", @"showLocation", @"changeMessageNum",
        @"copyLink", @"share", @"saveImage", @"closePresentWindow", @"setNavigationBarTitle",
        @"weixinLogin", @"weixinPay", @"aliPay", @"chooseFile", @"uploadFile", @"QRScan",
        @"previewImage", @"userLogin", @"userLogout", @"switchTab", @"hideNavationbar",
        @"showNavationbar", @"noticemsg_setNumber", @"showModal", @"showToast", @"selectLocation",
        @"selectLocationCity", @"navigateBack", @"reLaunch", @"showActionSheet", @"areaSelect",
        @"reloadOtherPages"
    ]];
    
    // 如果是子类特有的action，直接调用子类处理
    if ([childActions containsObject:action]) {
        NSLog(@"🎯 [CFJClientH5Controller] 调用子类处理: %@", action);
        [self handleJavaScriptCall:jsData completion:^(id result) {
            if (jsCallBack) {
                jsCallBack(result);
            }
        }];
        return;
    }
    
    NSLog(@"🎯 [CFJClientH5Controller] 调用父类处理: %@", action);
    // 否则调用父类处理
    [super jsCallObjc:jsData jsCallBack:jsCallBack];
}

// 保留原有的completion方法作为兼容
- (void)jsCallObjc:(NSDictionary *)jsData completion:(void(^)(id result))completion {
    [self jsCallObjc:jsData jsCallBack:^(id responseData) {
        if (completion) {
            completion(responseData);
        }
    }];
}

#pragma mark - 回调数据格式化

/**
 * 统一的回调数据格式化方法
 * 解决OC端多包一层data导致的多端兼容性问题
 */
- (NSDictionary *)formatCallbackResponse:(NSString *)apiType data:(id)data success:(BOOL)success errorMessage:(NSString *)errorMessage {
    if (!errorMessage) {
        errorMessage = @"";
    }
    
    id formattedData = nil;
    
    if ([apiType isEqualToString:@"showModal"]) {
        // showModal类型：JavaScript端期望 {confirm: true/false, cancel: true/false}
        formattedData = @{
            @"confirm": data[@"confirm"] ?: @"false",
            @"cancel": data[@"cancel"] ?: @"false"
        };
    } else if ([apiType isEqualToString:@"showActionSheet"]) {
        // showActionSheet类型：JavaScript端期望 {tapIndex: number}
        formattedData = @{
            @"tapIndex": data[@"tapIndex"] ?: @(-1)
        };
    } else if ([apiType isEqualToString:@"fancySelect"] || [apiType isEqualToString:@"areaSelect"]) {
        // 选择器类型：JavaScript端期望 {value: string, code: string}
        formattedData = @{
            @"value": data[@"value"] ?: @"",
            @"code": data[@"code"] ?: @""
        };
    } else if ([apiType isEqualToString:@"chooseFile"]) {
        // 文件选择类型：JavaScript端期望文件列表数组
        formattedData = data ?: @[];
    } else if ([apiType isEqualToString:@"getLocation"]) {
        // 定位类型：JavaScript端期望 {latitude: number, longitude: number, city: string}
        formattedData = @{
            @"latitude": data[@"lat"] ?: @(0),
            @"longitude": data[@"lng"] ?: @(0),
            @"city": data[@"city"] ?: @"",
            @"address": data[@"address"] ?: @""
        };
    } else if ([apiType isEqualToString:@"hasWx"] || [apiType isEqualToString:@"isiPhoneX"]) {
        // 状态查询类型：JavaScript端期望 {status: number}
        formattedData = @{
            @"status": data[@"status"] ?: @(0)
        };
    } else if ([apiType isEqualToString:@"nativeGet"]) {
        // nativeGet特殊处理，data字段包含实际内容
        formattedData = data ?: @"";
    } else if ([apiType isEqualToString:@"request"]) {
        // request类型：应用层期望res.data.code，需要额外嵌套一层data
        if ([data isKindOfClass:[NSDictionary class]]) {
            // 获取服务器code值，确保类型正确
            NSNumber *serverCode = [data objectForKey:@"code"];
            NSString *codeString = @"0"; // 默认成功
            
            if (!success) {
                // 如果不成功，使用服务器返回的code
                if (serverCode) {
                    codeString = [serverCode stringValue];
                } else {
                    codeString = @"-1";
                }
            }
            
            // 构造应用层期望的格式，需要嵌套data字段
            formattedData = @{
                @"data": @{
                    @"code": codeString,
                    @"data": [data objectForKey:@"data"] ?: @{},
                    @"errorMessage": [data objectForKey:@"errorMessage"] ?: @""
                }
            };
        } else {
            formattedData = @{
                @"data": @{
                    @"code": success ? @"0" : @"-1",
                    @"data": @{},
                    @"errorMessage": @""
                }
            };
        }
    } else {
        // 其他类型：保持原始数据
        formattedData = data ?: @{};
    }
    
    // 统一返回格式：{success: boolean, data: object, errorMessage: string}
    // 这样JavaScript端的 backData.data 就能正确获取到数据
    // 注意：JavaScript端期望success是字符串"true"/"false"
    return @{
        @"success": success ? @"true" : @"false",
        @"data": formattedData,
        @"errorMessage": errorMessage
    };
}

@end

