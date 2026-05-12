import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'home/personal/editar/:id',
    renderMode: RenderMode.Client // <-- Le dice a Angular: "No prerenderices esto, que lo haga el navegador del usuario"
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
