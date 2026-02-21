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