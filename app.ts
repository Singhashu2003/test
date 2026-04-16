import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import type { EditorComponent } from '@tinymce/tinymce-angular';

type OrderedListStyle =
  | 'decimal'
  | 'decimal-leading-zero'
  | 'lower-alpha'
  | 'upper-alpha'
  | 'lower-roman'
  | 'upper-roman';

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
    advlist_number_styles:
      'default,decimal,decimal-leading-zero,lower-alpha,lower-roman,upper-alpha,upper-roman',
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
        padding-left: 0;
      }

      ol ol {
        margin-top: 0.35rem;
        margin-left: 1.5rem;
      }

      ol li {
        display: block;
        position: relative;
        margin: 0.35rem 0;
        padding-left: 3.75rem;
      }

      ol li::before {
        counter-increment: item;
        position: absolute;
        left: 0;
        top: 0;
        width: 3.25rem;
        text-align: right;
        color: #1f2a37;
        font-weight: 600;
      }

      ol li::before,
      ol[type="1"] li::before,
      ol[style*="list-style-type: decimal"] li::before {
        content: counters(item, '.', decimal) '.';
      }

      ol[type="a"] li::before,
      ol[style*="list-style-type: lower-alpha"] li::before,
      ol[style*="list-style-type: lower-latin"] li::before {
        content: counters(item, '.', lower-alpha) '.';
      }

      ol[type="A"] li::before,
      ol[style*="list-style-type: upper-alpha"] li::before,
      ol[style*="list-style-type: upper-latin"] li::before {
        content: counters(item, '.', upper-alpha) '.';
      }

      ol[type="i"] li::before,
      ol[style*="list-style-type: lower-roman"] li::before {
        content: counters(item, '.', lower-roman) '.';
      }

      ol[type="I"] li::before,
      ol[style*="list-style-type: upper-roman"] li::before {
        content: counters(item, '.', upper-roman) '.';
      }

      ol[style*="list-style-type: decimal-leading-zero"] li::before {
        content: counters(item, '.', decimal-leading-zero) '.';
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

  private decorateOrderedList(
    list: HTMLOListElement,
    parentPath: Array<{ index: number; style: OrderedListStyle }>
  ): void {
    const listStyle = this.getOrderedListStyle(list);
    list.style.listStyle = 'none';
    list.style.paddingLeft = '0';
    list.style.margin = parentPath.length === 0 ? '0 0 1rem' : '0.35rem 0 0';

    const items = Array.from(list.children).filter(
      (child): child is HTMLLIElement => child instanceof HTMLLIElement
    );

    items.forEach((item, index) => {
      const currentPath = [...parentPath, { index: index + 1, style: listStyle }];
      item.style.display = 'block';
      item.style.margin = '0.35rem 0';

      const childNodes = Array.from(item.childNodes);
      const nestedLists = childNodes.filter(
        (node): node is HTMLElement =>
          node instanceof HTMLOListElement || node instanceof HTMLUListElement
      );
      const contentNodes = this.normalizeContentNodes(
        childNodes.filter(
          (node) =>
            !(node instanceof HTMLOListElement) && !(node instanceof HTMLUListElement)
        )
      );

      item.replaceChildren();
      item.style.listStyle = 'none';
      item.style.margin = '0.35rem 0';
      item.style.padding = '0';

      const row = document.createElement('div');
      row.style.display = 'table';
      row.style.width = '100%';
      row.style.tableLayout = 'fixed';

      const marker = document.createElement('span');
      marker.textContent = `${this.formatMarkerPath(currentPath)}.`;
      marker.style.display = 'table-cell';
      marker.style.width = `${Math.max(3.4, currentPath.length * 1.15 + 2.1)}rem`;
      marker.style.paddingRight = '0.6rem';
      marker.style.verticalAlign = 'top';
      marker.style.textAlign = 'right';
      marker.style.fontWeight = '700';
      marker.style.color = '#1f2a37';

      const body = document.createElement('div');
      body.style.display = 'table-cell';
      body.style.verticalAlign = 'top';
      body.style.width = 'auto';
      body.style.wordBreak = 'break-word';

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
          nestedList.style.margin = '0.35rem 0 0 1.5rem';
        }
        item.appendChild(nestedList);
      }
    });
  }

  private normalizeContentNodes(nodes: ChildNode[]): ChildNode[] {
    const normalized: ChildNode[] = [];

    for (const node of nodes) {
      if (node.nodeType !== Node.TEXT_NODE) {
        normalized.push(node);
        continue;
      }

      const text = node.textContent?.replace(/\s+/g, ' ').trim() ?? '';
      if (text) {
        normalized.push(document.createTextNode(text));
      }
    }

    return normalized;
  }

  private getOrderedListStyle(list: HTMLOListElement): OrderedListStyle {
    const inlineStyle = list.style.listStyleType?.trim().toLowerCase();
    if (this.isSupportedOrderedListStyle(inlineStyle)) {
      return inlineStyle;
    }

    const type = list.getAttribute('type');
    switch (type) {
      case 'a':
        return 'lower-alpha';
      case 'A':
        return 'upper-alpha';
      case 'i':
        return 'lower-roman';
      case 'I':
        return 'upper-roman';
      default:
        return 'decimal';
    }
  }

  private isSupportedOrderedListStyle(
    value: string | null | undefined
  ): value is OrderedListStyle {
    return (
      value === 'decimal' ||
      value === 'decimal-leading-zero' ||
      value === 'lower-alpha' ||
      value === 'upper-alpha' ||
      value === 'lower-roman' ||
      value === 'upper-roman'
    );
  }

  private formatMarkerPath(
    path: Array<{ index: number; style: OrderedListStyle }>
  ): string {
    return path.map((segment) => this.formatMarkerSegment(segment.index, segment.style)).join('.');
  }

  private formatMarkerSegment(index: number, style: OrderedListStyle): string {
    switch (style) {
      case 'lower-alpha':
        return this.toAlphabetic(index).toLowerCase();
      case 'upper-alpha':
        return this.toAlphabetic(index).toUpperCase();
      case 'lower-roman':
        return this.toRoman(index).toLowerCase();
      case 'upper-roman':
        return this.toRoman(index).toUpperCase();
      case 'decimal-leading-zero':
        return index.toString().padStart(2, '0');
      case 'decimal':
      default:
        return index.toString();
    }
  }

  private toAlphabetic(index: number): string {
    let value = index;
    let result = '';

    while (value > 0) {
      value -= 1;
      result = String.fromCharCode(97 + (value % 26)) + result;
      value = Math.floor(value / 26);
    }

    return result;
  }

  private toRoman(index: number): string {
    const numerals: Array<[number, string]> = [
      [1000, 'M'],
      [900, 'CM'],
      [500, 'D'],
      [400, 'CD'],
      [100, 'C'],
      [90, 'XC'],
      [50, 'L'],
      [40, 'XL'],
      [10, 'X'],
      [9, 'IX'],
      [5, 'V'],
      [4, 'IV'],
      [1, 'I']
    ];

    let value = index;
    let result = '';

    for (const [numeric, symbol] of numerals) {
      while (value >= numeric) {
        result += symbol;
        value -= numeric;
      }
    }

    return result || index.toString();
  }
}
