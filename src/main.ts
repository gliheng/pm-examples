import { LitElement, html, css } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { ref, createRef } from 'lit/directives/ref.js';
import { keyed } from 'lit/directives/keyed.js';
import { repeat } from 'lit/directives/repeat.js';
import '@shoelace-style/shoelace';
import '@shoelace-style/shoelace/dist/themes/light.css';
import '@shoelace-style/shoelace/dist/themes/dark.css';
import { getBasePath, setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import { examples } from './examples';
import "prosemirror-example-setup/style/style.css";
import { EditorView } from 'prosemirror-view';
import pmStyle from "prosemirror-view/style/prosemirror.css?raw";

setBasePath('/node_modules/@shoelace-style/shoelace/dist');

@customElement('lit-example')
class LitExample extends LitElement {
  @property({ attribute: false })
  example: any

  el = createRef()

  view?: EditorView

  firstUpdated() {
    this.view = this.example.setup(this.el.value);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.view?.destroy();
  }

  render() {
    return html`
      <style>${pmStyle}</style>
      <style>${this.example.style}</style>
      <h1>${this.example.title}</h1>
      <p>${this.example.desc}</p>
      <div class="root" ${ref(this.el)}></div>
    `;
  }

  static styles = css`
    .root {
      border: 1px solid silver;
      position: relative;
    }
    .ProseMirror {
      display: flow-root;
      padding: 4px 8px;
    }
  `
}

@customElement('pm-examples')
export class ProseMirrorExamples extends LitElement {
  @state()
  current = 0

  onSelect(evt: CustomEvent) {
    this.current = parseInt(evt.detail.item.value);
  }

  render() {
    return html`
      <sl-dropdown @sl-select=${this.onSelect}>
        <sl-button slot="trigger">
          <sl-icon name="list" label="Settings"></sl-icon>
        </sl-button>
        <sl-menu>
          ${repeat(examples, (e, i) => {
            return html`<sl-menu-item value=${i}>${e.title}</sl-menu-item>`;
          })}
        </sl-menu>
      </sl-dropdown>
      ${keyed(this.current, html`<lit-example :key="${this.current}" .example=${examples[this.current]}></lit-example>`)}
    `;
  }

  static styles = css`
    sl-dropdown {
      position: fixed;
      top: 0;
      right: 0;
      z-index: 100;
    }
  `;
}
