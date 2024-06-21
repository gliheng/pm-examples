import { undo, redo, history } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { EditorState, Transaction } from "prosemirror-state";
import { baseKeymap, toggleMark } from "prosemirror-commands";
import { EditorView } from "prosemirror-view";
import { schema } from 'prosemirror-schema-basic';
import { Schema, NodeSpec, MarkType } from "prosemirror-model";
import { MenuItem, menuBar, wrapItem } from "prosemirror-menu";
import menuStyle from "prosemirror-menu/style/menu.css?raw";
import { text } from "../lorem";
import { html, render } from "lit";

const mySchema = new Schema({
  nodes: schema.spec.nodes,
  marks: schema.spec.marks.addToEnd('colorful', {
    attrs: {
      fg: {
        default: '#000000'
      },
      bg: {
        default: '#ffffff'
      },
    },
    parseDOM: [{tag: 'span', getAttrs(node: HTMLElement) {
      const { color, backgroundColor } = node.style;
      const attrs = {};
      if (color) attrs.fg = color;
      if (backgroundColor) attrs.bg = backgroundColor;
      return attrs;
    }}],
    toDOM(node) {
      console.log('node?',node.attrs);
      let style = [];
      const { fg, bg } = node.attrs;
      if (fg) {
        style.push(`color: ${fg}`);
      }
      if (bg) {
        style.push(`background-color: ${bg}`);
      }
      
      return ['span', { style: style.join(';')}, 0];
    },
  }),
});

function setup(el: HTMLElement) {
  let state = EditorState.create({
    doc: mySchema.node(
      mySchema.nodes.doc, null,
      [
        mySchema.node(
          mySchema.nodes.paragraph, null,
          mySchema.text(text),
        ),
      ],
    ),
    schema: mySchema,
    plugins: [
      history(),
      keymap({"Mod-z": undo, "Mod-y": redo}),
      keymap(baseKeymap),
      menuBar({
        content: [
          [
            new MenuItem({
              label: `colorful`,
              render(view) {
                function setMarkAttr(attr, value) {
                  const { state, dispatch } = view;
                  toggleMark(mySchema.marks.colorful, {
                    [attr]: value,
                  })(state, dispatch);
                }

                let div = document.createElement('div');
                render(html`
                  <label>
                    fg:
                    <input type="color" @change=${(evt: Event) => {
                      setMarkAttr('fg', evt.target.value);
                    }}
                  </label>
                  <label>
                    bg:
                    <input type="color" @change=${(evt: Event) => {
                      setMarkAttr('bg', evt.target.value);
                    }}
                  </label>
                `, div);
                return div;
              },
              run: (state: EditorState, dispatch: (tr: Transaction) => void) => {
                return false;
              },
              active(state) {
                const { from, to, ranges } = state.selection;
                state.doc.nodesBetween(from, to, (node) => {
                  return !node.marks.some(mark => mark.type == mySchema.marks.colorful);
                });
                const active = ranges.some(range => state.doc.rangeHasMark(range.$from.pos, range.$to.pos, mySchema.marks.colorful));
                // this.ipt.value = color;
                return active;
              },
            }),
          ],
        ],
      }),
    ]
  });

  let view = new EditorView(el, {state});
  return view;
}

export default {
  setup,
  style: `
    ${menuStyle}
  `,
  title: 'Schema with custom marks',
  desc: 'Use parseDOM and toDOM with mark',
}