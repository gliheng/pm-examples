import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { schema } from 'prosemirror-schema-basic'
import { MenuItem, menuBar } from 'prosemirror-menu';
import { NodeSpec, NodeType, Schema } from "prosemirror-model";
import emStyle from "prosemirror-example-setup/style/style.css?raw";
import menuStyle from "prosemirror-menu/style/menu.css?raw";
import { baseKeymap, setBlockType } from 'prosemirror-commands';
import { history, redo, undo } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';

class NoticeView {
  constructor(node, view, getPos) {
    const el = document.createElement("pm-notice")
    el.pm = {
      node, view, getPos,
    };
    this.dom = this.contentDOM = el;
  }
}

@customElement('pm-notice')
class Notice extends LitElement {
  @property({ attribute: false })
  pm!: {
    node: NodeType;
    view: EditorView;
    getPos: any;
  }

  @property()
  label = ''

  askLabel() {
    const label = prompt('Give a label for the notice!');
    const { view } = this.pm;
    const { state } = view;
    if (label) {
      view.dispatch(state.tr.setNodeAttribute(this.pm.getPos(), 'label', label));
    }
  }

  render() {
    const { label } = this.pm.node.attrs;
    return html`
      <div class="notice">
        <h1 @click=${this.askLabel}>${label}</h1>
        <p><slot></slot></p>
      </div>
    `;
  }

  static styles = css`
    :host {
      white-space: initial;
      display: block;
    }
    .notice {
      display: flex;
      align-items: center;
      margin: 1em 0;
    }
    .notice > h1 {
      background: gray;
      color: white;
      font-size: 16px;
      margin: 0;
      margin-right: 4px;
    }
    .notice > p {
      margin: 0;
    }
  `;
}

function setup(el: HTMLElement) {
  const noticeSpec: NodeSpec = {
    attrs: {
      label: { default: 'Notice' },
    },
    content: 'text*',
    group: 'block',
    // toDOM: (node) => ['pm-notice', { label: node.attrs.label }, 0],
    // parseDOM: [{tag: 'pm-notice', getAttrs(dom) {
    //   let label = dom.getAttribute('label');
    //   return label ? { label } : false;
    // }}],
  }
  
  const mySchema = new Schema({
    nodes: schema.spec.nodes.addToEnd('notice', noticeSpec),
    marks: schema.spec.marks,
  })
  
  const noticeType = mySchema.nodes.notice;

  let state = EditorState.create({
    schema: mySchema,
    plugins: [
      history(),
      keymap({"Mod-z": undo, "Mod-y": redo}),
      keymap(baseKeymap),
      menuBar({
        content: [
          [
            new MenuItem({
              title: "Insert notice",
              label: "Insert notice",
              run: setBlockType(noticeType),
            }),
          ],
        ]
      }),
    ],
  });

  let view = new EditorView(el, {
    state,
    nodeViews: {
      notice(node, view, getPos) {
        return new NoticeView(node, view, getPos);
      },
    },
  });
  return view;
}

export default {
  setup,
  style: `
    ${emStyle}
    ${menuStyle}
  `,
  title: 'Node view example',
  desc: 'Use nodeView to listen to events to custom nodes',
}
