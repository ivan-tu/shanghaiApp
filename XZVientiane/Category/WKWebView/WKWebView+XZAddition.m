//
//  WKWebView+XZAddition.m
//  XZVientiane
//
//  Created by System on 2024/12/19.
//  Copyright © 2024年 TuWeiA. All rights reserved.
//

#import "WKWebView+XZAddition.h"
#import <objc/runtime.h>

@implementation WKWebView (XZAddition)

#pragma mark - JavaScript Bridge Methods

+ (NSDictionary *)objcCallJsWithFn:(NSString *)function data:(id)data {
    NSMutableDictionary *paramDic = [NSMutableDictionary dictionary];
    [paramDic setValue:function forKey:@"method"];
    
    if (data) {
        [paramDic setValue:data forKey:@"params"];
    }
    
    return [paramDic copy];
}

+ (NSDictionary *)objcCallJsLoadPageParamWithHtml:(NSString *)html url:(NSString *)url requestData:(id)data {
    NSMutableDictionary *paramDic = [NSMutableDictionary dictionary];
    [paramDic setValue:@"loadPage" forKey:@"method"];
    
    NSMutableDictionary *params = [NSMutableDictionary dictionary];
    if (html) {
        [params setValue:html forKey:@"html"];
    }
    if (url) {
        [params setValue:url forKey:@"url"];
    }
    if (data) {
        [params setValue:data forKey:@"data"];
    }
    
    [paramDic setValue:params forKey:@"params"];
    
    return [paramDic copy];
}

#pragma mark - Cookie Management

+ (void)saveCookiesToUserDefaults {
    if (@available(iOS 11.0, *)) {
        WKHTTPCookieStore *cookieStore = [WKWebsiteDataStore defaultDataStore].httpCookieStore;
        [cookieStore getAllCookies:^(NSArray<NSHTTPCookie *> *cookies) {
            NSMutableArray *cookieArray = [NSMutableArray array];
            for (NSHTTPCookie *cookie in cookies) {
                NSDictionary *cookieProperties = cookie.properties;
                if (cookieProperties) {
                    [cookieArray addObject:cookieProperties];
                }
            }
            [[NSUserDefaults standardUserDefaults] setObject:cookieArray forKey:@"WKWebViewSavedCookies"];
            [[NSUserDefaults standardUserDefaults] synchronize];
        }];
    }
}

+ (void)loadCookies {
    if (@available(iOS 11.0, *)) {
        NSArray *savedCookies = [[NSUserDefaults standardUserDefaults] objectForKey:@"WKWebViewSavedCookies"];
        if (savedCookies && savedCookies.count > 0) {
            WKHTTPCookieStore *cookieStore = [WKWebsiteDataStore defaultDataStore].httpCookieStore;
            for (NSDictionary *cookieProperties in savedCookies) {
                NSHTTPCookie *cookie = [NSHTTPCookie cookieWithProperties:cookieProperties];
                if (cookie) {
                    [cookieStore setCookie:cookie completionHandler:^{
                        NSLog(@"Cookie loaded: %@", cookie.name);
                    }];
                }
            }
        }
    }
}

+ (void)clearAllCookies {
    if (@available(iOS 11.0, *)) {
        WKHTTPCookieStore *cookieStore = [WKWebsiteDataStore defaultDataStore].httpCookieStore;
        [cookieStore getAllCookies:^(NSArray<NSHTTPCookie *> *cookies) {
            for (NSHTTPCookie *cookie in cookies) {
                [cookieStore deleteCookie:cookie completionHandler:^{
                    NSLog(@"Cookie deleted: %@", cookie.name);
                }];
            }
        }];
        
        // 清除本地存储的Cookie
        [[NSUserDefaults standardUserDefaults] removeObjectForKey:@"WKWebViewSavedCookies"];
        [[NSUserDefaults standardUserDefaults] synchronize];
    }
}

+ (void)cookieJSOperateCookie:(NSDictionary *)cookieDic path:(NSString *)path {
    if (!cookieDic || !path) return;
    
    NSString *operation = cookieDic[@"operation"];
    NSString *domain = cookieDic[@"domain"];
    NSString *name = cookieDic[@"name"];
    
    if (@available(iOS 11.0, *)) {
        WKHTTPCookieStore *cookieStore = [WKWebsiteDataStore defaultDataStore].httpCookieStore;
        
        if ([operation isEqualToString:@"set"]) {
            NSString *value = cookieDic[@"value"];
            NSNumber *expires = cookieDic[@"expires"];
            
            if (domain && name && value) {
                NSMutableDictionary *cookieProperties = [NSMutableDictionary dictionary];
                [cookieProperties setValue:name forKey:NSHTTPCookieName];
                [cookieProperties setValue:value forKey:NSHTTPCookieValue];
                [cookieProperties setValue:domain forKey:NSHTTPCookieDomain];
                [cookieProperties setValue:path forKey:NSHTTPCookiePath];
                
                if (expires) {
                    NSDate *expiresDate = [NSDate dateWithTimeIntervalSinceNow:expires.integerValue * 24 * 60 * 60];
                    [cookieProperties setValue:expiresDate forKey:NSHTTPCookieExpires];
                }
                
                NSHTTPCookie *cookie = [NSHTTPCookie cookieWithProperties:cookieProperties];
                if (cookie) {
                    [cookieStore setCookie:cookie completionHandler:nil];
                }
            }
        } else if ([operation isEqualToString:@"delete"]) {
            if (domain && name) {
                [cookieStore getAllCookies:^(NSArray<NSHTTPCookie *> *cookies) {
                    for (NSHTTPCookie *cookie in cookies) {
                        if ([cookie.domain isEqualToString:domain] && [cookie.name isEqualToString:name]) {
                            [cookieStore deleteCookie:cookie completionHandler:nil];
                            break;
                        }
                    }
                }];
            }
        }
    }
}

#pragma mark - JavaScript Execution

- (void)safeEvaluateJavaScript:(NSString *)script completion:(void (^)(id _Nullable, NSError * _Nullable))completion {
    if (!script || script.length == 0) {
        if (completion) {
            NSError *error = [NSError errorWithDomain:@"WKWebViewAddition" 
                                                 code:-1 
                                             userInfo:@{NSLocalizedDescriptionKey: @"JavaScript script is empty"}];
            completion(nil, error);
        }
        return;
    }
    
    // 确保在主线程执行
    if ([NSThread isMainThread]) {
        [self evaluateJavaScript:script completionHandler:completion];
    } else {
        dispatch_async(dispatch_get_main_queue(), ^{
            [self evaluateJavaScript:script completionHandler:completion];
        });
    }
}

#pragma mark - User Agent

- (void)setCustomUserAgent:(NSString *)userAgent {
    if (@available(iOS 9.0, *)) {
        self.customUserAgent = userAgent;
    } else {
        // 对于iOS 9以下版本，使用运行时设置
        [self setValue:userAgent forKey:@"applicationNameForUserAgent"];
    }
}

#pragma mark - Utility Methods

+ (NSString *)jsonStringFromObject:(id)object {
    if (!object) return @"null";
    
    NSError *error;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:object 
                                                       options:NSJSONWritingPrettyPrinted 
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