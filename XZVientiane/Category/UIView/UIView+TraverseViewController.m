//
//  UIView+TraverseViewController.m
//  DogFamily
//
//  Created by user on 14-7-7.
//  Copyright (c) 2014年 Tm. All rights reserved.
//
#import "UIView+TraverseViewController.h"

@implementation UIView (TraverseViewController)

- (UIViewController *)firstAvailableUIViewController {
    // convenience function for casting and to "mask" the recursive function
    return (UIViewController *)[self traverseResponderChainForUIViewController];
}

- (id)traverseResponderChainForUIViewController {
    id nextResponder = [self nextResponder];
    if ([nextResponder isKindOfClass:[UIViewController class]]) {
        return nextResponder;
    } else if ([nextResponder isKindOfClass:[UIView class]]) {
        return [nextResponder traverseResponderChainForUIViewController];
    } else {
        return nil;
    }
}



@end
