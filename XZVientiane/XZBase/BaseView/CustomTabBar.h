//
//  CustomTabBar.h
//  MaYiXiaoDao
//
//  Created by cuifengju on 17/3/24.
//  Copyright © 2017年 崔逢举. All rights reserved.
//

#import <UIKit/UIKit.h>
@class CustomTabBar;
//#warning ZTTabBar继承自UITabBar，所以ZTTabBar的代理必须遵循UITabBar的代理协议！
@protocol CustomTabBarDelegate <UITabBarDelegate>

@optional

- (void)tabBarDidClickPlusButton:(CustomTabBar *)tabBar;

@end



@interface CustomTabBar : UITabBar
@property (nonatomic, weak) id<CustomTabBarDelegate> tabbardelegate;

@end
