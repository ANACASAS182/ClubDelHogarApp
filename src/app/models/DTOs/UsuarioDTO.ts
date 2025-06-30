export interface UsuarioRegistrarBasicoDTO{
  email:string;
  password:string;
  codigoInvitacion:string;
}

export interface UsuarioDTO {
    nombres: string;
    apellidos: string;
    email: string;
    password?: string;
    confirmPassword?: string;
    celular: string;
    catalogoPaisID?: number;
    catalogoEstadoID?: number;
    ciudad: string;
    estadoTexto: string;
    fuenteOrigenID?: number;
    codigoInvitacion?: string;
    //Abraham Casas
    UsuarioParent?: number;
    rolesId?:number;

    id?:number;
  }
  