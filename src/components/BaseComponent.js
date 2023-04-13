import React, { Component } from 'react';
import Immutable from 'immutable';

export default class BaseComponent extends Component {
    shouldComponentUpdate(nextProps, nextState) {
      if (!Immutable.is(this.props, nextProps) || !Immutable.is(this.state, nextState)) {
        return true;
      }
      return false;
    }
  }