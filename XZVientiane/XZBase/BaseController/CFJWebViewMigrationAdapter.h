//
//  CFJWebViewMigrationAdapter.h
//  XZVientiane
//
//  Created by System on 2024/12/19.
//  Copyright © 2024年 TuWeiA. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "XZWKWebViewBaseController.h"

NS_ASSUME_NONNULL_BEGIN

/**
 * CFJWebView迁移适配器
 * 提供从UIWebView到WKWebView的兼容性支持
 * 帮助现有代码平滑过渡到新的WKWebView架构
 */
@interface CFJWebViewMigrationAdapter : NSObject

/**
 * 将WebViewJavascriptBridge的响应回调转换为WKWebView的回调格式
 * @param bridgeCallback 原始的WebViewJavascriptBridge回调
 * @return 新的WKWebView回调格式
 */
+ (XZWebViewJSCallbackBlock)adaptBridgeCallback:(id)bridgeCallback;

/**
 * 将UIWebView的JavaScript执行方法适配到WKWebView
 * @param webView WKWebView实例
 * @param script JavaScript代码
 * @param completion 完成回调
 */
+ (void)evaluateJavaScript:(NSString *)script 
                 inWebView:(WKWebView *)webView 
                completion:(nullable void (^)(id _Nullable result, NSError * _Nullable error))completion;

/**
 * 适配UIWebView的Cookie操作到WKWebView
 * @param cookieDict Cookie字典
 * @param completion 完成回调
 */
+ (void)setCookieFromDictionary:(NSDictionary *)cookieDict 
                     completion:(nullable void (^)(BOOL success))completion;

/**
 * 获取当前所有Cookie
 * @param completion 完成回调，返回Cookie数组
 */
+ (void)getAllCookies:(void (^)(NSArray<NSHTTPCookie *> *cookies))completion;

/**
 * 清理指定域名的Cookie
 * @param domain 域名
 * @param completion 完成回调
 */
+ (void)clearCookiesForDomain:(NSString *)domain 
                   completion:(nullable void (^)(void))completion;

/**
 * 适配UIWebView的User-Agent设置
 * @param userAgent User-Agent字符串
 * @param webView WKWebView实例
 */
+ (void)setUserAgent:(NSString *)userAgent forWebView:(WKWebView *)webView;

/**
 * 适配UIWebView的滚动位置设置
 * @param webView WKWebView实例
 * @param point 滚动位置
 * @param animated 是否动画
 */
+ (void)setScrollPosition:(CGPoint)point 
                inWebView:(WKWebView *)webView 
                 animated:(BOOL)animated;

/**
 * 适配UIWebView的缩放设置
 * @param webView WKWebView实例
 * @param scale 缩放比例
 * @param animated 是否动画
 */
+ (void)setZoomScale:(CGFloat)scale 
           inWebView:(WKWebView *)webView 
            animated:(BOOL)animated;

/**
 * 检查WKWebView是否支持特定功能
 * @param feature 功能名称
 * @return 是否支持
 */
+ (BOOL)isFeatureSupported:(NSString *)feature;

/**
 * 获取WKWebView的版本信息
 * @return 版本字符串
 */
+ (NSString *)webViewVersion;

@end

NS_ASSUME_NONNULL_END 