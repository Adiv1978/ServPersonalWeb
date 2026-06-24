export interface LoginRequest {
    nick: string;
    pass: string;
}

export interface Session {
    token: string;
    usuarioId: number;
    rol: number;
}

export interface UpdatePasswordRequest {
    token: string;
    nick: string;
    passActual: string;
    passNuevo: string;
}
