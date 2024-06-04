import { html, css, LitElement } from 'lit';
import { customElement } from "lit/decorators.js";
import { undo, redo, history } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { EditorState, Transaction } from "prosemirror-state";
import { baseKeymap } from "prosemirror-commands";
import { EditorView } from "prosemirror-view";
import { Schema } from "prosemirror-model";
import { wrapIn, toggleMark } from "prosemirror-commands"
import { MenuItem, menuBar, wrapItem } from 'prosemirror-menu';
import menuStyle from "prosemirror-menu/style/menu.css?raw";

@customElement('pm-note')
class Note extends LitElement {
  render() {
    return html`<slot></slot>`;
  }

  static styles = css`
    :host {
      display: block;
      white-space: initial;
      border: 1px solid silver;
      padding: 4px;
    }
  `
}

@customElement('pm-notegroup')
class NoteGroup extends LitElement {
  render() {
    return html`<slot></slot>`;
  }

  static styles = css`
    :host {
      display: block;
      white-space: initial;
      border: 1px solid blue;
      padding: 4px;
      margin: 8px 0;
    }
  `
}

const schema = new Schema({
  nodes: {
    doc: {
      content: 'block+',
    },
    note: {
      group: 'block',
      content: 'inline*',
      toDOM() {
        return ['pm-note', 0];
      },
      parseDOM: [{tag: 'pm-note'}],
    },
    notegroup: {
      group: 'block',
      content: 'note+',
      toDOM() {
        return ['pm-notegroup', 0];
      },
      parseDOM: [{tag: 'pm-notegroup'}],
    },
    text: {
      group: "inline",
    },
    star: {
      group: "inline",
      inline: true,
      toDOM() {
        return ['star', '🌟'];
      },
      parseDOM: [{tag: 'star'}]
    },
  },
  marks: {
    em: {
      toDOM() {
        return ['em', 0];
      },
      parseDOM: [{tag: 'em'}],
    },
  },
});

function setup(el: HTMLElement) {
  let state = EditorState.create({
    schema,
    plugins: [
      history(),
      keymap({"Mod-z": undo, "Mod-y": redo}),
      keymap(baseKeymap),
      menuBar({
        content: [
          [
            new MenuItem({
              label: 'Insert star',
              run: (state: EditorState, dispatch: (tr: Transaction) => void) => {
                dispatch(state.tr.replaceSelectionWith(schema.nodes.star.create()));
              },
            }),
            wrapItem(schema.nodes.notegroup, {
              label: 'Insert notegroup',
            }),
          ],
          [
            new MenuItem({
              label: 'Mark em',
              run: toggleMark(schema.marks.em),
            }),
          ],
        ],
      }),
    ],
  });

  let view = new EditorView(el, {state});
  return view;
}

export default {
  setup,
  style: `${menuStyle}`,
  title: 'Schema example',
  desc: 'A custom schema showing usage of nodes and marks',
}
