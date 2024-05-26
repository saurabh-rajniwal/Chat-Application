import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return new Promise<boolean>((resolve) => {
        authService.getAuthState((user) => {
            const isAuthenticated = !!user;
            if (!isAuthenticated) {
                router.navigate(['/login']);
            }
            resolve(isAuthenticated);
        });
    });
};

export const redirectLoggedIn: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return new Promise<boolean>((resolve) => {
        authService.getAuthState((user) => {
            if (user) {
                router.navigate(['/chats']);
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
};