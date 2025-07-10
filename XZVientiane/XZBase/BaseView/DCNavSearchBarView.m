//
//  DCNavSearchBarView.m
//  CDDMall
//
//  Created by apple on 2017/6/3.
//  Copyright © 2017年 RocketsChen. All rights reserved.
//

#import "DCNavSearchBarView.h"
#import "UIView+DCExtension.h"
#import "DCConsts.h"
#import <Masonry.h>
// Controllers

// Models

// Views

// Vendors

// Categories

// Others

@interface DCNavSearchBarView ()

@end

@implementation DCNavSearchBarView

- (instancetype)initWithFrame:(CGRect)frame {
    if (self = [super initWithFrame:frame]) {
        
        [self setUpUI];
        
        UITapGestureRecognizer *tapGesture=[[UITapGestureRecognizer alloc]initWithTarget:self action:@selector(searchClick)];
        [self addGestureRecognizer:tapGesture];
    }
    return self;
}


- (void)setUpUI
{
    self.backgroundColor = [[UIColor whiteColor]colorWithAlphaComponent:1];
    _placeholdLabel = [[UILabel alloc]initWithFrame:CGRectZero];
    _placeholdLabel.font = [UIFont systemFontOfSize:14];
    _placeholdLabel.textColor = [UIColor lightGrayColor];
    _voiceImageBtn = [UIButton buttonWithType:UIButtonTypeCustom];
    [_voiceImageBtn setImage:[UIImage imageNamed:@"search"] forState:UIControlStateNormal];
    [_voiceImageBtn addTarget:self action:@selector(voiceButtonClick) forControlEvents:UIControlEventTouchUpInside];
    
    
    [self addSubview:_voiceImageBtn];
    [self addSubview:_placeholdLabel];
    
}

- (void)layoutSubviews
{
    [super layoutSubviews];
    [_voiceImageBtn mas_makeConstraints:^(MASConstraintMaker *make) {
        [make.left.equalTo(self)setOffset:DCMargin];
        make.top.equalTo(self);
        make.height.equalTo(self);
    }];
    [_placeholdLabel mas_makeConstraints:^(MASConstraintMaker *make) {
        [make.left.equalTo(self->_voiceImageBtn.mas_right)setOffset:DCMargin];
        make.top.equalTo(self);
        make.height.equalTo(self);
    }];

    
    //设置边角
    UIBezierPath *maskPath = [UIBezierPath bezierPathWithRoundedRect:self.bounds byRoundingCorners:UIRectCornerTopLeft | UIRectCornerTopRight | UIRectCornerBottomLeft | UIRectCornerBottomRight cornerRadii:CGSizeMake(2, 2)];
    CAShapeLayer *maskLayer = [[CAShapeLayer alloc] init];
    maskLayer.frame = self.bounds;
    maskLayer.path = maskPath.CGPath;
    self.layer.mask = maskLayer;
}

#pragma mark - Intial
- (void)awakeFromNib {
    [super awakeFromNib];

}

#pragma mark - Setter Getter Methods

- (void)searchClick
{
    !_searchViewBlock ?: _searchViewBlock();
}

#pragma mark - 语音点击回调
- (void)voiceButtonClick {
    !_voiceButtonClickBlock ? : _voiceButtonClickBlock();
}

@end
