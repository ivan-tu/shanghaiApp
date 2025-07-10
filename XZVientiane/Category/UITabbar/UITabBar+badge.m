//
//  UITabBar+badge.m
//  XZVientiane
//
//  Created by 崔逢举 on 2018/5/25.
//  Copyright © 2018年 崔逢举. All rights reserved.
//

#import "UITabBar+badge.h"
#define TabbarBadge_Nums 5.0
@implementation UITabBar (badge)
//显示角标

- (void)showBadgeOnItemIndex:(int)index withNum:(NSInteger)badgeNum{
    
    //移除之前的小红点
    
    [self removeBadgeOnItemIndex:index];
    
    //新建小红点
    
    UILabel *labNum = [[UILabel alloc]init];
    
    labNum.tag = 888 + index;
    
    labNum.layer.masksToBounds = YES;
    
    labNum.layer.cornerRadius = 18/2;//圆形
    
    labNum.backgroundColor = [UIColor redColor];//颜色：红色
    
    CGRect tabFrame = self.frame;
    
    //确定角标的位置
    
    float percentX = (index + 0.55) / TabbarBadge_Nums;
    
    CGFloat x = ceilf(percentX * tabFrame.size.width);
    
    CGFloat y = ceilf(0.1 * tabFrame.size.height)-2;
    
    labNum.frame = CGRectMake(x, y, 18, 18);//圆形大小为18
    
    //-30*screenWidth/375
    if (badgeNum > 99) {
        labNum.text = [NSString stringWithFormat:@"··"];
    }
    else {
        labNum.text = [NSString stringWithFormat:@"%ld",(long)badgeNum];
    }
    labNum.font = [UIFont systemFontOfSize:11];
    labNum.textColor = [UIColor whiteColor];
    
    labNum.adjustsFontSizeToFitWidth = YES;
    
    labNum.textAlignment = NSTextAlignmentCenter;
    
    [self addSubview:labNum];
    
}

//隐藏角标

- (void)hideBadgeOnItemIndex:(NSInteger)index{
    
    //移除小红点
    
    [self removeBadgeOnItemIndex:index];
    
}

//移除角标

- (void)removeBadgeOnItemIndex:(NSInteger)index{
    
    //按照tag值进行移除
    
    for (UIView *subView in self.subviews) {
        
        if (subView.tag == 888+index) {
            
            [subView removeFromSuperview];
            
        }
        
    }
    
}
//显示小红点

- (void)showRedDotOnItemIndex:(int)index{
    
    //移除之前的小红点
    
    [self removeRedDotOnItemIndex:index];
    
    //新建小红点
    
    UILabel *labNum = [[UILabel alloc]init];
    
    labNum.tag = 999 + index;
    
    labNum.layer.masksToBounds = YES;
    
    labNum.layer.cornerRadius = 10/2;//圆形
    
    labNum.backgroundColor = [UIColor redColor];//颜色：红色
    
    CGRect tabFrame = self.frame;
    
    //确定小红点的位置
    
    float percentX = (index + 0.55) / TabbarBadge_Nums;
    
    CGFloat x = ceilf(percentX * tabFrame.size.width);
    
    CGFloat y = ceilf(0.1 * tabFrame.size.height)+2;
    
    labNum.frame = CGRectMake(x, y, 10, 10);//圆形大小为6
    
    labNum.adjustsFontSizeToFitWidth = YES;
    
    labNum.textAlignment = NSTextAlignmentCenter;
    
    [self addSubview:labNum];
    
}

//隐藏小红点

- (void)hideRedDotOnItemIndex:(NSInteger)index{
    
    //移除小红点
    
    [self removeRedDotOnItemIndex:index];
    
}

//移除小红点

- (void)removeRedDotOnItemIndex:(NSInteger)index{
    
    //按照tag值进行移除
    
    for (UIView *subView in self.subviews) {
        
        if (subView.tag == 999+index) {
            
            [subView removeFromSuperview];
            
        }
        
    }
    
}
@end
