export interface ReferenciaItemDTO {
  id: number;
  nombre: string;
  email?: string;
  celular?: string;
  producto?: string;
  productoVigente?: boolean;
  vigencia?: string | Date | number; // fecha fin (opcional)
  embajador?: string;
  empresa?: string;
  estatusReferencia?: string | number;
  codigoQR?: string; // para ver QR
}

export interface PageResult<T> {
  total: number;
  items: T[];
}
