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

      const { anchor , head } = state.selection
      const el = document.createElement('div');
      el.classList.add('flag');
      el.setAttribute('data-label', 's');
      const decoration = Decoration.widget(anchor, el);
      const el2 = document.createElement('div');
      el2.classList.add('flag');
      el2.setAttribute('data-label', 'e');
      const decoration2 = Decoration.widget(head, el2);
      return DecorationSet.create(state.doc, [decoration, decoration2]);
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
  setup: setup,
  style: `
    .flag {
      display: inline-block;
      position: relative;
      width: 0;
      height: 0;
    }
    .flag::after {
      content: attr(data-label);
      display: block;
      position: absolute;
      top: 0;
      transform: translateX(-50%);
      background-color: gray;
      padding: 0 2px;
      color: white;
    }
  `,
  title: 'Widget decoration',
  desc: 'Use widget decoration to add dom nodes to mark the current selection',
}
