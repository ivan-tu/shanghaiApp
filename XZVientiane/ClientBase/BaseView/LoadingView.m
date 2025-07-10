//
//  LoadingView.m
//  XiangZhanClient
//
//  Created by CFJ on 16/7/14.
//  Copyright © 2016年 TuWeiA. All rights reserved.
//

#import "LoadingView.h"
@implementation LoadingView

- (id)initWithFrame:(CGRect)frame {
    self = [super initWithFrame:frame];
    if (self) {
        self.backgroundColor = [UIColor whiteColor];
        [self createSubView];
    }
    return self;
}

- (void)createSubView {
    UIImageView *imageView = [[UIImageView alloc] initWithFrame:CGRectMake(0, 0, [UIScreen mainScreen].bounds.size.width, [UIScreen mainScreen].bounds.size.height)];
    UIImage *img = [UIImage getLaunchImage];
    [imageView setImage:img];
    [self addSubview:imageView];
}

@end
