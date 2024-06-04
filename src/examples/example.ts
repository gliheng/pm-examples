import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { schema } from 'prosemirror-schema-basic'
import { exampleSetup } from 'prosemirror-example-setup';
import emStyle from "prosemirror-example-setup/style/style.css?raw";
import menuStyle from "prosemirror-menu/style/menu.css?raw";

function setup(el: HTMLElement) {
  let state = EditorState.create({
    schema,
    plugins: [
      ...exampleSetup({
        schema,
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
  title: 'exampleSetup example',
  desc: 'Use prosemirror-example-setup package for a quick setup',
}
