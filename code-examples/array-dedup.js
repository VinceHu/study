/**
 * 数组去重 - 多种实现方式
 * 日期: 2025-11-20
 * 难度: 基础
 * 
 * 问题描述:
 * 实现数组去重，要求能正确处理各种数据类型，包括NaN
 */

// ============================================
// 方法一: ES6 Set（最推荐⭐⭐⭐⭐⭐）
// 优点: 代码简洁、性能好、正确处理NaN
// 缺点: 需要ES6支持
// 时间复杂度: O(n)
// 空间复杂度: O(n)
// ============================================

function uniqueBySet(arr) {
  return [...new Set(arr)];
  // 或者: return Array.from(new Set(arr));
}

// ============================================
// 方法二: filter + indexOf
// 优点: 兼容性好
// 缺点: 性能差(O(n²))、无法正确处理NaN
// 时间复杂度: O(n²)
// 空间复杂度: O(n)
// ============================================

function uniqueByIndexOf(arr) {
  return arr.filter((item, index) => {
    return arr.indexOf(item) === index;
  });
}

// ============================================
// 方法三: reduce
// 优点: 函数式编程风格
// 缺点: 性能差(O(n²))、无法正确处理NaN
// 时间复杂度: O(n²)
// 空间复杂度: O(n)
// ============================================

function uniqueByReduce(arr) {
  return arr.reduce((acc, item) => {
    if (acc.indexOf(item) === -1) {
      acc.push(item);
    }
    return acc;
  }, []);
}

// ============================================
// 方法四: 双层循环
// 优点: 最基础的实现，易理解
// 缺点: 代码冗长、性能差(O(n²))
// 时间复杂度: O(n²)
// 空间复杂度: O(n)
// ============================================

function uniqueByLoop(arr) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    let isDuplicate = false;
    for (let j = 0; j < result.length; j++) {
      // 使用Object.is可以正确处理NaN
      if (Object.is(arr[i], result[j])) {
        isDuplicate = true;
        break;
      }
    }
    if (!isDuplicate) {
      result.push(arr[i]);
    }
  }
  return result;
}

// ============================================
// 方法五: Map
// 优点: 性能好、正确处理NaN
// 缺点: 需要ES6支持
// 时间复杂度: O(n)
// 空间复杂度: O(n)
// ============================================

function uniqueByMap(arr) {
  const map = new Map();
  const result = [];
  
  arr.forEach(item => {
    if (!map.has(item)) {
      map.set(item, true);
      result.push(item);
    }
  });
  
  return result;
}

// ============================================
// 方法六: Object键值对
// 优点: 性能好
// 缺点: 会将所有值转为字符串，导致类型丢失
// 时间复杂度: O(n)
// 空间复杂度: O(n)
// ============================================

function uniqueByObject(arr) {
  const obj = {};
  const result = [];
  
  arr.forEach(item => {
    // 问题: 1和"1"会被认为是同一个
    if (!obj[item]) {
      obj[item] = true;
      result.push(item);
    }
  });
  
  return result;
}

// 改进版: 区分类型
function uniqueByObjectImproved(arr) {
  const obj = {};
  const result = [];
  
  arr.forEach(item => {
    const key = typeof item + JSON.stringify(item);
    if (!obj[key]) {
      obj[key] = true;
      result.push(item);
    }
  });
  
  return result;
}

// ============================================
// 方法七: includes（推荐用于处理NaN）
// 优点: 可以正确处理NaN
// 缺点: 性能较差(O(n²))
// 时间复杂度: O(n²)
// 空间复杂度: O(n)
// ============================================

function uniqueByIncludes(arr) {
  const result = [];
  
  for (const item of arr) {
    if (!result.includes(item)) {
      result.push(item);
    }
  }
  
  return result;
}

// ============================================
// 方法八: 对象数组去重（基于某个属性）
// 优点: 可以处理对象数组
// 缺点: 需要指定去重依据
// 时间复杂度: O(n)
// 空间复杂度: O(n)
// ============================================

function uniqueBy(arr, key) {
  const seen = new Set();
  const result = [];
  
  for (const item of arr) {
    const k = item[key];
    if (!seen.has(k)) {
      seen.add(k);
      result.push(item);
    }
  }
  
  return result;
}

// 简洁版（牺牲一点性能换取代码简洁）
function uniqueBySimple(arr, key) {
  const seen = new Set();
  return arr.filter(item => !seen.has(item[key]) && seen.add(item[key]));
}

