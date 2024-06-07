import {undo, redo, history} from "prosemirror-history";
import {keymap} from "prosemirror-keymap";
import { EditorState, Plugin } from "prosemirror-state";
import {baseKeymap} from "prosemirror-commands";
import { Decoration, DecorationSet, EditorView } from "prosemirror-view";
import { schema } from 'prosemirror-schema-basic'


const plugin = new Plugin({
  props: {
    decorations(state) {
      const selection = state.selection;
      const resolved = state.doc.resolve(selection.anchor);
      const decoration = Decoration.node(resolved.before(), resolved.after(), {
        class: 'current-element'
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
  style: `
    .current-element {
      color: red;
    }
  `,
  title: 'Node decoration',
  desc: 'Use node decoration to paint the current selected dom node red',
}
