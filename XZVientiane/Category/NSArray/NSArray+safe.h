//
//  NSArray+safe.h
//  TuiYa
//
//  Created by CFJ on 15/7/30.
//  Copyright (c) 2015年 tuweia. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface NSArray (safe)

- (id)safeObjectAtIndex:(NSUInteger)index;

+ (instancetype)safeArrayWithObject:(id)object;

- (NSArray *)safeSubarrayWithRange:(NSRange)range;

- (NSUInteger)safeIndexOfObject:(id)anObject;

@end
