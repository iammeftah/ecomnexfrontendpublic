export interface AuthRequest {
    username?: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    roles?: string[]; // Add this field
}

export interface AuthResponse {
    token: string;
    type: string;
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    roles: string[];
}

export interface User {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    roles: string[];
}

export interface UserUpdateRequest {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    phone?: string;
}

export interface ApiResponse {
    success: boolean;
    message: string;
}
