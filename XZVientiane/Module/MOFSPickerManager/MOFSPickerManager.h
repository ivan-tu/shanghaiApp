//
//  MOFSPickerManager.h
//  MOFSPickerManager
//
//  Created by luoyuan on 16/8/26.
//  Copyright © 2016年 luoyuan. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "MOFSDatePicker.h"
#import "MOFSPickerView.h"
#import "MOFSAddressPickerView.h"
#import "CFJAdressPickerView.h"
typedef void (^DatePickerCommitBlock)(NSDate *date);
typedef void (^DatePickerCancelBlock)(void);

typedef void (^PickerViewCommitBlock)(NSString *string);
typedef void (^PickerViewCancelBlock)(void);

@interface MOFSPickerManager : NSObject

+ (MOFSPickerManager *)shareManger;

@property (nonatomic, strong) MOFSDatePicker *datePicker;

@property (nonatomic, strong) MOFSPickerView *pickView;

@property (nonatomic, strong) MOFSAddressPickerView *addressPicker;

@property (nonatomic, strong) CFJAdressPickerView *CFJaddressPicker;

// ================================DatePicker===================================//

/**
 * show default datePicker.
 * default datePickerMode : UIDatePickerModeDate.
 * default cancelTitle : "取消".
 * default commitTitle : "确定".
 * default title : "".
 * @param tag : will remeber the last date you had select.
 */
- (void)showDatePickerWithTag:(NSInteger)tag commitBlock:(DatePickerCommitBlock)commitBlock cancelBlock:(DatePickerCancelBlock)cancelBlock;

/**
 * show default datePicker with your custom datePickerMode.
 * default cancelTitle : "取消".
 * default commitTitle : "确定".
 * default title : "".
 * @param tag : will remeber the last date you had select.
 * @param mode : UIDatePickerMode
 */
- (void)showDatePickerWithTag:(NSInteger)tag datePickerMode:(UIDatePickerMode)mode commitBlock:(DatePickerCommitBlock)commitBlock cancelBlock:(DatePickerCancelBlock)cancelBlock;

/**
 * show datePicker with your custom datePickerMode ,title , cancelTitle , commitTitle.
 * @param tag : will remeber the last date you had select.
 * @param title : toolbar title
 * @param cancelTitle : "".
 * @param commitTitle : "".
 * @param mode : UIDatePickerMode.
 */
- (void)showDatePickerWithTag:(NSInteger)tag title:(NSString *)title cancelTitle:(NSString *)cancelTitle commitTitle:(NSString *)commitTitle datePickerMode:(UIDatePickerMode)mode commitBlock:(DatePickerCommitBlock)commitBlock cancelBlock:(DatePickerCancelBlock)cancelBlock;

/**
 * show datePicker with your custom datePickerMode ,firstDate , minDate , maxDate.
 * @param firstDate : show date.
 * @param minDate : minimumDate.
 * @param maxDate : maximumDate.
 * @param mode : UIDatePickerMode.
 */
- (void)showDatePickerWithfirstDate:(NSDate *)firstDate minDate:(NSDate *)minDate maxDate:(NSDate *)maxDate datePickerMode:(UIDatePickerMode)mode commitBlock:(DatePickerCommitBlock)commitBlock cancelBlock:(DatePickerCancelBlock)cancelBlock;

/**
 * show datePicker with your custom datePickerMode ,firstDate ,title , cancelTitle , commitTitle , minDate , maxDate.
 * @param title : toolbar title
 * @param cancelTitle : "".
 * @param commitTitle : "".
 * @param firstDate : show date.
 * @param minDate : minimumDate.
 * @param maxDate : maximumDate.
 * @param mode : UIDatePickerMode.
 * @param tag : will remeber the last date you had select.
 */
- (void)showDatePickerWithTitle:(NSString *)title cancelTitle:(NSString *)cancelTitle commitTitle:(NSString *)commitTitle firstDate:(NSDate *)firstDate minDate:(NSDate *)minDate maxDate:(NSDate *)maxDate datePickerMode:(UIDatePickerMode)mode tag:(NSInteger)tag commitBlock:(DatePickerCommitBlock)commitBlock cancelBlock:(DatePickerCancelBlock)cancelBlock;




