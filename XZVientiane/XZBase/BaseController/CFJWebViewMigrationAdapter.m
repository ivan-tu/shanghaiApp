//
//  CFJWebViewMigrationAdapter.m
//  XZVientiane
//
//  Created by System on 2024/12/19.
//  Copyright © 2024年 TuWeiA. All rights reserved.
//

#import "CFJWebViewMigrationAdapter.h"
#import <WebKit/WebKit.h>

@implementation CFJWebViewMigrationAdapter

#pragma mark - Bridge Callback Adaptation

+ (XZWebViewJSCallbackBlock)adaptBridgeCallback:(id)bridgeCallback {
    if (!bridgeCallback) {
        return nil;
    }
    
    return ^(id result) {
        // 如果是原始的WebViewJavascriptBridge回调
        if ([bridgeCallback isKindOfClass:NSClassFromString(@"WVJBResponseCallback")]) {
            void (^originalCallback)(id) = bridgeCallback;
            originalCallback(result);
        }
        // 如果是block形式的回调
        else if ([bridgeCallback isKindOfClass:[NSObject class]]) {
            void (^callback)(id) = bridgeCallback;
            callback(result);
        }
    };
}

#pragma mark - JavaScript Execution

+ (void)evaluateJavaScript:(NSString *)script 
                 inWebView:(WKWebView *)webView 
                completion:(void (^)(id _Nullable, NSError * _Nullable))completion {
    if (!script || script.length == 0) {
        if (completion) {
            NSError *error = [NSError errorWithDomain:@"CFJWebViewMigrationAdapter" 
                                                 code:-1 
                                             userInfo:@{NSLocalizedDescriptionKey: @"JavaScript script is empty"}];
            completion(nil, error);
        }
        return;
    }
    
    // 确保在主线程执行
    dispatch_async(dispatch_get_main_queue(), ^{
        [webView evaluateJavaScript:script completionHandler:completion];
    });
}

#pragma mark - Cookie Management

+ (void)setCookieFromDictionary:(NSDictionary *)cookieDict 
                     completion:(void (^)(BOOL))completion {
    if (!cookieDict || cookieDict.count == 0) {
        if (completion) completion(NO);
        return;
    }
    
    if (@available(iOS 11.0, *)) {
        WKHTTPCookieStore *cookieStore = [WKWebsiteDataStore defaultDataStore].httpCookieStore;
        
        NSString *name = cookieDict[@"name"];
        NSString *value = cookieDict[@"value"];
        NSString *domain = cookieDict[@"domain"];
        NSString *path = cookieDict[@"path"] ?: @"/";
        
        if (!name || !value || !domain) {
            if (completion) completion(NO);
            return;
        }
        
        NSMutableDictionary *cookieProperties = [NSMutableDictionary dictionary];
        [cookieProperties setValue:name forKey:NSHTTPCookieName];
        [cookieProperties setValue:value forKey:NSHTTPCookieValue];
        [cookieProperties setValue:domain forKey:NSHTTPCookieDomain];
        [cookieProperties setValue:path forKey:NSHTTPCookiePath];
        
        // 设置过期时间
        if (cookieDict[@"expires"]) {
            NSDate *expiresDate = cookieDict[@"expires"];
            if ([expiresDate isKindOfClass:[NSNumber class]]) {
                NSTimeInterval interval = [(NSNumber *)expiresDate doubleValue];
                expiresDate = [NSDate dateWithTimeIntervalSinceNow:interval];
            }
            [cookieProperties setValue:expiresDate forKey:NSHTTPCookieExpires];
        }
        
        // 设置安全属性
        if ([cookieDict[@"secure"] boolValue]) {
            [cookieProperties setValue:@YES forKey:NSHTTPCookieSecure];
        }
        
        if ([cookieDict[@"httpOnly"] boolValue]) {
            [cookieProperties setValue:@YES forKey:NSHTTPCookieHttpOnly];
        }
        
        NSHTTPCookie *cookie = [NSHTTPCookie cookieWithProperties:cookieProperties];
        if (cookie) {
            [cookieStore setCookie:cookie completionHandler:^{
                if (completion) completion(YES);
            }];
        } else {
            if (completion) completion(NO);
        }
    } else {
        // iOS 11以下版本的兼容处理
        if (completion) completion(NO);
    }
}

+ (void)getAllCookies:(void (^)(NSArray<NSHTTPCookie *> *))completion {
    if (!completion) return;
    
    if (@available(iOS 11.0, *)) {
        WKHTTPCookieStore *cookieStore = [WKWebsiteDataStore defaultDataStore].httpCookieStore;
        [cookieStore getAllCookies:completion];
    } else {
        // iOS 11以下版本的兼容处理
        NSArray *cookies = [[NSHTTPCookieStorage sharedHTTPCookieStorage] cookies];
        completion(cookies);
    }
}

