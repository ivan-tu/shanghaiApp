//
//  UIButton+EnlargeTouchArea.h
//  XiangZhanClient
//
//  Created by 崔逢举 on 2017/11/6.
//  Copyright © 2017年 TuWeiA. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface UIButton (EnlargeTouchArea)
- (void)setEnlargeEdgeWithTop:(CGFloat) top right:(CGFloat) right bottom:(CGFloat) bottom left:(CGFloat) left;

- (void)setEnlargeEdge:(CGFloat) size;  
@end
