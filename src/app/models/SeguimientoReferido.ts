export interface SeguimientoReferido{
    id: number;
    fechaSeguimiento?: Date | null;
    fechaCreacion?: Date | null;  // 👈 nueva (opcional por si viene null)
    comentario: string;
    referidoID:Number;
}
