import { combineReducers } from 'redux';
import Auth from "./Auth";
import Case from "./Case";
import Process from "./Process";
import Chat from "./Chat";

let rootReducer = combineReducers({
    Auth,
    Case,
    Process,
    Chat
});

export default rootReducer;
