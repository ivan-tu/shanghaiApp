//
//  AppDelegate.m
//  XZVientiane
//
//  Created by 崔逢举 on 2018/7/29.
//  Copyright © 2018年 崔逢举. All rights reserved.
//

#import "AppDelegate.h"
#import "TCConfig.h"
#import "LoadingView.h"
#import "XZTabBarController.h"
#import "CFJWebViewBaseController.h"
#import "PublicSettingModel.h"
#import "ClientSettingModel.h"
// 友盟分享相关导入 - 使用正确路径
#import <UMShare/UMShare.h>
#import <UMShare/UMSociallogMacros.h>
#import <UMShare/UMSocialManager.h>
#import <UMShare/UMSocialGlobal.h>
// 创建缺失的头文件或跳过不存在的
// #import "NSUserDefaults+XZUserDefaults.h"  // 如果不存在可以暂时注释
// #import "XZUserDefaultFastDefine.h"        // 如果不存在可以暂时注释
#import "NetworkNoteViewController.h"
#import "WXApi.h"
// 修正支付宝SDK导入
#import <AlipaySDK/AlipaySDK.h>
// 修正为系统框架导入
#import <CoreTelephony/CTCellularData.h>
// 删除重复导入，已通过UserNotifications框架导入
// #import "UNUserNotificationCenter.h"
#import "UMCommon/UMCommon.h"
// 友盟推送相关导入 - 使用新版本UMPush
#import <UMPush/UMessage.h>
// #import "UMCommonLog/UMCommonLogMacros.h"  // 如果路径不对可以注释
// #import "UMCommonLog/UMCommonLogManager.h" // 如果路径不对可以注释  
// 修正HybridManager导入路径
#import <HybridSDK/HybridManager.h>
#import "Reachability.h"
#import "JHSysAlertUtil.h"
#import <UserNotifications/UserNotifications.h>
// 添加SAMKeychain导入
#import <SAMKeychain/SAMKeychain.h>
// 添加高德地图相关导入
#import <AMapFoundationKit/AMapFoundationKit.h>
#import <AMapLocationKit/AMapLocationKit.h>

@interface AppDelegate () <WXApiDelegate,UNUserNotificationCenterDelegate>

@property (strong, nonatomic) Reachability *reachability;
@property (strong, nonatomic) AFNetworkReachabilityManager *internetReachability;
@property (strong, nonatomic) XZTabBarController *tabbarVC;
@property (strong, nonatomic) NSDictionary *dataDic;
@property (strong, nonatomic) NSDictionary *appInfoDic;
@property (assign, nonatomic) BOOL mallConfigModel;
@property (assign, nonatomic) UIBackgroundTaskIdentifier backgroundTaskIdentifier;
// 高德定位管理器
@property (strong, nonatomic) AMapLocationManager *locationManager;

@end

@implementation AppDelegate

- (NSDictionary *)appInfoDic {
    if (_appInfoDic == nil) {
        _appInfoDic = [NSDictionary dictionary];
    }
    return _appInfoDic;
}

- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
    [self.internetReachability stopMonitoring];
}

- (void)addNotif {
    WEAK_SELF;
    [[NSNotificationCenter defaultCenter] addObserverForName:@"RerequestData" object:nil queue:[NSOperationQueue mainQueue] usingBlock:^(NSNotification * _Nonnull note) {
        STRONG_SELF;
        if (self.internetReachability.networkReachabilityStatus == AFNetworkReachabilityStatusNotReachable) {
            return ;
        }
        [self downloadManifestAppsource];
    }];
}

- (AFNetworkReachabilityManager *)internetReachability {
    if (_internetReachability == nil) {
        _internetReachability = [AFNetworkReachabilityManager manager];
    }
    return _internetReachability;
}

