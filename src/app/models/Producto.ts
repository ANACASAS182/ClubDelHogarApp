export interface Producto{
    id: number;
    empresaID: string;
    nombre: string;
    descripcion:string;
    tipoComision:number; //enumerador
    comisionCantidad:number; 
    comisionPorcentaje:number; 
    comisionPorcentajeCantidad:number; 
    precio:number; 
    fechaCaducidad:Date; 
}
