//
//  CFJAdressPickerView.h
//  XiangZhanClient
//
//  Created by 崔逢举 on 2017/11/24.
//  Copyright © 2017年 TuWeiA. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "MOFSToolbar.h"
#import "AddressModel.h"
typedef NS_ENUM(NSInteger, CFJSearchType) {
    CFJSearchTypeAddress = 0,
    CFJSearchTypeZipcode = 1,
    CFJSearchTypeAddressIndex = 2,
    CFJSearchTypeZipcodeIndex = 3,
};
@interface CFJAdressPickerView : UIPickerView
@property (nonatomic, assign) NSInteger showTag;
@property (nonatomic, strong) MOFSToolbar *toolBar;
@property (nonatomic, strong) UIView *containerView;
- (void)showMOFSAddressPickerCommitBlock:(void(^)(NSString *address, NSString *zipcode))commitBlock cancelBlock:(void(^)(void))cancelBlock;

- (void)searchType:(CFJSearchType)searchType key:(NSString *)key block:(void(^)(NSString *result))block;
@end
