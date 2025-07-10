//
//  SearchTableView.h
//  XZVientiane
//
//  Created by 崔逢举 on 2018/8/28.
//  Copyright © 2018年 崔逢举. All rights reserved.
//

#import <UIKit/UIKit.h>
@protocol SearchTableViewDelegate <NSObject>

- (void)searchResultsSelect:(CLLocationCoordinate2D )coordinate adressName:(NSString *)cityName formattedAddress:(NSString *)formattedAddress;
- (void)touchViewToExit;
@end
@interface SearchTableView : UIView
@property (nonatomic, weak) id<SearchTableViewDelegate> delegate;
- (void)PoisWithSaerchArray:(NSMutableArray *)array;
@end