- (Reachability *)reachability {
    if (_reachability == nil) {
        _reachability = [Reachability reachabilityForInternetConnection];
    }
    return _reachability;
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    [self.reachability startNotifier];
    //1.获取网络权限 根绝权限进行人机交互
    if (__IPHONE_10_0 && !TARGET_IPHONE_SIMULATOR) {
        [self networkStatus:application didFinishLaunchingWithOptions:launchOptions];
    } else {
        //2.2已经开启网络权限 监听网络状态
        [self addReachabilityManager:application didFinishLaunchingWithOptions:launchOptions];
    }
    
    //初始化配置数据
    [self locAppInfoData];
    self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
    self.window.backgroundColor = [UIColor whiteColor];
    [self.window makeKeyAndVisible];
    
    if (self.internetReachability.networkReachabilityStatus == AFNetworkReachabilityStatusNotReachable) {
        [JHSysAlertUtil presentAlertViewWithTitle:@"网络异常" message:@"您的网络出现异常，请检查您的网络" confirmTitle:@"确定" handler:nil];
        NetworkNoteViewController *networkVC = [[NetworkNoteViewController alloc] init];
        self.window.rootViewController = networkVC;
        return YES;
    }
    LoadingView *loadingView = [[LoadingView alloc] initWithFrame:[UIApplication sharedApplication].keyWindow.bounds];
    loadingView.tag = 2001;
    [[UIApplication sharedApplication].keyWindow addSubview:loadingView];
    self.tabbarVC = [[XZTabBarController alloc] initWithNibName:nil bundle:nil];
    self.window.rootViewController = self.tabbarVC;
    return YES;
}

- (void)downloadManifestAppsource {
    NSLog(@"CFJClientH5Controller - downloadManifestAppsource 开始");
    if (![[UIApplication sharedApplication].keyWindow viewWithTag:2001]) {
        LoadingView *loadingView = [[LoadingView alloc] initWithFrame:[UIApplication sharedApplication].keyWindow.bounds];
        loadingView.tag = 2001;
        [[UIApplication sharedApplication].keyWindow addSubview:loadingView];
    }
    [self getAppInfo];
}


