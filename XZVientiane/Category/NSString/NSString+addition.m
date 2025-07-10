//
//  NSString+addition.m
//  TuiYa
//
//  Created by CFJ on 15/6/15.
//  Copyright (c) 2015年 tuweia. All rights reserved.
//

#import "NSString+addition.h"
#import "GTMBase64.h"

@implementation NSString (addition)

+ (NSString *)nowTimeString
{
    //    NSDateFormatter * formatter = [[NSDateFormatter alloc ] init];
    //    [formatter setDateFormat:@"YYYYMMddhhmmssSSS"];
    //    return [formatter stringFromDate:[NSDate date]];
    
    NSTimeInterval t = [NSDate date].timeIntervalSince1970;
    NSString *time = [NSString stringWithFormat:@"%f",t];
    time = [time stringByReplacingOccurrencesOfString:@"." withString:@"_"];
    return time;
}

+ (NSString *)randomTimeString
{
    NSString *nowTimeString = [self nowTimeString];
    NSString *userid = @"";
    NSString *randomTimeString = [NSString stringWithFormat:@"%@%@",userid,nowTimeString];
    return randomTimeString;
}

+ (NSString *)randomImageName;
{
    NSString *nowTimeString = [self nowTimeString];
    NSString *userid = @"";
    NSString *randomImageName = [NSString stringWithFormat:@"%@%@.png",userid,nowTimeString];
    return randomImageName;
}

+ (NSDictionary*)dictionaryFromQuery:(NSString*)query usingEncoding:(NSStringEncoding)encoding {
    NSCharacterSet* delimiterSet = [NSCharacterSet characterSetWithCharactersInString:@"&;"];
    NSMutableDictionary* pairs = [NSMutableDictionary dictionary];
    NSScanner* scanner = [[NSScanner alloc] initWithString:query];
    while (![scanner isAtEnd]) {
        NSString* pairString = nil;
        [scanner scanUpToCharactersFromSet:delimiterSet intoString:&pairString];
        [scanner scanCharactersFromSet:delimiterSet intoString:NULL];
        NSArray* kvPair = [pairString componentsSeparatedByString:@"="];
        if (kvPair.count == 2) {
            NSString* key = [[kvPair objectAtIndex:0]
                             stringByRemovingPercentEncoding];
            NSString* value = [[kvPair objectAtIndex:1]
                               stringByRemovingPercentEncoding];
            [pairs setObject:value forKey:key];
        }
    }
    
    return [NSDictionary dictionaryWithDictionary:pairs];
}

+ (BOOL)checkCellPhoneNumber:(NSString *)phoneNumber
{
    NSPredicate *predicate = [NSPredicate predicateWithFormat:@"SELF MATCHES %@", @"[0-9]{4,14}"];
    return ([predicate evaluateWithObject:phoneNumber]);
}


//加密密码
- (NSString *)encryptUserPassword {
    NSString *str = [NSString stringWithFormat:@"%@%@%@",[self getRandomStr],self,[self getRandomStr]];
    NSData *base64Data = [GTMBase64 encodeData:[str dataUsingEncoding:NSUTF8StringEncoding]];
    NSString *passwordStr = [[NSString alloc] initWithData:base64Data encoding:NSUTF8StringEncoding];
    return passwordStr;
}

- (NSString *)getRandomStr {
    int NUMBER_OF_CHARS = 4;
    char data[NUMBER_OF_CHARS];
    for (int x=0;x<NUMBER_OF_CHARS;data[x++] = (char)('A' + (arc4random_uniform(26))));
    return [[NSString alloc] initWithBytes:data length:NUMBER_OF_CHARS encoding:NSUTF8StringEncoding];
}

+ (CGSize)getStringSize:(NSString *)str andFont:(UIFont *)font andSize:(CGSize)s{
    NSDictionary *attribute = @{NSFontAttributeName: font};
    CGSize size = [str boundingRectWithSize:s options: NSStringDrawingTruncatesLastVisibleLine | NSStringDrawingUsesLineFragmentOrigin | NSStringDrawingUsesFontLeading attributes:attribute context:nil].size;
    return size;
}

+ (NSString*)urlWithParam:(NSDictionary*)dic andHead:(NSString*)head {
    NSString*urlStr=[[NSString alloc]initWithString:head];
    NSArray*keyArr=[dic allKeys];
    for (int i=0; i<keyArr.count; i++) {
        urlStr=[urlStr stringByAppendingString:@"&"];
        urlStr=[urlStr stringByAppendingString:keyArr[i]];
        urlStr=[urlStr stringByAppendingString:@"="];
        urlStr=[urlStr stringByAppendingString:[NSString stringWithFormat:@"%@",dic[keyArr[i]]]];
    }
    NSLog(@"%@",urlStr);
    urlStr=[urlStr stringByReplacingOccurrencesOfString:@"/" withString:@"_"];
    urlStr=[urlStr stringByReplacingOccurrencesOfString:@":" withString:@"_"];
    urlStr=[urlStr stringByReplacingOccurrencesOfString:@"." withString:@"_"];
    urlStr=[urlStr stringByReplacingOccurrencesOfString:@"-" withString:@"_"];
    return urlStr;
}

+ (NSString*)encodeString:(NSString*)unencodedString {
    NSString *charactersToEscape = @"!*'();:@&=+$,/?%#[] ";
    NSCharacterSet *allowedCharacters = [[NSCharacterSet characterSetWithCharactersInString:charactersToEscape] invertedSet];
    NSString *encodedString = [unencodedString stringByAddingPercentEncodingWithAllowedCharacters:allowedCharacters];
    return encodedString;
}

+ (void)copyLink:(NSString *)linkStr
{
    UIPasteboard *pasteboard = [UIPasteboard generalPasteboard];
    pasteboard.string = linkStr;
}
+(NSString *)contentTypeForImageData:(NSData *)data{
    uint8_t c;
    [data getBytes:&c length:1];
    switch (c) {
        case 0xFF:
            return @"jpeg";
        case 0x89:
            return @"png";
        case 0x47:
            return @"gif";
        case 0x49:
        case 0x4D:
            return @"tiff";
        case 0x52:
            if ([data length] < 12) {
                return nil;
            }
            NSString *testString = [[NSString alloc] initWithData:[data subdataWithRange:NSMakeRange(0, 12)] encoding:NSASCIIStringEncoding];
            if ([testString hasPrefix:@"RIFF"] && [testString hasSuffix:@"WEBP"]) {
                return @"webp";
            }
            return nil;
    }
    return nil;
}

NSString * getSafeString(NSString *str){
    if ([str isKindOfClass:[NSString class]]) {
        if ([str isEqualToString:@"<null>"]||[str isEqualToString:@"<NULL>"]) {
            return @"";
        } else if ([str isEqualToString:@"(null)"]||[str isEqualToString:@"(NULL)"]){
            return @"";
        } else if ([str isEqualToString:@"null"]||[str isEqualToString:@"NULL"]){
            return @"";
        }
        return (NSString *)str;
    } else if ([str isKindOfClass:[NSNumber class]]) {
        return [(NSNumber *)str stringValue];
    } else if ([str isKindOfClass:[NSNull class]]) {
        return @"";
    } else if (str == nil) {
        return @"";
    } else {
        return @"";
    }
}


- (BOOL)isValidString {
    if (self) {
        if ([self isKindOfClass:[NSString class]]) {
            return [(NSString *)self length]>0;
        } else {
            return NO;
        }
    } else {
        return NO;
    }
}
@end


