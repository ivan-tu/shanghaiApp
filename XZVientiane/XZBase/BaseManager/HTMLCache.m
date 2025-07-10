//
//  HTMLCache.m
//  XiangZhanBase
//
//  Created by CFJ on 16/5/7.
//  Copyright © 2016年 TuWeiA. All rights reserved.
//

#import "HTMLCache.h"
#import "EGOCache.h"
#import "BaseFileManager.h"
#import "NSString+addition.h"

@interface HTMLCache ()

@property (nonatomic, strong) NSMutableDictionary *runtimeCacheDic;

@end

@implementation HTMLCache

+ (HTMLCache *)sharedCache {
    static HTMLCache *sharedCacheInstance = nil;
    static dispatch_once_t predicate;
    dispatch_once(&predicate, ^{
        sharedCacheInstance = [[self alloc] init];
        sharedCacheInstance.runtimeCacheDic = [[NSMutableDictionary alloc] init];
        [[NSNotificationCenter defaultCenter] addObserver:sharedCacheInstance selector:@selector(didReceiveMemoryWarning) name:UIApplicationDidReceiveMemoryWarningNotification object:nil];
    });
    return sharedCacheInstance;
}

- (NSString *)pageHtml {
    if (!_pageHtml) {
        NSURL *htmlUrl = [NSURL fileURLWithPath:[NSString stringWithFormat:@"%@/page.phtml",[BaseFileManager appH5ManifesPath]]];
        _pageHtml = [NSString stringWithContentsOfURL:htmlUrl encoding:NSUTF8StringEncoding error:nil];
        if (!_pageHtml) {
            NSURL *url = [[NSBundle mainBundle] URLForResource:@"manifest/page" withExtension:@"phtml"];
            _pageHtml = [NSString stringWithContentsOfURL:url encoding:NSUTF8StringEncoding error:nil];
        }
    }
    return _pageHtml;
}

- (NSString *)noPageHtml {
    if (!_noPageHtml) {
        NSURL *url = [[NSBundle mainBundle] URLForResource:@"manifest/app" withExtension:@"phtml"];
        _noPageHtml = [NSString stringWithContentsOfURL:url encoding:NSUTF8StringEncoding error:nil];
    }
    return _noPageHtml;
}

- (NSString *)appHtml {
    if (!_appHtml) {
        NSURL *htmlUrl = [NSURL fileURLWithPath:[NSString stringWithFormat:@"%@/app.phtml",[BaseFileManager appH5ManifesPath]]];
        _appHtml = [NSString stringWithContentsOfURL:htmlUrl encoding:NSUTF8StringEncoding error:nil];
    }
    return _appHtml;
}

- (NSURL *)htmlBaseUrl {
    if (!_htmlBaseUrl) {
        _htmlBaseUrl = [NSURL fileURLWithPath:[BaseFileManager appH5ManifesPath]];
    }
    return _htmlBaseUrl;
}

- (NSURL *)noHtmlBaseUrl {
    if (!_noHtmlBaseUrl) {
        _noHtmlBaseUrl = [[NSBundle mainBundle] URLForResource:@"manifest" withExtension:nil];
    }
    return _noHtmlBaseUrl;
}

- (void)didReceiveMemoryWarning {
    [self.runtimeCacheDic removeAllObjects];
}

- (void)runtimeCacheString:(NSString *)aString forKey:(NSString *)key {
    if (!aString || !key) {
        return;
    }
    key = [NSString urlWithParam:nil andHead:key];
    [self.runtimeCacheDic setObject:aString forKey:key];
    //防止接受到memorywarning以后全部清空，默认缓存private模式为30分钟，可以根据需求调整
    [[EGOCache globalCache] setString:aString forKey:key withTimeoutInterval:1800];
}

- (NSString *)objectForKey:(NSString *)key {
    if (!key) {
        return nil;
    }
    key = [NSString urlWithParam:nil andHead:key];
    NSString *html = [self.runtimeCacheDic objectForKey:key];
    if (html) {
        return html;
    }
    
    html = [[EGOCache globalCache] stringForKey:key];
    if (html.length > 0) {
        return html;
    }
    
    if (html.length <= 0 &&  NoReachable) {
        NSURL *netUrl = [NSURL fileURLWithPath:[NSString stringWithFormat:@"%@/networkNotReach.phtml",[BaseFileManager appH5ManifesPath]]];
        html = [NSString stringWithContentsOfURL:netUrl encoding:NSUTF8StringEncoding error:nil];
        return html;
    }
    return nil;
}

- (void)setString:(NSString*)aString forKey:(NSString*)key withTimeoutInterval:(NSTimeInterval)timeoutInterval {
    key = [NSString urlWithParam:nil andHead:key];
    [[EGOCache globalCache] setString:aString forKey:key withTimeoutInterval:timeoutInterval];
}

- (void)permanentCacheString:(NSString *)aString forKey:(NSString *)key {
    key = [NSString urlWithParam:nil andHead:key];
    [[EGOCache globalCache] setString:aString forKey:key withTimeoutInterval:3600 * 2];
}

- (void)removeObjectForKey:(NSString *)key {
    if (!key) {
        return;
    }
    key = [NSString urlWithParam:nil andHead:key];
    [self.runtimeCacheDic removeObjectForKey:key];
    [[EGOCache globalCache] removeCacheForKey:key];
}

- (void)removeAllCache {
    [[EGOCache globalCache] clearCache];
    [self.runtimeCacheDic removeAllObjects];
    //清除accessToken
    [[NSUserDefaults standardUserDefaults] setObject:[NSDate dateWithTimeIntervalSince1970:0] forKey:@"User_Token_Expire_Time"];
    [[NSUserDefaults standardUserDefaults]synchronize];
}
- (void)cacheHtml:(NSString *)htmlStr key:(NSString *)urlStr {
    NSLog(@"开始缓存 HTML");
    NSLog(@"URL: %@", urlStr);
    NSLog(@"HTML 内容长度: %lu", (unsigned long)htmlStr.length);
    
    //获取缓存策略
    NSRange startRange = [htmlStr rangeOfString:@"<!--<appset>{"];
    NSRange endRange = [htmlStr rangeOfString:@"}</appset>-->"];
    NSString *JsonString = nil;
    if (startRange.location != NSNotFound && endRange.location != NSNotFound) {
        JsonString = [htmlStr substringWithRange:NSMakeRange(startRange.location + startRange.length - 1, endRange.location - startRange.location - startRange.length + 2)];
        NSLog(@"缓存配置: %@", JsonString);
    }
    
    NSDictionary *jsonDic = nil;
    if (JsonString) {
        jsonDic = [NSJSONSerialization JSONObjectWithData:[JsonString dataUsingEncoding:NSUTF8StringEncoding] options:NSJSONReadingAllowFragments error:nil];
        NSLog(@"解析后的配置: %@", jsonDic);
    }
    
    if (!jsonDic) {
        NSLog(@"未找到缓存配置");
        return;
    }
    
    NSString *cacheMethod = [jsonDic objectForKey:@"cache"];
    NSLog(@"缓存策略: %@", cacheMethod);
    
    if ([cacheMethod isEqualToString:@"no-cache"]) {
        NSLog(@"不缓存内容");
        return;
    } else {
        NSLog(@"永久缓存内容");
        [[HTMLCache sharedCache] permanentCacheString:htmlStr forKey:urlStr];
    }
}
@end

