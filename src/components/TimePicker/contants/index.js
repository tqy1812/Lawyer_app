import {Dimensions} from 'react-native';
import {getWeekDay, getDaysInMonth, getToday, convertDateToString} from '../utils/dateFormat';
import moment from 'moment';
export const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
export const DEFAULT_MIN_DATE = '2000-1-1default';
export const DEFAULT_MAX_DATE = getToday() + 'default';
export const CALENDAR_DEFAULT_MIN_DATE = '2000-1-1';
export const CALENDAR_DEFAULT_MAX_DATE = getToday();

/** Tool bar **/
export const DEFAULT_CANCEL_TEXT = 'Cancel';
export const DEFAULT_CONFIRM_TEXT = 'Confirm';
export const DEFAULT_TOOL_BAR_POSITION = {
    TOP: 'top',
    BOTTOM: 'bottom',
};

/** Only for Calendar */
export const DEFAULT_WEEK_ZH = ['日', '一', '二', '三', '四', '五', '六'];

/** Only for Calendar */
export const DEFAULT_WEEK_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];



/**
 * Only for Calendar
 *
 * @param weeks
 * @param firstDay
 * @returns {[]} Returns a week array according to the first day.
 */
export function getWeekDays(weeks: [string], firstDay: number): [string] {
    let _weeks = [];
    // Use default week
    if (weeks === DEFAULT_WEEK_EN || weeks === DEFAULT_WEEK_ZH) {
        const temWeeks = weeks === DEFAULT_WEEK_EN ? DEFAULT_WEEK_EN : DEFAULT_WEEK_ZH;
        // Nothing changed
        if (firstDay === 0) {
            return temWeeks;
        }

        const _pre = [];
        const _later = [];
        temWeeks.forEach((day, index) => {
            if (index < firstDay) {
                _later.push(day);
            } else {
                _pre.push(day);
            }
        });
        _weeks = _pre.concat(_later);
    } else {
        _weeks = weeks;
    }
    return _weeks;
}

/** Only for Date Picker */
export const DATE_PICKER_ROWS = 5;
export const DATE_PICKER_ROW_HEIGHT = 35;

/** Only for Date Picker */
export const BORDER_LINE_POSITION = {
    TOP: 'top',
    MIDDLE: 'middle',
    BOTTOM: 'bottom',
};


/** Only for Date Picker */
export const DATE_KEY_TYPE = {
    YEAR: 'year',
    MONTH: 'month',
    DAY: 'day',
    START_HOUR: 'start_hour',
    START_MINUTE: 'start_minute',
    END_HOUR: 'end_hour',
    END_MINUTE: 'end_minute',
    DIVIDER: 'divider',
};




export function dateTimeListWidth(type: string, width: number | string) {
    return +width / 5;
}

/** Only for Time Picker */
export function getTimePickerData(startHours, startMinutes, endHours, endMinutes) {
    const _startHour = {key: DATE_KEY_TYPE.START_HOUR, data: startHours};
    const _startMinute = {key: DATE_KEY_TYPE.START_MINUTE, data: startMinutes};
    const _divider = {key: DATE_KEY_TYPE.DIVIDER, data: ['~']};
    const _endHour = {key: DATE_KEY_TYPE.END_HOUR, data: endHours};
    const _endMinute = {key: DATE_KEY_TYPE.END_MINUTE, data: endMinutes};
    return [_startHour, _startMinute, _divider,  _endHour, _endMinute];
}

/** Only for Time Picker */
export function getTimePickerInitialData(initialProps) {
    const {
        defaultStartTime,
        defaultEndTime,
    } = initialProps;
    let _defaultStartTime = [];
    let _defaultEndTime = []
    if(!defaultStartTime) {
        _defaultStartTime = moment(new Date()).format('HH:mm').split(':')
    }
    else {
        _defaultStartTime = defaultStartTime.split(':')
    }
    if(!defaultEndTime) {
        _defaultEndTime = moment(new Date()).format('HH:mm').split(':')
    }
    else {
        _defaultEndTime = defaultEndTime.split(':')
    }
    // hour
    const startHours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
    const selectedStartHour = _defaultStartTime[0];
    const defaultStartHourIndex = _defaultStartTime[0];
    //minute
    let startMinutes = [];
    for(let i=0; i<60; i++) {
        startMinutes.push(i);
    }
    const selectedStartMinute = _defaultStartTime[1];
    const defaultStartMinuteIndex = _defaultStartTime[1];

    // hour
    const endHours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
    const selectedEndHour = _defaultEndTime[0];
    const defaultEndHourIndex = _defaultEndTime[0];
    //minute
    let endMinutes = [];
    for(let i=0; i<60; i++) {
        endMinutes.push(i);
    }
    const selectedEndMinute = _defaultEndTime[1];
    const defaultEndMinuteIndex = _defaultEndTime[1];
    return {
        startHours,
        startMinutes,
        defaultStartHourIndex,
        defaultStartMinuteIndex,
        selectedStartHour,
        selectedStartMinute,
        endHours,
        endMinutes,
        defaultEndHourIndex,
        defaultEndMinuteIndex,
        selectedEndHour,
        selectedEndMinute,
        isDefaultTimeChanged: false,
    };
}
