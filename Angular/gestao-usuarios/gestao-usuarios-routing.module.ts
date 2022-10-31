import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../security/auth.guard";
import { GestaoPerfisModalComponent } from "./gestao-perfis-modal/gestao-perfis-modal.component";
import { GestaoServentiasModalComponent } from "./gestao-serventias-modal/gestao-serventias-modal.component";
import { GestaoUsuariosComponent } from "./gestao-usuarios.component";

const routes: Routes = [
  {
    canActivate: [AuthGuard],
    children: [
      { path: "gestao-perfis-modal", component: GestaoPerfisModalComponent, canActivate: [AuthGuard] },
      { path: "gestao-serventias-modal", component: GestaoServentiasModalComponent, canActivate: [AuthGuard] },
    ],
    component: GestaoUsuariosComponent,
    path: "gestao-usuarios",
  },
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forChild(routes)],
})
export class GestaoUsuariosRoutingModule {}
