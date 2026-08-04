export type DocumentoColumnType = 'text' | 'number' | 'currency' | 'date' | 'status';
export type SortDirection = 'asc' | 'desc';
export type DocumentoStatus = '' | 'pendiente' | 'facturada';

export interface DocumentoListItem {
  id: number;
  serie: string;
  folio: number;
  fecha: string;
  cliente: string;
  contacto: string;
  usuario: string;
  total: number;
  estado: Exclude<DocumentoStatus, ''>;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface DocumentoListQuery {
  page: number;
  pageSize: number;
  search: string;
  sortBy: string;
  sortDirection: SortDirection;
  dateFrom: string;
  dateTo: string;
  status: DocumentoStatus;
}

export interface DocumentoColumnConfig {
  key: keyof DocumentoListItem | 'serieFolio';
  label: string;
  type: DocumentoColumnType;
  sortable?: boolean;
  sortKey?: string;
  align?: 'start' | 'center' | 'end';
}

export type DocumentoActionId = 'preview' | 'pdf' | 'edit' | 'duplicate';

export interface DocumentoActionConfig {
  id: DocumentoActionId;
  label: string;
  icon: string;
}

export interface DocumentoListConfig {
  title: string;
  createLabel: string;
  createRoute: string;
  searchPlaceholder: string;
  columns: DocumentoColumnConfig[];
  actions: DocumentoActionConfig[];
}

export interface DocumentoListAction {
  action: DocumentoActionId;
  item: DocumentoListItem;
}

export const DEFAULT_DOCUMENTO_LIST_QUERY: DocumentoListQuery = {
  page: 1,
  pageSize: 25,
  search: '',
  sortBy: 'fecha',
  sortDirection: 'desc',
  dateFrom: '',
  dateTo: '',
  status: '',
};
