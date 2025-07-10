//
//  UIImage+tool.m
//  TuiYa
//
//  Created by  on 15/5/20.
//  Copyright (c) 2015年 . All rights reserved.
//

#import "UIImage+tool.h"
#import "BaseFileManager.h"
#import "NSString+addition.h"
#define FILEPATH @"http://okgo.top/"

@implementation UIImage (tool)

+ (instancetype)getLaunchImage {
    CGSize viewSize = [UIScreen mainScreen].bounds.size;
    NSString *viewOrientation = @"Portrait";
    NSString *launchImage = nil;
    NSArray *imageDict = [[[NSBundle mainBundle] infoDictionary] valueForKey:@"UILaunchImages"];
    for (NSDictionary *dict in imageDict) {
        CGSize imageSize = CGSizeFromString(dict[@"UILaunchImageSize"]);
        if (CGSizeEqualToSize(imageSize, viewSize) && [viewOrientation isEqualToString:dict[@"UILaunchImageOrientation"]]) {
            launchImage = dict[@"UILaunchImageName"];
        }
    }
    return [UIImage imageNamed:launchImage];
}


+ (UIImage *)imageWithColor:(UIColor *)aColor
{
    CGRect rect = CGRectMake(0.0f, 0.0f, 1.0f, 1.0f);
    UIGraphicsBeginImageContext(rect.size);
    CGContextRef context = UIGraphicsGetCurrentContext();
    CGContextSetFillColorWithColor(context, [aColor CGColor]);
    CGContextFillRect(context, rect);
    UIImage *theImage = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    return theImage;
}

+ (UIImage *)imageWithColor:(UIColor *)aColor size:(CGSize)size
{
    CGRect rect = CGRectMake(0.0f, 0.0f, size.width, size.height);
    UIGraphicsBeginImageContext(rect.size);
    CGContextRef context = UIGraphicsGetCurrentContext();
    CGContextSetFillColorWithColor(context, [aColor CGColor]);
    CGContextFillRect(context, rect);
    UIImage *theImage = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    return theImage;
}

//设置图片透明度
- (UIImage *)imageByApplyingAlpha:(CGFloat)alpha
{
    UIGraphicsBeginImageContextWithOptions(self.size, NO, 0.0f);
    
    CGContextRef ctx = UIGraphicsGetCurrentContext();
    CGRect area = CGRectMake(0, 0, self.size.width, self.size.height);
    
    CGContextScaleCTM(ctx, 1, -1);
    CGContextTranslateCTM(ctx, 0, -area.size.height);
    
    CGContextSetBlendMode(ctx, kCGBlendModeMultiply);
    
    CGContextSetAlpha(ctx, alpha);
    
    CGContextDrawImage(ctx, area, self.CGImage);
    
    UIImage *newImage = UIGraphicsGetImageFromCurrentImageContext();
    
    UIGraphicsEndImageContext();
    
    return newImage;
}

//等比例缩放
-(UIImage*)scaleToSize:(CGSize)size
{
    //不用CGImageGetHeight(self.CGImage)，图片拍摄后会旋转90度，exif属性会记录，CGImageGetHeight实际会获得宽度而不是高度
    CGFloat width = self.size.width;
    CGFloat height = self.size.height;
    
    float verticalRadio = size.height*1.0/height;
    float horizontalRadio = size.width*1.0/width;
    
    float radio = 1;
    if(verticalRadio>1 && horizontalRadio>1)
    {
        radio = verticalRadio > horizontalRadio ? horizontalRadio : verticalRadio;
    }
    else
    {
        radio = verticalRadio < horizontalRadio ? verticalRadio : horizontalRadio;
    }
    
    width = width*radio;
    height = height*radio;
    
    int xPos = (size.width - width)/2;
    int yPos = (size.height - height)/2;
    
    // 创建一个bitmap的context
    // 并把它设置成为当前正在使用的context
    UIGraphicsBeginImageContext(size);
    
    // 绘制改变大小的图片
    [self drawInRect:CGRectMake(xPos, yPos, width, height)];
    
    // 从当前context中创建一个改变大小后的图片
    UIImage* scaledImage = UIGraphicsGetImageFromCurrentImageContext();
    
    // 使当前的context出堆栈
    UIGraphicsEndImageContext();
    
    // 返回新的改变大小后的图片
    return scaledImage;
}


