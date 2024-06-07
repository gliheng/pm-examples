import { undo, redo, history } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { EditorState } from "prosemirror-state";
import { baseKeymap } from "prosemirror-commands";
import { EditorView } from "prosemirror-view";
import { schema } from 'prosemirror-schema-basic';

function setup(el: HTMLElement) {
  let state = EditorState.create({
    schema,
    plugins: [
      history(),
      keymap({"Mod-z": undo, "Mod-y": redo}),
      keymap(baseKeymap),
    ]
  });

  let view = new EditorView(el, {
    state,
    dispatchTransaction(tr) {
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