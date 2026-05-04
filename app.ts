function getListStyleType(list: HTMLOListElement): string {
  return list.style.listStyleType || list.getAttribute('type') || 'decimal';
}

function getMarker(index: number, type: string): string {
  switch (type) {
    case 'lower-alpha':
      return String.fromCharCode(96 + index) + '.';
    case 'upper-alpha':
      return String.fromCharCode(64 + index) + '.';
    case 'lower-roman':
      return toRoman(index).toLowerCase() + '.';
    case 'upper-roman':
      return toRoman(index).toUpperCase() + '.';
    default:
      return index + '.';
  }
}

function toRoman(num: number): string {
  const map: { [key: number]: string } = {
    1000: 'M', 900: 'CM', 500: 'D', 400: 'CD',
    100: 'C', 90: 'XC', 50: 'L', 40: 'XL',
    10: 'X', 9: 'IX', 5: 'V', 4: 'IV', 1: 'I'
  };

  let result = '';
  Object.keys(map)
    .map(Number)
    .sort((a, b) => b - a)
    .forEach((key) => {
      while (num >= key) {
        result += map[key];
        num -= key;
      }
    });

  return result;
}


static buildRenderedList(
  list: HTMLOListElement,
  parentNumbers: number[]
): HTMLDivElement {

  const renderedList = document.createElement('div');
  renderedList.setAttribute('data-rendered-list', 'true');
  renderedList.setAttribute('style', RENDERED_LIST_STYLE);

  const start = Number.parseInt(list.getAttribute('start') ?? '1', 10);
  const listStyleType = getListStyleType(list);

  const items = Array.from(list.children).filter(
    (child): child is HTMLLIElement => child.tagName === 'LI'
  );

  items.forEach((item, itemIndex) => {

    const currentNumber = Number.isNaN(start)
      ? itemIndex + 1
      : start + itemIndex;

    const depth = parentNumbers.length;

    // extract nested lists
    const nestedLists = Array.from(item.children).filter(
      (child): child is HTMLOListElement => child.tagName === 'OL'
    );

    nestedLists.forEach((nested) => nested.remove());

    const contentNodes = Array.from(item.childNodes);

    const renderedItem = document.createElement('div');
    renderedItem.setAttribute('data-rendered-item', 'true');
    renderedItem.setAttribute('style', RENDERED_ITEM_STYLE);

    const row = document.createElement('p');
    row.setAttribute('data-rendered-row', 'true');
    row.setAttribute(
      'style',
      `${ROW_STYLE}; margin-left:${depth * PREVIEW_INDENT_PER_LEVEL_PT}pt;`
    );

    // marker
    const marker = document.createElement('strong');
    marker.setAttribute('data-rendered-marker', 'true');
    marker.setAttribute('style', MARKER_STYLE);

    marker.textContent = getMarker(currentNumber, listStyleType);

    // content
    const content = document.createElement('span');
    content.setAttribute('data-rendered-content', 'true');
    content.setAttribute('style', CONTENT_STYLE);

    if (this.hasvisibleContent(contentNodes)) {
      contentNodes.forEach((node) => content.appendChild(node));
    } else {
      content.innerHTML = '&nbsp;';
    }

    const spacer = document.createTextNode('\u00a0\u00a0');

    row.append(marker, spacer, content);
    renderedItem.appendChild(row);

    // nested recursion
    nestedLists.forEach((nestedList) => {
      renderedItem.appendChild(
        this.buildRenderedList(nestedList, [...parentNumbers, currentNumber])
      );
    });

    renderedList.appendChild(renderedItem);
  });

  return renderedList;
}