- (UIImage *)shrinkImageForSize:(CGSize)aSize
{
	CGFloat scale = [UIScreen mainScreen].scale;
	CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
	CGContextRef context = CGBitmapContextCreate(NULL,
												 aSize.width * scale,
												 aSize.height * scale,
												 8,
												 0,
												 colorSpace,
												 kCGBitmapByteOrderDefault|kCGImageAlphaPremultipliedLast);
	CGContextDrawImage(context,
					   CGRectMake(0, 0, aSize.width * scale, aSize.height * scale),
					   self.CGImage);
	CGImageRef shrunken = CGBitmapContextCreateImage(context);
	UIImage *final = [UIImage imageWithCGImage:shrunken];
	CGContextRelease(context);
	CGImageRelease(shrunken);
	CGColorSpaceRelease(colorSpace);
	return final;
}

- (NSString *)saveImageWithName:(NSString *)imageName
		  forCompressionQuality:(CGFloat )aQuality
{
	if (aQuality < 0) {
		aQuality = 0;
	}
	if (aQuality > 1.0f) {
		aQuality = 1.0f;
	}

	NSData* imageData=UIImageJPEGRepresentation(self, aQuality);

    NSFileManager *fm = [NSFileManager defaultManager];
    NSString *draftFolder = [NSString stringWithFormat:@"%@/tuweiaDraft",[BaseFileManager appDocPath]];
    
    BOOL isDir;
    BOOL exists = [fm fileExistsAtPath:draftFolder isDirectory:&isDir];
    if (exists) {
        if (!isDir) {
            return nil;
        }
    }
    else {
        NSError *error;
        [fm createDirectoryAtPath:draftFolder withIntermediateDirectories:NO attributes:nil error:&error];
        if (error) {
            return nil;
        }
    }
    
    
	NSString* fullPathToFile = [draftFolder stringByAppendingPathComponent:[NSString stringWithFormat:@"%@",imageName]];
	if ([[NSFileManager defaultManager] fileExistsAtPath:fullPathToFile]) {
		[[NSFileManager defaultManager] removeItemAtPath:fullPathToFile error:nil];
	}

	NSLog(@"save image%@ At path %@",self,fullPathToFile);

	if (![imageData writeToFile:fullPathToFile atomically:NO]) {
		return nil;
	}
	return fullPathToFile;
}

+ (NSData *)saveImage:(UIImage *)img withQuality:(CGFloat)aQuality {
    if (aQuality < 0) {
        aQuality = 0;
    }
    if (aQuality > 1.0f) {
        aQuality = 1.0f;
    }
    NSData *imageData = UIImageJPEGRepresentation(img, aQuality);
    return imageData;
}

//获取视频的第一张图片
+ (UIImage *)thumbnailImageForVideo:(NSURL *)videoURL atTime:(NSTimeInterval)time {
    AVURLAsset *asset = [[AVURLAsset alloc] initWithURL:videoURL options:nil];
    NSParameterAssert(asset);
    AVAssetImageGenerator *assetImageGenerator = [[AVAssetImageGenerator alloc] initWithAsset:asset];
    assetImageGenerator.appliesPreferredTrackTransform = YES;
    assetImageGenerator.apertureMode = AVAssetImageGeneratorApertureModeEncodedPixels;

    CGImageRef thumbnailImageRef = NULL;
    CFTimeInterval thumbnailImageTime = time;
    NSError *thumbnailImageGenerationError = nil;
    thumbnailImageRef = [assetImageGenerator copyCGImageAtTime:CMTimeMake(thumbnailImageTime, 60) actualTime:NULL error:&thumbnailImageGenerationError];

    if (!thumbnailImageRef)
    NSLog(@"thumbnailImageGenerationError %@", thumbnailImageGenerationError);

    UIImage *thumbnailImage = thumbnailImageRef ? [[UIImage alloc] initWithCGImage:thumbnailImageRef] : nil;
    return thumbnailImage;
}

