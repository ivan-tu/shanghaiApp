//
//  MOFSPickerView.m
//  MOFSPickerManager
//
//  Created by luoyuan on 16/8/30.
//  Copyright © 2016年 luoyuan. All rights reserved.
//

#import "MOFSPickerView.h"
#import "PublicModel.h"
#define UISCREEN_WIDTH  [UIScreen mainScreen].bounds.size.width
#define UISCREEN_HEIGHT [UIScreen mainScreen].bounds.size.height

@interface MOFSPickerView() <UIPickerViewDelegate,UIPickerViewDataSource>

@property (nonatomic, strong) NSMutableDictionary *recordDic;
@property (nonatomic, strong) NSMutableArray *dataArr;
@property (nonatomic, strong) NSMutableArray *dataModelArr;

@property (nonatomic, strong) UIView *bgView;

@property (nonatomic, assign) NSInteger selectedRow;

@end

@implementation MOFSPickerView

- (NSMutableArray *)dataArr {
    if (!_dataArr) {
        _dataArr = [NSMutableArray array];
    }
    return _dataArr;
}
- (NSMutableArray *)dataModelArr {
    if (_dataModelArr == nil) {
        _dataModelArr = [NSMutableArray array];
    }
    return _dataModelArr;
}

- (NSMutableDictionary *)recordDic {
    if (!_recordDic) {
        _recordDic = [NSMutableDictionary dictionary];
    }
    return _recordDic;
}

#pragma mark - create UI

- (instancetype)initWithFrame:(CGRect)frame {
    
    [self initToolBar];
    [self initContainerView];
    
    CGRect initialFrame;
    if (CGRectIsEmpty(frame)) {
        initialFrame = CGRectMake(0, self.toolBar.frame.size.height, UISCREEN_WIDTH, 216);
    } else {
        initialFrame = frame;
    }
    self = [super initWithFrame:initialFrame];
    if (self) {
        self.backgroundColor = [UIColor whiteColor];
        self.autoresizingMask = UIViewAutoresizingFlexibleWidth;
        
        self.delegate = self;
        self.dataSource = self;
        
        [self initBgView];
    }
    return self;
}

- (void)initToolBar {
    self.toolBar = [[MOFSToolbar alloc] initWithFrame:CGRectMake(0, 0, UISCREEN_WIDTH, 44)];
    self.toolBar.translucent = NO;
}