// ================================pickerView===================================//

- (void)showPickerViewWithDataArray:(NSArray *)array tag:(NSInteger)tag title:(NSString *)title cancelTitle:(NSString *)cancelTitle commitTitle:(NSString *)commitTitle commitBlock:(PickerViewCommitBlock)commitBlock cancelBlock:(PickerViewCancelBlock)cancelBlock;

- (void)showPickerViewWithData:(NSArray *)array tag:(NSInteger)tag title:(NSString *)title cancelTitle:(NSString *)cancelTitle commitTitle:(NSString *)commitTitle commitBlock:(PickerViewCommitBlock)commitBlock cancelBlock:(PickerViewCancelBlock)cancelBlock;

//===============================addressPicker===================================//

/**
 *  show addressPicker with your custom title, cancelTitle, commitTitle
 *
 *  @param title       your custom title
 *  @param cancelTitle your custom cancelTitle
 *  @param commitTitle your custom commitTitle
 *  @param commitBlock commitBlock
 *  @param cancelBlock cancelBlock
 */
- (void)showMOFSAddressPickerWithTitle:(NSString *)title cancelTitle:(NSString *)cancelTitle commitTitle:(NSString *)commitTitle commitBlock:(void(^)(NSString *address, NSString *zipcode))commitBlock cancelBlock:(void(^)(void))cancelBlock;

/**
 *  show addressPicker with your custom title, cancelTitle, commitTitle
 *
 *  @param title       your custom title
 *  @param address     default address
 *  @param cancelTitle your custom cancelTitle
 *  @param commitTitle your custom commitTitle
 *  @param commitBlock commitBlock
 *  @param cancelBlock cancelBlock
 */
- (void)showMOFSAddressPickerWithDefaultAddress:(NSString *)address title:(NSString *)title cancelTitle:(NSString *)cancelTitle commitTitle:(NSString *)commitTitle commitBlock:(void(^)(NSString *address, NSString *zipcode))commitBlock cancelBlock:(void(^)(void))cancelBlock;

/**
 *  show addressPicker with your custom title, cancelTitle, commitTitle
 *
 *  @param zipcode     default zipcode
 *  @param title       your custom title
 *  @param cancelTitle your custom cancelTitle
 *  @param commitTitle your custom commitTitle
 *  @param commitBlock commitBlock
 *  @param cancelBlock cancelBlock
 */
- (void)showMOFSAddressPickerWithDefaultZipcode:(NSString *)zipcode title:(NSString *)title cancelTitle:(NSString *)cancelTitle commitTitle:(NSString *)commitTitle commitBlock:(void(^)(NSString *address, NSString *zipcode))commitBlock cancelBlock:(void(^)(void))cancelBlock;

/**
 *  searchAddressByZipcode
 *
 *  @param zipcode zipcode
 *  @param block block
 */
- (void)searchAddressByZipcode:(NSString *)zipcode block:(void(^)(NSString *address))block;

/**
 *  searchZipCodeByAddress
 *
 *  @param address address
 *  @param block block
 */
- (void)searchZipCodeByAddress:(NSString *)address block:(void(^)(NSString *zipcode))block;


/**
 *  searchIndexByAddress
 *
 *  @param address address
 *  @param block block
 */
- (void)searchIndexByAddress:(NSString *)address block:(void(^)(NSString *address))block;


/**
 *  searchIndexByZipCode
 *
 *  @param zipcode address
 *  @param block block
 */
- (void)searchIndexByZipCode:(NSString *)zipcode block:(void(^)(NSString *address))block;
//===============================CFJaddressPicker===================================//

- (void)showCFJAddressPickerWithDefaultZipcode:(NSString *)zipcode title:(NSString *)title cancelTitle:(NSString *)cancelTitle commitTitle:(NSString *)commitTitle commitBlock:(void(^)(NSString *address, NSString *zipcode))commitBlock cancelBlock:(void(^)(void))cancelBlock;
@end
