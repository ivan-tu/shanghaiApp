//
//  UIBarButtonItem+DCBarButtonItem.h
//  CDDStoreDemo
//
//  Created by apple on 2017/3/19.
//  Copyright © 2017年 apple. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface UIBarButtonItem (DCBarButtonItem)

+(UIBarButtonItem *)ItemWithImage:(UIImage *)image WithHighlighted:(UIImage *)HighlightedImage Target:(id)target action:(SEL)action;

+(UIBarButtonItem *)ItemWithImage:(CGFloat)fontSize andColor:(UIColor *)fontColor andText:(NSString *)textStr Target:(id)target action:(SEL)action;
//创建左侧个性化导航按钮
+(UIBarButtonItem *)leftItemWithDic:(NSDictionary *)dic Color:(NSString *)color Target:(id)target action:(SEL)action;
//创建右侧个性化导航按钮
+(UIBarButtonItem *)rightItemWithDic:(NSDictionary *)dic Color:(NSString *)color Target:(id)target action:(SEL)action;
+(UIBarButtonItem *)rightItemTarget:(id)target action:(SEL)action;


//单为定位按钮而写
+(UIBarButtonItem *)leftItemWithtitle:(NSString *)title Color:(NSString *)color Target:(id)target action:(SEL)action;
@end
