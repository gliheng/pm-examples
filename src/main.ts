import { examples } from './examples';
import { LitElement, html, css } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { ref, createRef } from 'lit/directives/ref.js';
import { keyed } from 'lit/directives/keyed.js';
import { repeat } from 'lit/directives/repeat.js';
import '@shoelace-style/shoelace';
import '@shoelace-style/shoelace/dist/themes/light.css';
import '@shoelace-style/shoelace/dist/themes/dark.css';
import { getBasePath, setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import "prosemirror-example-setup/style/style.css";
import { EditorView } from 'prosemirror-view';
import pmStyle from "prosemirror-view/style/prosemirror.css?raw";
import { Router } from './router';
import { kebabCase } from 'lodash-es';
import { SlDrawer } from '@shoelace-style/shoelace';

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
  drawer = createRef<SlDrawer>()

  router = new Router(this, {
    routes: [
      {
        name: 'home',
        path: '/',
        redirect: () => ({ name: kebabCase(examples[0].title) }),
      },
      ...examples.map(e => {
        const name = kebabCase(e.title);
        return {
          name,
          path: '/' + name,
          render: () => html`${keyed(name, html`<lit-example .example=${e}></lit-example>`)}`,
        }
      })
    ],
  });

  onSelect(item: { title: string }) {
    this.router.go('/' + kebabCase(item.title));
    this.drawer.value?.hide();
  }

  onShowDrawer() {
    this.drawer.value?.show();
  }

  render() {
    return html`
      <sl-button class="nav-btn" @click="${this.onShowDrawer}">
        <sl-icon name="list" label="Settings"></sl-icon>
      </sl-button>
      <sl-drawer
        ${ref(this.drawer)}
        label="Menu"
        placement="end"
      >
        <nav>
        ${repeat(examples, (e, i) => {
          return html`<div class="nav-item" @click=${this.onSelect.bind(this, e)}>
            <h1>${e.title}</h1>
            <p>${e.desc}</p>
          </div>`;
        })}
        </nav>
      </sl-drawer>
      ${this.router.outlet()}
    `;
  }

  static styles = css`
    .nav-btn {
      position: fixed;
      top: 0;
      right: 0;
      z-index: 100;
    }
    .nav-item {
      padding: 10px;
      cursor: default;
    }
    .nav-item:hover {
      background: var(--sl-color-sky-100);
      outline: 1px solid var(--sl-color-sky-600);
    }
    .nav-item h1 {
      font-size: var(--sl-font-size-x-large);
      margin: 0;
    }
    .nav-item p {
      font-size: var(--sl-font-size-medium);
      color: var(--sl-color-neutral-500);
      margin: 0;
    }
  `;
}
