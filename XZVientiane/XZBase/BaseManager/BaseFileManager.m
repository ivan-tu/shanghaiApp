//
//  BaseFileManager.m
//  XiangZhanBase
//
//  Created by CFJ on 16/4/27.
//  Copyright © 2016年 TuWeiA. All rights reserved.
//

#import "BaseFileManager.h"

@implementation BaseFileManager
+ (NSString *)appDocPath {
    return [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) objectAtIndex:0];
}

+ (NSString *)appLibPath {
    return [NSSearchPathForDirectoriesInDomains(NSLibraryDirectory, NSUserDomainMask, YES) objectAtIndex:0];
}

+ (NSString *)appCachePath {
    return [NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES) objectAtIndex:0];
}

+ (NSString *)appTmpPath {
    NSString *tmpDir = NSTemporaryDirectory();
    return tmpDir;
}

+ (NSString *)appH5ManifesPath {
    return [NSString stringWithFormat:@"%@/manifest",[BaseFileManager appDocPath]];
}

+ (NSString *)appH5LocailManifesPath {
    return [[NSBundle mainBundle]pathForResource:@"manifest" ofType:nil];
}

+ (NSString *)appH5AppSourcesPath {
    return [NSString stringWithFormat:@"%@/manifest/appsources",[BaseFileManager appDocPath]];
}

+ (BOOL)isFileExsit:(NSString *)aPath {
    NSFileManager *manager = [NSFileManager defaultManager];
    return [manager fileExistsAtPath:aPath];
}

@end
