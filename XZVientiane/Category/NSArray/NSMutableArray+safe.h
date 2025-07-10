//
//  NSMutableArray+safe.h
//  TuiYa
//
//  Created by CFJ on 15/7/30.
//  Copyright (c) 2015年 tuweia. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface NSMutableArray (safe)

- (void)safeAddObject:(id)object;

- (void)safeAddObjectsFromArray:(NSArray *)ary;

- (void)safeInsertObject:(id)object atIndex:(NSUInteger)index;

- (void)safeInsertObjects:(NSArray *)objects atIndexes:(NSIndexSet *)indexs;

- (void)safeRemoveObjectAtIndex:(NSUInteger)index;

- (void)safeRemoveObjectsInRange:(NSRange)range;

@end
