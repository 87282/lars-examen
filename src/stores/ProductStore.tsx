import { create, StoreApi, UseBoundStore } from 'zustand';
import ApiRoutes from '../constants/ApiRoutes';
interface Product {
    _id: number;
    naam: string;
    prijs: number;
    categorie: string;
    beschrijving: string;
}

interface ProductStoreState {
    productData: Product[];
    setProductData: (products: Product[]) => void;
    getAllProducts: () => void;
    deleteProduct: (id: number) => void;
}

export const useProductStore: UseBoundStore<StoreApi<ProductStoreState>> =
    create<ProductStoreState>((set) => ({
        productData: [],
        setProductData: (products) => set({ productData: products }),

        getAllProducts: async () => {
            const response = await fetch(`${ApiRoutes.rootUrl}${ApiRoutes.products.getAll}`, {credentials: "include"});
            const data = await response.json();
            set({ productData: data });
        },

        deleteProduct: async (id: number) => {
            await fetch(`${ApiRoutes.rootUrl}${ApiRoutes.products.deleteProduct}/${id}`, {
                method: 'DELETE',
                credentials: "include"
            });
            set({ productData: [] });
        }
    }));
