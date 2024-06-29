import { EditorState, Selection } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { schema as baseSchema } from 'prosemirror-schema-basic'
import { exampleSetup } from 'prosemirror-example-setup';
import { Schema } from "prosemirror-model";
import { MenuItem } from "prosemirror-menu";
import { keymap } from "prosemirror-keymap";
import emStyle from "prosemirror-example-setup/style/style.css?raw";
import menuStyle from "prosemirror-menu/style/menu.css?raw";

const schema = new Schema({
  nodes: baseSchema.spec.nodes.append({
    accordion: {
      group: 'block',
      content: 'accordionTitle accordionBody',
      attrs: {
        open: {
          default: false,
        },
      },
      toDOM(node) {
        return ['details', { open: node.attrs.open ? '' : undefined }, 0];
      },
      parseDOM: [{ tag: 'details' }],
    },
    accordionTitle: {
      group: 'block',
      content: 'inline*',
      toDOM(node) {
        return ['summary', 0];
      },
      parseDOM: [{ tag: 'summary' }],
    },
    accordionBody: {
      group: 'block',
      content: 'inline*',
      toDOM(node) {
        return ['p', 0];
      },
      parseDOM: [{ tag: 'p' }],
    },
  }),
  marks: baseSchema.spec.marks,
});

function setup(el: HTMLElement) {
  let state = EditorState.create({
    schema,
    plugins: [
      keymap({
        'Enter': (state, dispatch) => {
          const { $from } = state.selection;
          const parent = $from.node(1);
          if (parent.type == schema.nodes.accordion) {
            if (dispatch) {
              const { tr } = state;
              tr.setNodeAttribute($from.before(1), 'open', !parent.attrs.open);
              tr.scrollIntoView();
              dispatch(tr);
              return true;
            }
          }
          
          return false;
        },
        'Ctrl-Enter': (state, dispatch) => {
          const { $from } = state.selection;
          const parent = $from.node(1);
          if (parent.type == schema.nodes.accordion) {
            if (dispatch) {
              const { tr } = state;
              const pos = $from.after(1);
              const node = schema.nodes.paragraph.createAndFill()!;
              tr.insert(pos, node);
              tr.setSelection(Selection.near(tr.doc.resolve(pos)));
              tr.scrollIntoView();
              dispatch(tr);
              return true;
            }
          }
          return true;
        },
      }),
      ...exampleSetup({
        schema,
        menuContent: [
          [
            new MenuItem({
              title: "Insert accordion",
              label: "Insert accordion",
              run: (state, dispatch) => {
                if (dispatch) {
                  const tr = state.tr;
                  const range = tr.selection.$from.blockRange();
                  // if (state.selection.empty) {
                  //   dispatch(tr.setBlockType(range!.start, range!.end, schema.nodes.accordion));
                  // } else {
                  console.log('insert at', range?.end);
                    const node = schema.nodes.accordion.createAndFill();
                    dispatch(tr.insert(range!.end, node!));
                  // }
                }
                return true;
              },
            }),
          ],
        ],
      }),
    ]
  });

  let view = new EditorView(el, {
    state,
  });
  return view;
}

export default {
  setup,
  style: `
    ${emStyle}
    ${menuStyle}
    details {
      background: silver;
      border-radius: 8px;
      overflow: hidden;
    }
    summary {
      padding-left: 10px;
      padding-right: 10px;
      background: #666;
      color: white;
    }
    details > p {
      padding-left: 8px;
      padding-right: 8px;
    }
  `,
  title: 'Accordion example',
  desc: 'Add accordion with subview',
}
