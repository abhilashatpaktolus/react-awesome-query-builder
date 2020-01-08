import React, { Component } from 'react';
import PropTypes from 'prop-types';
import mapValues from 'lodash/mapValues';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import {useOnPropsChange} from "../../utils/stuff";


export default (Group) => {
  class GroupContainer extends Component {
    static propTypes = {
      //tree: PropTypes.instanceOf(Immutable.Map).isRequired,
      config: PropTypes.object.isRequired,
      actions: PropTypes.object.isRequired, //{setConjunction: Funciton, removeGroup, addGroup, addRule, ...}
      path: PropTypes.any.isRequired, //instanceOf(Immutable.List)
      id: PropTypes.string.isRequired,
      not: PropTypes.bool,
      conjunction: PropTypes.string,
      children1: PropTypes.any, //instanceOf(Immutable.OrderedMap)
      onDragStart: PropTypes.func,
      treeNodesCnt: PropTypes.number,
      //connected:
      dragging: PropTypes.object, //{id, x, y, w, h}
    };

    constructor(props) {
      super(props);
      useOnPropsChange(this);

      this.conjunctionOptions = this._getConjunctionOptions(props);
    }

    pureShouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

    shouldComponentUpdate(nextProps, nextState) {
        let prevProps = this.props;
        let prevState = this.state;

        let should = this.pureShouldComponentUpdate(nextProps, nextState);
        if (should) {
          if (prevState == nextState && prevProps != nextProps) {
            const draggingId = (nextProps.dragging.id || prevProps.dragging.id);
            const isDraggingMe = draggingId == nextProps.id;
            let chs = [];
            for (let k in nextProps) {
                let changed = (nextProps[k] != prevProps[k]);
                if (k == 'dragging' && !isDraggingMe) {
                  changed = false; //dragging another item -> ignore
                }
                if (changed) {
                  chs.push(k);
                }
            }
            if (!chs.length)
                should = false;
          }
        }
        return should;
    }

    onPropsChanged(nextProps) {
      const {config, id, conjunction} = nextProps;
      const oldConfig = this.props.config;
      const oldConjunction = this.props.conjunction;
      if (oldConfig != config || oldConjunction != conjunction) {
        this.conjunctionOptions = this._getConjunctionOptions(nextProps);
      }
    }

    _getConjunctionOptions (props) {
      return mapValues(props.config.conjunctions, (item, index) => ({
        id: `conjunction-${props.id}-${index}`,
        name: `conjunction[${props.id}]`,
        key: index,
        label: item.label,
        checked: index === props.conjunction,
      }));
    }

    setConjunction = (e = null, conj = null) => {
      if (!conj && e) {
        //for RadioGroup
        conj = e.target.value;
      }

      this.props.actions.setConjunction(this.props.path, conj);
    }

    setNot = (e = null, not = null) => {
      this.props.actions.setNot(this.props.path, not);
    }

    dummyFn = () => {}

    removeSelf = () => {
      this.props.actions.removeGroup(this.props.path);
    }

    addGroup = () => {
      this.props.actions.addGroup(this.props.path);
    }

    addRule = () => {
      this.props.actions.addRule(this.props.path);
    }

    render() {
      const isDraggingMe = this.props.dragging.id == this.props.id;
      const currentNesting = this.props.path.size;
      const maxNesting = this.props.config.settings.maxNesting;

      // Don't allow nesting further than the maximum configured depth and don't
      // allow removal of the root group.
      const allowFurtherNesting = typeof maxNesting === 'undefined' || currentNesting < maxNesting;
      const isRoot = currentNesting == 1;

      return (
        <div
          className={'group-or-rule-container group-container'}
          data-id={this.props.id}
        >
        {[
          isDraggingMe ? <Group
            key={"dragging"}
            id={this.props.id}
            isDraggingMe={isDraggingMe}
            isDraggingTempo={true}
            dragging={this.props.dragging}
            isRoot={isRoot}
            allowFurtherNesting={allowFurtherNesting}
            conjunctionOptions={this.conjunctionOptions}
            not={this.props.not}
            selectedConjunction={this.props.conjunction}
            setConjunction={this.dummyFn}
            setNot={this.dummyFn}
            removeSelf={this.dummyFn}
            addGroup={this.dummyFn}
            addRule={this.dummyFn}
            config={this.props.config}
            children1={this.props.children1}
            actions={this.props.actions}
            //tree={this.props.tree}
            treeNodesCnt={this.props.treeNodesCnt}
          /> : null
        ,
          <Group
            key={this.props.id}
            id={this.props.id}
            isDraggingMe={isDraggingMe}
            onDragStart={this.props.onDragStart}
            isRoot={isRoot}
            allowFurtherNesting={allowFurtherNesting}
            conjunctionOptions={this.conjunctionOptions}
            not={this.props.not}
            selectedConjunction={this.props.conjunction}
            setConjunction={this.setConjunction}
            setNot={this.setNot}
            removeSelf={this.removeSelf}
            addGroup={this.addGroup}
            addRule={this.addRule}
            config={this.props.config}
            children1={this.props.children1}
            actions={this.props.actions}
            //tree={this.props.tree}
            treeNodesCnt={this.props.treeNodesCnt}
          />
        ]}
        </div>
      );
    }

  };

  const ConnectedGroupContainer = connect(
      (state) => {
          return {
            dragging: state.dragging,
          }
      }
  )(GroupContainer);
  ConnectedGroupContainer.displayName = "ConnectedGroupContainer";

  return ConnectedGroupContainer;
};
