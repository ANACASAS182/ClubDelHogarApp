export interface Promocion{
  iD: number;
  empresaID: number;
  empresaNombre: string;
  nombre: string;
  descripcion: string;
  marketing: string;
  comision: string;          // lo vamos a sobrescribir con el texto final
  vigencia: string;
  logotipoBase64: string;

  // nuevas, calculadas
  tipoComision?: 0 | 1;          // 0 = Monto, 1 = Porcentaje
  moneda?: string;               // por defecto MXN
  comisionCantidad?: number;     // cuando es monto
  comisionPorcentaje?: number;   // cuando es %
}