//
//  HeadeView.m
//  AddressFromMap
//
//  Created by 崔逢举 on 2018/8/27.
//  Copyright © 2018年 uxiu.me. All rights reserved.
//

#import "HeadeView.h"
@interface HeadeView()


@end

@implementation HeadeView
- (instancetype)initWithFrame:(CGRect)frame {
    if (self = [super initWithFrame:frame]) {
        self.image = [[UIImageView alloc]initWithFrame:CGRectMake(10, 14, 16, 16)];
        [self.image setImage:[UIImage imageNamed:@"location"]];
        [self addSubview:self.image];
        self.label = [[UILabel alloc]initWithFrame:CGRectMake(CGRectGetMaxX(self.image.frame) + 5, 0, 100, 44)];
        self.label.text = @"附近地址";
        self.label.textColor = [UIColor colorWithHexString:@"#7BBD28"];
        self.label.font = [UIFont systemFontOfSize:15];
        self.label.textAlignment = NSTextAlignmentLeft;
        [self addSubview:self.label];
    }
    return self;
}
/*
// Only override drawRect: if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
- (void)drawRect:(CGRect)rect {
    // Drawing code
}
*/

@end
