export default class GlobalData {
    static myInstance = null;
    top = 0;
    screenHeight = 0;
    constructor() {
    }

    static getInstance() {
        if (!GlobalData.myInstance) {
            GlobalData.myInstance = new GlobalData();
        }
        return GlobalData.myInstance;
    }

    setTop (val) {
        this.top = val;
    }
    getTop() {
        return this.top;
    }

    setScreenHeight (val) {
        this.screenHeight = val;
    }
    getScreenHeight() {
        return this.screenHeight;
    }
}