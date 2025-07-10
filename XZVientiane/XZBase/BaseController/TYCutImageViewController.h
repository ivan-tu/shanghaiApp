//
//  TYCutImageViewController.h
//  CropImage
//
//  Created by mqb on .
//  Copyright (c) 2015年 杨 烽. All rights reserved.
//

#import <UIKit/UIKit.h>
@class TYCutImageMaskView;
typedef void(^Comeplete)(UIImage*image);
@interface TYCutImageViewController : UIViewController
{
    TYCutImageMaskView*MaskView;
}
//要裁减的图片的宽高比例 
@property (nonatomic,assign) float proportion;
//要裁减的图片
@property (nonatomic,retain) UIImage *cutImage;

@property (nonatomic,copy) Comeplete comeplete;
@end

@interface TYCutImageMaskView : UIView {
@private
    CGRect  ShowRect;//截图框的大小
}
- (void)setShowRect:(CGSize)size;
- (CGSize)ShowRect;
@end