#pragma mark ----首次进入获取定位
- (void)getCurrentPosition {
    // 带逆地理信息的一次定位（返回坐标和地址信息）
    self.locationManager = [[AMapLocationManager alloc] init];
    // 带逆地理信息的一次定位（返回坐标和地址信息）
    [self.locationManager setDesiredAccuracy:kCLLocationAccuracyHundredMeters];
    //   定位超时时间，最低2s，此处设置为2s
    self.locationManager.locationTimeout = 2;
    //   逆地理请求超时时间，最低2s，此处设置为2s
    self.locationManager.reGeocodeTimeout = 2;
    [self.locationManager requestLocationWithReGeocode:YES completionBlock:^(CLLocation *location, AMapLocationReGeocode *regeocode, NSError *error) {
        if (error) {
            NSLog(@"locError:{%ld - %@};", (long)error.code, error.localizedDescription);
            
            if (error.code == AMapLocationErrorLocateFailed) {
                return;
            }
        }
        NSLog(@"location:%@", location);
        
        if (regeocode) {
            NSLog(@"reGeocode:%@", regeocode);
        }
        CLLocationCoordinate2D coordinate = location.coordinate;
        NSUserDefaults *Defaults = [NSUserDefaults standardUserDefaults];
        if (coordinate.latitude == 0 && coordinate.longitude == 0) {
            [Defaults setObject:@(0) forKey:@"currentLat"];
            [Defaults setObject:@(0) forKey:@"currentLng"];
            [Defaults setObject:@"请选择" forKey:@"currentCity"];
            [Defaults setObject:@"请选择" forKey:@"currentAddress"];
            return;
        }
        [Defaults setObject:@(coordinate.latitude) forKey:@"currentLat"];
        [Defaults setObject:@(coordinate.longitude) forKey:@"currentLng"];
        // 安全处理regeocode为nil的情况
        NSString *cityName = (regeocode && regeocode.POIName.length > 0) ? regeocode.POIName : @"请选择";
        NSString *addressName = (regeocode && regeocode.formattedAddress.length > 0) ? regeocode.formattedAddress : @"请选择";
        [Defaults setObject:cityName forKey:@"currentCity"];
        [Defaults setObject:addressName forKey:@"currentAddress"];

        [Defaults synchronize];
    }];
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
    NSLog(@"%s", __func__);
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo {
    NSLog(@"%s", __func__);
    
    // 友盟推送 - 处理远程通知
    [UMessage didReceiveRemoteNotification:userInfo];
    
    //    if(![[userInfo class] isSubclassOfClass:[NSDictionary class]] || ![userInfo objectForKey:@"extra"]) {
    //        return;
    //    }
    //    NSString *extraStr = [userInfo objectForKey:@"extra"];
    //    NSDictionary *extraDic = [NSJSONSerialization JSONObjectWithData:[extraStr dataUsingEncoding:NSUTF8StringEncoding] options:NSJSONReadingMutableLeaves error:nil];
    //    NSDictionary *data = @{
    //                           @"id": [extraDic objectForKey:@"id"],
    //                           @"content": [extraDic objectForKey:@"content"],
    //                           @"title": [extraDic objectForKey:@"title"],
    //                           @"addtime": [extraDic objectForKey:@"addtime"],
    //                           @"url": [extraDic objectForKey:@"url"]
    //                           };
    //    NSDictionary *dataDic = @{
    //                              @"num": @(1),
    //                              @"type": [extraDic objectForKey:@"type"],
    //                              @"data": data
    //                              };
    //    NSDictionary *dic = @{
    //                          @"action": @"noticemsg_addMsg",
    //                          @"data": dataDic
    //                          };
}

- (void)applicationWillResignActive:(UIApplication *)application {
}

//app将要进入前台
- (void)applicationWillEnterForeground:(UIApplication *)application {
    [[UIApplication sharedApplication] endBackgroundTask: self.backgroundTaskIdentifier];

//    [ManageCenter requestMessageNumber:^(id aResponseObject, NSError *anError) {
//        [[NSNotificationCenter defaultCenter] postNotificationName:@"changeMessageNum" object:nil];
//    }];
}


//app进入后台
- (void)applicationDidEnterBackground:(UIApplication *)application {
    NSInteger num = [[NSUserDefaults standardUserDefaults] integerForKey:@"clinetMessageNum"];
    [UIApplication sharedApplication].applicationIconBadgeNumber = num;
    self.backgroundTaskIdentifier = [[UIApplication sharedApplication] beginBackgroundTaskWithName:@"deleyTimeTask" expirationHandler:^{
        if (self.backgroundTaskIdentifier != UIBackgroundTaskInvalid) {
            [[UIApplication sharedApplication] endBackgroundTask:self.backgroundTaskIdentifier];
            self.backgroundTaskIdentifier = UIBackgroundTaskInvalid;
        }
     }];
}


- (void)applicationDidBecomeActive:(UIApplication *)application {
    
}

- (void)applicationWillTerminate:(UIApplication *)application {
    NSInteger num = [[NSUserDefaults standardUserDefaults] integerForKey:@"clinetMessageNum"];
    [UIApplication sharedApplication].applicationIconBadgeNumber = num;
}

// 在 iOS8 系统中，还需要添加这个方法。通过新的 API 注册推送服务
- (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings {
    [application registerForRemoteNotifications];
}

- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
    // 友盟推送 - 注册设备Token
    [UMessage registerDeviceToken:deviceToken];
    [UMessage setAutoAlert:NO];
    if ([[[UIDevice currentDevice] systemVersion] floatValue] >= 13) {
        if (![deviceToken isKindOfClass:[NSData class]]) {
            //记录获取token失败的描述
            return;
        }
        const unsigned *tokenBytes = (const unsigned *)[deviceToken bytes];
        NSString *strToken = [NSString stringWithFormat:@"%08x%08x%08x%08x%08x%08x%08x%08x",
                              ntohl(tokenBytes[0]), ntohl(tokenBytes[1]), ntohl(tokenBytes[2]),
                              ntohl(tokenBytes[3]), ntohl(tokenBytes[4]), ntohl(tokenBytes[5]),
                              ntohl(tokenBytes[6]), ntohl(tokenBytes[7])];
        NSLog(@"deviceToken1:%@", strToken);
        [[NSUserDefaults standardUserDefaults] setObject:strToken forKey:User_ChannelId];
        [[NSUserDefaults standardUserDefaults] synchronize];
    } else {
        NSString *token = [NSString
                           stringWithFormat:@"%@",deviceToken];
        token = [token stringByReplacingOccurrencesOfString:@"<" withString:@""];
        token = [token stringByReplacingOccurrencesOfString:@">" withString:@""];
        token = [token stringByReplacingOccurrencesOfString:@" " withString:@""];
        NSLog(@"deviceToken2 is: %@", token);
        [[NSUserDefaults standardUserDefaults] setObject:token forKey:User_ChannelId];
        [[NSUserDefaults standardUserDefaults] synchronize];
    }
    
    
//    [ManageCenter requestMessageNumber:^(id aResponseObject, NSError *anError) {
//        [[NSNotificationCenter defaultCenter] postNotificationName:@"changeMessageNum" object:nil];
//    }];
}

- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
    NSLog(@"RegisterForRemoteNotificationsError:%@",error);
}

