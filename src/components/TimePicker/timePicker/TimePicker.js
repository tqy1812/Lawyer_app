import React, {Component} from 'react';
import {View, Overlay} from 'react-native';
import TimePickerList from './TimePickerList';
import PropTypes from 'prop-types';
import styles from './style';
import ToolBar from '../components/ToolBar';
import * as Constants from '../contants';
const Toast = Overlay.Toast;
class TimePicker extends Component {

    constructor(props) {
        super(props);
        this.state = Constants.getTimePickerInitialData(props);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.defaultStartTime !== nextProps.defaultStartTime || this.props.defaultEndTime !== nextProps.defaultEndTime) {
            this.setState({ isDefaultTimeChanged: true }, () => {
                const obj = Constants.getTimePickerInitialData(nextProps);
                this.setState(obj);
            });
        }
        return true;
    }

    _onValueChange = (key, selectedIndex) => {
        const {startHours, startMinutes, endHours, endMinutes} = this.state;
        const _getSelectedIndex = times => selectedIndex < 0 ? 0 : Math.min(selectedIndex, times.length - 1);

        switch (key) {
            case Constants.DATE_KEY_TYPE.START_HOUR:
                const hourIndex = _getSelectedIndex(startHours);
                this.setState({
                    selectedStartHour: startHours[hourIndex]
                }, this._onValueChangeCallBack);
                break;
            case Constants.DATE_KEY_TYPE.START_MINUTE:
                const minuteIndex = _getSelectedIndex(startMinutes);
                this.setState({
                    selectedStartMinute: startMinutes[minuteIndex],
                }, this._onValueChangeCallBack);
                break;
            case Constants.DATE_KEY_TYPE.END_HOUR:
                const endHourIndex = _getSelectedIndex(endHours);
                this.setState({
                    selectedEndHour: endHours[endHourIndex]
                }, this._onValueChangeCallBack);
                break;
            case Constants.DATE_KEY_TYPE.END_MINUTE:
                const endMinuteIndex = _getSelectedIndex(endMinutes);
                this.setState({
                    selectedEndMinute: endMinutes[endMinuteIndex],
                }, this._onValueChangeCallBack);
                break;
            default:
                break;
        }
    };

    _onValueChangeCallBack = () => {
        const {onValueChange} = this.props;
        const {selectedStartHour, selectedStartMinute, selectedEndHour, selectedEndMinute} = this.state;
        const _selectedStartTime = `${parseInt(selectedStartHour) < 10 ? '0'+ parseInt(selectedStartHour): selectedStartHour}:${parseInt(selectedStartMinute) < 10 ? '0'+ parseInt(selectedStartMinute): selectedStartMinute}`;
        const _selectedEndTime = `${parseInt(selectedEndHour) < 10 ? '0'+ parseInt(selectedEndHour): selectedEndHour}:${parseInt(selectedEndMinute) < 10 ? '0'+ parseInt(selectedEndMinute): selectedEndMinute }`;
        if((parseInt(selectedEndHour) < parseInt(selectedStartHour))||(parseInt(selectedEndHour) == parseInt(selectedStartHour) && parseInt(selectedEndMinute) <  parseInt(selectedStartMinute))) {
            Toast.show('开始时间需小于结束时间，请重新提交！')
            return;
        }
        onValueChange && typeof onValueChange === 'function' && onValueChange([_selectedStartTime, _selectedEndTime]);
    };

    render() {

        const {
            type,
            backgroundColor,
            width,
            rows,
            rowHeight,
            selectedRowBackgroundColor,
            unselectedRowBackgroundColor,
            selectedBorderLineColor,
            selectedBorderLineWidth,
            selectedBorderLineMarginHorizontal,
            selectedTextFontSize,
            selectedTextColor,
            selectedTextStyle,
            unselectedTextColor,
            unselectedTextStyle,
            textMarginHorizontal,

            showToolBar,
            toolBarPosition,
            toolBarStyle,
            toolBarCancelStyle,
            toolBarConfirmStyle,
            titleStyle,
            titleText,
            cancelText,
            confirmText,
            cancel,
            confirm,
            cancelDisabled,
            confirmDisabled,

            hourSuffix,
            minuteSuffix,

        } = this.props;

        const {
            startHours,
            startMinutes,
            selectedStartHour,
            selectedStartMinute,
            defaultStartHourIndex,
            defaultStartMinuteIndex,
            endHours,
            endMinutes,
            selectedEndHour,
            selectedEndMinute,
            defaultEndHourIndex,
            defaultEndMinuteIndex,
            isDefaultTimeChanged,
        } = this.state;

        if (isDefaultTimeChanged) return null;

        const dataSource = Constants.getTimePickerData(startHours, startMinutes, endHours, endMinutes);

        const _toolBar = (<ToolBar
            style={[{backgroundColor}, toolBarStyle]}
            cancelStyle={toolBarCancelStyle}
            confirmStyle={toolBarConfirmStyle}
            titleStyle={titleStyle}
            titleText={titleText}
            cancelText={cancelText}
            cancel={() => cancel && typeof cancel === 'function' && cancel()}
            confirm={() => {
                const _selectedStartDate = `${parseInt(selectedStartHour) < 10 ? '0'+ parseInt(selectedStartHour): selectedStartHour}:${parseInt(selectedStartMinute) < 10 ? '0'+ parseInt(selectedStartMinute): selectedStartMinute}`;
                const _selectedEndDate = `${parseInt(selectedEndHour) < 10 ? '0'+ parseInt(selectedEndHour): selectedEndHour}:${parseInt(selectedEndMinute) < 10 ? '0'+ parseInt(selectedEndMinute): selectedEndMinute }`;
                if((parseInt(selectedEndHour) < parseInt(selectedStartHour))||(parseInt(selectedEndHour) == parseInt(selectedStartHour) && parseInt(selectedEndMinute) <  parseInt(selectedStartMinute))) {
                    Toast.show('开始时间需小于结束时间，请重新提交！')
                    return;
                }
                confirm && typeof confirm === 'function' && confirm([_selectedStartDate, _selectedEndDate]);
            }}
            confirmText={confirmText}
            cancelDisabled={cancelDisabled}
            confirmDisabled={confirmDisabled}
        />);
        return (
            <View>
                {showToolBar && toolBarPosition === Constants.DEFAULT_TOOL_BAR_POSITION.TOP && _toolBar}
                <View style={[styles.datePickerContainer, {backgroundColor}]}>
                    {
                        dataSource.map((item, index) => {
                            const {key, data} = item;
                            const initialScrollIndex = key === Constants.DATE_KEY_TYPE.START_HOUR ? defaultStartHourIndex : key ===  Constants.DATE_KEY_TYPE.START_MINUTE ? defaultStartMinuteIndex : key ===  Constants.DATE_KEY_TYPE.END_HOUR ? defaultEndHourIndex : key ===  Constants.DATE_KEY_TYPE.END_MINUTE ? defaultEndMinuteIndex : 0;
                            return (<TimePickerList
                                key={index}
                                data={data}
                                dataIndex={index}
                                keyType={key}
                                rows={rows}
                                rowHeight={rowHeight}
                                dataLength={dataSource.length}
                                initialScrollIndex={initialScrollIndex}
                                width={Constants.dateTimeListWidth(type, width)}
                                onValueChange={selectedIndex => this._onValueChange(key, selectedIndex)}
                                selectedRowBackgroundColor={selectedRowBackgroundColor || backgroundColor}
                                unselectedRowBackgroundColor={unselectedRowBackgroundColor || backgroundColor}
                                selectedBorderLineColor={selectedBorderLineColor}
                                selectedBorderLineWidth={selectedBorderLineWidth}
                                selectedBorderLineMarginHorizontal={selectedBorderLineMarginHorizontal}
                                selectedTextFontSize={selectedTextFontSize}
                                selectedTextColor={selectedTextColor}
                                selectedTextStyle={selectedTextStyle}
                                unselectedTextColor={unselectedTextColor}
                                unselectedTextStyle={unselectedTextStyle}
                                textMarginHorizontal={textMarginHorizontal}
                                hourSuffix={hourSuffix}
                                minuteSuffix={minuteSuffix}
                            />);
                        })
                    }
                </View>
                {showToolBar && toolBarPosition === Constants.DEFAULT_TOOL_BAR_POSITION.BOTTOM && _toolBar}
            </View>
        );
    }

}

