import { combineReducers } from 'redux';
import Auth from "./Auth";
import Case from "./Case";
import Process from "./Process";

let rootReducer = combineReducers({
    Auth,
    Case,
    Process,
});

export default rootReducer;