#pragma mark - 微信QQ授权回调方法 -

-(void) onReq:(BaseReq*)request {
    NSLog(@"微信支付");
}

-(void) onResp:(BaseResp*)response {
    NSLog(@"🔔 [微信回调] 收到响应: %@, 错误码: %d", NSStringFromClass([response class]), response.errCode);
    
    if([response isKindOfClass:[PayResp class]]) {
        PayResp *res = (PayResp *)response;
        NSLog(@"💰 [微信支付回调] 错误码: %d", res.errCode);
        switch (res.errCode) {
            case WXSuccess:
            {
                NSLog(@"✅ [微信支付] 支付成功");
                [[NSNotificationCenter defaultCenter] postNotificationName:@"weixinPay" object:@"true"];
            }
                break;
            default:
            {
                NSLog(@"❌ [微信支付] 支付失败或取消，错误码: %d", res.errCode);
                [[NSNotificationCenter defaultCenter] postNotificationName:@"weixinPay" object:@"false"];
            }
                break;
        }
        return;
    }
    
    // 处理微信分享回调
    if([response isKindOfClass:[SendMessageToWXResp class]]) {
        SendMessageToWXResp *resp = (SendMessageToWXResp *)response;
        NSLog(@"📤 [微信分享回调] 错误码: %d", resp.errCode);
        
        NSString *resultMessage = @"";
        BOOL shareSuccess = NO;
        
        switch (resp.errCode) {
            case WXSuccess:
                NSLog(@"✅ [微信分享] 分享成功");
                resultMessage = @"分享成功";
                shareSuccess = YES;
                break;
            case WXErrCodeCommon:
                NSLog(@"❌ [微信分享] 普通错误类型");
                resultMessage = @"分享失败";
                break;
            case WXErrCodeUserCancel:
                NSLog(@"⚠️ [微信分享] 用户点击取消并返回");
                resultMessage = @"分享已取消";
                break;
            case WXErrCodeSentFail:
                NSLog(@"❌ [微信分享] 发送失败");
                resultMessage = @"分享发送失败";
                break;
            case WXErrCodeAuthDeny:
                NSLog(@"❌ [微信分享] 授权失败");
                resultMessage = @"微信授权失败";
                break;
            case WXErrCodeUnsupport:
                NSLog(@"❌ [微信分享] 微信不支持");
                resultMessage = @"微信版本过低";
                break;
            default:
                NSLog(@"❌ [微信分享] 未知错误，错误码: %d", resp.errCode);
                resultMessage = [NSString stringWithFormat:@"分享失败(%d)", resp.errCode];
                break;
        }
        
        // 发送分享结果通知
        NSDictionary *shareResult = @{
            @"success": shareSuccess ? @"true" : @"false",
            @"errorCode": @(resp.errCode),
            @"errorMessage": resultMessage
        };
        [[NSNotificationCenter defaultCenter] postNotificationName:@"wechatShareResult" object:shareResult];
        return;
    }
    
    NSLog(@"⚠️ [微信回调] 未处理的响应类型: %@", NSStringFromClass([response class]));
}

#pragma mark -  回调

- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options {
    NSLog(@"🔗 [URL回调] 收到URL: %@, scheme: %@, host: %@", url.absoluteString, url.scheme, url.host);
    
    //6.3的新的API调用，是为了兼容国外平台(例如:新版facebookSDK,VK等)的调用[如果用6.2的api调用会没有回调],对国内平台没有影响。
    BOOL result = [[UMSocialManager defaultManager]  handleOpenURL:url options:options];
    
    NSLog(@"📤 [UMSocialManager] 处理结果: %@", result ? @"成功" : @"失败");
    
    if (!result) {
        //银联和支付宝支付返回结果
        if ([url.host isEqualToString:@"safepay"] || [url.host isEqualToString:@"platformapi"] || [url.host isEqualToString:@"uppayresult"]) {
            NSLog(@"💳 [支付回调] 检测到支付相关URL");
            [[NSNotificationCenter defaultCenter] postNotificationName:@"payresultnotif" object:url];
            return YES;
        }
        else if ( [url.host isEqualToString:@"pay"]) {
            NSLog(@"💰 [微信支付] 检测到微信支付回调");
            return [WXApi handleOpenURL:url delegate:self];
        }
        
    }
    NSDictionary *dic = @{
        @"result" : @(result),
        @"urlhost" : url.host ? url.host : @"",
    };
    NSLog(@"📢 [通知发送] 发送分享结果通知: %@", dic);
    [[NSNotificationCenter defaultCenter] postNotificationName:@"shareresultnotif" object:dic];
    return result;
}


