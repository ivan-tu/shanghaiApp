//
//  UIColor+addition.h
//  TuiYa
//
//  Created by CFJ on 15/6/15.
//  Copyright (c) 2015年 tuweia. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface UIColor (addition)

/**
 *  通过0xffffff的16进制数字创建颜色
 *
 *  @param aRGB 0xffffff
 *
 *  @return UIColor
 */
+ (UIColor *)colorWithRGB:(NSUInteger)aRGB;


/**
 *  通过#ffffff的16进制数字创建颜色
 *
 *  @param hexString #ffffff
 *
 *  @return UIColor
 */
+ (UIColor *)colorWithHexString:(NSString *)hexString;

/**
 *  通过#ffffff的16进制数字创建颜色
 *
 *  @param hexString #ffffff
 *  @param alpha 透明度
 *
 *  @return UIColor
 */

+ (UIColor *)colorWithHexString:(NSString *)hexString alpha:(CGFloat)alpha;



//
+ (UIColor *)tyColorWithRed:(unsigned int)red green:(unsigned int)green blue:(unsigned int)blue alpha:(unsigned int)alpha;



//页面背景颜色 所有页面  灰色
+ (UIColor *)tyBgViewColor;

//cell的3层颜色   主label颜色   描述detail颜色  副描述颜色
+ (UIColor *)titleColor;
+ (UIColor *)color666666;
+ (UIColor *)subDescColor;

//页面右上角如果有按钮的按钮颜色
+ (UIColor *)tyRightBtnBlueColor;

//响站最深的颜色
+ (UIColor *)tyMostDarkColor;

//响站默认分割线颜色
+ (UIColor *)tySeperatorColor;



//响站默认红色
+ (UIColor *)tyDefaultRedColor;

/**
 *  获取验证码时，验证码按钮不可用，颜色变灰
 *
 *  @return 灰色
 */
+ (UIColor *)color999999;

/**
 *  获取验证码，验证码按钮可用，颜色变红
 *
 *  @return 红色
 */
+ (UIColor *)colorDB0000;

/**
 *  分割线颜色
 *
 *  @return 分割线灰
 */
+ (UIColor *)colorE1e1e1;

/**
 *  按钮颜色
 *
 *  @return 红色
 */
+ (UIColor *)colorDC0000;

/**
 *  字体颜色
 *
 *  @return 深黑色
 */
+ (UIColor *)color333333;

/**
 *  导航按钮颜色
 *
 *  @return 黑色
 */
+ (UIColor *)color000000;

/**
 *  导航标题颜色
 *
 *  @return 浅黑色
 */
+ (UIColor *)color545454;

/**
 *  侧边栏导航条背景颜色
 *
 *  @return 浅灰色
 */
+ (UIColor *)colorf6f6f6;

+ (UIColor *)color434343;
//渐变层
+ (CAGradientLayer *)setGradualChangingColor:(UIView *)view fromColor:(NSString *)fromHexColorStr toColor:(NSString *)toHexColorStr;

@end