+ (UIImage *)captureView:(UIView *)view {
    
    if ([[UIScreen mainScreen] respondsToSelector:@selector(scale)])
        UIGraphicsBeginImageContextWithOptions(view.bounds.size, NO, [UIScreen mainScreen].scale);
    else
        UIGraphicsBeginImageContext(view.bounds.size);
    
    [view.layer renderInContext:UIGraphicsGetCurrentContext()];
    UIImage *image = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    
    return image;
}

+ (UIImage *)captureScreen {
    
    UIWindow *keyWindow = [[UIApplication sharedApplication] keyWindow];
    UIGraphicsBeginImageContext(keyWindow.bounds.size);
    [keyWindow.layer renderInContext:UIGraphicsGetCurrentContext()];
    UIImage *image = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    
    return image;
}


- (UIImage *)fixOrientation {
    
    // No-op if the orientation is already correct
    if (self.imageOrientation == UIImageOrientationUp) return self;
    
    // We need to calculate the proper transformation to make the image upright.
    // We do it in 2 steps: Rotate if Left/Right/Down, and then flip if Mirrored.
    CGAffineTransform transform = CGAffineTransformIdentity;
    
    switch (self.imageOrientation) {
        case UIImageOrientationDown:
        case UIImageOrientationDownMirrored:
            transform = CGAffineTransformTranslate(transform, self.size.width, self.size.height);
            transform = CGAffineTransformRotate(transform, M_PI);
            break;
            
        case UIImageOrientationLeft:
        case UIImageOrientationLeftMirrored:
            transform = CGAffineTransformTranslate(transform, self.size.width, 0);
            transform = CGAffineTransformRotate(transform, M_PI_2);
            break;
            
        case UIImageOrientationRight:
        case UIImageOrientationRightMirrored:
            transform = CGAffineTransformTranslate(transform, 0, self.size.height);
            transform = CGAffineTransformRotate(transform, -M_PI_2);
            break;
        case UIImageOrientationUp:
            
            break;
        case UIImageOrientationUpMirrored:
            
            break;
    }
    
    switch (self.imageOrientation) {
        case UIImageOrientationUp:
            
            break;
        case UIImageOrientationDown:
            
            break;
        case UIImageOrientationLeft:
            
            break;
        case UIImageOrientationRight:
            
            break;
        case UIImageOrientationUpMirrored:
        case UIImageOrientationDownMirrored:
            transform = CGAffineTransformTranslate(transform, self.size.width, 0);
            transform = CGAffineTransformScale(transform, -1, 1);
            break;
            
        case UIImageOrientationLeftMirrored:
        case UIImageOrientationRightMirrored:
            transform = CGAffineTransformTranslate(transform, self.size.height, 0);
            transform = CGAffineTransformScale(transform, -1, 1);
            break;
    }
    
    // Now we draw the underlying CGImage into a new context, applying the transform
    // calculated above.
    CGContextRef ctx = CGBitmapContextCreate(NULL, self.size.width, self.size.height,
                                             CGImageGetBitsPerComponent(self.CGImage), 0,
                                             CGImageGetColorSpace(self.CGImage),
                                             CGImageGetBitmapInfo(self.CGImage));
    CGContextConcatCTM(ctx, transform);
    switch (self.imageOrientation) {
        case UIImageOrientationLeft:
        case UIImageOrientationLeftMirrored:
        case UIImageOrientationRight:
        case UIImageOrientationRightMirrored:
            // Grr...
            CGContextDrawImage(ctx, CGRectMake(0,0,self.size.height,self.size.width), self.CGImage);
            break;
            
        default:
            CGContextDrawImage(ctx, CGRectMake(0,0,self.size.width,self.size.height), self.CGImage);
            break;
    }
    
    // And now we just create a new UIImage from the drawing context
    CGImageRef cgimg = CGBitmapContextCreateImage(ctx);
    UIImage *img = [UIImage imageWithCGImage:cgimg];
    CGContextRelease(ctx);
    CGImageRelease(cgimg);
    return img;
}

