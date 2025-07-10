//
//  SearchTableView.m
//  XZVientiane
//
//  Created by 崔逢举 on 2018/8/28.
//  Copyright © 2018年 崔逢举. All rights reserved.
//

#import "SearchTableView.h"
#import <AMapFoundationKit/AMapFoundationKit.h>
// 添加高德搜索SDK导入 - 使用正确的CocoaPods路径
#import <AMapSearchKit/AMapSearchKit.h>

@interface SearchTableView ()<UITableViewDelegate, UITableViewDataSource>

@property (nonatomic, strong) UITableView *rootTableView;
@property (nonatomic, strong) NSMutableArray *pois;


@end
@implementation SearchTableView
- (NSMutableArray *)pois {
    if (_pois == nil) {
        _pois = [NSMutableArray arrayWithCapacity:0];
    }
    return _pois;
}
- (void)PoisWithSaerchArray:(NSMutableArray *)array {
    self.pois = array;
    [self addSubview:self.rootTableView];
    [self.rootTableView reloadData];
}
- (instancetype)initWithFrame:(CGRect)frame {
    if (self = [super initWithFrame:frame]) {
    }
    return self;
}
- (UITableView *)rootTableView {
    if (!_rootTableView) {
        _rootTableView = [[UITableView alloc] initWithFrame:self.bounds style:UITableViewStylePlain];
        _rootTableView.delegate = self;
        _rootTableView.dataSource = self;
        _rootTableView.backgroundColor = [UIColor whiteColor];
    }
    return _rootTableView;
}
- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return [self.pois count];
}
- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath {
    return 50;
}
- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"UITableViewCell"];
    if (!cell) {
        cell = [[UITableViewCell alloc] initWithStyle:(UITableViewCellStyleSubtitle) reuseIdentifier:@"UITableViewCell"];
    }
    cell.textLabel.font = [UIFont systemFontOfSize:16];
    cell.detailTextLabel.font = [UIFont systemFontOfSize:12];
    cell.detailTextLabel.textColor = UIColor.lightGrayColor;
    
    if (self.pois.count > 0) {
        if ([self.pois[indexPath.row] isKindOfClass:[AMapPOI class]]) {
            AMapPOI *poi = self.pois[indexPath.row];
            cell.textLabel.text = poi.name;
            cell.detailTextLabel.text = [NSString stringWithFormat:@"%@%@%@%@", poi.province, poi.city, poi.district, poi.address];
        }
        else {
            AMapTip *tip = self.pois[indexPath.row];
            cell.textLabel.text = tip.name;
            cell.detailTextLabel.text = [NSString stringWithFormat:@"%@%@", tip.district, tip.address];
        }
 
    }
    
    return cell;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    [tableView deselectRowAtIndexPath:indexPath animated:YES];
    
    AMapTip *poi = self.pois[indexPath.row];
    if ([self.delegate respondsToSelector:@selector(searchResultsSelect:adressName:formattedAddress:)]) {
        [self.delegate searchResultsSelect:CLLocationCoordinate2DMake(poi.location.latitude, poi.location.longitude) adressName:poi.name formattedAddress:poi.address];
    }
}

- (void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event {
    if (self.delegate && [self.delegate respondsToSelector:@selector(touchViewToExit)]) {
        [self.delegate touchViewToExit];
    }
    
}
/*
// Only override drawRect: if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
- (void)drawRect:(CGRect)rect {
    // Drawing code
}
*/

@end
