//
//  JFCityTableViewCell.m
//  JFFootball
//
//  Created by 崔逢举 on 2016/11/21.
//  Copyright © 2016年 崔逢举. All rights reserved.
//

#import "JFCityTableViewCell.h"
#import "JFModel.h"
#import "Masonry.h"
#import "JFCityCollectionFlowLayout.h"
#import "JFCityCollectionViewCell.h"

#define JFRGBColor(r, g, b) [UIColor colorWithRed:(r)/255.0 green:(g)/255.0 blue:(b)/255.0 alpha:1.0]

NSString * const JFCityTableViewCellDidChangeCityNotification = @"JFCityTableViewCellDidChangeCityNotification";

static NSString *ID = @"cityCollectionViewCell";

@interface JFCityTableViewCell ()<UICollectionViewDelegate, UICollectionViewDataSource>

@property (nonatomic, strong) UICollectionView *collectionView;

@end

@implementation JFCityTableViewCell

- (instancetype)initWithStyle:(UITableViewCellStyle)style reuseIdentifier:(NSString *)reuseIdentifier {
    if (self = [super initWithStyle:style reuseIdentifier:reuseIdentifier]) {
    }
    return self;
}

- (void)layoutSubviews {
    [super layoutSubviews];
    [self addSubview:self.collectionView];
}

- (UICollectionView *)collectionView {
    if (!_collectionView) {
        _collectionView = [[UICollectionView alloc] initWithFrame:self.bounds collectionViewLayout:[[JFCityCollectionFlowLayout alloc] init]];
        [_collectionView registerClass:[JFCityCollectionViewCell class] forCellWithReuseIdentifier:ID];
        _collectionView.dataSource = self;
        _collectionView.delegate = self;
        _collectionView.backgroundColor = JFRGBColor(247, 247, 247);
    }
    return _collectionView;
}

- (void)setCityNameArray:(NSArray *)cityNameArray {
    _cityNameArray = cityNameArray;
    [_collectionView reloadData];
}

#pragma mark UICollectionViewDataSource 数据源方法
- (NSInteger)collectionView:(UICollectionView *)collectionView numberOfItemsInSection:(NSInteger)section {
    return _cityNameArray.count;
}

- (UICollectionViewCell *)collectionView:(UICollectionView *)collectionView cellForItemAtIndexPath:(NSIndexPath *)indexPath {
    JFCityCollectionViewCell *cell = [collectionView dequeueReusableCellWithReuseIdentifier:ID forIndexPath:indexPath];
    if ([self.cityNameArray[0] isKindOfClass:[JFCityModel class]]) {
        JFCityModel *model = self.cityNameArray[indexPath.row];
        cell.title = model.area;
    }
    else {
        cell.title = _cityNameArray[indexPath.row];
    }

    return cell;
}

- (void)collectionView:(UICollectionView *)collectionView didSelectItemAtIndexPath:(NSIndexPath *)indexPath {
    if ([self.cityNameArray[0] isKindOfClass:[JFCityModel class]]) {
        JFCityModel *model = self.cityNameArray[indexPath.row];
        NSDictionary *cityNameDic = @{@"cityTitle":model.area,
                                      @"cityCode":model.code
                                      };
        [[NSNotificationCenter defaultCenter] postNotificationName:JFCityTableViewCellDidChangeCityNotification object:self userInfo:cityNameDic];
    }
    else {
        NSString *cityName = _cityNameArray[indexPath.row];
        NSDictionary *cityNameDic = @{@"cityLocation":cityName};
        [[NSNotificationCenter defaultCenter] postNotificationName:JFCityTableViewCellDidChangeCityNotification object:self userInfo:cityNameDic];
    }

}


@end
