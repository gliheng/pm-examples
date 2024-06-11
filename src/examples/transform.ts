import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { schema as baseSchema } from 'prosemirror-schema-basic'
import { addListNodes, sinkListItem } from 'prosemirror-schema-list';
import { exampleSetup } from 'prosemirror-example-setup';
import emStyle from "prosemirror-example-setup/style/style.css?raw";
import menuStyle from "prosemirror-menu/style/menu.css?raw";
import { Schema } from "prosemirror-model";
import { MenuItem } from "prosemirror-menu";
import { liftTarget } from 'prosemirror-transform';


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
              title: "Join with previous paragraph",
              label: "Join",
              run: (state: EditorState, dispatch) => {
                const tr = state.tr;
                const range = state.selection.$from.blockRange();
                if (range) {
                  dispatch(tr.join(range.start));
                  return true;
                }
              },
            }),
          ],
          [
            new MenuItem({
              title: "Wrap in a list",
              label: "Wrap",
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
            new MenuItem({
              title: "Lift to parent list",
              label: "Lift",
              run: (state: EditorState, dispatch) => {
                const tr = state.tr;
                const range = state.selection.$from.blockRange();
                if (range) {
                  const tar = liftTarget(range);
                  if (typeof tar == 'number') {
                    dispatch(tr.lift(range, tar));
                    return true;
                  }
                }
              },
            }),
            new MenuItem({
              title: "Sink list item",
              label: "Sink",
              run: (state, dispatch) => sinkListItem(schema.nodes.list_item)(state, dispatch),
              // run: (state: EditorState, dispatch) => {
              //   const tr = state.tr;
              //   const range = state.selection.$from.blockRange();
              //   if (range) {
              //     const tar = liftTarget(range);
              //     if (typeof tar == 'number') {
              //       dispatch(tr.lift(range, tar));
              //       return true;
              //     }
              //   }
              // },
            }),
            new MenuItem({
              title: "Split list",
              label: "Split",
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
  desc: 'Use state.tr to transform document',
}
