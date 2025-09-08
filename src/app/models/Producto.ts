export interface Producto {
  id: number;
  empresaID: number;                // <- era string
  nombre: string;
  descripcion?: string | null;
  tipoComision?: number | null;     // 0 = MXN, 1 = %
  comisionCantidad?: number | null; // MXN
  comisionPorcentaje?: number | null; // %
  comisionPorcentajeCantidad?: number | null;
  precio?: number | null;
  fechaCaducidad?: string | Date | null;
}
