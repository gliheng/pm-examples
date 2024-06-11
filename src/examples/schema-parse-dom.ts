import { undo, redo, history } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { EditorState, Transaction } from "prosemirror-state";
import { baseKeymap } from "prosemirror-commands";
import { EditorView } from "prosemirror-view";
import { nodes, marks } from 'prosemirror-schema-basic';
import { Schema, NodeSpec } from "prosemirror-model";
import { MenuItem, menuBar, wrapItem } from "prosemirror-menu";
import menuStyle from "prosemirror-menu/style/menu.css?raw";

const mySchema = new Schema({
  nodes: {
    ...nodes,
    note: {
      group: 'block',
      content: 'inline+',

      attrs: {
        type: {
          default: 'text',
        },
      },
      toDOM(node) {
        return ['div', { class: 'note', 'data-type': node.attrs.type }, 0];
      },
      parseDOM: [{tag: 'div.note', getAttrs(node) {
        return { type: node.dataset.type };
      }}]
    } as NodeSpec,
    fancyNote: {
      group: 'block',
      content: 'inline+',

      attrs: {
        type: {
          default: 'text',
        },
      },
      toDOM(node) {
        return ['div', { class: 'note', 'data-type': node.attrs.type, 'data-fancy': true }, 0];
      },
      parseDOM: [{tag: 'div.note', getAttrs(node) {
        if (!node.hasAttribute('data-fancy')) return false;
        return { type: node.dataset.type };
      }}]
    } as NodeSpec,
  },
  marks,
});

function setup(el: HTMLElement) {
  let state = EditorState.create({
    doc: mySchema.node(
      mySchema.nodes.doc, null,
      [
        mySchema.node(
          mySchema.nodes.note, null,
          mySchema.text('hello'),
        ),
        mySchema.node(
          mySchema.nodes.fancyNote, null,
          mySchema.text('hello'),
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
              label: 'Set note',
              run: (state: EditorState, dispatch: (tr: Transaction) => void) => {
                const { from, to } = state.selection;
                dispatch(state.tr.setBlockType(from, to, mySchema.nodes.note));
              },
            }),
            new MenuItem({
              label: 'Set fancy note',
              run: (state: EditorState, dispatch: (tr: Transaction) => void) => {
                const { from, to } = state.selection;
                dispatch(state.tr.setBlockType(from, to, mySchema.nodes.fancyNote));
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
    div.note {
      background: orange;
    }
    div.note[data-fancy] {
      background: purple;
      color: white;
    }
  `,
  title: 'Custom Schema with parseDOM',
  desc: 'Use parseDOM and toDOM to customize dom',
}