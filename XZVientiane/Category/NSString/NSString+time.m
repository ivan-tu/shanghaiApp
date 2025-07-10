//
//  NSString+time.m
//  XiangZhan
//
//  Created by tuweia on 16/1/27.
//  Copyright © 2016年 tuweia. All rights reserved.
//

#import "NSString+time.h"

@implementation NSString (time)

+ (NSString *)timeInfoWithDateString:(NSString *)dateString isShort:(BOOL)isShort {
    if (!dateString || [dateString isEqualToString:@""]) {
        return @"";
    }
//    NSDateFormatter *date=[[NSDateFormatter alloc] init];
////   [date setDateFormat:@"yyyy-MM-dd HH:mm"];
//    NSDate *compareDate = [date dateFromString:dateString];
//    
//    NSTimeInterval  timeInterval = [compareDate timeIntervalSinceNow];
//    timeInterval = -timeInterval;
//    long temp = 0;
//    NSString *result;
//    if (timeInterval < 60) {
//        result = [NSString stringWithFormat:@"刚刚"];
//    }
//    else if((temp = timeInterval/60) <30){
//        result = [NSString stringWithFormat:@"%ld分前",temp];
//    }
//    
//    else if((temp = temp/24) <1){
//        result = @"昨天";
//    }
//    
//    else if((temp = temp/24) <2){
//        result = @"前天";
//    }
//    
//    else if((temp = temp/30) <12){
//        
//        NSString *date = [dateString substringWithRange:NSMakeRange(0, 10)];
//        if (isShort) {
//            date = [date substringWithRange:NSMakeRange(5, 5)];
//        }
//        result = isShort?date:dateString;
//        
//    } else {
//        
//        result = dateString;
//        
//    }
//    
//    return  result;

    NSDateFormatter *inputFormatter = [[NSDateFormatter alloc] init];
    [inputFormatter setDateFormat:@"yyyy/MM/dd HH:mm"];
    NSDate *beginDate = [inputFormatter dateFromString:dateString];
    NSDateComponents *beginComponents = [[NSCalendar currentCalendar] components:NSCalendarUnitDay | NSCalendarUnitMonth | NSCalendarUnitYear fromDate:beginDate];
    
    NSDate *endDate= [NSDate date];
    NSDateComponents *endComponents = [[NSCalendar currentCalendar] components:NSCalendarUnitDay | NSCalendarUnitMonth | NSCalendarUnitYear fromDate:endDate];
    
    NSInteger beginYear = beginComponents.year;
    NSInteger endYear = endComponents.year;
    
    NSString *partTime = [dateString substringWithRange:NSMakeRange(11, 5)];
    
    NSCalendar *gregorian = [[NSCalendar alloc]
                             initWithCalendarIdentifier:NSCalendarIdentifierGregorian];
    [gregorian setFirstWeekday:2];
    NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
    [dateFormatter setDateFormat:@"yyyy/MM/dd HH:mm"];
    NSDate *fromDate;
    NSDate *toDate;
    [gregorian rangeOfUnit:NSCalendarUnitDay startDate:&fromDate interval:NULL forDate:[dateFormatter dateFromString:dateString]];
    [gregorian rangeOfUnit:NSCalendarUnitDay startDate:&toDate interval:NULL forDate:[NSDate date]];
    NSDateComponents *dayComponents = [gregorian components:NSCalendarUnitDay fromDate:fromDate toDate:toDate options:0];
    
    NSInteger days = dayComponents.day;
    
    if (days > 2) {
        NSString *date = [dateString substringWithRange:NSMakeRange(0, 10)];
        if (isShort && endYear == beginYear) {
            date = [date substringWithRange:NSMakeRange(5, 5)];
        }
        return isShort?date:dateString;
    }
    else {
        NSTimeInterval time = -[beginDate timeIntervalSinceDate:endDate];
        //    计算相差分钟数
        float t = time / 60.0;
        switch (days) {
            case 2:
                return isShort?@"前天":[NSString stringWithFormat:@"前天 %@",partTime];
                break;
            case 1:
                return isShort?@"昨天":[NSString stringWithFormat:@"昨天 %@",partTime];
                break;
                
            default:
                
                //    一分钟内显示“刚刚”
                if (t < 1){
                    return @"刚刚";
                }
                //    30分钟内显示几分钟前
                else if (t < 30) {
                    return [NSString stringWithFormat:@"%.f分钟前",t];
                    
                }
                //    当天且大于30分钟，直接显示分钟
                else {
                    return partTime;
                }
        }
    }

}

