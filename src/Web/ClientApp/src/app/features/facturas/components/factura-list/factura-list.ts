import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {DocumentoList} from '../../../../shared/components/documento-list/documento-list';
import {
  DocumentoListAction,
  DocumentoListConfig,
  DocumentoListItem,
  DocumentoListQuery
} from '../../../../shared/models/documento-list.model';

@Component({
  selector: 'app-factura-list',
  imports: [DocumentoList],
  templateUrl: './factura-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FacturaList {
  readonly items = input.required<DocumentoListItem[]>();
  readonly totalCount = input.required<number>();
  readonly query = input.required<DocumentoListQuery>();
  readonly loading = input(false);
  readonly queryChange = output<DocumentoListQuery>();
  readonly itemAction = output<DocumentoListAction>();

  readonly config: DocumentoListConfig = {
    title: 'Facturas',
    createLabel: 'Nueva factura',
    createRoute: '/facturas/nuevo',
    searchPlaceholder: 'Buscar serie, folio, cliente o contacto',
    columns: [
      {key: 'serieFolio', label: 'Serie / Folio', type: 'text', sortKey: 'serieFolio'},
      {key: 'fecha', label: 'Fecha', type: 'date', sortKey: 'fecha'},
      {key: 'cliente', label: 'Cliente', type: 'text', sortKey: 'cliente'},
      {key: 'usuario', label: 'Usuario', type: 'text', sortKey: 'usuario'},
      {key: 'total', label: 'Total', type: 'currency', sortKey: 'total', align: 'end'},
      {key: 'estado', label: 'Estado', type: 'status', sortKey: 'estado', align: 'center'},
    ],
    actions: [
      {id: 'edit', label: 'Editar', icon: 'edit'},
      {id: 'preview', label: 'Vista previa', icon: 'visibility'},
      {id: 'delete', label: 'Eliminar', icon: 'delete'},
    ],
  };
}
