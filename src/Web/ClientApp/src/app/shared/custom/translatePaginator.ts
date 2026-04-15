import { MatPaginatorIntl } from '@angular/material/paginator';

export function translatePaginator() {
  const paginatorIntl = new MatPaginatorIntl();

  paginatorIntl.itemsPerPageLabel = 'Items:';
  paginatorIntl.nextPageLabel = 'Siguiente ';
  paginatorIntl.previousPageLabel = ' anterior';
  paginatorIntl.firstPageLabel = 'Primera ';
  paginatorIntl.lastPageLabel = 'Última ';

  // Esta función controla el texto "1 of 10"
  paginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) {
      return `0 de ${length}`;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < length
      ? Math.min(startIndex + pageSize, length)
      : startIndex + pageSize;
    return `${startIndex + 1} – ${endIndex} de ${length}`;
  };

  return paginatorIntl;
}
