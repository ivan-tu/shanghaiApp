//
//  TYNavBar.m
//  TuiYa
//
//  Created by mqb on .
//  Copyright (c) 2015年 tuweia. All rights reserved.
//


#define barFont          [UIFont fontWithName:@"icomoon" size:20]
#define titleFont        [UIFont fontWithName:@"Helvetica" size:18]
#define barbuttonColor   [UIColor color000000]

#import "XZNavBar.h"
#import "UIView+AutoLayout.h"
#import "UIColor+addition.h"
#import "XZIcomoonDefine.h"
#import "UIView+addition.h"
#import <Masonry.h>
static inline BOOL isIPhoneXSeries() {
    BOOL iPhoneXSeries = NO;
    if (UIDevice.currentDevice.userInterfaceIdiom != UIUserInterfaceIdiomPhone) {
        return iPhoneXSeries;
    }
    
    if (@available(iOS 11.0, *)) {
        UIWindow *mainWindow = [[[UIApplication sharedApplication] delegate] window];
        if (mainWindow.safeAreaInsets.bottom > 0.0) {
            iPhoneXSeries = YES;
        }
    }
    
    return iPhoneXSeries;
}
@implementation XZNavBar

- (instancetype)init {
    self=[super init];
    if (self) {
        self.backgroundColor = [UIColor whiteColor];
    }
    return self;
}

- (void)updataFrame {
    if (isIPhoneXSeries()) {
        [self mas_makeConstraints:^(MASConstraintMaker *make) {
            make.top.left.right.mas_equalTo(self.superview);
            make.height.mas_equalTo(88);
        }];
    }
    else {
        [self mas_makeConstraints:^(MASConstraintMaker *make) {
            make.top.left.right.mas_equalTo(self.superview);
            make.height.mas_equalTo(64);
        }];
    }
    [self create];
}

- (void)create {
    
    self.navTitleView.alpha=0.95;
    self.navTitleView=[UIView newAutoLayoutView];
    self.navTitleView.backgroundColor=[UIColor clearColor];
    [self addSubview:self.navTitleView];

    [self.navTitleView autoPinEdgeToSuperviewEdge:ALEdgeLeft  withInset:0];
    [self.navTitleView autoPinEdgeToSuperviewEdge:ALEdgeTop   withInset:isIPhoneXSeries() ? 44 : 20];
    [self.navTitleView autoPinEdgeToSuperviewEdge:ALEdgeRight withInset:0];
    [self.navTitleView autoPinEdgeToSuperviewEdge:ALEdgeBottom withInset:0];
    
    self.leftBarButton=[UIButton newAutoLayoutView];
    self.leftBarButton.tag=5;
    [self.leftBarButton setTitleColor:[UIColor color000000] forState:UIControlStateNormal];
    self.leftBarButton.titleLabel.font=barFont;
    [self.leftBarButton setTitle:Icon_arrow_l forState:UIControlStateNormal];
    [self.navTitleView addSubview:self.leftBarButton];
    [self.leftBarButton autoPinEdgeToSuperviewEdge:ALEdgeLeft  withInset:0];
    [self.leftBarButton autoPinEdgeToSuperviewEdge:ALEdgeTop   withInset:0];
    [self.leftBarButton autoPinEdgeToSuperviewEdge:ALEdgeBottom withInset:0];
    [self.leftBarButton autoSetDimension:ALDimensionWidth toSize:30];
    
    self.closeBarButton=[UIButton newAutoLayoutView];
    [self.closeBarButton setTitleImageWith:15.0 andColor:[UIColor color000000] andText:Icon_close];
    [self.navTitleView addSubview:self.closeBarButton];
    [self.closeBarButton autoPinEdgeToSuperviewEdge:ALEdgeLeft  withInset:45];
    [self.closeBarButton autoPinEdgeToSuperviewEdge:ALEdgeTop   withInset:0];
    [self.closeBarButton autoPinEdgeToSuperviewEdge:ALEdgeBottom withInset:0];
    [self.closeBarButton autoSetDimension:ALDimensionWidth toSize:25];
    
    self.titleLable=[UILabel newAutoLayoutView];
    self.titleLable.textColor = [UIColor color333333];
    self.titleLable.font=titleFont;
    self.titleLable.font = [UIFont boldSystemFontOfSize:17.0];
    self.titleLable.backgroundColor=[UIColor clearColor];
    self.titleLable.textAlignment=NSTextAlignmentCenter;
    [self.navTitleView addSubview:self.titleLable];
    [self.titleLable autoPinEdgeToSuperviewEdge:ALEdgeLeft   withInset:60];
    [self.titleLable autoPinEdgeToSuperviewEdge:ALEdgeRight  withInset:55];
    [self.titleLable autoPinEdgeToSuperviewEdge:ALEdgeTop    withInset:0];
    [self.titleLable autoPinEdgeToSuperviewEdge:ALEdgeBottom withInset:0];
    
    self.rightBarButton=[UIButton newAutoLayoutView];
    self.rightBarButton.tag=10;
    self.rightBarButton.hidden=YES;
    self.rightBarButton.titleLabel.font=barFont;
    [self.rightBarButton setTitleColor:[UIColor color000000] forState:UIControlStateNormal];
    [self.rightBarButton setTitle:Icon_arrow_r forState:UIControlStateNormal];
    [self.navTitleView addSubview:self.rightBarButton];
    [self.rightBarButton autoPinEdgeToSuperviewEdge:ALEdgeRight  withInset:5];
    [self.rightBarButton autoPinEdgeToSuperviewEdge:ALEdgeTop   withInset:0];
    [self.rightBarButton autoPinEdgeToSuperviewEdge:ALEdgeBottom withInset:0];
    [self.rightBarButton autoSetDimension:ALDimensionWidth toSize:50];
    
    self.lineView = [UIView newAutoLayoutView];
    [self.navTitleView addSubview:self.lineView];
    self.lineView.backgroundColor = [UIColor colorE1e1e1];
    [self.lineView autoPinEdgeToSuperviewEdge:ALEdgeLeft withInset:0];
    [self.lineView autoPinEdgeToSuperviewEdge:ALEdgeRight withInset:0];
    [self.lineView autoPinEdgeToSuperviewEdge:ALEdgeBottom withInset:0];
    [self.lineView autoSetDimension:ALDimensionHeight toSize:1];
    }
@end
