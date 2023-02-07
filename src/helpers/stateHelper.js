
export default class stateHelper {

    static store = null;
  
    static getState() {
      if (this.store) {
        return this.store.getState();
      }
      return null;
    }
  
    static getDispatch() {
      if (this.store) {
        return this.store.dispatch;
      }
      return null;
    }
}  