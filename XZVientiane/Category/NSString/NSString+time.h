//
//  NSString+time.h
//  XiangZhan
//
//  Created by tuweia on 16/1/27.
//  Copyright © 2016年 tuweia. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface NSString (time)

+ (NSString *)timeInfoWithDateString:(NSString *)dateString isShort:(BOOL)isShort;

+ (BOOL)dateString:(NSString *)dateString;

+ (BOOL)showDate:(NSString *)beginDateStr andEndDateStr:(NSString *)endDateStr;

//获取当前时间
+ (NSString *)getDate;

@end