TimePicker.propTypes = {

    /**
     * Container background color. Default is 'white'.
     */
    backgroundColor: PropTypes.string,

    /**
     * The default date. Default is equal to maxDate. Other supported formats are the same as minDate and maxDate.
     * A string type or Date type are also supported. E.g: new Date().
     */
    defaultStartTime: PropTypes.string,
    defaultEndTime: PropTypes.string,

    /**
     * Whether to show tool bar, default is true. If false, hide tool bar on top.
     */
    showToolBar: PropTypes.bool,

    /**
     * The position of tool bar, default is 'top' that is at the top of screen. So far, just both 'top' and 'bottom'
     * are supported.
     */
    toolBarPosition: PropTypes.oneOf(['top', 'bottom']),

    /**
     * Tool bar view styles, passed like {backgroundColor: 'red'} as you like.
     */
    toolBarStyle: PropTypes.object,

    /**
     * Tool bar cancel button text styles, passed like {color: 'red', fontSize: 15} as you like.
     * Note that you can control the active opacity of the button through {activeOpacity: 1}.
     */
    toolBarCancelStyle: PropTypes.object,

    /**
     * Tool bar confirm button text styles, passed like {color: 'red', fontSize: 15} as you like.
     * Note that you can control the active opacity of the button through {activeOpacity: 1}.
     */
    toolBarConfirmStyle: PropTypes.object,

    /**
     * Tool bar title text style.
     */
    titleStyle: PropTypes.object,

    /**
     * Tool bar title text, default is "".
     */
    titleText: PropTypes.string,

    /**
     * Tool bar cancel button text, default is "Cancel".
     */
    cancelText: PropTypes.string,

    /**
     * Tool bar confirm button text, default is "Confirm".
     */
    confirmText: PropTypes.string,

    /**
     * On date value change callback in real time. Once you has selected the date each time, you'll get the date you selected.
     * For example, you can set like this to get the selected date:
     * ......
     * onValueChange={selectedDate => console.warn(selectedDate)}
     * ......
     */
    onValueChange: PropTypes.func,

    /**
     * Tool bar cancel button callback.
     */
    cancel: PropTypes.func,

    /**
     * Tool bar confirm button callback with a date string like "2020-06-10".
     */
    confirm: PropTypes.func,

    /**
     * Whether to disable the cancel button. Default is false.
     */
    cancelDisabled: PropTypes.bool,

    /**
     * Whether to disable the confirm button. Default is false.
     */
    confirmDisabled: PropTypes.bool,

    /**
     * Width for date picker. Default is screen width. Note that the height for date picker relied on the rowHeight and the rows below.
     */
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    /**
     * Row number for date picker. Default is 5. Note that Only one of [5, 7] is supported up to now. E.g: rows={5} or rows={7}.
     */
    rows: PropTypes.oneOf([5, 7]),

    /**
     * Height for each row. Default is 35.
     */
    rowHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    /**
     * Background color for the selected row. Default is 'white'.
     */
    selectedRowBackgroundColor: PropTypes.string,

    /**
     * Background color for the unselected row. Default is 'white'.
     */
    unselectedRowBackgroundColor: PropTypes.string,

    /**
     * Border line color for the selected row. Default is '#d3d3d3'.
     */
    selectedBorderLineColor: PropTypes.string,

    /**
     * Border line width for the selected row. Default is 0.5. string and number type are supported. E.g: selectedBorderLineWidth={20} or selectedBorderLineWidth={'20'}.
     */
    selectedBorderLineWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    /**
     * Border line margin horizontal. Default is 0.
     */
    selectedBorderLineMarginHorizontal: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    /**
     * Font size for the selected row text. Default is 22. string and number type are supported. E.g: selectedTextFontSize={20} or selectedTextFontSize={'20'}.
     */
    selectedTextFontSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    /**
     * Text color for the selected row text. Default is 'black'.
     */
    selectedTextColor: PropTypes.string,

    /**
     * The selected text styles. Note that if both `selectedTextStyle` and `selectedTextFontSize` are set, `selectedTextStyle`
     * will have higher priority. For example, if selectedTextStyle={{fontSize: 15}} and selectedTextFontSize=10, then the selected
     * font size will be 15.
     */
    selectedTextStyle: PropTypes.object,

    /**
     * Text color for the unselected row text. Default is '#9d9d9d'.
     */
    unselectedTextColor: PropTypes.string,

    /**
     * The unselected text styles. Note that if both `unselectedTextStyle` and `unselectedTextColor` are set, `unselectedTextStyle`
     * will have higher priority. For example, if unselectedTextStyle={{color: 'white'}} and unselectedTextColor={'black'}, then the
     * unselected text color will be `white`. Besides, the fontSize is not supported for the unselected text, it's only determined by
     * the selected text font size setting. For example, if you set unselectedTextStyle={{fontSize: 15}}, it won't work.
     */
    unselectedTextStyle: PropTypes.object,

    /**
     * Text margin horizontal distance to left and right. Default is 0.
     */
    textMarginHorizontal: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    /**
     * Hour suffix string to display for each row. E.g: if hourSuffix={'时'}, the hour column will follow a '时' suffix like 12时.
     */
    hourSuffix: PropTypes.string,

    /**
     * Minute suffix string to display for each row. E.g: if minuteSuffix={'分'}, the minute column will follow a '分' suffix like 6分.
     */
    minuteSuffix: PropTypes.string,
};

TimePicker.defaultProps = {
    backgroundColor: 'white',
    width: Constants.SCREEN_WIDTH,
    rows: Constants.DATE_PICKER_ROWS,
    rowHeight: Constants.DATE_PICKER_ROW_HEIGHT,
    selectedRowBackgroundColor: '',
    unselectedRowBackgroundColor: '',
    selectedBorderLineColor: '#d3d3d3',
    selectedBorderLineWidth: 0.5,
    selectedBorderLineMarginHorizontal: 0,
    selectedTextFontSize: 22,
    selectedTextColor: 'black',
    selectedTextStyle: {},
    unselectedTextColor: '#9d9d9d',
    unselectedTextStyle: {},
    textMarginHorizontal: 0,
    showToolBar: true,
    toolBarPosition: Constants.DEFAULT_TOOL_BAR_POSITION.TOP,
    cancelText: Constants.DEFAULT_CANCEL_TEXT,
    confirmText: Constants.DEFAULT_CONFIRM_TEXT,
    cancel: () => {
    },
    confirm: () => {
    },
    cancelDisabled: false,
    confirmDisabled: false,
    hourSuffix: '',
    minuteSuffix: '',
};

export default TimePicker;
