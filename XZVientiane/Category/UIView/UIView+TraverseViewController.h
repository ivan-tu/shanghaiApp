//
//  UIView+TraverseViewController.h
//  DogFamily
//
//  Created by user on 14-7-7.
//  Copyright (c) 2014年 Tm. All rights reserved.
//
#import <UIKit/UIKit.h>

@interface UIView (TraverseViewController)

- (UIViewController *)firstAvailableUIViewController;
- (id)traverseResponderChainForUIViewController;

@end
