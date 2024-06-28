import { EditorState, Plugin } from "prosemirror-state";
import { Decoration, DecorationSet, EditorView } from "prosemirror-view";
import { schema as baseSchema } from 'prosemirror-schema-basic'
import { exampleSetup } from 'prosemirror-example-setup';
import emStyle from "prosemirror-example-setup/style/style.css?raw";
import menuStyle from "prosemirror-menu/style/menu.css?raw";
import { Node, Schema } from "prosemirror-model";
import { MenuItem } from "prosemirror-menu";
import { html, render } from "lit";
import Prism from 'prismjs';
import { flatten } from 'lodash-es';

const syntaxHighlight = new Plugin({
  state: {
    init: () => new Map,
    apply(transaction, state) {
      const meta = transaction.getMeta(syntaxHighlight);
      if (meta) {
        const { inst, tokens } = meta;
        if (!tokens) {
          state.delete(inst);
        } else {
          state.set(inst, tokens);
        }
        return state;
      }
      return state;
    },
  },
  props: {
    decorations(state) {
      const pState = syntaxHighlight.getState(state);
      let decorations = [];
      for (const [inst, tokens] of pState.entries()) {
        decorations.push(tokensToDecorartions(inst.getPos(), tokens));
      }
      const deco = flatten(decorations);
      if (deco.length == 0) {
        return DecorationSet.empty;
      }
      return DecorationSet.create(state.doc, deco);
    },
  },
});

function tokensToDecorartions(start: number, tokens: any[]) {
  const deco: Decoration[] = [];
  let i = 1;
  tokens.forEach((t) => {
    if (typeof t == 'object') {
      deco.push(Decoration.inline(start + i, start + i + t.length, {
        class: t.type,
      }));
    }
    i += t.length;
  });
  return deco;
}

class CodeBlockView {
  dom: HTMLElement;
  contentDOM: HTMLElement;
  prev?: string;

  constructor(
    node: Node,
    public view: EditorView,
    public getPos: () => number | undefined,
  ) {
    const el = document.createElement("div")
    el.classList.add('code-block');
    this.dom = el;
    this.render(node);
    this.contentDOM = el.querySelector('code')!;
  }

  update(node: Node) {
    const t = node.textContent;
    if (t != this.prev) {
      setTimeout(() => {
        const tokens = Prism.tokenize(node.textContent, Prism.languages.javascript);
        this.view.dispatch(this.view.state.tr.setMeta(syntaxHighlight, {
          inst: this,
          tokens,
        }));
      }, 0);
    }
    this.prev = t;
    return true;
  }

  destroy() {
    setTimeout(() => {
      this.view.dispatch(this.view.state.tr.setMeta(syntaxHighlight, {
        inst: this,
        tokens: null,
      }));
    }, 0);
  }

  render(node: Node) {
    render(html`
      <div class="lang-selector">${node.attrs.lang}</div>
      <pre><code></code></pre>
    `, this.dom);
  }
}
const schema = new Schema({
  nodes: baseSchema.spec.nodes.append({
    code_block: {
      content: "text*",
      marks: "",
      group: "block",
      attrs: {
        lang: {default: 'javascript'},
      },
      code: true,
      defining: true,
    },
  }),
  marks: baseSchema.spec.marks,
});

function setup(el: HTMLElement) {
  let state = EditorState.create({
    schema,
    plugins: [
      ...exampleSetup({
        schema,
        menuContent: [
          [
            new MenuItem({
              title: "Insert code block",
              label: "Insert code block",
              run: (state, dispatch) => {
                if (dispatch) {
                  const tr = state.tr;
                  if (!tr.selection.$from.node().content.size) {
                    const range = tr.selection.$from.blockRange();
                    dispatch(tr.setBlockType(range!.start, range!.end, schema.nodes.code_block));
                  } else {
                    const node = schema.nodes.code_block.createAndFill();
                    dispatch(tr.insert(state.selection.from, node!));
                  }
                }
                return true;
              },
            }),
          ],
        ],
      }),
      syntaxHighlight,
    ]
  });

  let view = new EditorView(el, {
    state,
    nodeViews: {
      code_block(node, view, getPos) {
        return new CodeBlockView(node, view, getPos);
      },
    }
  });
  return view;
}

export default {
  setup,
  style: `
    ${emStyle}
    ${menuStyle}
    .code-block {
      white-space: initial;
      border: 1px solid silver;
      padding: 10px;
      padding-top: 20px;
      position: relative;
    }
    .code-block .lang-selector {
      position: absolute;
      color: gray;
      top: 0;
    }
    .code-block .punctuation {
      color: cadetblue;
    }
    .code-block .function {
      color: blue;
    }
    .code-block .number {
      color: orange;
    }
    .code-block .string {
      color: green;
    }
    .code-block .keyword {
      color: sandybrown;
    }
    .code-block .class-name {
      color: dodgerblue;
    }
  `,
  title: 'Code block example',
  desc: 'Add syntax highlight using prismjs',
}
