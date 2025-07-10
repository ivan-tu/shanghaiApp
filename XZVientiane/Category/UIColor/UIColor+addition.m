//
//  UIColor+addition.m
//  TuiYa
//
//  Created by CFJ on 15/6/15.
//  Copyright (c) 2015年 tuweia. All rights reserved.
//

#import "UIColor+addition.h"

@implementation UIColor (addition)

+ (UIColor *)colorWithRGB:(NSUInteger)aRGB
{
    return [UIColor colorWithRed:((float)((aRGB & 0xFF0000) >> 16))/255.0 green:((float)((aRGB & 0xFF00) >> 8))/255.0 blue:((float)(aRGB & 0xFF))/255.0 alpha:1.0];
}

+ (UIColor *)tyColorWithRed:(unsigned int)red green:(unsigned int)green blue:(unsigned int)blue alpha:(unsigned int)alpha {
    return [UIColor colorWithRed:red / 255.0f green:green / 255.0f blue:blue / 255.0f alpha:alpha];
}

+ (UIColor *)colorWithHexString:(NSString *)hexString {
    return [UIColor colorWithHexString:hexString alpha:1.0f];
}

+ (UIColor *)colorWithHexString:(NSString *)hexString alpha:(CGFloat)alpha {
    NSString *cString = [[hexString stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]] uppercaseString];
    // String should be 6 or 8 characters
    if ([cString length] < 6) return [UIColor clearColor];
    // strip 0X if it appears
    if ([cString hasPrefix:@"0X"]) cString = [cString substringFromIndex:2];
    if ([cString hasPrefix:@"#"]) cString = [cString substringFromIndex:1];
    if ([cString length] != 6) return [UIColor clearColor];
    // Separate into r, g, b substrings
    NSRange range;
    range.location = 0;
    range.length = 2;
    NSString *rString = [cString substringWithRange:range];
    range.location = 2;
    NSString *gString = [cString substringWithRange:range];
    range.location = 4;
    NSString *bString = [cString substringWithRange:range];
    // Scan values
    unsigned int r, g, b;
    [[NSScanner scannerWithString:rString] scanHexInt:&r];
    [[NSScanner scannerWithString:gString] scanHexInt:&g];
    [[NSScanner scannerWithString:bString] scanHexInt:&b];
    return [UIColor colorWithRed:((float) r / 255.0f)
                           green:((float) g / 255.0f)
                            blue:((float) b / 255.0f)
                           alpha:alpha];
}

+ (UIColor *)tyBgViewColor
{
    return [UIColor colorWithHexString:@"#FFFFFF"];
}

+ (UIColor *)tyMostDarkColor
{
    return [UIColor colorWithHexString:@"#444444"];
}

+ (UIColor *)titleColor
{
    return [UIColor colorWithHexString:@"#777777"];
}

+ (UIColor *)color666666
{
    return [UIColor colorWithHexString:@"#666666"];
}

+ (UIColor *)subDescColor
{
    return [UIColor colorWithHexString:@"#cccccc"];
}

+ (UIColor *)tyRightBtnBlueColor
{
    return [UIColor colorWithHexString:@"#46e0db"];
}

+ (UIColor *)tySeperatorColor
{
    return [UIColor colorWithHexString:@"#dddddd"];
}

+ (UIColor *)tyDefaultRedColor {
    return [UIColor colorWithHexString:@"#ff7777"];
}

+ (UIColor *)color999999
{
    return [UIColor colorWithHexString:@"#999999"];
}

+ (UIColor *)colorDB0000
{
    return [UIColor colorWithHexString:@"#db0000"];
}

+ (UIColor *)colorE1e1e1
{
    return [UIColor colorWithHexString:@"#e1e1e1"];
}

+ (UIColor *)colorDC0000
{
    return [UIColor colorWithHexString:@"#dc0000"];
}

+ (UIColor *)color333333
{
    return [UIColor colorWithHexString:@"#333333"];
}

+ (UIColor *)color000000
{
    return [UIColor colorWithHexString:@"#000000"];
}

+ (UIColor *)color545454
{
    return [UIColor colorWithHexString:@"#545454"];
}

+ (UIColor *)colorf6f6f6
{
    return [UIColor colorWithHexString:@"#f6f6f6"];
}

+ (UIColor *)color434343;
{
    return [UIColor colorWithHexString:@"#434343"];
}
+ (CAGradientLayer *)setGradualChangingColor:(UIView *)view fromColor:(NSString *)fromHexColorStr toColor:(NSString *)toHexColorStr{
    //    CAGradientLayer类对其绘制渐变背景颜色、填充层的形状(包括圆角)
    CAGradientLayer *gradientLayer = [CAGradientLayer layer];
    gradientLayer.frame = view.bounds;
    //  创建渐变色数组，需要转换为CGColor颜色
    gradientLayer.colors = @[(__bridge id)[UIColor colorWithHexString:fromHexColorStr].CGColor,(__bridge id)[UIColor colorWithHexString:toHexColorStr].CGColor];
    //  设置渐变颜色方向，左上点为(0,0), 右下点为(1,1)
    gradientLayer.startPoint = CGPointMake(0, 0);
    gradientLayer.endPoint = CGPointMake(1, 1);
    //  设置颜色变化点，取值范围 0.0~1.0
    gradientLayer.locations = @[@0,@1];
    
    return gradientLayer;
}

@end
