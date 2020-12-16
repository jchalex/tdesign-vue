import Vue from 'vue';
import TButton from '../../button';
import IconChevronLeft from '../../icon/chevron-right';
import IconChevronRight from '../../icon/chevron-left';
import { prefix } from '../../config';

const name = `${prefix}-transfer-operations`;
export default Vue.extend({
  name,
  props: {
    // 控制左按钮的禁用与否
    leftDisabled: {
      type: Boolean,
      required: true,
    },
    // 控制右按钮的禁用与否
    rightDisabled: {
      type: Boolean,
      required: true,
    },
    operations: [String, Array, Function],
  },
  methods: {
    moveToRight() {
      this.$emit('moveToRight');
    },
    moveToLeft() {
      this.$emit('moveToLeft');
    },
    getIconRight() {
      return <IconChevronRight />;
    },
    getIconLeft() {
      return <IconChevronLeft />;
    },
    // getIcon(order: string) {
    //   let iconName;
    //   if (!this.operations || !this.operations.length) {
    //     iconName = order === 'up' ? 'chevron-right' : 'chevron-left';
    //   } else {
    //     iconName = null;
    //   }
    //   return iconName;
    // },
    buttonContent(order: string) {
      let renderButtonContent;
      // 处理传进来的operations是数组，函数，字符型类型以及不传
      if (this.operations instanceof Array && this.operations.length) {
        const buttonOrder = order === 'up' ? 0 : 1;
        if (typeof this.operations[buttonOrder] === 'function') {
          const operationFunc = this.operations[buttonOrder] as Function;
          renderButtonContent = operationFunc();
        } else if (typeof this.operations[buttonOrder] === 'string') {
          renderButtonContent = this.operations[buttonOrder];
        }
      } else if (typeof this.operations === 'function') {
        renderButtonContent = this.operations();
      } else if (typeof this.operations === 'string') {
        renderButtonContent = this.operations;
      } else {
        renderButtonContent = null;
      }

      return renderButtonContent;
    },
  },
  render() {
    const { leftDisabled, rightDisabled } = this.$props;
    return (
      <div class={name}>
        <TButton
          theme={leftDisabled ? 'line' : 'primary'}
          disabled={leftDisabled}
          onClick={this.moveToRight}
          icon={this.getIconLeft}
        >
          {this.buttonContent('up')}
        </TButton>
        <TButton
          theme={rightDisabled ? 'line' : 'primary'}
          disabled={rightDisabled}
          onClick={this.moveToLeft}
          icon={this.getIconRight}
        >
          {this.buttonContent('down')}
        </TButton>
      </div>
    );
  },
});