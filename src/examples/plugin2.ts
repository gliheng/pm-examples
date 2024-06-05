import { EditorState, Plugin } from "prosemirror-state";
import { schema } from 'prosemirror-schema-basic';
import { keymap } from "prosemirror-keymap";
import { history, redo, undo } from "prosemirror-history";
import { baseKeymap } from "prosemirror-commands";
import { EditorView } from "prosemirror-view";
import { html, render } from 'lit';

const counterPlugin = new Plugin({
  state: {
    init: () => 0,
    apply(transaction, state) {
      const counterPluginMeta = transaction.getMeta(counterPlugin);
      switch (counterPluginMeta?.type) {
        case "counter/incremented":
          return state + 1;
        case "counter/decremented":
          return state - 1;
        default:
          return state;
      }
    },
  },
  view: (view) => {
    const countElement = document.createElement("div");
    view.dom.parentNode?.append(countElement);

    const onAdd = () => {
      const transaction = view.state.tr;
      transaction.setMeta(counterPlugin, { type: "counter/incremented" });
      view.dispatch(transaction);
    };

    const onDec = () => {
      const transaction = view.state.tr;
      transaction.setMeta(counterPlugin, { type: "counter/decremented" });
      view.dispatch(transaction);
    };

    const update = () => {
      const count = counterPlugin.getState(view.state);
      const tmpl = html`
        <div>
          <div>Count: ${count}</div>
          <button @click=${onAdd}>+</button>
          <button @click=${onDec}>-</button>
        </div>
      `;
      render(tmpl, countElement);
    }

    update();

    return {
      update: (view, previousState) => {
        update();
      },
    };
  },
});

function setup(el: HTMLElement) {
  let state = EditorState.create({
    schema,
    plugins: [
      history(),
      keymap({"Mod-z": undo, "Mod-y": redo}),
      keymap(baseKeymap),
      counterPlugin,
    ]
  });

  let view = new EditorView(el, {state});
  return view;
}

export default {
  setup,
  title: 'Plugin state example',
  desc: 'Plugin can have its own state and react to state change',
}