//
//  XZOrderModel.h
//  XiangZhan
//
//  Created by tuweia on 15/11/19.
//  Copyright © 2015年 tuweia. All rights reserved.
//

#import "XZJsonModel.h"
@interface XZOrderModel : XZJsonModel

@property(nonatomic, copy) NSString * partner;
@property(nonatomic, copy) NSString * seller;
@property(nonatomic, copy) NSString * tradeNO;
@property(nonatomic, copy) NSString * productName;
@property(nonatomic, copy) NSString * productDescription;
@property(nonatomic, copy) NSString * amount;
@property(nonatomic, copy) NSString * notifyURL;

@property(nonatomic, copy) NSString * service;
@property(nonatomic, copy) NSString * paymentType;
@property(nonatomic, copy) NSString * inputCharset;
@property(nonatomic, copy) NSString * itBPay;
@property(nonatomic, copy) NSString * showUrl;

@property(nonatomic, copy) NSString *sign;
@property(nonatomic, copy) NSString *scheme;


@property(nonatomic, copy) NSString * rsaDate;//可选
@property(nonatomic, copy) NSString * appID;//可选

@property(nonatomic, readonly) NSMutableDictionary * extraParams;

@end
