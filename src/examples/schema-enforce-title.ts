import { undo, redo, history } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { EditorState, Plugin } from "prosemirror-state";
import { baseKeymap } from "prosemirror-commands";
import { EditorView } from "prosemirror-view";
import { schema, nodes } from 'prosemirror-schema-basic';
import { NodeType, Schema } from "prosemirror-model";
import { text } from '../lorem';
import { customElement, property } from "lit/decorators.js";
import { LitElement, html, css } from "lit";


@customElement('x-tagline')
class TagLine extends LitElement {
  @property({ attribute: false })
  pm!: {
    node: Node;
    view: EditorView;
    getPos: any;
  }

  @property()
  tags: String = ''

  onAdd() {
    const tags = prompt('Set a tag line, use commor to seperate');
    const { view } = this.pm;
    const { state } = view;
    if (tags) {
      view.dispatch(state.tr.setNodeAttribute(this.pm.getPos(), 'tags', tags));
    }
  }

  render() {
    const { tags } = this;
    if (tags) {
      return html`${this.tags.split(',').map(s => html`<sl-badge pill>${s}</sl-badge>`)}`;
    }
    return html`<sl-button size="small" @click="${this.onAdd}">Set tag line</sl-button>`;
  }

  static styles = css`
    :host {
      display: block;
      white-space: collapse;
    }
  `;
}

const mySchema = new Schema({
  nodes: schema.spec.nodes.append({
    doc: {
      content: "heading tagline block+",
    },
    tagline: {
      group: 'block',
      atom: true,
      attrs: {tags: { default: '' }},
      // toDOM: (node) => ['x-tagline', { tags: node.attrs.tags }],
      // parseDOM: [{tag: 'x-tagline', getAttrs(dom) { return { tags: dom.getAttribute('tags') }}}]
    },
  }),
  marks: schema.spec.marks,
});

function setup(el: HTMLElement) {
  let state = EditorState.create({
    schema: mySchema,
    plugins: [
      history(),
      keymap({"Mod-z": undo, "Mod-y": redo}),
      keymap(baseKeymap),
    ],
    doc: mySchema.node('doc', null, [
      mySchema.node('heading', null, mySchema.text('Article title')),
      mySchema.node('tagline', { tags: 'science,art,story' }),
      mySchema.node('paragraph', null, mySchema.text(text)),
    ]),
  });

  let view = new EditorView(el, {
    state,
    nodeViews: {
      tagline(node, view, getPos) {
        const el = document.createElement("x-tagline")
        el.setAttribute('tags', node.attrs.tags);
        el.pm = {
          node, view, getPos,
        };
        return {
          dom: el,
        };
      }
    },
  });
  return view;
}

export default {
  setup,
  title: 'Enforce doc title',
  desc: 'Use schema to ensure title always exists',
}