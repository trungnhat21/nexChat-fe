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

export type CurrentUser = { id: string; email: string; userName: string | null; firstName: string | null; lastName: string | null; avatar: string | null; status: string; createdAt: string; updatedAt: string };
export type AuthSession = { accessToken: string; currentUser: CurrentUser };
