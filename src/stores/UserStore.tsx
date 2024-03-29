import { create, StoreApi, UseBoundStore } from 'zustand';
import ApiRoutes from '../constants/ApiRoutes';
interface User {
    role: string;
    _id: number;
    username: string;
    email: string;
}
interface UserStoreState {
    UserData: User;
    setUserData: (users: User) => void;
    getAllUsers: () => void;
    getUserBySessionToken: () => void;
}

const token = localStorage.getItem('token');
export const useUserStore: UseBoundStore<StoreApi<UserStoreState>> =
    create<UserStoreState>((set) => ({
        UserData: {} as User,
        setUserData: (users) => set({ UserData: users }),

       getAllUsers: async () => {
            const response = await fetch(`${ApiRoutes.rootUrl}${ApiRoutes.users.getAll}`, {credentials: "include", headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` }});
            const data = await response.json();

        },

        getUserBySessionToken: async () => {
            const response = await fetch(`${ApiRoutes.rootUrl}${ApiRoutes.users.getMe}`, {credentials: "include", headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` }});
            const data = await response.json();
            set({ UserData: data });
        }
    }));


export default useUserStore;