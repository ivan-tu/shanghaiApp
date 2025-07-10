//
//  PublishProgressView.m
//  TuiYa
//
//  Created by CFJ on 15/7/7.
//  Copyright (c) 2015年 tuweia. All rights reserved.
//

#import "PublishProgressView.h"

@interface PublishProgressView ()

@end

@implementation PublishProgressView

- (id)initWithFrame:(CGRect)frame {
    
    self = [super initWithFrame:frame];
    if (self) {
        [self createView];
    }
    return self;
}

- (void)createView {
    
    self.backgroundColor = [UIColor colorWithRed:255./255. green:255./255. blue:255./255. alpha:0.95];
    
    self.cancelBtn = [UIButton autolayoutView];
    self.cancelBtn.layer.cornerRadius = 5.;
    self.cancelBtn.layer.masksToBounds = YES;
    self.cancelBtn.backgroundColor = [UIColor colorWithHexString:@"#46e0db"];
    [self.cancelBtn setTitleColor:[UIColor whiteColor] forState:UIControlStateNormal];
    [self.cancelBtn setTitle:@"取消" forState:UIControlStateNormal];
    [self.cancelBtn.titleLabel setFont:[UIFont systemFontOfSize:15]];
    [self addSubview:self.cancelBtn];
    
    self.titleLabel = [UILabel autolayoutView];
    self.titleLabel.font = [UIFont systemFontOfSize:15];
    self.titleLabel.textColor = [UIColor colorWithHexString:@"999999"];
    self.titleLabel.textAlignment = NSTextAlignmentCenter;
    [self addSubview:self.titleLabel];
    
    self.progressView = [UIProgressView autolayoutView];
    self.progressView.progressTintColor = [UIColor colorWithHexString:@"#46e0db"];
    [self addSubview:self.progressView];
    
    NSDictionary *bindDic = NSDictionaryOfVariableBindings(_cancelBtn,_titleLabel,_progressView);
    
    [self.titleLabel autoAlignAxisToSuperviewAxis:ALAxisHorizontal];
    
    [self addConstraints:[NSLayoutConstraint constraintsWithVisualFormat:@"V:[_titleLabel(==21)]-8-[_progressView(==2)]" options:0 metrics:nil views:bindDic]];
    [self addConstraints:[NSLayoutConstraint constraintsWithVisualFormat:@"V:[_cancelBtn(==44)]-90-|" options:0 metrics:nil views:bindDic]];
    [self addConstraints:[NSLayoutConstraint constraintsWithVisualFormat:@"H:|-50-[_progressView]-50-|" options:0 metrics:nil views:bindDic]];
    [self addConstraints:[NSLayoutConstraint constraintsWithVisualFormat:@"H:|-60-[_cancelBtn]-60-|" options:0 metrics:nil views:bindDic]];
    [self addConstraints:[NSLayoutConstraint constraintsWithVisualFormat:@"H:|-10-[_titleLabel]-10-|" options:0 metrics:nil views:bindDic]];
}
@end