+ (void)clearCookiesForDomain:(NSString *)domain 
                   completion:(void (^)(void))completion {
    if (!domain || domain.length == 0) {
        if (completion) completion();
        return;
    }
    
    if (@available(iOS 11.0, *)) {
        WKHTTPCookieStore *cookieStore = [WKWebsiteDataStore defaultDataStore].httpCookieStore;
        [cookieStore getAllCookies:^(NSArray<NSHTTPCookie *> *cookies) {
            dispatch_group_t group = dispatch_group_create();
            
            for (NSHTTPCookie *cookie in cookies) {
                if ([cookie.domain isEqualToString:domain] || 
                    [cookie.domain hasSuffix:domain]) {
                    dispatch_group_enter(group);
                    [cookieStore deleteCookie:cookie completionHandler:^{
                        dispatch_group_leave(group);
                    }];
                }
            }
            
            dispatch_group_notify(group, dispatch_get_main_queue(), ^{
                if (completion) completion();
            });
        }];
    } else {
        // iOS 11以下版本的兼容处理
        NSHTTPCookieStorage *cookieStorage = [NSHTTPCookieStorage sharedHTTPCookieStorage];
        NSArray *cookies = [cookieStorage cookies];
        
        for (NSHTTPCookie *cookie in cookies) {
            if ([cookie.domain isEqualToString:domain] || 
                [cookie.domain hasSuffix:domain]) {
                [cookieStorage deleteCookie:cookie];
            }
        }
        
        if (completion) completion();
    }
}

#pragma mark - User Agent Management

+ (void)setUserAgent:(NSString *)userAgent forWebView:(WKWebView *)webView {
    if (!userAgent || !webView) return;
    
    if (@available(iOS 9.0, *)) {
        webView.customUserAgent = userAgent;
    } else {
        // iOS 9以下版本的兼容处理
        [webView setValue:userAgent forKey:@"applicationNameForUserAgent"];
    }
}

#pragma mark - Scroll and Zoom Management

+ (void)setScrollPosition:(CGPoint)point 
                inWebView:(WKWebView *)webView 
                 animated:(BOOL)animated {
    if (!webView) return;
    
    dispatch_async(dispatch_get_main_queue(), ^{
        [webView.scrollView setContentOffset:point animated:animated];
    });
}

+ (void)setZoomScale:(CGFloat)scale 
           inWebView:(WKWebView *)webView 
            animated:(BOOL)animated {
    if (!webView) return;
    
    dispatch_async(dispatch_get_main_queue(), ^{
        [webView.scrollView setZoomScale:scale animated:animated];
    });
}

#pragma mark - Feature Detection

+ (BOOL)isFeatureSupported:(NSString *)feature {
    if (!feature) return NO;
    
    if ([feature isEqualToString:@"JavaScriptEnabled"]) {
        return YES; // WKWebView默认支持JavaScript
    } else if ([feature isEqualToString:@"CookieStore"]) {
        return @available(iOS 11.0, *);
    } else if ([feature isEqualToString:@"CustomUserAgent"]) {
        return @available(iOS 9.0, *);
    } else if ([feature isEqualToString:@"ContentBlocker"]) {
        return @available(iOS 11.0, *);
    } else if ([feature isEqualToString:@"PictureInPicture"]) {
        return @available(iOS 9.0, *);
    } else if ([feature isEqualToString:@"InlineMediaPlayback"]) {
        return YES;
    }
    
    return NO;
}

+ (NSString *)webViewVersion {
    if (@available(iOS 8.0, *)) {
        return [NSString stringWithFormat:@"WKWebView iOS %@", 
                [[UIDevice currentDevice] systemVersion]];
    } else {
        return @"WKWebView not available";
    }
}

#pragma mark - Utility Methods

+ (NSString *)jsonStringFromObject:(id)object {
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

+ (id)objectFromJSONString:(NSString *)jsonString {
    if (!jsonString || jsonString.length == 0) return nil;
    
    NSData *jsonData = [jsonString dataUsingEncoding:NSUTF8StringEncoding];
    NSError *error;
    id object = [NSJSONSerialization JSONObjectWithData:jsonData 
                                                options:NSJSONReadingMutableContainers 
                                                  error:&error];
    if (error) {
        NSLog(@"JSON deserialization error: %@", error.localizedDescription);
        return nil;
    }
    
    return object;
}

@end 