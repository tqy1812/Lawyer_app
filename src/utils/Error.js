// 错误提示
export default class Error {

    static ERR_REQ = 1;
    static ERR_NET = 2;
    static ERR_INTANAL = 3;
  
    constructor(type = Error.ERR_INTANAL, code, info, api = '') {
      this.type = type;
      this.info = info;
      this.api = api;
      this.code = code;
      this.time = new Date().toLocaleString().split('GMT')[0];
    }
  
    toString() {
      return this.info;
    }
  
    print() {
      let errtag = '程序错误';
      switch (this.type) {
        case Error.ERR_REQ: errtag = '请求错误'; break;
        case Error.ERR_NET: errtag = '网络错误'; break;
        case Error.ERR_INTANAL: errtag = '程序错误'; break;
      }
      console.log(':::{code:' + this.code + ', '+ errtag +':' + this.info + ', api:' + this.api + ', time:"' + this.time + '"}');
    }
  }
  