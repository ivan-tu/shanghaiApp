//
//  JFCityViewController.h
//  JFFootball
//
//  Created by 崔逢举 on 2016/11/21.
//  Copyright © 2016年 崔逢举. All rights reserved.
//

#import <UIKit/UIKit.h>

@protocol JFCityViewControllerDelegate <NSObject>

- (void)cityName:(NSString *)name cityCode:(NSString *)code;

@end

@interface JFCityViewController : UIViewController
@property(nonatomic,copy)NSString *locationTitle;
@property (nonatomic, weak) id<JFCityViewControllerDelegate> delegate;
@end
