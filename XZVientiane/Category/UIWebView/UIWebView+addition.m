//
//  UIWebView+addition.m
//  TuiYa
//
//  Created by CFJ on 15/6/28.
//  Copyright (c) 2015年 tuweia. All rights reserved.
//

#import "UIWebView+addition.h"
#import "XZBaseHead.h"
#import "NSString+addition.h"
#import "PublicSettingModel.h"
#define User_Cookie   @"User_Cookie"

@implementation UIWebView (addition)

+ (NSDictionary *)objcCallJsLoadPageParamWithHtml:(NSString *)html url:(NSString *)url requestData:(id)data{
    url = [url stringByAddingPercentEncodingWithAllowedCharacters:[NSCharacterSet URLQueryAllowedCharacterSet]];
    NSRange range = [url rangeOfString:@"://"];
    if(range.length <= 0)
    {
        url = [NSString stringWithFormat:@"http://%@%@",MainDomain,url];
    }
    NSMutableArray *cookieAry = [NSMutableArray array];
    NSArray *storageCookieAry = [[NSHTTPCookieStorage sharedHTTPCookieStorage] cookiesForURL:[NSURL URLWithString:url]];
    for (NSHTTPCookie *cookie in storageCookieAry) {
        NSString *name = cookie.properties[NSHTTPCookieName];
        NSString *value = cookie.properties[NSHTTPCookieValue];
        NSDictionary *cookieDic = @{
                                    @"name" : name,
                                    @"value" : value,
                                    };
        [cookieAry addObject:cookieDic];
    }
    NSDictionary *paramDic = @{
                               @"url" : url,
                               @"cookie" : cookieAry,
                               @"vs" : @(3),
                               @"requestData" : data
                               };
    return [UIWebView objcCallJsWithFn:@"loadPage" data:paramDic];
}

//+ (NSDictionary *)objcCallJsWithFn:(NSString *)function data:(id)data
//{
//    NSDictionary *dic = [NSDictionary dictionaryWithObjectsAndKeys:
//                         function, @"action",
//                         data, @"data",
//                         @"", @"callback",
//                         nil];
//    NSDictionary *finalDic = @{@"data":dic,
//                          @"action":function
//                          };
//    return finalDic;
//}
+ (NSDictionary *)objcCallJsWithFn:(NSString *)function data:(id)data
{
    
    NSDictionary *dic = [NSDictionary dictionaryWithObjectsAndKeys:
                         function, @"action",
                         data, @"data",
                         @"", @"callback",
                         nil];
    return dic;
}
+ (void)saveCookiesToUserDefaults {
    NSData *cookiesData = [NSKeyedArchiver archivedDataWithRootObject:[[NSHTTPCookieStorage sharedHTTPCookieStorage] cookies]];
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    [defaults setObject:cookiesData forKey:User_Cookie];
    [defaults synchronize];
}

+ (void)loadCookies {
    NSArray *cookies = [NSKeyedUnarchiver unarchiveObjectWithData:[[NSUserDefaults standardUserDefaults] objectForKey:User_Cookie]];
    NSHTTPCookieStorage *cookieStorage = [NSHTTPCookieStorage sharedHTTPCookieStorage];
    for (NSHTTPCookie *cookie in cookies){
        [cookieStorage setCookie:cookie];
    }
}

+ (void)cookieDeleteAllCookie {
    NSArray *cookies = [[NSHTTPCookieStorage sharedHTTPCookieStorage] cookies];
    for (NSHTTPCookie *cookie in cookies) {
        [[NSHTTPCookieStorage sharedHTTPCookieStorage] deleteCookie:cookie];
    }
}

+ (void)cookieDeleteCookieWithDomain:(NSString *)domain name:(NSString *)cookieName path:(NSString *)path {
    if (domain) {
        NSArray *cookies = [[NSHTTPCookieStorage sharedHTTPCookieStorage] cookiesForURL:[NSURL URLWithString:domain]];
        for (NSHTTPCookie *cookie in cookies) {
            if ([cookie.name isEqualToString:cookieName] && [cookie.path isEqualToString:path]) {
                [[NSHTTPCookieStorage sharedHTTPCookieStorage] deleteCookie:cookie];
            }
        }
    }
    
    if ([cookieName isEqualToString:@"loginUid"]) {
        [[NSUserDefaults standardUserDefaults] setObject:@"" forKey:@"loginUid"];
        [[NSUserDefaults standardUserDefaults] setObject:@"" forKey:@"userName"];
        [[NSUserDefaults standardUserDefaults] setObject:@"" forKey:@"userPhone"];
        [[NSUserDefaults standardUserDefaults] synchronize];
        NSArray *cookies = [[NSHTTPCookieStorage sharedHTTPCookieStorage] cookies];
        for (NSHTTPCookie *cookie in cookies) {
            if ([cookie.name isEqualToString:cookieName] && [cookie.path isEqualToString:path]) {
                [[NSHTTPCookieStorage sharedHTTPCookieStorage] deleteCookie:cookie];
            }
        }
    }
}

