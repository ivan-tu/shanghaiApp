//
//  XZPicNavBar.m
//  XiangZhanBase
//
//  Created by yiliu on 16/6/8.
//  Copyright © 2016年 TuWeiA. All rights reserved.
//

#import "XZPicNavBar.h"

#define leftBarFont          [UIFont fontWithName:@"icomoon" size:14]
#define rightBarFont          [UIFont fontWithName:@"icomoon" size:16]

#define titleFont        [UIFont fontWithName:@"Helvetica" size:17]
#define barbuttonColor   [UIColor color000000]

#import "XZPicNavBar.h"
#import "UIView+AutoLayout.h"
#import "XZIcomoonDefine.h"
#import "UIView+addition.h"

@implementation XZPicNavBar

- (instancetype)init {
    self=[super init];
    if (self) {
        self.backgroundColor = [UIColor clearColor];
    }
    return self;
}

- (void)updataFrame {
    [self autoPinEdgeToSuperviewEdge:ALEdgeLeft  withInset:0];
    [self autoPinEdgeToSuperviewEdge:ALEdgeTop   withInset:0];
    [self autoPinEdgeToSuperviewEdge:ALEdgeRight withInset:0];
    [self autoSetDimension:ALDimensionHeight toSize:44];
    [self create];
}

- (void)create {
    self.leftBarButton=[UIButton newAutoLayoutView];
    self.leftBarButton.tag=5;
    [self.leftBarButton setTitleColor:[UIColor whiteColor] forState:UIControlStateNormal];
    self.leftBarButton.titleLabel.font=leftBarFont;
    [self.leftBarButton setTitle:Icon_close forState:UIControlStateNormal];
    [self addSubview:self.leftBarButton];
    [self.leftBarButton autoPinEdgeToSuperviewEdge:ALEdgeLeft  withInset:0];
    [self.leftBarButton autoPinEdgeToSuperviewEdge:ALEdgeTop   withInset:0];
    [self.leftBarButton autoPinEdgeToSuperviewEdge:ALEdgeBottom withInset:0];
    [self.leftBarButton autoSetDimension:ALDimensionWidth toSize:44];
    
    self.titleLable=[UILabel newAutoLayoutView];
    self.titleLable.textColor = [UIColor whiteColor];
    self.titleLable.font=titleFont;
    self.titleLable.font = [UIFont boldSystemFontOfSize:17.0];
    self.titleLable.backgroundColor=[UIColor clearColor];
    self.titleLable.textAlignment=NSTextAlignmentCenter;
    [self addSubview:self.titleLable];
    [self.titleLable autoPinEdgeToSuperviewEdge:ALEdgeLeft   withInset:44];
    [self.titleLable autoPinEdgeToSuperviewEdge:ALEdgeRight  withInset:44];
    [self.titleLable autoPinEdgeToSuperviewEdge:ALEdgeTop    withInset:0];
    [self.titleLable autoPinEdgeToSuperviewEdge:ALEdgeBottom withInset:0];
    
    self.rightBarButton=[UIButton newAutoLayoutView];
    self.rightBarButton.tag=10;
    self.rightBarButton.hidden=YES;
    self.rightBarButton.titleLabel.font=rightBarFont;
    [self.rightBarButton setTitleColor:[UIColor whiteColor] forState:UIControlStateNormal];
    [self.rightBarButton setTitle:Icon_more forState:UIControlStateNormal];
    [self addSubview:self.rightBarButton];
    [self.rightBarButton autoPinEdgeToSuperviewEdge:ALEdgeRight  withInset:5];
    [self.rightBarButton autoPinEdgeToSuperviewEdge:ALEdgeTop   withInset:0];
    [self.rightBarButton autoPinEdgeToSuperviewEdge:ALEdgeBottom withInset:0];
    [self.rightBarButton autoSetDimension:ALDimensionWidth toSize:44];
}
@end
