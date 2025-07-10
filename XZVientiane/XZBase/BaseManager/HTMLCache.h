//
//  HTMLCache.h
//  XiangZhanBase
//
//  Created by CFJ on 16/5/7.
//  Copyright © 2016年 TuWeiA. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "XZFunctionDefine.h"

@interface HTMLCache : NSObject

+ (HTMLCache *)sharedCache;

@property (strong, nonatomic) NSString *pageHtml;
@property (strong, nonatomic) NSString *noPageHtml;

@property (strong, nonatomic) NSString *appHtml;
@property (strong, nonatomic) NSURL *htmlBaseUrl;
@property (strong, nonatomic) NSURL *noHtmlBaseUrl;
- (void)cacheHtml:(NSString *)htmlStr key:(NSString *)urlStr;

- (void)runtimeCacheString:(NSString *)aString forKey:(NSString *)key;
- (void)setString:(NSString*)aString forKey:(NSString*)key withTimeoutInterval:(NSTimeInterval)timeoutInterval;
- (void)permanentCacheString:(NSString *)aString forKey:(NSString *)key;

- (NSString *)objectForKey:(NSString *)key;
- (void)removeObjectForKey:(NSString *)key;
- (void)removeAllCache;

@end

