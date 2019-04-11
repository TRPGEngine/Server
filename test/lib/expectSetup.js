const jestExpect = global.expect;

jestExpect.extend({
  toBeSuccess: (received) => {
    if(received.result === true) {
      return {
        message: () => `result should be error but successd: ${JSON.stringify(received)}`,
        pass: true,
      };
    }else {
      return {
        message: () => `result is ${received.result}, message: ${received.msg}`,
        pass: false,
      };
    }
  }
});
