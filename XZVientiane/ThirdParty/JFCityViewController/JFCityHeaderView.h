//
//  JFCityHeaderView.h
//  JFFootball
//
//  Created by 崔逢举 on 2016/11/21.
//  Copyright © 2016年 崔逢举. All rights reserved.
//

#import <UIKit/UIKit.h>

@protocol JFCityHeaderViewDelegate <NSObject>

- (void)beginSearch;
- (void)endSearch;
- (void)searchResult:(NSString *)result;
@end

@interface JFCityHeaderView : UIView


@property (nonatomic, weak) id<JFCityHeaderViewDelegate> delegate;

/// 取消搜索
- (void)cancelSearch;
@end