// ============================================
// 方法九: 深度去重（按值比较对象）
// 优点: 可以去重内容相同的对象
// 缺点: 性能差、JSON.stringify有局限性
// 时间复杂度: O(n²)
// 空间复杂度: O(n)
// ============================================

function deepUnique(arr) {
  const seen = [];
  return arr.filter(item => {
    const str = JSON.stringify(item);
    const exists = seen.includes(str);
    if (!exists) {
      seen.push(str);
    }
    return !exists;
  });
}

// ============================================
// 测试用例
// ============================================

console.log('=== 基本数组去重测试 ===');
const arr1 = [1, 2, 2, 3, 4, 4, 5];
console.log('原数组:', arr1);
console.log('Set方法:', uniqueBySet(arr1));
console.log('indexOf方法:', uniqueByIndexOf(arr1));
console.log('reduce方法:', uniqueByReduce(arr1));
console.log('双层循环:', uniqueByLoop(arr1));
console.log('Map方法:', uniqueByMap(arr1));
console.log('includes方法:', uniqueByIncludes(arr1));

console.log('\n=== NaN处理测试 ===');
const arr2 = [1, NaN, 2, NaN, 3];
console.log('原数组:', arr2);
console.log('Set方法:', uniqueBySet(arr2)); // [1, NaN, 2, 3] ✅
console.log('indexOf方法:', uniqueByIndexOf(arr2)); // [1, NaN, 2, NaN, 3] ❌
console.log('双层循环(Object.is):', uniqueByLoop(arr2)); // [1, NaN, 2, 3] ✅
console.log('Map方法:', uniqueByMap(arr2)); // [1, NaN, 2, 3] ✅
console.log('includes方法:', uniqueByIncludes(arr2)); // [1, NaN, 2, 3] ✅

console.log('\n=== 混合类型测试 ===');
const arr3 = [1, '1', true, 'true', null, undefined, NaN, NaN];
console.log('原数组:', arr3);
console.log('Set方法:', uniqueBySet(arr3));
console.log('Object方法(有问题):', uniqueByObject(arr3)); // 1和"1"会混淆
console.log('Object改进版:', uniqueByObjectImproved(arr3));

console.log('\n=== 对象数组去重测试 ===');
const users = [
  {id: 1, name: 'Alice'},
  {id: 2, name: 'Bob'},
  {id: 1, name: 'Charlie'},
  {id: 3, name: 'David'}
];
console.log('原数组:', users);
console.log('按id去重:', uniqueBy(users, 'id'));

console.log('\n=== 深度去重测试 ===');
const arr4 = [
  {a: 1, b: 2},
  {a: 1, b: 2},
  {a: 2, b: 3}
];
console.log('原数组:', arr4);
console.log('Set方法(按引用):', uniqueBySet(arr4)); // 不去重
console.log('深度去重(按值):', deepUnique(arr4)); // 去重

console.log('\n=== 性能测试 ===');
const largeArr = Array.from({length: 10000}, (_, i) => i % 1000);

console.time('Set方法');
uniqueBySet(largeArr);
console.timeEnd('Set方法');

console.time('indexOf方法');
uniqueByIndexOf(largeArr);
console.timeEnd('indexOf方法');

console.time('Map方法');
uniqueByMap(largeArr);
console.timeEnd('Map方法');

console.time('includes方法');
uniqueByIncludes(largeArr);
console.timeEnd('includes方法');

// ============================================
// 面试中的最佳实践
// ============================================

/**
 * 推荐使用: Set方法
 * 理由:
 * 1. 代码最简洁: 一行代码搞定
 * 2. 性能最好: O(n)时间复杂度
 * 3. 正确处理NaN: Set内部使用SameValueZero算法
 * 4. 现代浏览器都支持: ES6已经普及
 * 
 * 面试回答顺序:
 * 1. 先写Set方案，说明这是最推荐的
 * 2. 解释Set的原理和优势
 * 3. 补充传统方案(indexOf、双层循环)，展示知识广度
 * 4. 说明各方案的优缺点和适用场景
 * 5. 提到特殊情况(NaN、对象去重)
 */

// 最终推荐方案
const unique = arr => [...new Set(arr)];

// 导出供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    uniqueBySet,
    uniqueByIndexOf,
    uniqueByReduce,
    uniqueByLoop,
    uniqueByMap,
    uniqueByObject,
    uniqueByIncludes,
    uniqueBy,
    deepUnique,
    unique
  };
}
