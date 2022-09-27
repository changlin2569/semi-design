import React, {createRef, PureComponent, ReactNode} from 'react';
import PropTypes from 'prop-types';
import cls from 'classnames';
import {cssClasses} from '@douyinfe/semi-foundation/tabs/constants';
import getDataAttr from '@douyinfe/semi-foundation/utils/getDataAttr';
import TabsContext from './tabs-context';
import {TabContextValue} from './interface';
import {PlainTab, TabPaneProps} from './interface';
import CSSAnimation from "../_cssAnimation";

class TabPane extends PureComponent<TabPaneProps> {
    static isTabPane = true;
    static contextType = TabsContext;

    static propTypes = {
        className: PropTypes.string,
        style: PropTypes.object,
        children: PropTypes.node,
        disabled: PropTypes.bool,
        itemKey: PropTypes.string,
        tab: PropTypes.node,
        icon: PropTypes.node,
        closable: PropTypes.bool
    };

    lastActiveKey: string = null;

    ref = createRef<HTMLDivElement>();
    _active: boolean;
    context: TabContextValue;
    firstRender: boolean = true;

    componentDidMount(): void {
        this.lastActiveKey = this.context.activeKey;
    }

    // get direction from current item key to activeKey
    getDirection = (activeKey: string, itemKey: string, panes: Array<PlainTab>): boolean => {
        if (itemKey !== null && activeKey !== null && Array.isArray(panes) && panes.length) {
            const activeIndex = panes.findIndex(pane => pane.itemKey === activeKey);
            const itemIndex = panes.findIndex(pane => pane.itemKey === itemKey);
            const lastActiveIndex = panes.findIndex(pane => pane.itemKey === this.lastActiveKey);

            this.lastActiveKey = activeKey;

            if (activeIndex === itemIndex) {
                return lastActiveIndex > activeIndex;
            } else {
                return itemIndex < activeIndex;
            }
        }

        return false;
    };


    shouldRender = (): boolean => {
        const {itemKey} = this.props;
        const {activeKey, lazyRender} = this.context;
        const active = activeKey === itemKey;
        this._active = this._active || active;
        return lazyRender ? this._active : true;
    };

    render(): ReactNode {
        const {tabPaneMotion: motion, tabPosition,isFirstRender} = this.context;
        const {className, style, children, itemKey, ...restProps} = this.props;
        const active = this.context.activeKey === itemKey;
        const classNames = cls(className, {
            [cssClasses.TABS_PANE_INACTIVE]: !active,
            [cssClasses.TABS_PANE_ACTIVE]: active,
            [cssClasses.TABS_PANE]: true,
        });
        const shouldRender = this.shouldRender();
        return (
            <div
                ref={this.ref}
                role="tabpanel"
                id={`semiTabPanel${itemKey}`}
                aria-labelledby={`semiTab${itemKey}`}
                className={classNames}
                style={style}
                aria-hidden={active ? 'false' : 'true'}
                tabIndex={0}
                {...getDataAttr(restProps)}
                x-semi-prop="children"
            >

                <CSSAnimation motion={motion && active && !isFirstRender} animationState={active ? "enter" : "leave"}
                              startClassName={(() => {
                                  const direction = this.getDirection(this.context.activeKey, itemKey, this.context.panes);
                                  if (tabPosition === 'top') {
                                      if (direction) {
                                          return cssClasses.TABS_PANE_ANIMATE_RIGHT_SHOW
                                      } else {
                                          return cssClasses.TABS_PANE_ANIMATE_LEFT_SHOW
                                      }
                                  } else {
                                      if (direction) {
                                          return cssClasses.TABS_PANE_ANIMATE_BOTTOM_SHOW
                                      } else {
                                          return cssClasses.TABS_PANE_ANIMATE_TOP_SHOW
                                      }
                                  }
                              })()}>
                    {
                        ({animationClassName, animationEventsNeedBind}) => {
                            return <div
                                className={`${cssClasses.TABS_PANE_MOTION_OVERLAY} ${animationClassName}`}
                                x-semi-prop="children"
                                {...animationEventsNeedBind}
                            >
                                {shouldRender ? children : null}
                            </div>
                        }
                    }
                </CSSAnimation>
            </div>
        );
    }
}

export default TabPane;
