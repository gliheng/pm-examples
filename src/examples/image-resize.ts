import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { schema as baseSchema } from 'prosemirror-schema-basic'
import { addListNodes } from 'prosemirror-schema-list';
import { exampleSetup } from 'prosemirror-example-setup';
import emStyle from "prosemirror-example-setup/style/style.css?raw";
import menuStyle from "prosemirror-menu/style/menu.css?raw";
import { Schema } from "prosemirror-model";
import { MenuItem } from "prosemirror-menu";
import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from 'lit/directives/if-defined.js';
import { styleMap } from 'lit/directives/style-map.js';

@customElement('x-image')
class Image extends LitElement {
  @property({ attribute: false })
  pm!: {
    node: Node;
    view: EditorView;
    getPos: any;
  }

  resizing = false;

  onPointerdown = (evt: PointerEvent) => {
    evt.preventDefault();
    this.resizing = true;
    evt.target.setPointerCapture(evt.pointerId);
  }

  onPointermove = (evt: PointerEvent) => {
    if (this.resizing) {
      const { view, getPos, node } = this.pm;
      let { width, height } = node.attrs;
      width = Math.max(width + evt.movementX, 0);
      height = Math.max(height + evt.movementY, 0);
      const pos = getPos();
      const tr = view.state.tr
        .setNodeAttribute(pos, 'width', width)
        .setNodeAttribute(pos, 'height', height)
        .scrollIntoView();
      view.dispatch(tr);
    }
  }

  onPointerup = (evt: PointerEvent) => {
    this.resizing = false;
  }

  render() {
    const { attrs } = this.pm.node;
    const { src, alt, title, width, height } = attrs;
    return html`
      <img
        src=${src}
        style=${styleMap({
          width: `${width}px`,
          height: `${height}px`,
        })}
        alt=${ifDefined(alt)}
        title=${ifDefined(title)}
      >
      <div
        class="handle"
        @pointerdown=${this.onPointerdown}
        @pointerup=${this.onPointerup}
        @pointermove=${this.onPointermove}
      ></div>
    `;
  }

  static styles = css`
    :host {
      display: inline-block;
      white-space: initial;
      position: relative;
      outline: 1px solid blue;
    }
    .handle {
      width: 14px;
      height: 14px;
      background: blue;
      position: absolute;
      right: 0;
      bottom: 0;
      cursor: nwse-resize;
    }
  `;
}

const schema = new Schema({
  nodes: baseSchema.spec.nodes.append({
    image: {
      inline: true,
      attrs: {
        src: {},
        alt: {default: null},
        title: {default: null},
        width: {default: null},
        height: {default: null},
      },
      group: "inline",
      draggable: true,
    }}
  ),
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
              title: "Insert image",
              label: "Insert image",
              run: (state, dispatch) => {
                if (dispatch) {
                  const tr = state.tr;
                  const node = schema.nodes.image.createAndFill({
                    src: '/lit.svg',
                    width: 300,
                    height: 200,
                  });
                  dispatch(tr.replaceSelectionWith(node!));
                }
                return true;
              },
            }),
          ],
        ],
      }),
    ]
  });

  let view = new EditorView(el, {
    state,
    nodeViews: {
      image(node, view, getPos) {
        const el = document.createElement("x-image");
        el.pm = {
          node, view, getPos,
        };
        return {
          dom: el,
          update(node) {
            if (node.type != schema.nodes.image) {
              return false;
            }
            el.pm.node = node;
            el.requestUpdate();
            return true;
          },
        };
      }
    }
  });
  return view;
}

export default {
  setup,
  style: `
    ${emStyle}
    ${menuStyle}
  `,
  title: 'Image resize example',
  desc: 'Add image resize controls using node views',
}
