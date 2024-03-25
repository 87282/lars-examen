interface ApiRoutesInterface {
    rootUrl: string | undefined
    notes: {
        get: string
    }
    users: {
        getAll: string
        getMe: string
    }

    products: {
        getAll: string
        deleteProduct: string
    }

}

const ApiRoutes: ApiRoutesInterface = {
    rootUrl: process.env.NEXT_PUBLIC_API_URL,
    notes: {
        get: 'notes',
    },
    users : {
        getAll: '/users',
        getMe: '/me'
    },

    products : {
        getAll: '/getProducten',
        deleteProduct: '/product'
    }

}
export default ApiRoutes
