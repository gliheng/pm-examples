import { undo, redo, history } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { EditorState, TextSelection, Transaction } from "prosemirror-state";
import { baseKeymap } from "prosemirror-commands";
import { EditorView } from "prosemirror-view";
import { schema } from 'prosemirror-schema-basic';
import { Schema, MarkType, Attrs, Mark } from "prosemirror-model";
import { MenuItem, menuBar } from "prosemirror-menu";
import menuStyle from "prosemirror-menu/style/menu.css?raw";
import { text } from "../lorem";
import { html, render } from "lit";
import { createRef, ref } from "lit/directives/ref.js";

const mySchema = new Schema({
  nodes: schema.spec.nodes,
  marks: schema.spec.marks.append({
    textColor: {
      attrs: {
        color: {},
      },
      parseDOM: [{tag: 'span', getAttrs(node: HTMLElement) {
        const { color } = node.style;
        if (!color) return false;
        return {
          color,
        };
      }}],
      toDOM(node) {
        const { color } = node.attrs;
        return ['span', { style: `color: ${color}`}, 0];
      },
    },
    backgroundColor: {
      attrs: {
        color: {},
      },
      parseDOM: [{tag: 'span', getAttrs(node: HTMLElement) {
        const { backgroundColor } = node.style;
        if (!backgroundColor) return false;
        return {
          color: backgroundColor,
        };
      }}],
      toDOM(node) {
        const { color } = node.attrs;        
        return ['span', { style: `background-color: ${color}`}, 0];
      },
    },
  }),
});

function setup(el: HTMLElement) {
  let state = EditorState.create({
    doc: mySchema.node(
      mySchema.nodes.doc, null,
      [
        mySchema.node(
          mySchema.nodes.paragraph, null,
          mySchema.text(text),
        ),
      ],
    ),
    schema: mySchema,
    plugins: [
      history(),
      keymap({"Mod-z": undo, "Mod-y": redo}),
      keymap(baseKeymap),
      menuBar({
        content: [
          [
            colorItem('Text color', mySchema.marks.textColor),
            colorItem('Background color', mySchema.marks.backgroundColor),
          ],
        ],
      }),
    ]
  });

  let view = new EditorView(el, {state});
  return view;
}

function colorItem(label: string, markType: MarkType) {
  const iptRef = createRef();
  return new MenuItem({
    label,
    render(view) {
      function setMarkAttr(attrs: Attrs) {
        const { state, dispatch } = view;
        const { empty, ranges, $cursor } = state.selection as TextSelection;
        if (empty) return false;

        let tr = state.tr
        for (let i = 0; i < ranges.length; i++) {
          let {$from, $to} = ranges[i]
          let has = state.doc.rangeHasMark($from.pos, $to.pos, markType);
          if (has) {
            tr.removeMark($from.pos, $to.pos, markType)
          }
          let from = $from.pos, to = $to.pos, start = $from.nodeAfter, end = $to.nodeBefore
          let spaceStart = start && start.isText ? /^\s*/.exec(start.text!)![0].length : 0
          let spaceEnd = end && end.isText ? /\s*$/.exec(end.text!)![0].length : 0
          if (from + spaceStart < to) { from += spaceStart; to -= spaceEnd }
          tr.addMark(from, to, markType.create(attrs))
        }

        dispatch(tr.scrollIntoView())

        return true;
      }

      let div = document.createElement('div');
      render(html`
        <label>
          ${label}:
          <input type="color" ${ref(iptRef)} @change=${(evt: Event) => {
            setMarkAttr({ color: evt.target.value });
          }}
        </label>
      `, div);
      return div;
    },
    run: (state: EditorState, dispatch: (tr: Transaction) => void) => {
      return false;
    },
    active(state) {
      const { from, to, ranges, $cursor } = state.selection as TextSelection;
      const checkMarks = (marks: readonly Mark[]) => {
        if (markType.isInSet(marks)) {
          const mark = marks.find(e => e.type == markType);
          const color = mark?.attrs.color ?? '#000';
          iptRef.value.value = color;
          return true;
        }
        return false;
      };

      let active;
      if ($cursor) {
        return checkMarks($cursor.marks());
      } else {
        active = ranges.some(range => state.doc.rangeHasMark(range.$from.pos, range.$to.pos, markType));
        if (active) {
          state.doc.nodesBetween(from, to, (node) => !checkMarks(node.marks));
        }
      }
      return active;
    },
  });
}

export default {
  setup,
  style: `
    ${menuStyle}
  `,
  title: 'Schema with custom marks',
  desc: 'Use parseDOM and toDOM with mark',
}