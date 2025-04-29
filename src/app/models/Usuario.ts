export interface Usuario{
    nombres: string;
    apellidos: string;
    email: string;
    password: string;
    celular?: string;
    catalogoPaisID?: number;
    catalogoEstadoID?: number;
    estadoTexto?: string;
    ciudad?: string;
    fuenteOrigenID?: number;
    fechaCreacion: Date;
}

