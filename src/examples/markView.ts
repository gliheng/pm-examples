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

class NoticeView {
  dom: HTMLElement;
  contentDOM: HTMLElement;

  constructor(private mark: Mark, private view: EditorView, private inline: boolean) {
    const el = document.createElement("span")
    el.classList.add('notice');
    this.dom = el;
    this.render(mark);
    this.contentDOM = el.querySelector('.content')!;
  }

  render(mark: Mark) {
    render(html`
      <span>👉</span><span class="content"></span><span>👈</span>
    `, this.dom);
  }

  update(mark: Mark) {
    this.mark = mark;
    this.render(mark);
    return true;
  }
}

function setup(el: HTMLElement) {
  const noticeSpec: MarkSpec = {
    attrs: {},
  }
  
  const mySchema = new Schema({
    nodes: schema.spec.nodes,
    marks: schema.spec.marks.addToEnd('notice', noticeSpec),
  })
  
  const noticeType = mySchema.marks.notice;

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
              title: "Apply notice mark",
              label: "Apply notice mark",
              run: toggleMark(noticeType),
            }),
          ],
        ]
      }),
    ],
  });

  let view = new EditorView(el, {
    state,
    markViews: {
      notice(mark, view, inline) {
        return new NoticeView(mark, view, inline);
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
    .notice {
      white-space: normal;
      color: red;
    }
    
    .notice .content {
      background: -webkit-linear-gradient(red, pink);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  `,
  title: 'Mark view example',
  desc: 'Use markView to customize mark style. Note that these cannot provide the kind of dynamic behavior that node views can—they just provide custom rendering logic',
}
