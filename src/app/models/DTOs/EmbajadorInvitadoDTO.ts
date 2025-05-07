export interface EmbajadorInvitadoDTO{
    referente_id:number;
    email: string;
}

export interface InvitacionDTO{
    vigente:boolean;
    codigo:string;
    nombreInvitador:string;
    correoElectronicoInvitacion:string;
    embajadorReferenteId:number;
}

export interface CodigoVerificacionDTO{
    codigo:string;
}

