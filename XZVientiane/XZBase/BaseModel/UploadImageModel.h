//
//  UploadImageModel.h
//  XiangZhanBase
//
//  Created by yiliu on 16/6/2.
//  Copyright © 2016年 TuWeiA. All rights reserved.
//

#import "XZJsonModel.h"

@interface UploadImageModel : XZJsonModel
@property (copy, nonatomic) NSString *appId;
@property (assign, nonatomic) NSInteger count;
@property (copy, nonatomic) NSString *cropper;
@property (copy, nonatomic) NSString *filters;
@property (copy, nonatomic) NSString *folderId;
@property (copy, nonatomic) NSString *maxFiles;
@property (assign, nonatomic) unsigned long long max_size;
@property (copy, nonatomic) NSString *title;
@property (copy, nonatomic) NSString *type;
@property (copy, nonatomic) NSString *userId;
@property (copy, nonatomic) NSString *watermark;
@end
