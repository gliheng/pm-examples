import { undo, redo, history } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { EditorState, Plugin } from "prosemirror-state";
import { baseKeymap } from "prosemirror-commands";
import { EditorView } from "prosemirror-view";
import { schema } from 'prosemirror-schema-basic';
import { computePosition, flip, offset, shift } from '@floating-ui/dom';


class Panel {
  el: HTMLElement

  constructor(private view: EditorView) {
    this.el = document.createElement('pm-panel');
    this.view.dom.parentNode?.appendChild(this.el);
    this.update(this.view);
  }
  update(view: EditorView, lastState?: EditorState) {
    const { state } = view;
    // Dont do anything is view does not change
    if (lastState && lastState.doc.eq(state.doc) &&
        lastState.selection.eq(state.selection)) return

    if (state.selection.empty) {
      this.el.style.display = 'none';
      return;
    }
    this.el.style.display = 'block';
    const { from, to } = view.state.selection;
    const start = view.coordsAtPos(from);
    const end = view.coordsAtPos(to);
    let left = Math.min(start.left, end.left);
    let top = start.top;
    let width = Math.max(start.right, end.right) - Math.min(start.left, end.left);
    let height = end.bottom - start.top;
    this.el.innerHTML = `Selection from ${from} to ${to}`;
    computePosition({
      getBoundingClientRect() {
        return {
            x: left,
            y: top,
            top,
            left,
            bottom: top + height,
            right: left + width,
            width,
            height,
        }
      }
    }, this.el, {
      middleware: [offset(6), flip(), shift({padding: 5})],
    }).then(({ x, y }) => {
      this.el.style.left = `${x}px`;
      this.el.style.top = `${y}px`;
    });
  }
  destroy() {
    this.el.remove();
  }
}

function panel() {
  return new Plugin({
    view(editorView) { return new Panel(editorView) },
  });
}

function setup(el: HTMLElement) {
  let state = EditorState.create({
    schema,
    plugins: [
      history(),
      keymap({"Mod-z": undo, "Mod-y": redo}),
      keymap(baseKeymap),
      panel(),
    ]
  });

  let view = new EditorView(el, {state});
  return view;
}

export default {
  setup,
  style: `
    pm-panel {
      display: block;
      position: absolute;
      pointer-events: none;
      background: gray;
      color: white;
      padding: 20px;
    }
  `,
  title: 'Plugin view example',
  desc: 'Use pluginview to add editor ui to the dom',
}