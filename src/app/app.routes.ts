import { Routes } from '@angular/router';
import { authGuard, redirectLoggedIn } from './guards/AuthGuard';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    {
        path: 'login',
        loadComponent: () =>
            import('./login/login.component').then((m) => m.LoginComponent),
        canActivate: [redirectLoggedIn],
    },
    {
        path: 'register',
        loadComponent: () =>
            import('./register/register.component').then((m) => m.RegisterComponent),
        canActivate: [redirectLoggedIn],

    },
    {
        path: 'chats',
        loadComponent: () =>
            import('./chat/chat.component').then((m) => m.ChatComponent),
        canActivate: [authGuard],
    },
    {
        path: 'chats/:username',
        loadComponent: () =>
            import('./chat/chat.component').then((m) => m.ChatComponent),
        canActivate: [authGuard],
    },
    {
        path: '**', redirectTo: '/login',

    }, // Wildcard route for a 404 page
];
