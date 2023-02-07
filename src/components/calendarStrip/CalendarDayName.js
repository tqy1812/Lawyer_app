/**
 * Created by bogdanbegovic on 8/20/16.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";

import { Text, View, Animated, Easing, LayoutAnimation, TouchableOpacity } from "react-native";
import styles from "./Calendar.style.js";

class CalendarDayName extends Component {
  static propTypes = {
    dateName: PropTypes.string.isRequired,
    selectedDate: PropTypes.any,
    onDateSelected: PropTypes.func.isRequired,
    dayComponent: PropTypes.any,
    datesWhitelist: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
    datesBlacklist: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),

    markedDates: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),

    showDayName: PropTypes.bool,
    showDayNumber: PropTypes.bool,

    calendarColor: PropTypes.string,

    width: PropTypes.number,
    height: PropTypes.number,

    dateNameStyle: PropTypes.any,
    dateNumberStyle: PropTypes.any,
    dayContainerStyle: PropTypes.any,
    weekendDateNameStyle: PropTypes.any,
    weekendDateNumberStyle: PropTypes.any,
    highlightDateContainerStyle: PropTypes.any,
    highlightDateNameStyle: PropTypes.any,
    highlightDateNumberStyle: PropTypes.any,
    highlightDateNumberContainerStyle: PropTypes.any,
    disabledDateNameStyle: PropTypes.any,
    disabledDateNumberStyle: PropTypes.any,
    disabledDateOpacity: PropTypes.number,
    styleWeekend: PropTypes.bool,
    customDatesStyles: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
    markedDatesStyle: PropTypes.object,
    allowDayTextScaling: PropTypes.bool,

    calendarAnimation: PropTypes.object,
    registerAnimation: PropTypes.func.isRequired,
    daySelectionAnimation: PropTypes.object,
    useNativeDriver: PropTypes.bool,
    scrollable: PropTypes.bool,
    upperCaseDays: PropTypes.bool,
  };

  // Reference: https://medium.com/@Jpoliachik/react-native-s-layoutanimation-is-awesome-4a4d317afd3e
  static defaultProps = {
    daySelectionAnimation: {
      type: "", // animations disabled by default
      duration: 300,
      borderWidth: 1,
      borderHighlightColor: "black",
      highlightColor: "yellow",
      animType: LayoutAnimation.Types.easeInEaseOut,
      animUpdateType: LayoutAnimation.Types.easeInEaseOut,
      animProperty: LayoutAnimation.Properties.opacity,
      animSpringDamping: undefined // Only applicable for LayoutAnimation.Types.spring,
    },
    styleWeekend: true,
    showDayName: true,
    showDayNumber: true,
    upperCaseDays: true,
    width: 30, // Default width and height to avoid calcSizes() *sometimes* doing Math.round(undefined) to cause NaN
    height: 30
  };

  constructor(props) {
    super(props);
    this.state = {
      enabled: true,
      selected: false,
      animatedValue: new Animated.Value(0),
    };

    if (!props.scrollable) {
      props.registerAnimation(this.createAnimation());
    }
  }

  componentDidUpdate(prevProps, prevState) {
   
  }



  createAnimation = () => {
    const {
      calendarAnimation,
      useNativeDriver,
    } = this.props

    if (calendarAnimation) {
      this.animation = Animated.timing(this.state.animatedValue, {
        toValue: 1,
        duration: calendarAnimation.duration,
        easing: Easing.linear,
        useNativeDriver,
      });

      // Individual CalendarDayName animation starts have unpredictable timing
      // when used with delays in RN Animated.
      // Send animation to parent to collect and start together.
      return this.animation;
    }
  }





  render() {
    // Defaults for disabled state
    let day = (
          <View
            style={[
              styles.dateContainer, {width: 20, height: 20}
            ]}
          >
           <Text style={[{ fontSize: 15, color: '#000'}]}>
                {this.props.dateName}
            </Text>
          </View>
       
      );

    return <View style={styles.dateRootContainer}>
    {day}
  </View>;
  }
}

export default CalendarDayName;
