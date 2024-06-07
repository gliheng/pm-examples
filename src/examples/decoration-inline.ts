import {undo, redo, history} from "prosemirror-history";
import {keymap} from "prosemirror-keymap";
import { EditorState, Plugin } from "prosemirror-state";
import {baseKeymap} from "prosemirror-commands";
import { Decoration, DecorationSet, EditorView } from "prosemirror-view";
import { schema } from 'prosemirror-schema-basic'


const plugin = new Plugin({
  props: {
    decorations(state) {
      if (state.selection.empty) {
        return DecorationSet.empty;
      }
      const { from , to } = state.selection
      const decoration = Decoration.inline(from, to, {
        style: 'color: red'
      });
      return DecorationSet.create(state.doc, [decoration]);
    }
  }
})

function setup(el: HTMLElement) {
  let state = EditorState.create({
    schema,
    plugins: [
      history(),
      keymap({"Mod-z": undo, "Mod-y": redo}),
      keymap(baseKeymap),
      plugin,
    ]
  });
  let view = new EditorView(el, {state});
  return view;
}

export default {
  setup,
  title: 'Inline decoration',
  desc: 'Use inline decoration to paint the current selected text red',
}
