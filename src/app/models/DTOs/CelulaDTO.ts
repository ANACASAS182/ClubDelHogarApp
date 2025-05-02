import { UsuarioDTO } from "./UsuarioDTO";

export interface UsuarioCelula{
    yo?:UsuarioDTO;
    padre?:UsuarioDTO;
    hijos?:UsuarioDTO[];
}