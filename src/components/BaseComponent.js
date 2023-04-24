import React, { Component } from 'react';
import Immutable from 'immutable';

export default class BaseComponent extends Component {
    shouldComponentUpdate(nextProps, nextState) {
      let mapState = Immutable.fromJS(this.state);
      let mapNextState = Immutable.fromJS(nextState);
      let mapProps = Immutable.fromJS(this.props);
      let mapNextProps = Immutable.fromJS(nextProps);
      if (!Immutable.is(mapProps, mapNextProps) || !Immutable.is(mapState, mapNextState)) {
        return true;
      }
      return false;
    }
  }