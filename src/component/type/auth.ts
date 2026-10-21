export type LoginPayload = {
    email: string;
    password: string;
};

export type RegisterPayload = {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    userName: string;
};

export type RegisterResponse = {
    success: boolean;
    message: string;
    data: { id: string; email: string };
};
