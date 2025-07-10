//
//  PublishProgressView.h
//  TuiYa
//
//  Created by CFJ on 15/7/7.
//  Copyright (c) 2015年 tuweia. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "UIView+addition.h"
#import "UIView+AutoLayout.h"

@interface PublishProgressView : UIView

@property (strong, nonatomic) UIButton *cancelBtn;
@property (strong, nonatomic) UIProgressView *progressView;
@property (strong, nonatomic) UILabel *titleLabel;
@property (assign, nonatomic) NSInteger maxCount;
@property (assign, nonatomic) NSInteger count;

@end
