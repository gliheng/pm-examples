import {undo, redo, history} from "prosemirror-history";
import {keymap} from "prosemirror-keymap";
import { EditorState, Plugin } from "prosemirror-state";
import {baseKeymap} from "prosemirror-commands";
import { Decoration, DecorationSet, EditorView } from "prosemirror-view";
import { schema } from 'prosemirror-schema-basic'


const decoPlaceholder = (cfg: {
  placeholder: string;
}) => {
  return new Plugin({
    props: {
      decorations({ doc, selection }) {
        const { anchor } = selection
        const decorations: Decoration[] = []

        const { firstChild } = doc.content
        const isLeaf = firstChild && firstChild.type.isLeaf
        const isAtom = firstChild && firstChild.isAtom
        
        const isEmptyDoc = doc.content.childCount <= 1
          && firstChild
          && (firstChild.nodeSize <= 2 && (!isLeaf || !isAtom))

        doc.descendants((node, pos) => {
          const hasAnchor = anchor >= pos && anchor <= pos + node.nodeSize
          const isEmpty = !node.isLeaf && !node.childCount

          if (hasAnchor && isEmpty) {
            const classes = ['is-empty']

            if (isEmptyDoc) {
              classes.push('is-editor-empty')
            }

            const decoration = Decoration.node(pos, pos + node.nodeSize, {
              class: classes.join(' '),
              'data-placeholder': cfg.placeholder,
            })

            decorations.push(decoration)
          }

          return false;
        })

        return DecorationSet.create(doc, decorations)
      },
    }
  })
};

function setup(el: HTMLElement) {
  let state = EditorState.create({
    schema,
    plugins: [
      history(),
      keymap({"Mod-z": undo, "Mod-y": redo}),
      keymap(baseKeymap),
      decoPlaceholder({
        placeholder: 'Yo!!!!'
      }),
    ]
  });
  let view = new EditorView(el, {state});
  return view;
}

export default {
  setup,
  style: `
    p.is-editor-empty[data-placeholder]::before {
      content: attr(data-placeholder);
      color: gray;
      pointer-events: none;
      height: 0;
      float: left;
    }
  `,
  title: 'Placeholder decoration',
  desc: 'Use node decoration to add placeholder',
}
