//
//  AddressFromMapViewController.h
//  Dynasty.dajiujiao
//
//  Created by uxiu.me on 2018/7/10.
//  Copyright © 2018年 HangZhouFaDaiGuoJiMaoYi Co. Ltd. All rights reserved.
//

#import <UIKit/UIKit.h>
// 临时注释MAMapKit导入，等待SDK问题解决
 #import <MAMapKit/MAMapKit.h>
#import <AMapFoundationKit/AMapFoundationKit.h>
#import <CoreLocation/CoreLocation.h>

@interface AddressFromMapViewController : UIViewController
@property (nonatomic,  strong ) NSMutableArray *addressList;

@property (nonatomic,  copy ) void(^selectedEvent)(CLLocationCoordinate2D coordinate , NSString *addressName, NSString*formattedAddress);

@end
