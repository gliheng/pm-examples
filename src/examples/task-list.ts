import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { schema as baseSchema } from 'prosemirror-schema-basic'
import { addListNodes, wrapInList, splitListItem } from 'prosemirror-schema-list';
import { exampleSetup } from 'prosemirror-example-setup';
import emStyle from "prosemirror-example-setup/style/style.css?raw";
import menuStyle from "prosemirror-menu/style/menu.css?raw";
import { Node, Schema } from "prosemirror-model";
import { MenuItem } from "prosemirror-menu";
import { keymap } from "prosemirror-keymap";


class TaskListItemView {
  constructor(node: Node, view: EditorView, getPos: any) {
    const el = document.createElement('li');
    el.classList.add('task-list-item');
    const content = document.createElement('div');
    const input = document.createElement('input');
    input.setAttribute('type', 'checkbox');

    el.appendChild(input);
    el.appendChild(content);
    this.dom = el;
    this.check = input;
    this.contentDOM = content;
    input.addEventListener('input', (evt) => {
      evt.preventDefault();
      const done =  !node.attrs.done;
      view.dispatch(view.state.tr.setNodeAttribute(getPos(), 'done', done));
    });
  }
  update(node: Node) {
    this.check.checked = node.attrs.done;
    return true;
  }
}

const nodes = baseSchema.spec.nodes.append({
  task_list: {
    group: 'block list',
    content: "task_list_item+",
    parseDOM: [{tag: "ul"}],
    toDOM(_node: Node) {
      return ["ul", { class: 'task-list' }, 0]
    },
    inline: false,
    isBlock: true,
  },
  task_list_item: {
    attrs: {done: {default: false}},
    content: "paragraph+",
    inline: false,
    isBlock: true,
  },
})

const schema = new Schema({
  nodes: addListNodes(nodes, 'paragraph block*', 'block list'),
  marks: baseSchema.spec.marks,
});

const taskListType = schema.nodes.task_list;
const taskListItemType = schema.nodes.task_list_item;

function setup(el: HTMLElement) {
  let state = EditorState.create({
    schema,
    plugins: [
      keymap({
        'Enter': splitListItem(taskListItemType),
      }),
      ...exampleSetup({
        schema,
        menuContent: [
          [
            new MenuItem({
              title: "Insert task list",
              label: "Insert task list",
              run: wrapInList(taskListType),
            }),
          ]
        ],
      }),
    ],
  });

  let view = new EditorView(el, {
    state,
    nodeViews: {
      task_list_item(node, view, getPos) {
        return new TaskListItemView(node, view, getPos);
      },
    },
  });
  return view;
}

export default {
  setup,
  style: `
    ${emStyle}
    ${menuStyle}
    .task-list-item {
      display: flex;
      p {
        margin: 0;
      }
    }
  `,
  title: 'Task list example',
  desc: 'A task list schema type',
}