- (void)getAppInfo {
    NSLog(@"CFJClientH5Controller - getAppInfo 开始");
    //标明是否带底部当好条
    [[NSUserDefaults standardUserDefaults] setBool:NO forKey:@"NoTabBar"];
    [[NSUserDefaults standardUserDefaults] synchronize];
    
    [self reloadByTabbarController];
}

//获取分享和推送的设置信息
- (void)getSharePushInfo {
    NSData *JSONData = [NSData dataWithContentsOfFile:[[NSBundle mainBundle] pathForResource:@"shareInfo" ofType:@"json"]];
    NSDictionary *dataDic = [NSJSONSerialization JSONObjectWithData:JSONData options:NSJSONReadingAllowFragments error:nil];
    self.dataDic = [dataDic objectForKey:@"data"];
    [self publicSetting:self.dataDic];
}

- (void)reloadByTabbarController {
    NSLog(@"CFJClientH5Controller - reloadByTabbarController 开始");
    dispatch_async(dispatch_get_global_queue(0, 0), ^(void) {
        dispatch_async(dispatch_get_main_queue(), ^(void) {
            [self.tabbarVC reloadTabbarInterface];
        });
    });
}
//给分享、支付所有的账号赋值
- (void)publicSetting:(NSDictionary *)dic {
    [[PublicSettingModel sharedInstance] setAppSiteId:[ClientSettingModel sharedInstance].AppSiteId];
    if (![[dic class] isSubclassOfClass:[NSDictionary class]]) {
        return;
    }
    [[PublicSettingModel sharedInstance] setUmeng_appkey:[dic objectForKey:@"pushAppKey"]];
    [[PublicSettingModel sharedInstance] setWeiBo_AppKey:[dic objectForKey:@"wbAppId"]];
    [[PublicSettingModel sharedInstance] setWeiBo_AppSecret:[dic objectForKey:@"wbAppScret"]];
    [[PublicSettingModel sharedInstance] setWeiBo_URL:[dic objectForKey:@"wbUrl"]];
    NSString *wxAppId ;
    if ([dic objectForKey:@"wxAppId"]) {
        wxAppId = [dic objectForKey:@"wxAppId"];
    }
    if (!wxAppId || wxAppId.length == 0) {
        wxAppId = [[dic objectForKey:@"wxpayApp"] objectForKey:@"APPID"];
    }
    NSString *wxAppSecret ;
    if ([dic objectForKey:@"wxAppScret"]) {
        wxAppSecret = [dic objectForKey:@"wxAppScret"];
    }
    if (!wxAppSecret || wxAppSecret.length == 0) {
        wxAppSecret = [[dic objectForKey:@"wxpayApp"] objectForKey:@"APPID"];
    }
    [[PublicSettingModel sharedInstance] setWeiXin_AppID:wxAppId];
    [[PublicSettingModel sharedInstance] setWeiXin_AppSecret:wxAppSecret];
    
    NSDictionary *payDic = [dic objectForKey:@"wxpayApp"];
    [[PublicSettingModel sharedInstance] setWeiXin_Key:[payDic objectForKey:@"KEY"]];
    [[PublicSettingModel sharedInstance] setWeiXin_Partnerid:[payDic objectForKey:@"MCHID"]];
    
    [[PublicSettingModel sharedInstance] setQq_AppId:[dic objectForKey:@"qqAppId"]];
    [[PublicSettingModel sharedInstance] setQq_AppKey:[dic objectForKey:@"qqAppScret"]];
    
    [self socialShare];
}