+ (void)setCookie:(NSString *)aDomain name:(NSString *)aName value:(NSString *)aValue expires:(NSDate *)expires path:(NSString *)path
{
    if (!aName) {
        return ;
    }
    
    if (!aValue) {
        [[NSHTTPCookieStorage sharedHTTPCookieStorage].cookies.copy enumerateObjectsUsingBlock:^(id obj, NSUInteger idx, BOOL *stop) {
            NSHTTPCookie *cookie = obj;
            if ([cookie.properties[NSHTTPCookieName] isEqualToString:aName]) {
                [[NSHTTPCookieStorage sharedHTTPCookieStorage] deleteCookie:obj];
                *stop = YES;
            }
        }];
        return ;
    }
    
    NSMutableDictionary *cookieProperties = [NSMutableDictionary dictionary];
    cookieProperties[NSHTTPCookieDomain] = aDomain;
    cookieProperties[NSHTTPCookieName] = aName;
    //有的cookie值是数字型的，需要转换一下
    if ([aValue isKindOfClass:[NSNumber class]]) {
        aValue = [(NSNumber *)aValue stringValue];
    }
    if ([[NSUserDefaults standardUserDefaults] objectForKey:@"UserDefault_IsClient"]) {
        cookieProperties[NSHTTPCookieValue] = [NSString encodeString:aValue];
    }
    else {
        cookieProperties[NSHTTPCookieValue] = [aValue stringByRemovingPercentEncoding];
    }
    cookieProperties[NSHTTPCookiePath] = path;
    cookieProperties[NSHTTPCookieVersion] = @"0";
    cookieProperties[NSHTTPCookieExpires] = expires;
    
    NSHTTPCookie *cookie = [NSHTTPCookie cookieWithProperties:cookieProperties];
    [[NSHTTPCookieStorage sharedHTTPCookieStorage] setCookie:cookie];
}

//操作js传过来需要操作的cookie
+ (void)cookieJSOperateCookie:(NSDictionary *)cookieDic path:(NSString *)aPath {
    NSString *name = [cookieDic objectForKey:@"name"];
    NSString *value = [cookieDic objectForKey:@"value"];
    NSDictionary *optionDic = [cookieDic objectForKey:@"options"];
    if (!optionDic) {
        return;
    }
    NSNumber *expires = [optionDic objectForKey:@"expires"];
    NSString *domain = [optionDic objectForKey:@"domain"];
    NSString *path = [optionDic objectForKey:@"path"];
    if (optionDic.count <= 0) {
        NSArray *httpAry = [aPath componentsSeparatedByString:@"://"];
        NSString *httpPath = httpAry.count > 1 ? httpAry[1] : httpAry[0];
        domain = httpAry.count > 1 ? [httpPath componentsSeparatedByString:@"/"][0] : [NSString stringWithFormat:@".%@",MainDomain];
        path = httpAry.count > 1 ? [httpPath stringByReplacingOccurrencesOfString:domain withString:@""] : httpAry[0];
    }
    if (!domain) {
        NSURL *pathUrl = [NSURL URLWithString:aPath];
        domain = pathUrl.host;
    }
    if (!domain) {
        domain = [NSString stringWithFormat:@".%@",MainDomain];
    }
    if (!path) {
        path = @"/";
    }
    
    if ((expires.integerValue <= 0 && expires) || !value || [value isKindOfClass:[NSNull class]]) {
        //删除cookie
        [UIWebView cookieDeleteCookieWithDomain:domain name:name path:path];
    }
    else {
        //存储cookie
        if (!expires) {
            expires = @(10000);
        }
        
        [UIWebView setCookie:domain name:name value:value expires:[NSDate dateWithTimeIntervalSinceNow:expires.integerValue * 60 * 60 * 24] path:path];
    }
}
@end

