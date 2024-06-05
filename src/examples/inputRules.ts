import { undo, redo, history } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { EditorState } from "prosemirror-state";
import { baseKeymap } from "prosemirror-commands";
import { EditorView } from "prosemirror-view";
import { schema } from 'prosemirror-schema-basic';
import { inputRules, wrappingInputRule, textblockTypeInputRule, InputRule } from 'prosemirror-inputrules';

function setup(el: HTMLElement) {
  let state = EditorState.create({
    schema,
    plugins: [
      history(),
      keymap({"Mod-z": undo, "Mod-y": redo}),
      keymap(baseKeymap),
      inputRules({
        rules: [
          textblockTypeInputRule(
            new RegExp("^(#{1,6})\\s$"),
            schema.nodes.heading,
            match => ({level: match[1].length}),
          ),
          wrappingInputRule(
            /^\s*>\s$/,
            schema.nodes.blockquote,
          ),
          new InputRule(/@([\w_-]+)/, (state, match, start, end) => {
            console.log('Typed in user match:', match);
            return null;
          }),
        ],
      }),
    ]
  });

  let view = new EditorView(el, {state});
  return view;
}

export default {
  setup,
  title: 'Input rules example',
  desc: 'Use inputrules plugin to trigger command when user types something',
}