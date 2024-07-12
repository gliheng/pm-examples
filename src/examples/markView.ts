import { LitElement, html, css, render } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { schema } from 'prosemirror-schema-basic'
import { MenuItem, menuBar } from 'prosemirror-menu';
import { Mark, MarkSpec, Node, Schema } from "prosemirror-model";
import emStyle from "prosemirror-example-setup/style/style.css?raw";
import menuStyle from "prosemirror-menu/style/menu.css?raw";
import { baseKeymap, toggleMark } from 'prosemirror-commands';
import { history, redo, undo } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';

class LoveView {
  dom: HTMLElement;
  contentDOM: HTMLElement;

  constructor(mark: Mark, private view: EditorView, private inline: boolean) {
    const el = document.createElement("span")
    el.classList.add('love');
    this.dom = el;
    this.render(mark);
    this.contentDOM = el.querySelector('.content')!;
  }

  toggleBroken() {
    console.log('Hi');
  }

  render(mark: Mark) {
    const { broken } = mark.attrs;
    render(html`
      <span class="content"></span>
      <span @click=${this.toggleBroken}>${broken ? '💔' : '❤️'}</span>
    `, this.dom);
  }

  update(mark: Mark) {
    this.render(mark);
    return true;
  }
}

function setup(el: HTMLElement) {
  const loveSpec: MarkSpec = {
    attrs: {
      broken: { default: false },
    },
  }
  
  const mySchema = new Schema({
    nodes: schema.spec.nodes,
    marks: schema.spec.marks.addToEnd('love', loveSpec),
  })
  
  const loveType = mySchema.marks.love;

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
              title: "Apply love mark",
              label: "Apply love mark",
              run: toggleMark(loveType),
            }),
          ],
        ]
      }),
    ],
  });

  let view = new EditorView(el, {
    state,
    markViews: {
      love(mark, view, inline) {
        return new LoveView(mark, view, inline);
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
    .love {
      white-space: normal;
      color: red;
    }
    
    .love .content {
      background: -webkit-linear-gradient(red, pink);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  `,
  title: 'Mark view example',
  desc: 'Use markView to listen to events to custom nodes',
}
