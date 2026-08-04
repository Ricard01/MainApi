import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {DocumentoList} from '../../../../shared/components/documento-list/documento-list';
import {
  DocumentoListAction,
  DocumentoListConfig,
  DocumentoListItem,
  DocumentoListQuery
} from '../../../../shared/models/documento-list.model';

@Component({
  selector: 'app-cotizacion-list',
  imports: [DocumentoList],
  templateUrl: './cotizacion-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CotizacionList {
  readonly items = input.required<DocumentoListItem[]>();
  readonly totalCount = input.required<number>();
  readonly query = input.required<DocumentoListQuery>();
  readonly loading = input(false);
  readonly queryChange = output<DocumentoListQuery>();
  readonly itemAction = output<DocumentoListAction>();

  readonly config: DocumentoListConfig = {
    title: 'Cotizaciones',
    createLabel: 'Nueva cotización',
    createRoute: '/cotizaciones/nuevo',
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
      {id: 'preview', label: 'Vista previa', icon: 'visibility'},
      {id: 'pdf', label: 'Descargar PDF', icon: 'picture_as_pdf'},
    ],
  };
}