- (void)socialShare {
    //设置友盟社会化组件appkey
    NSString *UMENG_APPKEY = [[PublicSettingModel sharedInstance] umeng_appkey];
    //友盟推送  如果分享应用和推送应用是一个，则注册的appkey是一样的
    if (UMENG_APPKEY && UMENG_APPKEY.length > 0) {
        // 友盟推送初始化 - 使用新版本API
        [UMessage registerForRemoteNotificationsWithLaunchOptions:nil Entity:nil completionHandler:^(BOOL granted, NSError * _Nullable error) {
        if (granted) {
            NSLog(@"友盟推送注册成功");
        } else {
            NSLog(@"友盟推送注册失败: %@", error);
        }
    }];
        [UMConfigure initWithAppkey:UMENG_APPKEY channel:@"App Store"];
        
        //iOS10必须加下面这段代码。
        UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
        center.delegate=self;
        UNAuthorizationOptions types10=UNAuthorizationOptionBadge|UNAuthorizationOptionAlert|UNAuthorizationOptionSound;
        [center requestAuthorizationWithOptions:types10 completionHandler:^(BOOL granted, NSError * _Nullable error) {
            if (granted) {
                //点击允许
            } else {
                //点击不允许
            }
        }];
        //如果你期望使用交互式(只有iOS 8.0及以上有)的通知，请参考下面注释部分的初始化代码
        UIMutableUserNotificationAction *action1 = [[UIMutableUserNotificationAction alloc] init];
        action1.identifier = @"action1_identifier";
        action1.title=@"打开应用";
        action1.activationMode = UIUserNotificationActivationModeForeground;//当点击的时候启动程序
        
        UIMutableUserNotificationAction *action2 = [[UIMutableUserNotificationAction alloc] init];  //第二按钮
        action2.identifier = @"action2_identifier";
        action2.title=@"忽略";
        action2.activationMode = UIUserNotificationActivationModeBackground;//当点击的时候不启动程序，在后台处理
        action2.authenticationRequired = YES;//需要解锁才能处理，如果action.activationMode = UIUserNotificationActivationModeForeground;则这个属性被忽略；
        action2.destructive = YES;
        UIMutableUserNotificationCategory *actionCategory1 = [[UIMutableUserNotificationCategory alloc] init];
        actionCategory1.identifier = @"category1";//这组动作的唯一标示
        [actionCategory1 setActions:@[action1,action2] forContext:(UIUserNotificationActionContextDefault)];
        NSSet *categories = [NSSet setWithObjects:actionCategory1, nil];
        
        // iOS 10+通知分类配置（项目最低支持iOS 15.0，无需iOS 8兼容）
        UNNotificationAction *tenaction1 = [UNNotificationAction actionWithIdentifier:@"tenaction1_identifier" title:@"打开应用" options:UNNotificationActionOptionForeground];
        
        UNNotificationAction *tenaction2 = [UNNotificationAction actionWithIdentifier:@"tenaction2_identifier" title:@"忽略" options:UNNotificationActionOptionForeground];
        
        //UNNotificationCategoryOptionNone
        //UNNotificationCategoryOptionCustomDismissAction  清除通知被触发会走通知的代理方法
        //UNNotificationCategoryOptionAllowInCarPlay       适用于行车模式
        UNNotificationCategory *tencategory1 = [UNNotificationCategory categoryWithIdentifier:@"tencategory1" actions:@[tenaction2,tenaction1]   intentIdentifiers:@[] options:UNNotificationCategoryOptionCustomDismissAction];
        NSSet *tencategories = [NSSet setWithObjects:tencategory1, nil];
        [center setNotificationCategories:tencategories];
        //        UIUserNotificationSettings *userSettings = [UIUserNotificationSettings settingsForTypes:UIUserNotificationTypeBadge|UIUserNotificationTypeSound|UIUserNotificationTypeAlert categories:nil];
        //        [UMessage registerRemoteNotificationAndUserNotificationSettings:userSettings];
#if DEBUG
        // 友盟推送调试日志 - 新版本SDK通过UMConfigure统一管理日志
        // [UMessage setLogEnabled:YES]; // 此方法在新版本SDK中已移除
#endif
    }
    if (UMENG_APPKEY) {
        [UMConfigure initWithAppkey:UMENG_APPKEY channel:@"App Store"];
    }
    //打开调试log的开关
#if DEBUG
    [UMConfigure setLogEnabled:YES];
#endif
    //设置微信AppId，设置分享url，默认使用友盟的网址
    [UMSocialGlobal shareInstance].universalLinkDic = @{@(UMSocialPlatformType_WechatSession):@"https://hi3.tuiya.cc/",
                                                        @(UMSocialPlatformType_QQ):@""
    };
    [[UMSocialManager defaultManager] setPlaform:UMSocialPlatformType_WechatSession appKey:[[PublicSettingModel sharedInstance] weiXin_AppID] appSecret:[[PublicSettingModel sharedInstance] weiXin_AppSecret] redirectURL:nil];
    
    [WXApi registerApp:[[PublicSettingModel sharedInstance] weiXin_AppID] universalLink:@"https://hi3.tuiya.cc/"];
    
    // 打开新浪微博的SSO开关
    [[UMSocialManager defaultManager] setPlaform:UMSocialPlatformType_Sina appKey:[[PublicSettingModel sharedInstance] weiBo_AppKey] appSecret:[[PublicSettingModel sharedInstance] weiBo_AppSecret] redirectURL:@"https://sns.whalecloud.com/sina2/callback"];
    
    //设置分享到QQ空间的应用Id，和分享url 链接
    [[UMSocialManager defaultManager] setPlaform:UMSocialPlatformType_QQ appKey:[[PublicSettingModel sharedInstance] qq_AppId]/*设置QQ平台的appID*/  appSecret:nil redirectURL:nil];
    
}