+ (UIImage *)headPlaceHolderImage
{
   return [UIImage imageNamed:@"headPlaceHolderImage"];
}

+ (UIImage *)cropImage:(UIImage *)image inRect:(CGRect)rect  {
    
    CGImageRef imageRef = CGImageCreateWithImageInRect(image.CGImage, rect);
    UIImage *resultImage = [UIImage imageWithCGImage:imageRef];
    CGImageRelease(imageRef);
    
    return resultImage;
}


+ (UIImage *)imageWithImage:(UIImage *)image scaledToSize:(CGSize)newSize {
    //UIGraphicsBeginImageContext(newSize);
    // In next line, pass 0.0 to use the current device's pixel scaling factor (and thus account for Retina resolution).
    // Pass 1.0 to force exact pixel size.
//    UIGraphicsBeginImageContextWithOptions(newSize, NO, 0.0);
//    [image drawInRect:CGRectMake(0, 0, newSize.width, newSize.height)];
//    UIImage *newImage = UIGraphicsGetImageFromCurrentImageContext();
//    UIGraphicsEndImageContext();
//    return newImage;
    
    [self beginImageContextWithSize:newSize];
    CGContextSetInterpolationQuality( UIGraphicsGetCurrentContext(), kCGInterpolationMedium);
    [image drawInRect:CGRectMake(0,0,newSize.width,newSize.height)];
    UIImage *newImage = UIGraphicsGetImageFromCurrentImageContext();
    [self endImageContext];
    return newImage;
}



+ (void)beginImageContextWithSize:(CGSize)size
{
    if ([[UIScreen mainScreen] respondsToSelector:@selector(scale)]) {
        if ([[UIScreen mainScreen] scale] == 2.0) {
            UIGraphicsBeginImageContextWithOptions(size, YES, 2.0);
        } else {
            UIGraphicsBeginImageContext(size);
        }
    } else {
        UIGraphicsBeginImageContext(size);
    }
}

+ (void)endImageContext
{
    UIGraphicsEndImageContext();
}

+ (UIImage*)imageFromView:(UIView*)view
{
    [self beginImageContextWithSize:[view bounds].size];
    BOOL hidden = [view isHidden];
    [view setHidden:NO];
    [[view layer] renderInContext:UIGraphicsGetCurrentContext()];
    UIImage *image = UIGraphicsGetImageFromCurrentImageContext();
    [self endImageContext];
    [view setHidden:hidden];
    return image;
}

+ (UIImage*)imageFromView:(UIView*)view scaledToSize:(CGSize)newSize
{
    UIImage *image = [self imageFromView:view];
    if ([view bounds].size.width != newSize.width ||
        [view bounds].size.height != newSize.height) {
        image = [self imageWithImage:image scaledToSize:newSize];
    }
    return image;
}

