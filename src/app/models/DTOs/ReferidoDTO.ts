import { EstatusReferenciaEnum } from "src/app/enums/estatus.referencia.enum";

export interface ReferidoDTO{
    id?: number;
    nombreCompleto: string;
    email: string;
    celular:string;
    usuarioID?:number;
    productoID?:number; 
    estatusReferenciaID?:number; 
    estatusReferenciaDescripcion?: string;
    estatusReferenciaEnum?: EstatusReferenciaEnum;
    empresaID?: number;
    empresaRazonSocial?: string;
    productoNombre?: string;
    comision?: number;
    fechaRegistro?: Date
}