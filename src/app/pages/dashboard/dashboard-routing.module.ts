import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardPage } from './dashboard.page';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { EmpresaResolver } from 'src/app/resolvers/empresas.resolver';
import { ConfiguracionResolver } from 'src/app/resolvers/configuracion.resolver';

const routes: Routes = [
  {
    path: '',
    component: DashboardPage,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'network',
        loadChildren: () => import('../empresas.network/empresas.network.module').then(m => m.EmpresasNetworkPageModule),
        resolve: {
          resolverData: EmpresaResolver
        }
      },
      {
        path: 'configuracion',
        loadChildren: () => import('../configuracion/configuracion.module').then(m => m.ConfiguracionPageModule),
        resolve: {
          resolverData: ConfiguracionResolver
        }
      },
      {
        path: 'referidos',
        loadChildren: () => import('../referidos/referidos.module').then(m => m.ReferidosPageModule),
      },
      {
        path: 'empresa/detalle',
        loadChildren: () => import('../empresa.details/empresa.details.module').then(m => m.EmpresaDetailsPageModule),
      },
      {
        path: '',
        redirectTo: '/dashboard/network',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardPageRoutingModule { }