import React, { Component } from 'react';
import {
  StyleSheet,
  Dimensions,
  View,
  Text,
  TouchableWithoutFeedback,
  TouchableNativeFeedback,
  TouchableOpacity,
  TouchableHighlight,
  Modal,
  ActivityIndicator,
  FlatList,
  Platform,
  TextInput,
  ScrollView 
} from 'react-native';
import PropTypes from 'prop-types';
import { logger } from '../utils/utils';
import GlobalData from '../utils/GlobalData';
import platform from '../utils/platform';
const TOUCHABLE_ELEMENTS = [
  'TouchableHighlight',
  'TouchableOpacity',
  'TouchableWithoutFeedback',
  'TouchableNativeFeedback',
];

const globalData = GlobalData.getInstance();
export default class ModalDropdown extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    multipleSelect: PropTypes.bool,
    scrollEnabled: PropTypes.bool,
    saveScrollPosition: PropTypes.bool,
    defaultIndex: PropTypes.number,
    defaultValue: PropTypes.string,
    options: PropTypes.array,
    accessible: PropTypes.bool,
    animated: PropTypes.bool,
    isFullWidth: PropTypes.bool,
    showsVerticalScrollIndicator: PropTypes.bool,
    keyboardShouldPersistTaps: PropTypes.string,
    showSearch: PropTypes.bool,
    keySearchObject: PropTypes.string,
    renderSearch: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.object,
    ]),
    searchInputStyle: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.object,
      PropTypes.array,
    ]),
    searchPlaceholder: PropTypes.string,
    style: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.object,
      PropTypes.array,
    ]),
    textStyle: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.object,
      PropTypes.array,
    ]),
    defaultTextStyle: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.object,
      PropTypes.array,
    ]),
    dropdownStyle: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.object,
      PropTypes.array,
    ]),
    dropdownTextStyle: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.object,
      PropTypes.array,
    ]),
    dropdownTextHighlightStyle: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.object,
      PropTypes.array,
    ]),
    dropdownListProps: PropTypes.object,
    dropdownTextProps: PropTypes.object,
    adjustFrame: PropTypes.func,
    renderRow: PropTypes.func,
    renderRowComponent: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.object,
    ]),
    renderRowProps: PropTypes.object,
    renderSeparator: PropTypes.func,
    renderButtonText: PropTypes.func,
    renderRowText: PropTypes.func,
    renderButtonComponent: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.object,
    ]),
    renderRightComponent: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.object,
    ]),
    renderButtonProps: PropTypes.object,
    onDropdownWillShow: PropTypes.func,
    onDropdownWillHide: PropTypes.func,
    onSelect: PropTypes.func,
    numberOfLines: PropTypes.number
  };

  static defaultProps = {
    disabled: false,
    multipleSelect: false,
    scrollEnabled: true,
    saveScrollPosition: true,
    defaultIndex: -1,
    defaultValue: '请选择...',
    animated: true,
    isFullWidth: false,
    showsVerticalScrollIndicator: true,
    keyboardShouldPersistTaps: 'never',
    showSearch: false,
    searchPlaceholder: "Search",
    keySearchObject: 'label',
    renderRowComponent: Platform.OS === 'ios' ? TouchableOpacity : TouchableHighlight,
    renderButtonComponent: TouchableOpacity,
    renderRightComponent: View,
    numberOfLines: 1
  };

  constructor(props) {
    super(props);
    this._button = null;
    this._buttonFrame = null;

    this.state = {
      accessible: !!props.accessible,
      loading: !props.options,
      showDropdown: false,
      buttonText: props.defaultValue,
      selectedIndex: props.defaultIndex,
      options: props.options.slice(0, 10),
      searchValue: '',
      page: 1,
      totalSize:  props.options ? props.options.length : 0
    };
  }

  static getDerivedStateFromProps(nextProps, state) {
    let { selectedIndex, loading, options: list } = state;
    const { defaultIndex, defaultValue, options } = nextProps;
    let newState = null;
    if (selectedIndex < 0) {
      selectedIndex = defaultIndex;
      newState = {
        selectedIndex: selectedIndex
      };
      if (selectedIndex < 0) {
        newState.buttonText = defaultValue;
      }
    }

    if (loading !== !options) {
      if (!newState) {
        newState = {};
      }
      newState.loading = !options;
    }

    logger('start getMoreData list', list.length)
    logger('start getMoreData options', options.length)
    // newState.options = list
    // this compare only checks an array with no data, doesnt deep check, this comparison use for get api
    // if (options !== state.options) {
    //   newState.options = options
    // }
    return newState;
  }

  render() {
    return (
      <View {...this.props}>
        {this._renderButton()}
        {this._renderModal()}
      </View>
    );
  }

  _updatePosition(callback) {
    if (this._button && this._button.measure) {
      this._button.measure((fx, fy, width, height, px, py) => {
        this._buttonFrame = {
          x: px,
          y: py,
          w: width,
          h: height,
        };
        callback && callback();
      });
    }
  }

  show() {
    this._updatePosition(() => {
      this.setState({
        showDropdown: true,
      });
    });
  }

  hide() {
    this.setState({
      showDropdown: false,
      options: this.props.options ? this.props.options.slice(0, 10) : [],
      page: 1,
    });
  }

  select(idx) {
    const {
      defaultValue,
      options,
      defaultIndex,
      renderButtonText,
    } = this.props;
    let value = defaultValue;

    if (idx == null || !options || idx >= options.length) {
      idx = defaultIndex;
    }
    if (idx >= 0) {
      value = renderButtonText
        ? renderButtonText(options[idx])
        : options[idx].toString();
    }

    this.setState({
      buttonText: value,
      selectedIndex: idx,
    });
  }

  getMoreData = () => {
    logger('start getMoreData')
    const {page, totalSize} = this.state;
    const that = this;
    let totalPage = Math.ceil(totalSize /10);
    logger('start caselist getMoreData', page)
    if(totalPage > 1 && page + 1 <= totalPage) {
      let size = page + 1;
      logger('start caselist getMoreData', 10 * size)
      setTimeout(()=>{
        that.setState({options: this.props.options.slice(0, 10 * size), page: size});
      },300);
    }
    else{
      logger('load finish')
    }
  }
  handleScrollEnd = event => {
    const contentHeight = event.nativeEvent.contentSize.height;
    const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;
    const scrollOffset = event.nativeEvent.contentOffset.y;

    // 是否滑动到底部
    const isEndReached = scrollOffset + scrollViewHeight >= contentHeight;
    // 内容高度是否大于列表高度
    const isContentFillPage = contentHeight >= scrollViewHeight;

    const { reqSsqData, reqJpqData, reqWbqData, reqInData } = this.state;

    if (isContentFillPage && isEndReached) {
      // 已滑动scrollview底部，触发加载分页请求
      this.getMoreData()
    }
  };
  _renderButton() {
    const {
      disabled,
      accessible,
      children,
      textStyle,
      defaultTextStyle,
      renderButtonComponent,
      renderButtonProps,
      renderRightComponent,
      buttonAndRightComponentContainerStyle,
      numberOfLines,
    } = this.props;
    const ButtonTouchable = renderButtonComponent;
    const RightComponent = renderRightComponent;
    const { buttonText, selectedIndex } = this.state;
    const buttonTextStyle = selectedIndex < 0 ? [textStyle, defaultTextStyle] : textStyle;
    return (
      <ButtonTouchable
        ref={button => (this._button = button)}
        disabled={disabled}
        accessible={accessible}
        onPress={this._onButtonPress}
        {...renderButtonProps}
      >
        {children || (
          <View style={[styles.button, buttonAndRightComponentContainerStyle]}>
            <Text style={[styles.buttonText, buttonTextStyle]} numberOfLines={numberOfLines}>
              {buttonText}
            </Text>
            <RightComponent />
          </View>
        )}
      </ButtonTouchable>
    );
  }

  _onButtonPress = () => {
    const { onDropdownWillShow, onDropdownWillHide } = this.props;
    const { showDropdown } = this.state;
  
    if (!showDropdown){
      if (!onDropdownWillShow || onDropdownWillShow() !== false) {
        this.show();
      }
    }
    else{
      if (!onDropdownWillHide || onDropdownWillHide() !== false) {
        this.hide();
      }
    }
    
  };

  _renderModal() {
    const { animated, accessible, dropdownStyle } = this.props;
    const { showDropdown, loading, options } = this.state;

    logger('start getMoreData _renderModal', options.length)
    if (showDropdown && this._buttonFrame) {
      const frameStyle = this._calcPosition();
      const animationType = animated ? 'fade' : 'none';
      if(platform.isAndroid()) {
      return (
       
          <Modal
          animationType={animationType}
          visible
          transparent
          onRequestClose={this._onRequestClose}
          supportedOrientations={[
            'portrait',
            'portrait-upside-down',
            'landscape',
            'landscape-left',
            'landscape-right',
          ]}
        >
          <TouchableWithoutFeedback
            accessible={accessible}
            disabled={!showDropdown}
            onPress={this._onModalPress}
          >
            <View style={styles.modal}>
            <View  style={[styles.dropdown, dropdownStyle, frameStyle]}>
                 {loading ? this._renderLoading() : this._renderDropdown()}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>);
        }
        else {
          return (<View  style={[styles.dropdown, dropdownStyle, frameStyle]}>
            <ScrollView 
              alwaysBounceHorizontal={false} 
              scrollEventThrottle={1}
              onMomentumScrollEnd={this.handleScrollEnd}>
                {loading ? this._renderLoading() : options && options.map((item, index)=>{
                       return this._renderItem({item, index})
                    })
                    }</ScrollView>
          </View>);
        }
      
    }
  }

  _calcPosition() {
    const { dropdownStyle, style, adjustFrame, isFullWidth } = this.props;
    const dimensions = Dimensions.get('window');
    const windowWidth = dimensions.width;
    const windowHeight = globalData.getScreenHeight() > 0 ? globalData.getScreenHeight() : dimensions.height;
    const dropdownHeight =
      (dropdownStyle && StyleSheet.flatten(dropdownStyle).height) ||
      StyleSheet.flatten(styles.dropdown).height;
    const bottomSpace =
      windowHeight - this._buttonFrame.y - this._buttonFrame.h;
    const rightSpace = windowWidth - this._buttonFrame.x;
    const showInBottom =
      bottomSpace >= dropdownHeight || bottomSpace >= this._buttonFrame.y;
    const showInLeft = rightSpace >= this._buttonFrame.x;
    const positionStyle = {
      height: dropdownHeight,
      top: showInBottom
        ? platform.isAndroid() ? this._buttonFrame.y : this._buttonFrame.h   //this._buttonFrame.y + this._buttonFrame.h
        : Math.max(0, this._buttonFrame.y - dropdownHeight),
    };

    if (showInLeft) {
      positionStyle.left = platform.isAndroid() ?  this._buttonFrame.x - 5 : 0; //this._buttonFrame.x - 5;
      if (isFullWidth) {
        positionStyle.right = rightSpace - this._buttonFrame.w;
      }
    } else {
      const dropdownWidth =
        (dropdownStyle && StyleSheet.flatten(dropdownStyle).width) ||
        (style && StyleSheet.flatten(style).width) || -1;

      if (dropdownWidth !== -1) {
        positionStyle.width = dropdownWidth;
      }

      positionStyle.right = rightSpace - this._buttonFrame.w;
    }

    return adjustFrame ? adjustFrame(positionStyle) : positionStyle;
  }

  _onRequestClose = () => {
    const { onDropdownWillHide } = this.props;
    if (!onDropdownWillHide || onDropdownWillHide() !== false) {
      this.hide();
    }
  };

  _onModalPress = () => {
    const { onDropdownWillHide } = this.props;
    if (!onDropdownWillHide || onDropdownWillHide() !== false) {
      this.hide();
    }
  };

  _renderLoading = () => {
    return <ActivityIndicator size="small" />;
  };

  _renderSearchInput = () => {
    const {
      showSearch,
      renderSearch,
      searchInputStyle,
      searchPlaceholder,
      options: initialOptions,
      keySearchObject,
    } = this.props;

    if (!showSearch) return null;
    if (renderSearch) return renderSearch;

    const { buttonText, searchValue } = this.state;

    return (
      <TextInput
        style={[styles.searchInput, searchInputStyle]}
        onChangeText={(text) => {
          let filteredOptions = initialOptions;

          if (text) {
            filteredOptions = initialOptions.filter((option) => {
              return typeof option === 'object' && option !== null
                ? option?.[keySearchObject]?.toLowerCase().includes(text.toLowerCase().trim())
                : option.toLowerCase().includes(text.toLowerCase().trim())
            }
            );
          }

          this.setState({
            searchValue: text,
            options: filteredOptions,
            selectedIndex: filteredOptions.indexOf(buttonText)
          })
        }}
        value={searchValue}
        placeholder={searchPlaceholder}
      />
    );
  };

  _renderDropdown() {
    const {
      scrollEnabled,
      saveScrollPosition,
      renderSeparator,
      showsVerticalScrollIndicator,
      keyboardShouldPersistTaps,
      dropdownListProps,
    } = this.props;
    const { selectedIndex } = this.state;
    const { options } = this.state;

    console.log('232323', options.length)
    return (

      <FlatList
        {...dropdownListProps}
        getItemLayout={(data, index) => { return {length: 33 + StyleSheet.hairlineWidth, index, offset: (33 + StyleSheet.hairlineWidth) * index} }}
        data={options}
        ref={component => (this.flatList = component)}
        scrollEnabled={scrollEnabled}
        initialScrollIndex={saveScrollPosition ? selectedIndex : -1}
        style={styles.list}
        keyExtractor={(item, i) => (`key-${i}-${item.id}`)}
        renderItem={this._renderItem}
        ItemSeparatorComponent={renderSeparator || this._renderSeparator}
        automaticallyAdjustContentInsets={false}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        ListHeaderComponent={this._renderSearchInput}
        // initialNumToRender={options.length+1}
        // onEndReachedThreshold={0.2}
        // onEndReached={this.getMoreData.bind(this)}
        onScrollToIndexFailed={info => {
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            this.flatList.scrollToIndex({ index: info.index, animated: true });
          });
        }}
        extraData={this.state}
      />
    );
  }

  _renderItem = ({ item, index, separators }) => {
    logger('....renderItem',item)
    const {
      renderRow,
      renderRowComponent,
      renderRowProps,
      dropdownTextStyle,
      dropdownTextHighlightStyle,
      accessible,
      dropdownTextProps,
      renderRowText
    } = this.props;
    const RowTouchable = renderRowComponent;
    const { selectedIndex } = this.state;
    const key = `row_${index}`;
    const highlighted = index === selectedIndex;
    const value =
      renderRowText ? renderRowText(item) : item.toString();
      // logger(index)
    const row = !renderRow ? (
      <Text
        style={[
          styles.rowText,
          dropdownTextStyle,
          highlighted && styles.highlightedRowText,
          highlighted && dropdownTextHighlightStyle,
        ]}
        testID={item}
        {...dropdownTextProps}
      >
        {value}
      </Text>
    ) : (
      renderRow(item, index, highlighted)
    );

    const touchableProps = {
      key,
      accessible,
      onPress: () => this._onRowPress(item, index, separators),
      ...renderRowProps
    };

    return <RowTouchable {...touchableProps}>{row}</RowTouchable>;
  };

  _onRowPress(rowData, rowID, highlightRow) {
    const {
      onSelect,
      renderButtonText,
      onDropdownWillHide,
      multipleSelect
    } = this.props;

    if (!onSelect || onSelect(rowID, rowData) !== false) {
      const value =
        (renderButtonText && renderButtonText(rowData)) || rowData.toString();
      this.setState({
        buttonText: value,
        selectedIndex: rowID,
      });
    }

    if (!multipleSelect &&
      (!onDropdownWillHide || onDropdownWillHide() !== false)
    ) {
      this.setState({
        showDropdown: false,
      });
    }
  }

  _renderSeparator = ({ leadingItem = '' }) => {
    const key = `spr_${leadingItem}`;

    return <View style={styles.separator} key={key} />;
  };
}

const styles = StyleSheet.create({
  button: {
    // justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center'
  },
  buttonText: {
    fontSize: 12,
  },
  modal: {
    flexGrow: 1,
  },
  dropdown: {
    position: 'absolute',
    height: (33 + StyleSheet.hairlineWidth) * 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'lightgray',
    borderRadius: 2,
    backgroundColor: 'white',
    justifyContent: 'center',
    zIndex: 5,
  },
  loading: {
    alignSelf: 'center',
  },
  list: {
    // flexGrow: 1,
  },
  rowText: {
    paddingHorizontal: 6,
    paddingVertical: 10,
    fontSize: 11,
    color: 'gray',
    backgroundColor: 'white',
    textAlignVertical: 'center',
  },
  highlightedRowText: {
    color: 'black',
  },
  separator: {
    // height: StyleSheet.hairlineWidth,
    height: 0,
    backgroundColor: 'lightgray',
  },
  searchInput: {
    borderColor: 'gray',
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 11,
    paddingHorizontal: 6,
    paddingVertical: 10,
  }
});