import Vue from 'vue';
import { defineComponent, computed, inject, ref, provide, onMounted } from '@vue/composition-api';
import { prefix } from '../config';
import props from '../../types/submenu/props';
import { renderContent, renderTNodeJSX } from '../utils/render-tnode';
import TIconChevronDown from '../icon/chevron-down';
import Ripple from '../utils/ripple';
import { TdMenuInterface, TdSubMenuInterface, TdMenuItem } from './const';

const name = `${prefix}-submenu`;
export default defineComponent({
  name,
  components: {
    TIconChevronDown,
  },
  directives: {
    ripple: Ripple,
  },
  props,
  setup(props, ctx) {
    const { theme, activeIndexValue, expandedArray, mode, isHead, selectSubMenu, open } = inject<TdMenuInterface>('TdMenu');
    const menuItems = ref([]); // 因composition-api的缺陷，不用reactive， 详见：https://github.com/vuejs/composition-api/issues/637
    const isActive = computed(() => {
      const childIsActive = menuItems.value.some(i => i.value === activeIndexValue.value);
      return activeIndexValue.value === props.value || childIsActive;
    });
    const popupVisible = ref(false);
    const rippleColor = computed(() => theme.value === 'light' ? '#E7E7E7' : '#383838');
    const isOpen = computed(() => {
      if (mode.value === 'popup') {
        return popupVisible.value;
      }
      return expandedArray ? expandedArray.value.includes(props.value) : false;
    });
    const classes = computed(() => [
      `${prefix}-submenu`,
      {
        [`${prefix}-is-disabled`]: props.disabled,
        // [`${prefix}-is-active`]: isOpen.value,
        [`${prefix}-is-opened`]: isOpen.value,
      },
    ]);
    const popupClass = computed(() => [
      `${prefix}-menu__popup`,
      {
        [`${prefix}-is-opened`]: popupVisible.value,
        [`${prefix}-is-vertical`]: !isHead,
      },
    ]);
    const submenuClass = computed(() => [
      `${prefix}-menu__item`,
      {
        [`${prefix}-is-opened`]: isOpen.value,
        [`${prefix}-is-active`]: isActive.value,
      },
    ]);
    const subClass = computed(() => [
      `${prefix}-menu__sub`,
      {
        [`${prefix}-is-opened`]: isOpen.value,
      },
    ]);
    const arrowClass = computed(() => [
      `${prefix}-fake-arrow`,
      {
        [`${prefix}-fake-arrow--active`]: isOpen.value,
      },
    ]);

    // methods
    const handleMouseEnter = () => {
      if (!popupVisible.value) {
        open(props.value);
      }
      popupVisible.value = true;
    };
    const handleMouseLeave = () => {
      popupVisible.value = false;
    };
    const handleHeadmenuItemClick = () => {
      const isOpen = open(props.value);
      selectSubMenu(isOpen ? menuItems.value : []);
    };
    const handleSubmenuItemClick = () => {
      open(props.value);
    };

    // provide
    provide<TdSubMenuInterface>('TdSubmenu', {
      hasIcon: !!ctx.slots.icon,
      addMenuItem: (item: TdMenuItem) => {
        menuItems.value.push(item);
      },
    });

    onMounted(() => {
      if (isOpen.value) {
        if (selectSubMenu) {
          selectSubMenu(menuItems.value);
        }
      }

      // adjust popup height
      if (ctx.refs.popup) {
        const rect = (ctx.refs.popupInner as HTMLElement).getBoundingClientRect();
        const $popup = ctx.refs.popup;

        ($popup as HTMLElement).style.setProperty('--popup-max-height', `${rect.height}px`);
        ($popup as HTMLElement).style.setProperty('--popup-width', `${rect.width}px`);
      }
    });

    return {
      menuItems,
      mode,
      isHead,
      classes,
      subClass,
      arrowClass,
      popupClass,
      submenuClass,
      rippleColor,
      handleMouseEnter,
      handleMouseLeave,
      handleSubmenuItemClick,
      handleHeadmenuItemClick,
    };
  },
  methods: {
    renderHeadSubmenu() {
      const normalSubmenu = [
        <div v-ripple={this.rippleColor} class={this.submenuClass} onClick={this.handleHeadmenuItemClick}>
          {renderTNodeJSX(this as Vue, 'title')}
        </div>,
        <ul style="opacity: 0; width: 0; height: 0; overflow: hidden">
        {renderContent(this as Vue, 'default', 'content')}
        </ul>,
      ];
      const popupSubmenu = [
        <div class={this.submenuClass}>
          {renderTNodeJSX(this as Vue, 'title')}
          <svg class={this.arrowClass} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.75 5.7998L7.99274 10.0425L12.2361 5.79921" stroke="black" stroke-opacity="0.9" stroke-width="1.3"/>
          </svg>
        </div>,
        <div ref="popup" class={this.popupClass}>
          <ul ref="popupInner" class={`${prefix}-menu__popup-wrapper`}>
            {renderContent(this as Vue, 'default', 'content')}
          </ul>
        </div>,
      ];
      return this.mode === 'normal' ? normalSubmenu : popupSubmenu;
    },
    renderSubmenu() {
      const hasContent = this.$slots.content || this.$slots.default;
      const icon = renderTNodeJSX(this, 'icon');
      const svgArrow = (
        <svg class={this.arrowClass} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.75 5.7998L7.99274 10.0425L12.2361 5.79921" stroke="black" stroke-opacity="0.9" stroke-width="1.3"/>
        </svg>);
      const normalSubmenu = [
        <div v-ripple={this.rippleColor} class={this.submenuClass} onClick={this.handleSubmenuItemClick}>
          {icon}
          <span class={[`${prefix}-menu__content`]}>{renderTNodeJSX(this, 'title')}</span>
          {hasContent && svgArrow}
        </div>,
        <ul class={this.subClass} >
          {renderContent(this, 'default', 'content')}
        </ul>,
      ];
      const popupSubmenu = [
        <div class={this.submenuClass}>
          {icon}
          <span class={[`${prefix}-menu__content`]}>{renderTNodeJSX(this, 'title')}</span>
          {svgArrow}
        </div>,
        <div ref="popup" class={this.popupClass}>
          <ul ref="popupInner" class={`${prefix}-menu__popup-wrapper`}>
            {renderContent(this, 'default', 'content')}
          </ul>
        </div>,
      ];

      return this.mode === 'normal' ? normalSubmenu : popupSubmenu;
    },
  },
  render() {
    let child = null;
    let events = {};

    if (this.mode === 'popup') {
      events = {
        mouseenter: this.handleMouseEnter,
        mouseleave: this.handleMouseLeave,
      };
    }
    if (Object.keys(this.$slots).length > 0) {
      child = this.isHead ? this.renderHeadSubmenu() : this.renderSubmenu();
    }
    return (
      <li class={this.classes} { ...{ on: events } }>
        {child}
      </li>
    );
  },
});

