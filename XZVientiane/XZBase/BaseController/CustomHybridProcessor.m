#import "CustomHybridProcessor.h"

@implementation CustomHybridProcessor

#pragma mark - Public Main Method

+ (void)custom_LocialPathByUrlStr:(NSString *)urlStr
                      templateDic:(NSDictionary *)templateDic
                 componentJsAndCs:(NSDictionary *)componentJsAndCs
                   componentDic:(NSDictionary *)componentDic
                        success:(void (^)(NSString *filePath, NSString *templateStr, NSString *title, BOOL isFileExsit))success {

    NSString *parsedUrl = [self parseURL:urlStr];
    if (!parsedUrl || parsedUrl.length == 0) {
        if (success) { success(@"", @"", @"", NO); }
        return;
    }

    NSString *h5ManifestPath = [self appH5LocalManifestPath];
    if (!h5ManifestPath) {
        if (success) { success(parsedUrl, @"", @"", NO); }
        return;
    }
    
    NSString *pageFragmentHtmlPath = [[h5ManifestPath stringByAppendingPathComponent:parsedUrl] stringByAppendingPathExtension:@"html"];
    BOOL fileExists = [self isFileExsit:pageFragmentHtmlPath];

    if (fileExists) {
        NSError *error = nil;
        
        NSString *pageFragmentHtml = [NSString stringWithContentsOfFile:pageFragmentHtmlPath encoding:NSUTF8StringEncoding error:&error];
        if (error) {
            if (success) { success(parsedUrl, @"", @"", YES); }
            return;
        }

        NSString *mainTemplatePath = [[h5ManifestPath stringByAppendingPathComponent:@"static/app"] stringByAppendingPathComponent:@"template.html"];
        NSString *mainTemplateStr = [NSString stringWithContentsOfFile:mainTemplatePath encoding:NSUTF8StringEncoding error:&error];
        if (error) {
            if (success) { success(parsedUrl, @"", @"", YES); }
            return;
        }
        
        NSArray<NSString *> *pathComponents = [parsedUrl componentsSeparatedByString:@"/"];
        NSString *systemId = (pathComponents.count > 2) ? pathComponents[2] : @"";
        NSString *moduleId = (pathComponents.count > 3) ? pathComponents[3] : @"";
        mainTemplateStr = [mainTemplateStr stringByReplacingOccurrencesOfString:@"{{systemId}}" withString:systemId];
        mainTemplateStr = [mainTemplateStr stringByReplacingOccurrencesOfString:@"{{moduleId}}" withString:moduleId];
        mainTemplateStr = [mainTemplateStr stringByReplacingOccurrencesOfString:@"{{url}}" withString:urlStr];

        
        NSMutableDictionary *mutableTemplateDic = [NSMutableDictionary dictionaryWithDictionary:templateDic ?: @{}];
        [mutableTemplateDic setObject:pageFragmentHtml forKey:@"html"];
        
        
        NSString *templateJsonStr = [self dicToJson:mutableTemplateDic];
        
        
        mainTemplateStr = [mainTemplateStr stringByReplacingOccurrencesOfString:@"{{template}}" withString:templateJsonStr];
        
        
        NSDictionary *localJsonData = [self getLocalJsonForPage:parsedUrl inManifestPath:h5ManifestPath];
        NSString *title = localJsonData[@"navigationBarTitleText"] ?: @"";
        NSDictionary *usingComponents = localJsonData[@"usingComponents"];
        
        NSString *finalHtml;
        if (usingComponents && usingComponents.count > 0) {
            finalHtml = [self recycleUsingComponents:usingComponents
                                       templateStr:mainTemplateStr
                                    inManifestPath:h5ManifestPath];
        } else {
            
            finalHtml = [mainTemplateStr stringByReplacingOccurrencesOfString:@"{{components}}" withString:@"''"];
            finalHtml = [finalHtml stringByReplacingOccurrencesOfString:@"{{jscript}}" withString:@""];
        }

        if (success) {
            success(parsedUrl, finalHtml, title, YES);
        }
        
    } else {
        if (success) {
            if (success) { success(parsedUrl, @"", @"", NO); }
        }
    }
}
#pragma mark - Tabbar Method:reloadTabbarInterfaceSuccess

