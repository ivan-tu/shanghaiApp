//
//  CustomTabBar.m
//  MaYiXiaoDao
//
//  Created by cuifengju on 17/3/24.
//  Copyright © 2017年 崔逢举. All rights reserved.
//

#import "CustomTabBar.h"
#import "UIView+Extension.h"
@interface CustomTabBar ()
@property (nonatomic, weak) UIButton *plusBtn;
@property (nonatomic, assign) BOOL isChoose;
@end
@implementation CustomTabBar
- (instancetype)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self) {
        UIButton *plusBtn = [UIButton new];
        [plusBtn setBackgroundImage:[UIImage imageNamed:@"serviceCenter"] forState:UIControlStateNormal];
        [plusBtn addTarget:self action:@selector(plusBtnClick) forControlEvents:UIControlEventTouchUpInside];
        plusBtn.bounds = CGRectMake(0, 0, 58, 58);
        [self addSubview:plusBtn];
        [self bringSubviewToFront:plusBtn];
        self.plusBtn = plusBtn;
        self.translucent = NO;
    }
    return self;
}
/**
 *  加号按钮点击
 */
- (void)plusBtnClick
{
    // 通知代理
    if ([self.tabbardelegate respondsToSelector:@selector(tabBarDidClickPlusButton:)]) {
        [self.tabbardelegate tabBarDidClickPlusButton:self];
    }
}
/**
 *  想要重新排布系统控件subview的布局，推荐重写layoutSubviews，在调用父类布局后重新排布。
 */
- (void)layoutSubviews
{
    [super layoutSubviews];
    // 1.设置加号按钮的位置
    self.plusBtn.centerX = self.width*0.5;
    self.plusBtn.centerY = self.height*0.1;
    NSMutableArray *list = [NSMutableArray arrayWithCapacity:2];
    for (UIView *child in self.subviews) {
        Class class = NSClassFromString(@"UITabBarButton");
        if (![child isKindOfClass:class]) {
            continue;
        }
        else{
            [list addObject:child];
        }
    }
    // 2.设置其他tabbarButton的frame
    CGFloat tabBarButtonW = self.width / 3.5;
    CGFloat tabBarButtonIndex = 0;
    if (list.count == 2) {
        NSMutableArray *sortList = [self QuickSort:list StartIndex:0 EndIndex:1];
        for (UIView *child in sortList) {
                // 设置x
                child.x = tabBarButtonIndex * tabBarButtonW;
                // 设置宽度
                child.width = tabBarButtonW;
            // 增加索引
            tabBarButtonIndex++;
            if (tabBarButtonIndex == 1) {
                tabBarButtonIndex+=1.5;
            }
        }
    }
}
//快速排序
-(NSMutableArray *)QuickSort:(NSMutableArray *)list StartIndex:(int)startIndex EndIndex:(int)endIndex{
    if(startIndex >= endIndex)return nil;
    UIView * temp = [list objectAtIndex:startIndex];
    int tempIndex = startIndex; //临时索引 处理交换位置(即下一个交换的对象的位置)
    for(int i = startIndex + 1 ; i <= endIndex ; i++){
        UIView *t = [list objectAtIndex:i];
        if(temp.frame.origin.x > t.frame.origin.x){
            tempIndex = tempIndex + 1;
            [list exchangeObjectAtIndex:tempIndex withObjectAtIndex:i];
        }
    }
    [list exchangeObjectAtIndex:tempIndex withObjectAtIndex:startIndex];
    [self QuickSort:list StartIndex:startIndex EndIndex:tempIndex -1];
    [self QuickSort:list StartIndex:tempIndex+1 EndIndex:endIndex];
    return list;
}
//重写hitTest方法，去监听发布按钮的点击，目的是为了让凸出的部分点击也有反应
- (UIView *)hitTest:(CGPoint)point withEvent:(UIEvent *)event {
    //这一个判断是关键，不判断的话push到其他页面，点击发布按钮的位置也是会有反应的，这样就不好了
    //self.isHidden == NO 说明当前页面是有tabbar的，那么肯定是在导航控制器的根控制器页面
    //在导航控制器根控制器页面，那么我们就需要判断手指点击的位置是否在发布按钮身上
    //是的话让发布按钮自己处理点击事件，不是的话让系统去处理点击事件就可以了
    if (self.isHidden == NO) {
        
        //将当前tabbar的触摸点转换坐标系，转换到发布按钮的身上，生成一个新的点
        CGPoint newP = [self convertPoint:point toView:self.plusBtn];
        
        //判断如果这个新的点是在发布按钮身上，那么处理点击事件最合适的view就是发布按钮
        if ( [self.plusBtn pointInside:newP withEvent:event]) {
            return self.plusBtn;
        }else{//如果点不在发布按钮身上，直接让系统处理就可以了
            return [super hitTest:point withEvent:event];
        }
    }
    else {//tabbar隐藏了，那么说明已经push到其他的页面了，这个时候还是让系统去判断最合适的view处理就好了
        return [super hitTest:point withEvent:event];
    }
}
- (void)setFrame:(CGRect)frame
{
    if (self.superview && CGRectGetMaxY(self.superview.bounds) != CGRectGetMaxY(frame)) {
        frame.origin.y = CGRectGetHeight(self.superview.bounds) - CGRectGetHeight(frame);
    }
    [super setFrame:frame];
}
@end