//iOS10新增：处理前台收到通知的代理方法
-(void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler API_AVAILABLE(ios(10.0)){
    NSDictionary * userInfo = notification.request.content.userInfo;
    if([notification.request.trigger isKindOfClass:[UNPushNotificationTrigger class]]) {
        //应用处于前台时的远程推送接受
        //关闭友盟自带的弹出框
        [UMessage setAutoAlert:NO];
        //必须加这句代码
        [UMessage didReceiveRemoteNotification:userInfo];
        NSDictionary *aps = [userInfo valueForKey:@"aps"];
        NSInteger num = [[aps valueForKey:@"badge"] integerValue];
        [[NSUserDefaults standardUserDefaults] setInteger:num forKey:@"clinetMessageNum"];
        [[NSUserDefaults standardUserDefaults]synchronize];
        [[NSNotificationCenter defaultCenter] postNotificationName:@"changeMessageNum" object:nil];
    } else{
        //应用处于前台时的本地推送接受
    }
    //当应用处于前台时提示设置，需要哪个可以设置哪一个
    completionHandler(UNNotificationPresentationOptionSound|UNNotificationPresentationOptionBadge|UNNotificationPresentationOptionAlert);
}

//iOS10新增：处理后台点击通知的代理方法
-(void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)(void))completionHandler API_AVAILABLE(ios(10.0)){
    NSDictionary * userInfo = response.notification.request.content.userInfo;
    if([response.notification.request.trigger isKindOfClass:[UNPushNotificationTrigger class]]) {
        //应用处于后台时的远程推送接受
        //必须加这句代码
        [UMessage didReceiveRemoteNotification:userInfo];
        
    } else{
        //应用处于后台时的本地推送接受
    }
    
}

-(BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity restorationHandler:(void (^)(NSArray * _Nullable))restorationHandler{

    NSLog(@"userActivity : %@",userActivity.webpageURL.description);
    return YES;
}

/*
 CTCellularData在iOS9之前是私有类，权限设置是iOS10开始的，所以App Store审核没有问题
 获取网络权限状态
 */
- (void)networkStatus:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    WEAK_SELF;
    if (@available(iOS 9.0, *)) {
        //2.根据权限执行相应的交互
        CTCellularData *cellularData = [[CTCellularData alloc] init];
        /*
         此函数会在网络权限改变时再次调用
         */
        cellularData.cellularDataRestrictionDidUpdateNotifier = ^(CTCellularDataRestrictedState state) {
            STRONG_SELF;
            switch (state) {
                case kCTCellularDataRestricted:
                    NSLog(@"Restricted");
                    //2.1权限关闭的情况下 再次请求网络数据会弹出设置网络提示
                    if (self.reachability.currentReachabilityStatus == NotReachable) {
                        if (![self isFirstAuthorizationNetwork]) {
                            [JHSysAlertUtil presentAlertViewWithTitle:@"温馨提示" message:@"若要网络功能正常使用,您可以在'设置'中为此应用打开网络权限" cancelTitle:@"设置" defaultTitle:@"好" distinct:NO cancel:^{
                                NSURL *url = [NSURL URLWithString:UIApplicationOpenSettingsURLString];
                                if ([[UIApplication sharedApplication] canOpenURL:url]) {
                                    [[UIApplication sharedApplication] openURL:url];
                                }
                            } confirm:nil];
                        }
                    }
                    else {
                        [self addReachabilityManager:application didFinishLaunchingWithOptions:launchOptions];
                    }
                    break;
                case kCTCellularDataNotRestricted:
                    NSLog(@"NotRestricted");
                {
                    dispatch_async(dispatch_get_main_queue(), ^{
                        //2.2已经开启网络权限 监听网络状态
                        [self addReachabilityManager:application didFinishLaunchingWithOptions:launchOptions];
                    });
                }
                    break;
                case kCTCellularDataRestrictedStateUnknown:
                    
                    NSLog(@"Unknown");
                    //2.3未知情况 （还没有遇到推测是有网络但是连接不正常的情况下）
                    [self getAppInfo];
                    break;
                    
                default:
                    break;
            }
        };
    }
    
}

