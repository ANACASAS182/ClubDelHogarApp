import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';
import { LoginUsuarioDTO } from 'src/app/models/DTOs/LoginUsuarioDTO';
import { ToastController } from '@ionic/angular';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { TokenService } from 'src/app/services/token.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { Keyboard } from '@capacitor/keyboard';

import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  hasError: boolean = false;
  messageError: string = "";

  nombreAlmacenado:string = "";
  correoAlmacenado:string = "";
  passwordAlmacenado:string = "";

  async borrarDatosAlmacenados(){
    this.nombreAlmacenado = "";
    this.correoAlmacenado = "";
    this.passwordAlmacenado = "";

    await Preferences.clear();
  }

  formEnviado: boolean = false;
  constructor(private fb: FormBuilder,
    private router: Router,
    private usuarioService: UsuarioService,
    private toastController: ToastController,
    private tokenService: TokenService) {

    this.loginForm = this.fb.group({
      user: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      almacenarDatos:[false]
    });

  }

  tecladoVisible:boolean=false;

  async ngOnInit() {

    this.correoAlmacenado = (await Preferences.get({key:'correoAlmacenado'})).value!;
    if(!this.correoAlmacenado){
      this.correoAlmacenado = "";
    }

    this.passwordAlmacenado = (await Preferences.get({key:'passwordAlmacenado'})).value!;
    if(!this.passwordAlmacenado){
      this.passwordAlmacenado = "";
    }

    this.nombreAlmacenado = (await Preferences.get({key:'nombreAlmacenado'})).value!;
    if(!this.nombreAlmacenado){
      this.nombreAlmacenado = "";
    }

    this.tecladoVisible = false;
    Keyboard.addListener('keyboardWillShow', info =>{
      this.tecladoVisible = true;
    });

    Keyboard.addListener('keyboardDidShow', info =>{
      this.tecladoVisible = true;
    });

    Keyboard.addListener('keyboardWillHide', () =>{
      this.tecladoVisible = false;
    });

    Keyboard.addListener('keyboardDidHide', () =>{
      this.tecladoVisible = false;
    });
  }

  iniciandoSesion:boolean = false;

  onSubmit() {
    if (this.formEnviado) return;

    this.formEnviado = true;
    this.iniciandoSesion = true;

    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      this.formEnviado = false;
      return;
    }

    let almacenarDatosDespues:boolean = this.loginForm.controls["almacenarDatos"].value;

    let user: LoginUsuarioDTO = {
      email: this.loginForm.controls["user"].value,
      password: this.loginForm.controls["password"].value
    };

    if(this.correoAlmacenado != ''){
       user = {
        email: this.correoAlmacenado,
        password: this.passwordAlmacenado 
      };
    } 

    
    this.usuarioService.login(user, true).pipe(
      finalize(() => {
        this.formEnviado = false;
        this.iniciandoSesion = false;
      })
    ).subscribe({
      next: (res) => {

if(almacenarDatosDespues){
   Preferences.set({
    key:'correoAlmacenado', value:user.email
  });

  Preferences.set({
    key:'passwordAlmacenado', value:user.password
  });

}

        this.tokenService.saveToken(res.data);
        this.router.navigate(['/dashboard']);
      },
      error: (res) => {
        this.hasError = true;
        this.messageError = res.error.message;
      }
    });
  }

  getControl(campo: string) {
    return this.loginForm.get(campo);
  }

}