+ (void)custom_reloadTabbarInterfaceSuccess:(void (^)(NSArray * _Nullable items, NSString * _Nullable activeColor, NSString * _Nullable bgColor))success {
    
    NSString *appInfoPath = [[NSBundle mainBundle] pathForResource:@"appInfo" ofType:@"json"];
    if (!appInfoPath) {
        if (success) { success(nil, nil, nil); }
        return;
    }
    
    NSData *jsonData = [NSData dataWithContentsOfFile:appInfoPath];
    if (!jsonData) {
        if (success) { success(nil, nil, nil); }
        return;
    }

    NSError *error;
    NSDictionary *appInfo = [NSJSONSerialization JSONObjectWithData:jsonData options:NSJSONReadingMutableContainers error:&error];
    if (error || ![appInfo isKindOfClass:[NSDictionary class]]) {
        if (success) { success(nil, nil, nil); }
        return;
    }
    
    NSDictionary *navInfo = appInfo[@"nav"];
    NSArray *items = navInfo[@"items"];
    NSString *activeTextColor = navInfo[@"activeTextColor"];
    NSString *tabBgcolor = navInfo[@"tabBgcolor"];
    id scrollHide = navInfo[@"scrollHide"];

    NSDictionary *statusBarInfo = appInfo[@"statusBar"];
    NSInteger statusBarStatus = [statusBarInfo[@"status"] integerValue];

    NSString *qiniuBaseUrl = appInfo[@"qiniu"];

    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    
    if (scrollHide) {
        [defaults setObject:scrollHide forKey:@"TabBarHideWhenScroll"];
    }
    
    [defaults setInteger:statusBarStatus forKey:@"StatusBarStatus"];
    
    if (qiniuBaseUrl) {
        [defaults setObject:qiniuBaseUrl forKey:@"QiNiuBaseUrl"];
    }
    
    [defaults synchronize];

    if (success) {
        success(items, activeTextColor, tabBgcolor);
    }
}

#pragma mark - objcCallJsWithFn:data

+ (NSDictionary *)custom_objcCallJsWithFn:(NSString *)functionName data:(id)data {
    if (!functionName) {
        return @{};
    }
    if (data) {
        return @{
            @"action": functionName,
            @"data": data,
            @"callback": @""
        };
    } else {
        return @{
            @"action": functionName
        };
    }
}

#pragma mark - custom_getRequestLinkUrl

+ (NSString *)custom_getRequestLinkUrl:(NSString *)urlStr{
//    return @"https://hi3.tuiya.cc"+urlStr;
    return [NSString stringWithFormat:@"https://hi3.tuiya.cc%@", urlStr];
}

#pragma mark - custom_getloginLinkUrl

+ (NSString *)custom_getloginLinkUrl {
    return @"https://hi3.tuiya.cc/api/operateChannel";
}

#pragma mark - Component Processing (Recreation of recycleUsingComponents)

+ (NSString *)recycleUsingComponents:(NSDictionary *)usingComponents
                       templateStr:(NSString *)templateStr
                    inManifestPath:(NSString *)manifestPath
{
    NSMutableArray *jsAndCssArray = [NSMutableArray array];
    NSMutableDictionary *componentHtmlDic = [NSMutableDictionary dictionary];
    
    [self performRecycleWithComponents:usingComponents
                      componentJsAndCs:jsAndCssArray
                        componentDic:componentHtmlDic
                      inManifestPath:manifestPath];
    
    NSString *componentsJson = [self dicToJson:componentHtmlDic];
    NSString *jscriptString = [self arrayToString:jsAndCssArray];
    
    NSString *resultHtml = [templateStr stringByReplacingOccurrencesOfString:@"{{components}}" withString:componentsJson];
    resultHtml = [resultHtml stringByReplacingOccurrencesOfString:@"{{jscript}}" withString:jscriptString];
    
    return resultHtml;
}

