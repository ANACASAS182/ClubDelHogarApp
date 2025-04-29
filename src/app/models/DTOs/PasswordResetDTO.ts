export interface PasswordResetDTO{
    token: string;
    newPassword: string;
    confirmNewPassword:string;
}