import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../security/auth.guard";
import { ContratosAutorizacoesComponent } from "./contratos-autorizacoes.component";

const routes: Routes = [
  {
    canActivate: [AuthGuard],
    children: [ ],
    component: ContratosAutorizacoesComponent,
    path: "contratos-autorizacoes",
  },
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forChild(routes)],
})
export class ContratosAutorizacoesRoutingModule { }