//设置字体水印
+ (UIImage *)watermarkImage:(UIImage *)img withData:(id)setDic
{
    int w = img.size.width;
    int h = img.size.height;
    UIGraphicsBeginImageContext(img.size);
    [img drawInRect:CGRectMake(0, 0, w, h)];
    
    //偏移的间距
    float space = 3.0;
    //根据返回的水印位置，确定水印的位置范围
    CGRect size ;
    float x;
    float y = 0.0;
    float width = w / 3.0 - space * 2;
    float height = h / 3.0 - space * 2;
    
    //文字内容
    NSString* mark = [setDic objectForKey:@"watermarkText"];
    UIFont *font = [UIFont systemFontOfSize:[[setDic objectForKey:@"fontSize"] floatValue]];
    //文字实际大小
    CGSize markSize = [NSString getStringSize:mark andFont:font andSize:CGSizeMake(width, 0)];
    
    NSMutableParagraphStyle *paragraphStyle = [[NSParagraphStyle defaultParagraphStyle] mutableCopy];
    paragraphStyle.lineBreakMode = NSLineBreakByTruncatingTail;
    NSDictionary *attr = @{
                           NSFontAttributeName: font,  //设置字体
                           NSForegroundColorAttributeName : [UIColor colorWithHexString:[setDic objectForKey:@"color"]],   //设置字体颜色
                           NSBackgroundColorAttributeName : [UIColor colorWithHexString:[setDic objectForKey:@"bColor"] alpha:[[setDic objectForKey:@"opacity"] floatValue]/100.0],
                           NSParagraphStyleAttributeName : paragraphStyle, //设置对齐方式
                           };

    paragraphStyle.lineBreakMode = NSLineBreakByCharWrapping;
    NSString *location = [setDic objectForKey:@"watermarkLocation"];
    if ([location isEqualToString:@"lt"]) {
        x = 0;
        y = 0;
        paragraphStyle.alignment = NSTextAlignmentLeft;
    } else if ([location isEqualToString:@"t"]) {
        x = w / 3.0;
        y = 0;
        paragraphStyle.alignment = NSTextAlignmentCenter;
    } else if ([location isEqualToString:@"rt"]) {
        x = w / 3.0 * 2;
        y = 0;
        paragraphStyle.alignment = NSTextAlignmentRight;
    } else if ([location isEqualToString:@"l"]) {
        x = 0;
        y = h / 3.0;
        paragraphStyle.alignment = NSTextAlignmentLeft;
    } else if ([location isEqualToString:@"c"]) {
        x = w / 3.0;
        y = h / 3.0;
        paragraphStyle.alignment = NSTextAlignmentCenter;
    } else if ([location isEqualToString:@"r"]) {
        x = w / 3.0 * 2;
        y = h / 3.0;
        paragraphStyle.alignment = NSTextAlignmentRight;
    } else if ([location isEqualToString:@"lb"]) {
        x = 0;
        y = h / 3.0 * 2;
        paragraphStyle.alignment = NSTextAlignmentLeft;
    } else if ([location isEqualToString:@"b"]) {
        x = w / 3.0;
        y = h / 3.0 * 2;
        paragraphStyle.alignment = NSTextAlignmentCenter;
    } else {
        x = w / 3.0 * 2;
        y = h / 3.0 * 2;
        paragraphStyle.alignment = NSTextAlignmentRight;
    }
    
    x = x + space;
    
    if ([location isEqualToString:@"l"] || [location isEqualToString:@"c"] || [location isEqualToString:@"r"]) {
        if ((height - markSize.height) > space * 2) {
            y = y + (height - markSize.height) / 2.0;
            height = markSize.height;
        } else {
            y = y + space;
        }
    } else if ([location containsString:@"b"]) {
        if ((height - markSize.height) > space * 2) {
             height = markSize.height;
            y = y + (h / 3.0 - height - space);
        } else {
            y = y + space;
        }
    } else {
        y = y + space;
        if ((height - markSize.height) > space * 2) {
            height = markSize.height;
        }
    }
    
    size = CGRectMake(x, y, width, height);
    [mark drawInRect:size withAttributes:attr];         //水印位置
    UIImage *aimg = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    
    return aimg;
}

