//
//  UITabBar+badge.h
//  XZVientiane
//
//  Created by 崔逢举 on 2018/5/25.
//  Copyright © 2018年 崔逢举. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface UITabBar (badge)

- (void)showBadgeOnItemIndex:(int)index withNum:(NSInteger)badgeNum;
- (void)hideBadgeOnItemIndex:(NSInteger)index;
- (void)showRedDotOnItemIndex:(int)index;
- (void)hideRedDotOnItemIndex:(NSInteger)index;
@end
