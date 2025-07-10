//
//  CLFileManager.m
//  XiangZhanClient
//
//  Created by yiliu on 16/5/16.
//  Copyright © 2016年 TuWeiA. All rights reserved.
//

#import "CLFileManager.h"
#import <AssetsLibrary/ALAssetsLibrary.h>
#import <AssetsLibrary/ALAssetsGroup.h>
#import <AssetsLibrary/ALAssetRepresentation.h>
#import "NSString+addition.h"

@implementation CLFileManager

+ (NSString *)appDocPath
{
    return [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) objectAtIndex:0];
}

+ (NSString *)appLibPath
{
    return [NSSearchPathForDirectoriesInDomains(NSLibraryDirectory, NSUserDomainMask, YES) objectAtIndex:0];
}

+ (NSString *)appCachePath
{
    return [NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES) objectAtIndex:0];
}

+ (NSString *)appTmpPath
{
    NSString *tmpDir = NSTemporaryDirectory();
    return tmpDir;
}

+ (NSString *)appH5ManifesPath {
    return [NSString stringWithFormat:@"%@/manifest",[CLFileManager appDocPath]];
}

+ (NSString *)appH5ManifesNewPath {
    NSString *path = [NSString stringWithFormat:@"%@/newVersionAppH5",[CLFileManager appDocPath]];
    if (![self isFileExsit:path]) {
        //         BOOL bo = [[NSFileManager defaultManager] createDirectoryAtPath:path withIntermediateDirectories:YES att
        BOOL bo = [[NSFileManager defaultManager] createDirectoryAtPath:path withIntermediateDirectories:YES attributes:nil error:nil];
        if (bo) {
            return path;
        }
    }
    return path;
}

+ (NSString *)appH5AppSourcesPath {
    return [NSString stringWithFormat:@"%@/manifest/appsources",[CLFileManager appDocPath]];
}

+ (BOOL)isFileExsit:(NSString *)aPath
{
    NSFileManager *manager = [NSFileManager defaultManager];
    return [manager fileExistsAtPath:aPath];
}

+ (BOOL)isBundleExsit:(NSString *)aBundleName
{
    return [[NSBundle mainBundle] URLForResource:aBundleName withExtension:@"bundle"] ? YES : NO;
}


+ (void)deleteFileInpathAry:(NSArray *)pathAry
{
    // 删除图片：
    dispatch_async(dispatch_get_global_queue(0, 0), ^{
        for (NSString *path in pathAry) {
            NSFileManager *fm = [NSFileManager defaultManager];
            if ([fm fileExistsAtPath:path]) {
                [fm removeItemAtPath:path error:nil];
            }
        }
    });
}

+ (void)copyH5ToDocument {
    NSString *h5BundlePath = [[[NSBundle mainBundle] resourcePath] stringByAppendingPathComponent:@"manifest"];
    
    NSString *h5DocumentPath = [NSString stringWithFormat:@"%@/manifest",[CLFileManager appDocPath]];
    if ([[NSFileManager defaultManager] fileExistsAtPath:h5DocumentPath]) {
        [[NSFileManager defaultManager] removeItemAtPath:h5DocumentPath error:nil];
    }
    NSError *error;
    BOOL success = [[NSFileManager defaultManager] copyItemAtURL:[NSURL fileURLWithPath:h5BundlePath] toURL:[NSURL fileURLWithPath:h5DocumentPath] error:&error];
    if (success) {
        [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"isCopy"];
        [[NSUserDefaults standardUserDefaults] synchronize];
    }
}
@end

