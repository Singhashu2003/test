import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import type { EditorComponent } from '@tinymce/tinymce-angular';

@Component({
  selector: 'app-root',
  imports: [FormsModule, EditorModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  providers: [
    {
      provide: TINYMCE_SCRIPT_SRC,
      useValue: 'tinymce/tinymce.min.js'
    }
  ]
})
export class App {
  protected readonly editorConfig: EditorComponent['init'] = {
    height: 420,
    menubar: false,
    branding: false,
    plugins: 'advlist lists link table code wordcount',
    toolbar:
      'undo redo | blocks | bold italic underline | bullist numlist | outdent indent | link table | removeformat code',
    content_style: `
      body {
        font-family: Georgia, serif;
        font-size: 16px;
        line-height: 1.6;
        margin: 1rem;
      }

      ol {
        counter-reset: item;
        list-style: none;
        margin: 0;
        padding-left: 2.75rem;
      }

      ol ol {
        margin-top: 0.35rem;
      }

      ol li {
        display: block;
        position: relative;
        margin: 0.35rem 0;
      }

      ol li::before {
        content: counters(item, '.') '.';
        counter-increment: item;
        position: absolute;
        left: -2.4rem;
        min-width: 2rem;
        color: #1f2a37;
        font-weight: 600;
      }
    `
  };

  protected content = `
    <h2>Multi-Level List</h2>
    <ol>
      <li>
        Planning
        <ol>
          <li>
            Research
            <ol>
              <li>Collect requirements</li>
            </ol>
          </li>
        </ol>
      </li>
    </ol>
  `;

  protected previewHtml = this.buildPreviewHtml(this.content);

  protected handleContentChange(content: string): void {
    this.content = content;
    this.previewHtml = this.buildPreviewHtml(content);
  }

  private buildPreviewHtml(content: string): string {
    const root = document.createElement('div');
    root.innerHTML = content;

    root.style.fontFamily = 'Georgia, serif';
    root.style.fontSize = '16px';
    root.style.lineHeight = '1.6';
    root.style.color = '#1f2a37';

    this.applyElementStyles(root);
    this.decorateOrderedLists(root);

    return root.innerHTML;
  }

  private applyElementStyles(root: HTMLElement): void {
    const headings = root.querySelectorAll('h1, h2, h3');
    for (const heading of headings) {
      const element = heading as HTMLElement;
      element.style.color = '#1f2a37';
      element.style.fontFamily = 'Georgia, serif';
      element.style.margin = '0 0 0.75rem';
      element.style.lineHeight = '1.15';
    }

    const paragraphs = root.querySelectorAll('p');
    for (const paragraph of paragraphs) {
      const element = paragraph as HTMLElement;
      element.style.margin = '0 0 0.75rem';
      element.style.color = '#4c5b6b';
    }
  }

  private decorateOrderedLists(root: HTMLElement): void {
    const topLevelLists = Array.from(root.querySelectorAll('ol')).filter(
      (list) => !list.parentElement?.closest('ol')
    );

    for (const list of topLevelLists) {
      this.decorateOrderedList(list, []);
    }
  }

  private decorateOrderedList(list: HTMLOListElement, parentPath: number[]): void {
    list.style.listStyle = 'none';
    list.style.paddingLeft = parentPath.length === 0 ? '0' : '2rem';
    list.style.margin = parentPath.length === 0 ? '0 0 1rem' : '0.35rem 0 0';

    const items = Array.from(list.children).filter(
      (child): child is HTMLLIElement => child instanceof HTMLLIElement
    );

    items.forEach((item, index) => {
      const currentPath = [...parentPath, index + 1];
      item.style.display = 'block';
      item.style.margin = '0.35rem 0';

      const childNodes = Array.from(item.childNodes);
      const nestedLists = childNodes.filter(
        (node): node is HTMLElement =>
          node instanceof HTMLOListElement || node instanceof HTMLUListElement
      );
      const contentNodes = childNodes.filter(
        (node) =>
          !(node instanceof HTMLOListElement) && !(node instanceof HTMLUListElement)
      );

      item.replaceChildren();

      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.alignItems = 'flex-start';
      row.style.gap = '0.5rem';

      const marker = document.createElement('span');
      marker.textContent = `${currentPath.join('.')}.`;
      marker.style.minWidth = `${Math.max(3.2, currentPath.length * 1.4 + 1.8)}rem`;
      marker.style.fontWeight = '700';
      marker.style.color = '#1f2a37';
      marker.style.flexShrink = '0';

      const body = document.createElement('div');
      body.style.flex = '1';
      body.style.minWidth = '0';

      for (const node of contentNodes) {
        body.appendChild(node);
      }

      if (!body.innerHTML.trim()) {
        body.innerHTML = '&nbsp;';
      }

      row.append(marker, body);
      item.appendChild(row);

      for (const nestedList of nestedLists) {
        if (nestedList instanceof HTMLOListElement) {
          this.decorateOrderedList(nestedList, currentPath);
        } else if (nestedList instanceof HTMLUListElement) {
          nestedList.style.margin = '0.35rem 0 0 2rem';
        }
        item.appendChild(nestedList);
      }
    });
  }
}