//添加图片水印
+ (UIImage *)addImageLogo:(UIImage *)img withData:(NSDictionary *)setDic
{
    NSString *fileP = [NSString stringWithFormat:@"%@%@",FILEPATH,[setDic objectForKey:@"watermarkPic"]];
    UIImage *logo = [UIImage imageWithData:[NSData dataWithContentsOfURL:[NSURL URLWithString:fileP]]];
    int w = img.size.width;
    int h = img.size.height;

    //偏移的间距
    float space = 3.0;
    CGRect size ;
    float x = 0.0;
    float y = 0.0;
    float width = w / 3.0 / 2.0 - 2 * space;
    float height = h / 3.0 / 2.0 - 2 * space;
    
    NSString *location = [setDic objectForKey:@"watermarkLocation"];
    if ([location isEqualToString:@"lt"]) {
        x = 0;
        y = 0;
    } else if ([location isEqualToString:@"t"]) {
        x = w / 3.0;
        y = 0;
    } else if ([location isEqualToString:@"rt"]) {
        x = w / 3.0 * 2;
        y = 0;
    } else if ([location isEqualToString:@"l"]) {
        x = 0;
        y = h / 3.0;
    } else if ([location isEqualToString:@"c"]) {
        x = w / 3.0;
        y = h / 3.0;
    } else if ([location isEqualToString:@"r"]) {
        x = w / 3.0 * 2;
        y = h / 3.0;
    } else if ([location isEqualToString:@"lb"]) {
        x = 0;
        y = h / 3.0 * 2;
    } else if ([location isEqualToString:@"b"]) {
        x = w / 3.0;
        y = h / 3.0 * 2;
    } else if ([location isEqualToString:@"rb"]) {
        x = w / 3.0 * 2;
        y = h / 3.0 * 2;
    }
    
    UIImage *scaledImage = [logo scaleToSize:CGSizeMake(width, height)];
    [logo imageByApplyingAlpha:[[setDic objectForKey:@"opacity"] floatValue]/100.0];
    
    float scaledWith = scaledImage.size.width;
    float scaledHeight = scaledImage.size.height;
    
    if ([location isEqualToString:@"t"] || [location isEqualToString:@"c"] || [location isEqualToString:@"b"]) {
        x = x + (w / 3.0 - scaledWith - space) / 2.0;
    } else if ([location containsString:@"r"]) {
        x = x + (w / 3.0 - scaledWith - space);
    } else {
        x = x + 3.0;
    }
    
    if ([location isEqualToString:@"l"] || [location isEqualToString:@"c"] || [location isEqualToString:@"r"]) {
        y = y + (h / 3.0 - scaledHeight - space) / 2.0;
    } else if ([location containsString:@"b"]) {
        y = y + (h / 3.0 - scaledHeight - space);
    } else {
        y = y + 3.0;
    }
    
    size = CGRectMake(x, y, scaledWith, scaledHeight);

    UIGraphicsBeginImageContextWithOptions(img.size, NO, 0.0);
    [img drawInRect:CGRectMake(0, 0, img.size.width, img.size.height)];
    
    [scaledImage drawInRect:size];
    
    UIImage *newImage = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    
    return newImage;
}
+ (NSData *)compressImage:(UIImage *)image toByte:(NSUInteger)maxLength {
    // Compress by quality
    CGFloat compression = 1;
    NSData *data = UIImageJPEGRepresentation(image, compression);
    if (data.length < maxLength) return data;
    CGFloat max = 1;
    CGFloat min = 0;
    for (int i = 0; i < 6; ++i) {
        compression = (max + min) / 2;
        data = UIImageJPEGRepresentation(image, compression);
        if (data.length < maxLength * 0.9) {
            min = compression;
        } else if (data.length > maxLength) {
            max = compression;
        } else {
            break;
        }
    }
    UIImage *resultImage = [UIImage imageWithData:data];
    if (data.length < maxLength) return data;
    
    // Compress by size
    NSUInteger lastDataLength = 0;
    while (data.length > maxLength && data.length != lastDataLength) {
        lastDataLength = data.length;
        CGFloat ratio = (CGFloat)maxLength / data.length;
        CGSize size = CGSizeMake((NSUInteger)(resultImage.size.width * sqrtf(ratio)),
                                 (NSUInteger)(resultImage.size.height * sqrtf(ratio))); // Use NSUInteger to prevent white blank
        UIGraphicsBeginImageContext(size);
        [resultImage drawInRect:CGRectMake(0, 0, size.width, size.height)];
        resultImage = UIGraphicsGetImageFromCurrentImageContext();
        UIGraphicsEndImageContext();
        data = UIImageJPEGRepresentation(resultImage, compression);
    }
    
    return data;
}
@end
