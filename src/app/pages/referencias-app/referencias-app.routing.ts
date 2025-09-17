import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReferenciasAppPage } from './referencias-app.page';

const routes: Routes = [
  { path: '', component: ReferenciasAppPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReferenciasAppRouting {}
