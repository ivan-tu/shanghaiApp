//
//  WKWebView+XZAddition.h
//  XZVientiane
//
//  Created by System on 2024/12/19.
//  Copyright © 2024年 TuWeiA. All rights reserved.
//

#import <WebKit/WebKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface WKWebView (XZAddition)

/**
 * 调用JavaScript方法的统一接口
 * @param function 要调用的JavaScript函数名
 * @param data 传递给JavaScript的数据
 * @return 返回调用所需的参数字典
 */
+ (NSDictionary *)objcCallJsWithFn:(NSString *)function data:(nullable id)data;

/**
 * 调用JavaScript loadPage方法的参数组装
 * @param html 要加载的HTML代码
 * @param url 当前网址
 * @param data 请求数据
 * @return 调用loadPage所需的参数字典
 */
+ (NSDictionary *)objcCallJsLoadPageParamWithHtml:(NSString *)html 
                                               url:(NSString *)url 
                                       requestData:(nullable id)data;

/**
 * 持久化Cookie到UserDefaults
 */
+ (void)saveCookiesToUserDefaults;

/**
 * 从UserDefaults加载Cookie
 */
+ (void)loadCookies;

/**
 * 清除所有Cookie
 */
+ (void)clearAllCookies;

/**
 * 通过JavaScript操作Cookie
 * @param cookieDic Cookie信息字典
 * @param path Cookie路径
 */
+ (void)cookieJSOperateCookie:(NSDictionary *)cookieDic path:(NSString *)path;

/**
 * 异步执行JavaScript代码
 * @param script JavaScript代码
 * @param completion 完成回调
 */
- (void)safeEvaluateJavaScript:(NSString *)script completion:(nullable void (^)(id _Nullable result, NSError * _Nullable error))completion;

/**
 * 设置User-Agent
 * @param userAgent 自定义User-Agent字符串
 */
- (void)setCustomUserAgent:(NSString *)userAgent;

@end

NS_ASSUME_NONNULL_END 