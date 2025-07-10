//
//  ProgressView.m
//  XiangZhan
//
//  Created by CFJ on 16/4/20.
//  Copyright © 2016年 tuweia. All rights reserved.
//

#import "ProgressView.h"

@implementation ProgressView

- (void)drawRectWithProgress:(CGFloat)progress {
    self.progress = progress;
    [self setNeedsDisplay];
}

- (void)drawRect:(CGRect)rect {
    CGRect newRect = CGRectMake(0, 0, self.bounds.size.width * self.progress, self.bounds.size.height);
//    [[UIColor colorWithRed:251/255. green:229/255. blue:229/255. alpha:1.0] set];
    if (self.progress >= 1.0) {
        [UIColor clearColor];
        UIRectFill(CGRectZero);
        return;
    }
    
    [[UIColor colorf6f6f6] set];
    UIRectFill(newRect);
}

@end