- (void)initContainerView {
    self.containerView = [[UIView alloc] initWithFrame:CGRectMake(0, 0, UISCREEN_WIDTH, UISCREEN_HEIGHT)];
    self.containerView.backgroundColor = [[UIColor blackColor] colorWithAlphaComponent:0.4];
    self.containerView.userInteractionEnabled = YES;
    [self.containerView addGestureRecognizer:[[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(hiddenWithAnimation)]];
}

- (void)initBgView {
    self.bgView = [[UIView alloc] initWithFrame:CGRectMake(0, UISCREEN_HEIGHT - self.frame.size.height - 44, UISCREEN_WIDTH, self.frame.size.height + self.toolBar.frame.size.height)];
}

#pragma mark - Action

- (void)showMOFSPickerViewWithDataArray:(NSArray *)array commitBlock:(void(^)(NSString *string))commitBlock cancelBlock:(void(^)(void))cancelBlock {
    self.dataArr = [NSMutableArray arrayWithArray:array];
    [self reloadAllComponents];
    self.selectedRow = 0;
    NSString *tagStr = [NSString stringWithFormat:@"%ld",(long)self.showTag];
    if ([self.recordDic.allKeys containsObject:tagStr]) {
        self.selectedRow = [self.recordDic[tagStr] integerValue];
    }
    [self selectRow:self.selectedRow inComponent:0 animated:NO];
    [self showWithAnimation];
    __weak __typeof(self) weakSelf = self;
    self.toolBar.cancelBlock = ^ {
        if (cancelBlock) {
            [weakSelf hiddenWithAnimation];
            cancelBlock();
        }
    };
    self.toolBar.commitBlock = ^ {
        [weakSelf hiddenWithAnimation];
        if (commitBlock) {
            NSString *rowStr = [NSString stringWithFormat:@"%ld",(long)weakSelf.selectedRow];
            [weakSelf.recordDic setValue:rowStr forKey:tagStr];
            commitBlock(weakSelf.dataArr[weakSelf.selectedRow]);
        }
    };
}
//暂时模型数据
- (void)showMOFSPickerViewWithData:(NSArray *)array commitBlock:(void(^)(NSString *string))commitBlock cancelBlock:(void(^)(void))cancelBlock {
    NSMutableArray *modelArray = [self ForInArray:array];
    self.dataArr = modelArray;
    [self reloadAllComponents];
    self.selectedRow = [self ForINModelArray:self.dataModelArr];
    [self selectRow:self.selectedRow inComponent:0 animated:NO];
    [self showWithAnimation];
    __weak __typeof(self) weakSelf = self;
    self.toolBar.cancelBlock = ^ {
        if (cancelBlock) {
            [weakSelf hiddenWithAnimation];
            cancelBlock();
        }
    };
    self.toolBar.commitBlock = ^ {
        [weakSelf hiddenWithAnimation];
        if (commitBlock) {
            commitBlock([NSString stringWithFormat:@"%@,%@",[weakSelf.dataModelArr[weakSelf.selectedRow] codeId],[weakSelf.dataModelArr[weakSelf.selectedRow] name]]);
        }
    };
}
//遍历模型数据,去除展示数据数组
- (NSMutableArray *)ForInArray:(NSArray *)array{
    [self.dataModelArr removeAllObjects];
    NSMutableArray *modelArray = [NSMutableArray arrayWithCapacity:0];
    for (NSDictionary *dic in array) {
        PublicModel *model = [[PublicModel alloc]initWithDictionary:dic];
        [modelArray addObject:model.name];
        [self.dataModelArr addObject:model];
    }
    return modelArray;
}
//倒取参数
- (NSInteger)ForINModelArray:(NSMutableArray *)array{
    NSInteger j = 0;
    for (int i = 0; i < array.count; i++) {
        PublicModel *model = array[i];
        if (model.selected && [model.selected isEqualToString:@"true"]) {
            j = i;
            break;
        }
    }
    return j;
}
- (void)showWithAnimation {
    [self addViews];
    self.containerView.backgroundColor = [[UIColor blackColor] colorWithAlphaComponent:0.0];
    CGFloat height = self.bgView.frame.size.height;
    self.bgView.center = CGPointMake(UISCREEN_WIDTH / 2, UISCREEN_HEIGHT + height / 2);
    [UIView animateWithDuration:0.25 animations:^{
        self.bgView.center = CGPointMake(UISCREEN_WIDTH / 2, UISCREEN_HEIGHT - height / 2);
        self.containerView.backgroundColor = [[UIColor blackColor] colorWithAlphaComponent:0.4];
    }];
    
}

- (void)hiddenWithAnimation {
    CGFloat height = self.bgView.frame.size.height;
    [UIView animateWithDuration:0.25 animations:^{
        self.bgView.center = CGPointMake(UISCREEN_WIDTH / 2, UISCREEN_HEIGHT + height / 2);
        self.containerView.backgroundColor = [[UIColor blackColor] colorWithAlphaComponent:0.0];
    } completion:^(BOOL finished) {
        [self hiddenViews];
    }];
}

- (void)addViews {
    UIWindow *window = [UIApplication sharedApplication].keyWindow;
    [window addSubview:self.containerView];
    [window addSubview:self.bgView];
    [self.bgView addSubview:self.toolBar];
    [self.bgView addSubview:self];
}

- (void)hiddenViews {
    [self removeFromSuperview];
    [self.toolBar removeFromSuperview];
    [self.bgView removeFromSuperview];
    [self.containerView removeFromSuperview];
}

#pragma mark - UIPickerViewDelegate,UIPickerViewDataSource

- (NSInteger)numberOfComponentsInPickerView:(UIPickerView *)pickerView {
    return 1;
}

- (NSInteger)pickerView:(UIPickerView *)pickerView numberOfRowsInComponent:(NSInteger)component {
    return self.dataArr.count;
}

- (CGFloat)pickerView:(UIPickerView *)pickerView rowHeightForComponent:(NSInteger)component {
    return 44;
}

- (NSString *)pickerView:(UIPickerView *)pickerView titleForRow:(NSInteger)row forComponent:(NSInteger)component {
    return self.dataArr[row];
}

- (void)pickerView:(UIPickerView *)pickerView didSelectRow:(NSInteger)row inComponent:(NSInteger)component {
    self.selectedRow = row;
}


@end
