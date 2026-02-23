export interface LoginRequest {
    nick: string;
    pass: string;
    minutos: number;
}

export interface Session {
    token: string;
    usuarioId: number;
    rol: number;
}

export interface UpdatePasswordRequest {
    token: string;
    minutos: number;
    nick: string;
    passActual: string;
    passNuevo: string;
}
