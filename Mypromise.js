/*
*建立MyPromise构造函数
*/

// 首先定义MyPromise的三种状态
const PENDING = 'pending';
const FULFILLED = 'fulfilled'; // 成功状态
const REJECTED = 'rejected'; // 失败状态
function MyPromise (fn) {
  this.state = PENDING;
  this.result = null; // result根据state的不同可能赋值给value或者reason
  // then方法的两个参数
  const onFulfilled = (value) => transition(this, FULFILLED, value); // 成功状态下的执行
  const onRejected = (reason) => transition(this, REJECTED, reason); // 失败状态下执行

  // resolve & reject (只能被调用一次)
  let ignore = false;
  const resolve = (value) => {
    if (ignore) return;
    ignore = true;
    console.log(`new的时候执行resolve---${value}`)
    onFulfilled(value);
  };
  const reject = (reason) => {
    if (ignore) return;
    ignore = true;
    onRejected(reason);
  };

  // 执行传入的函数fn
  try {
    fn(resolve, reject);
  } catch (error) {
    reject(error);
  }
};

// 负责状态修改
function transition (promise, state, result) {
  console.log(`修改状态，执行handleCallbacks`)
  if (promise.state === PENDING) {
    promise.state = state;
    promise.result = result;
    promise.callbacks = [];
    handleCallbacks(promise.callbacks, state, result);
  };
};

// promise的then方法
MyPromise.prototype.then = function (onFulfilled, onRejected) {
  return new MyPromise((resolve, reject) => {
    // console.log(JSON.stringify(onFulfilled), JSON.stringify(resolve))
    const callback = { onFulfilled, onRejected, resolve, reject };
    console.log(`状态---${this.state === PENDING},${callback}`);
    if (this.state === PENDING) {
      this.callbacks.push(callback); // then方法可能被多次调用，所以把之后要执行的then方法
      console.log(`then---${this.callbacks}`);
    } else {
      console.log('laile')
      handleCallbacks(this.callbacks, this.state, this.result);
    };
  });
};
// 将当前执行的callback清除掉
function handleCallbacks (callbacks, state, result) {
  console.log(`handleCallbacks--${callbacks}`)
  while (callbacks.length) {
    console.log('进来了');
    handleCallback(callbacks.shift(), state, result);
  };
};
function handleCallback (callback, state, result) {
  const { onFulfilled, onRejected, resolve, reject } = callback;
  try {
    if (state === FULFILLED) {
      isFunction(onFulfilled) ? resolve(onFulfilled(result)) : resolve(result);
    };
    if (state === REJECTED) {
      isFunction(onRejected) ? reject(onRejected(result)) : reject(result);
    };
  } catch (error) {
    reject(error);
  };
};

const promise1 = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    // console.log('22222222')
    // resolve(1)
  }, 2000)
});
promise1.then((val) => {
  console.log(`promise1:${val}`);
  return 2
})
