export interface Team {
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'active' | 'invited' | 'archived';
    invitedAt?: string;
    joinedAt?: string;
}
