//
//  UIImage+tool.h
//  TuiYa
//
//  Created by on 15/5/20.
//  Copyright (c) 2015年. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <AVFoundation/AVFoundation.h>
#import <AssetsLibrary/ALAssetsLibrary.h>
#import <AssetsLibrary/ALAssetsGroup.h>
#import <AssetsLibrary/ALAssetRepresentation.h>

@interface UIImage (tool)


//获取启动页图片
+ (instancetype)getLaunchImage;

/**
 *  通过颜色创建image
 *
 *  @param aColor 颜色
 *
 *  @return image
 */
+ (UIImage *)imageWithColor:(UIColor *)aColor;
+ (UIImage *)imageWithColor:(UIColor *)aColor size:(CGSize)size;

//设置图片透明度
- (UIImage *)imageByApplyingAlpha:(CGFloat)alpha;

/**
 *  等比例缩放
 *
 *  @param size 大小
 *
 *  @return image
 */
-(UIImage*)scaleToSize:(CGSize)size;

/**
 *	按照尺寸缩放图片
 *
 *	@param aSize 大小
 *
 *	@return 图片
 */

- (UIImage *)shrinkImageForSize:(CGSize)aSize;

/**
 *	功能:存储图片到doc目录
 *
 *	@param imageName :图片名称
 *	@param aQuality  :压缩比率
 *
 *	@return 图片
 */
- (NSString *)saveImageWithName:(NSString *)imageName
		  forCompressionQuality:(CGFloat )aQuality;


+ (NSData *)saveImage:(UIImage *)img withQuality:(CGFloat)aQuality;
//获取视频的第一张图片
+ (UIImage *)thumbnailImageForVideo:(NSURL *)videoURL atTime:(NSTimeInterval)time;


+ (UIImage *)captureView:(UIView *)view;

+ (UIImage *)captureScreen;

/**
 * 拍摄照片返回图片方向修正
 */
- (UIImage *)fixOrientation;

/**
 * 默认头像
 */
+ (UIImage *)headPlaceHolderImage;

/**
 * 剪切rect包含的图片
 */
+ (UIImage *)cropImage:(UIImage *)image inRect:(CGRect)rect;


+ (UIImage *)imageWithImage:(UIImage *)image scaledToSize:(CGSize)newSize;

//设置文字水印
+ (UIImage *)watermarkImage:(UIImage *)img withData:(id)setDic;

//设置图片水印
+ (UIImage *)addImageLogo:(UIImage *)img withData:(NSDictionary *)setDic;

//压缩图片大小
+ (NSData *)compressImage:(UIImage *)image toByte:(NSUInteger)maxLength;
@end