+ (void)performRecycleWithComponents:(NSDictionary *)usingComponents
                    componentJsAndCs:(NSMutableArray *)jsAndCssArray
                      componentDic:(NSMutableDictionary *)componentHtmlDic
                    inManifestPath:(NSString *)manifestPath
{
    for (NSString *componentName in usingComponents) {
        NSString *componentPath = usingComponents[componentName];
        NSString *staticComponentPath = [@"static" stringByAppendingString:componentPath];
        NSString *cssTag = [NSString stringWithFormat:@"<link href=\"%@.css\" rel=\"stylesheet\" />", staticComponentPath];
        NSString *jsTag = [NSString stringWithFormat:@"<script src=\"%@.js\"></script>", staticComponentPath];
        
        if (![jsAndCssArray containsObject:jsTag]) {
            [jsAndCssArray insertObject:jsTag atIndex:0];
        }
        if (![jsAndCssArray containsObject:cssTag]) {
            [jsAndCssArray insertObject:cssTag atIndex:0];
        }
        
        NSString *componentHtmlPath = [[manifestPath stringByAppendingPathComponent:staticComponentPath] stringByAppendingPathExtension:@"html"];
        NSString *componentHtml = [NSString stringWithContentsOfFile:componentHtmlPath encoding:NSUTF8StringEncoding error:nil];
        if (componentHtml) {
            [componentHtmlDic setObject:componentHtml forKey:componentName];
        }
        
        NSDictionary *childJsonData = [self getLocalJsonForPage:staticComponentPath inManifestPath:manifestPath];
        NSDictionary *childUsingComponents = childJsonData[@"usingComponents"];
        if ([childUsingComponents isKindOfClass:[NSDictionary class]] && childUsingComponents.count > 0) {
            [self performRecycleWithComponents:childUsingComponents
                              componentJsAndCs:jsAndCssArray
                                componentDic:componentHtmlDic
                              inManifestPath:manifestPath];
        }
    }
}


#pragma mark - Helper Methods

+ (NSString *)arrayToString:(NSArray *)array {
    return [array componentsJoinedByString:@"\n"];
}

+ (NSString *)parseURL:(NSString *)urlStr {
    if (!urlStr || urlStr.length == 0) { return @""; }
    NSURL *url = [NSURL URLWithString:urlStr];
    NSString *pathString = url.path;
    NSString *result = (pathString && pathString.length > 0) ? pathString : urlStr;
    if ([result hasSuffix:@".html"]) { result = [result stringByDeletingPathExtension]; }
    if ([result hasPrefix:@"/p/"]) { result = [result stringByReplacingCharactersInRange:NSMakeRange(0, 3) withString:@"/pages/"]; }
    return result;
}

+ (NSString *)appH5LocalManifestPath {
    return [[NSBundle mainBundle] pathForResource:@"manifest" ofType:nil];
}

+ (BOOL)isFileExsit:(NSString *)path {
    return [[NSFileManager defaultManager] fileExistsAtPath:path];
}

+ (NSDictionary *)getLocalJsonForPage:(NSString *)pagePath inManifestPath:(NSString *)manifestPath {
    NSString *jsonPath = [[manifestPath stringByAppendingPathComponent:pagePath] stringByAppendingPathExtension:@"json"];
    if (![self isFileExsit:jsonPath]) { return @{}; }
    NSData *data = [NSData dataWithContentsOfFile:jsonPath];
    if (!data) { return @{}; }
    NSError *error = nil;
    NSDictionary *jsonDict = [NSJSONSerialization JSONObjectWithData:data options:kNilOptions error:&error];
    if (error || ![jsonDict isKindOfClass:[NSDictionary class]]) { return @{}; }
    return jsonDict;
}

+ (NSString *)dicToJson:(NSDictionary *)dict {
    if (!dict) return @"{}";
    NSError *error = nil;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:dict options:0 error:&error];
    if (error || !jsonData) { return @"{}"; }
    return [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
}

@end
