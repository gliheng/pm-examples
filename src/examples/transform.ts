import { wrapIn } from 'prosemirror-commands';
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { schema as baseSchema } from 'prosemirror-schema-basic'
import { addListNodes, listItem } from 'prosemirror-schema-list';
import { exampleSetup } from 'prosemirror-example-setup';
import emStyle from "prosemirror-example-setup/style/style.css?raw";
import menuStyle from "prosemirror-menu/style/menu.css?raw";
import { Schema } from "prosemirror-model";
import { MenuItem } from "prosemirror-menu";


const schema = new Schema({
  nodes: addListNodes(baseSchema.spec.nodes, 'paragraph block*', 'block'),
  marks: baseSchema.spec.marks,
});

function setup(el: HTMLElement) {
  let state = EditorState.create({
    schema,
    plugins: [
      ...exampleSetup({
        schema,
        menuContent: [
          [
            new MenuItem({
              title: "Set heading",
              label: "Set heading",
              run: (state: EditorState, dispatch) => {
                const tr = state.tr;
                const range = state.selection.$from.blockRange();
                if (range) {
                  tr.setBlockType(range.start, range.end, schema.nodes.heading, { level: 1 });
                  dispatch(tr);
                  return true;
                }
              },
            }),
            new MenuItem({
              title: "Set heading level",
              label: "Set heading level",
              run: (state: EditorState, dispatch) => {
                const tr = state.tr;
                const range = state.selection.$from.blockRange();
                const ans = prompt('Give a heading level');
                if (range && ans) {
                  const n = parseInt(ans);
                  if (!isNaN(n)) {
                    tr.setNodeAttribute(range.start, 'level', n);
                    dispatch(tr);
                    return true;
                  }
                }
                return false;
              },
            }),
          ],
          [
            new MenuItem({
              title: "Wrap list",
              label: "Wrap list",
              run: (state: EditorState, dispatch) => {
                const tr = state.tr;
                const range = state.selection.$from.blockRange();
                if (range) {
                  tr.wrap(range, [
                    {
                      type: schema.nodes.bullet_list,
                    },
                    {
                      type: schema.nodes.list_item,
                    }
                  ]);
                  dispatch(tr);
                  return true;
                }
              },
            }),
          ],
          [
            new MenuItem({
              title: "Split list",
              label: "Split list",
              run: (state: EditorState, dispatch) => {
                const tr = state.tr;
                dispatch(tr.split(state.selection.$from.pos, 2).scrollIntoView());
                return true;
              },
            }),
          ]
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
    ${emStyle}
    ${menuStyle}
  `,
  title: 'Transform example',
  desc: 'Use state.tr for transform',
}