+ (BOOL)dateString:(NSString *)dateString {
    if (!dateString || [dateString isEqualToString:@""]) {
        return YES;
    }
    
    NSArray *timeAry = [dateString componentsSeparatedByString:@" "];
    NSString *timeStr = [timeAry lastObject];
    if (timeStr.length > 5) {
        dateString = [dateString substringToIndex:dateString.length - 3];
    }
    
    NSDateFormatter *inputFormatter = [[NSDateFormatter alloc] init];
    [inputFormatter setLocale:[[NSLocale alloc] initWithLocaleIdentifier:@"en_US"]];
    [inputFormatter setDateFormat:@"yyyy/MM/dd HH:mm"];
    NSDate *beginDate = [inputFormatter dateFromString:dateString];
    
    NSDate *endDate= [NSDate date];
    
    NSCalendar *gregorian = [[NSCalendar alloc]
                             initWithCalendarIdentifier:NSCalendarIdentifierGregorian];
    [gregorian setFirstWeekday:2];
    NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
    [dateFormatter setDateFormat:@"yyyy/MM/dd HH:mm"];
    NSDate *fromDate;
    NSDate *toDate;
    [gregorian rangeOfUnit:NSCalendarUnitDay startDate:&fromDate interval:NULL forDate:[dateFormatter dateFromString:dateString]];
    [gregorian rangeOfUnit:NSCalendarUnitDay startDate:&toDate interval:NULL forDate:[NSDate date]];
    NSDateComponents *dayComponents = [gregorian components:NSCalendarUnitDay fromDate:fromDate toDate:toDate options:0];
    
    NSInteger days = dayComponents.day;
    
    if (days > 2) {
        return YES;
    }
    else {
        NSTimeInterval time = -[beginDate timeIntervalSinceDate:endDate];
        //    计算相差分钟数
        float t = time / 60.0;
        switch (days) {
            case 2:
                return YES;
                break;
            case 1:
                return YES;
                break;
                
            default:
                //    小于30分钟的
                if (t < 30){
                    return NO;
                }
                //    当天且大于30分钟，直接显示分钟
                else {
                    return YES;
                }
        }
    }
}

+ (BOOL)showDate:(NSString *)beginDateStr andEndDateStr:(NSString *)endDateStr{
    if (!beginDateStr || [beginDateStr isEqualToString:@""] || !endDateStr || [endDateStr isEqualToString:@""]) {
        return NO;
    }
    
//    NSArray *beginTimeAry = [beginDateStr componentsSeparatedByString:@" "];
//    NSString *beginTimeStr = [beginTimeAry lastObject];
//    if (beginTimeStr.length > 5) {
//        beginDateStr = [beginDateStr substringToIndex:beginDateStr.length - 3];
//    }
//    
//    NSArray *endTimeAry = [beginDateStr componentsSeparatedByString:@" "];
//    NSString *endTimeStr = [endTimeAry lastObject];
//    if (endTimeStr.length > 5) {
//        endDateStr = [endDateStr substringToIndex:endDateStr.length - 3];
//    }
    NSArray *timeArray1=[beginDateStr componentsSeparatedByString:@"."];
    beginDateStr=[timeArray1 objectAtIndex:0];
    NSArray *timeArray2=[endDateStr componentsSeparatedByString:@"."];
    endDateStr=[timeArray2 objectAtIndex:0];
    
//    NSLog(@"beginDateStr：%@---endDateStr：%@",beginDateStr,endDateStr);
    NSDateFormatter *date=[[NSDateFormatter alloc] init];
    [date setDateFormat:@"yyyy-MM-dd HH:mm:ss"];
    
    NSDate *d1=[date dateFromString:beginDateStr];
    NSTimeInterval late1=[d1 timeIntervalSince1970]*1;
    
    NSDate *d2=[date dateFromString:endDateStr];
    NSTimeInterval late2=[d2 timeIntervalSince1970]*1;
    
    NSTimeInterval cha=late2-late1;
    NSString *min=@"";
    min = [NSString stringWithFormat:@"%d", (int)cha/60%60];
    //        min = [min substringToIndex:min.length-7];
    //    分
    min=[NSString stringWithFormat:@"%@", min];
    
    if (abs([min intValue]) <= 5 ) {
        return NO;
    } else {
        return YES;
    }
}

//获取当前时间
+ (NSString *)getDate{
    NSDate *senddate=[NSDate date];
    NSDateFormatter *dateformatter=[[NSDateFormatter alloc] init];
    [dateformatter setDateFormat:@"YYYY/MM/dd hh:mm"];
    NSString *dateString=[dateformatter stringFromDate:senddate];
    return dateString;
}

@end