/**
 实时检查当前网络状态
 */
- (void)addReachabilityManager:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    
    //这个可以放在需要侦听的页面
    //    [[NSNotificationCenter defaultCenter]addObserver:self selector:@selector(afNetworkStatusChanged:) name:AFNetworkingReachabilityDidChangeNotification object:nil];
    WEAK_SELF;
    [self.internetReachability setReachabilityStatusChangeBlock:^(AFNetworkReachabilityStatus status) {
        STRONG_SELF;
        switch (status) {
            case AFNetworkReachabilityStatusNotReachable:{
                NSLog(@"网络不通：%@",@(status) );
                [self getInfo_application:application didFinishLaunchingWithOptions:launchOptions];
                break;
            }
            case AFNetworkReachabilityStatusReachableViaWiFi:{
                NSLog(@"网络通过WIFI连接：%@",@(status));
                if (!self.mallConfigModel) {
                    [self getInfo_application:application didFinishLaunchingWithOptions:launchOptions];
                }
                break;
            }
            case AFNetworkReachabilityStatusReachableViaWWAN:{
                NSLog(@"网络通过无线连接：%@",@(status) );
                if (!self.mallConfigModel) {
                    [self getInfo_application:application didFinishLaunchingWithOptions:launchOptions];
                }
                break;
            }
            default:
                break;
        }
    }];
    [self.internetReachability startMonitoring];  //开启网络监视器；
}

- (void)getInfo_application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    self.mallConfigModel = YES;
    //获取初始信息
    [self initData];
    WEAK_SELF;
    dispatch_async(dispatch_get_global_queue(0, 0), ^{
        STRONG_SELF;
        //第三方库初始化
        [self initValueThirdParty:application didFinishLaunchingWithOptions:launchOptions];
    });
    //添加通知
    [self addNotif];
}

- (void)initValueThirdParty:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    //高德地图
    // 设置隐私政策配置 - 解决AMapFoundationErrorPrivacyShowUnknow错误
    [AMapServices sharedServices].enableHTTPS = YES;
    // 设置隐私权政策同意状态，这里设置为已同意
    [[AMapServices sharedServices] setApiKey:@"0d1897e206eeab57b4ab4314249ce201"];
    
    // 使用正确的隐私政策设置API - 必须在AMapLocationManager实例化之前调用
    [AMapLocationManager updatePrivacyShow:AMapPrivacyShowStatusDidShow privacyInfo:AMapPrivacyInfoStatusDidContain];
    [AMapLocationManager updatePrivacyAgree:AMapPrivacyAgreeStatusDidAgree];
    
    [self getCurrentPosition];
    dispatch_async(dispatch_get_main_queue(), ^{
        [self getSharePushInfo];
    });
}

- (void)initData {
    [self localNavSettingData];
}

//解析本地头部导航配置 json文件
- (void)localNavSettingData {
    [self downloadManifestAppsource];
}

//解析本地appinfo json
- (void)locAppInfoData {
    NSData *JSONData = [NSData dataWithContentsOfFile:[[NSBundle mainBundle] pathForResource:@"appInfo" ofType:@"json"]];
    NSDictionary *dataDic = [NSJSONSerialization JSONObjectWithData:JSONData options:NSJSONReadingAllowFragments error:nil];
    self.appInfoDic = dataDic;
}

// MARK: 是否是第一次授权使用网络(针对国行iOS10且需要连接移动网络的设备)
- (BOOL)isFirstAuthorizationNetwork {
    NSString *serviceName = [[NSBundle mainBundle] bundleIdentifier];
    NSString *isFirst = [SAMKeychain passwordForService:serviceName account:kSAMKeychainLabelKey];
    if (! isFirst || isFirst.length < 1) {
        [SAMKeychain setPassword:@"FirstAuthorizationNetwork" forService:serviceName account:kSAMKeychainLabelKey];
        return YES;
    } else {
        return NO;
    }
}


@end


