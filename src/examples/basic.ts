import { undo, redo, history } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { EditorState } from "prosemirror-state";
import { baseKeymap, setBlockType } from "prosemirror-commands";
import { EditorView } from "prosemirror-view";
import { schema } from 'prosemirror-schema-basic';

function setup(el: HTMLElement) {
  let state = EditorState.create({
    schema,
    plugins: [
      history(),
      keymap({"Mod-z": undo, "Mod-y": redo}),
      keymap(baseKeymap),
      keymap({
        'Mod-x': setBlockType(schema.nodes.heading, { level: 1 }),
      }),
    ]
  });

  let view = new EditorView(el, {
    state,
    dispatchTransaction(tr) {
      console.log('tr', tr);
      let newState = view.state.apply(tr);
      view.updateState(newState);
    },
  });
  return view;
}

export default {
  setup,
  title: 'Basic example',
  desc: 'A simple text editor',
}