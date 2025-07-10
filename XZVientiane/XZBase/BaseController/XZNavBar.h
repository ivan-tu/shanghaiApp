//
//  TYNavBar.h
//  TuiYa
//
//  Created by mqb on .
//  Copyright (c) 2015年 tuweia. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface XZNavBar : UIView

@property (nonatomic,strong) UIView   *navTitleView; //导航栏
@property (nonatomic,strong) UIButton *leftBarButton; //左button
@property (nonatomic,strong) UIButton *closeBarButton; //关闭button
@property (nonatomic,strong) UIButton *rightBarButton; //右button
@property (nonatomic,strong) UILabel *titleLable; //标题
@property (nonatomic,strong) UIView *lineView; //导航分隔线

- (void)updataFrame;
@end
