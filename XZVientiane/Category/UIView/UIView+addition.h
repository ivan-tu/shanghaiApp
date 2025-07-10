//
//  UIView+addition.h
//  TuiYa
//
//  Created by 崔逢举 on 15/6/15.
//  Copyright (c) 2015年 tuweia. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface UIView (addition)

+ (instancetype)autolayoutView;

/**
 *  通过字体库设置图片
 *  @param fontSize  字体大小
 *  @param fontColor 字体颜色
 *  @param textStr   文字
 */
- (void)setTitleImageWith:(CGFloat)fontSize andColor:(UIColor *)fontColor andText:(NSString *)textStr;

//设置字体图标
- (void)setTitleIconWith:(CGFloat)fontSize andColor:(UIColor *)fontColor andText:(NSString *)textStr;
/**
 *  Methot that capture a image from that view
 */
- (UIImageView *) imageInNavController: (UINavigationController *) navController;

/**
 *  没有数据的是够添加的view
 */
+ (UIView *)noDataViewWithView:(UIView *)view;

/**
 *  没有数据的是够添加的view和内容
 */
+ (UIView *)noDataViewWithView:(UIView *)view content:(NSString *)content;


- (UIViewController *)getViewController;
- (UINavigationController *)getNavController;

- (void)removeAllConstraint;

//获取当前正在显示的界面
+ (UIViewController *)getCurrentVC;

@end
