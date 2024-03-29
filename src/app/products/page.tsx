"use client"

import React, {useEffect, useState} from 'react';
import "./page.scss";
import {toast, ToastContainer} from "react-toastify";
import cookieCutter from "cookie-cutter";
import { useRouter } from "next/navigation";
import { motion } from 'framer-motion';
import { FieldValues, useForm} from "react-hook-form";
import {useProductStore} from "@/stores/ProductStore";
import userStore, {useUserStore} from "@/stores/UserStore";
import {Container, Nav, Navbar} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faShoppingCart, faSignOutAlt, faUser, faUserTie} from "@fortawesome/free-solid-svg-icons";


interface UserData {
    role: string;
    _id: number;
    username: string;
    email: string;
}

interface ProductData {
    _id: number;
    naam: string;
    prijs: number;
    categorie: string;
    beschrijving: string;
    "__v": number;
    "aantal": number;
}

const Page = () => {
    const store = useProductStore();
    const userStore = useUserStore();
    const userData = userStore.UserData;

    const canViewPage = userData && userData.role === "admin";
    const [data, setData] = useState<UserData[]>([]);
    const [isLoggedIn, setLoggedIn] = useState(true);
    const router = useRouter();
    const productData = store.productData;
    const [cartItems, setCartItems] = useState<ProductData[]>([]);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [isEditing, setIsEditing] = useState(null);
    const {register, handleSubmit, reset} = useForm();

    useEffect(() => {
        store.getAllProducts()
        userStore.getAllUsers()
        userStore.getUserBySessionToken()

    }, [])
    const onSubmit = async (data: FieldValues, productId: number) => {
        try {
            const url = `${process.env.NEXT_PUBLIC_API_URL}/product/${productId}`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Product update mislukt');
            }

            toast.success(`${data.naam} is succesvol aangepast!`);

            setIsEditing(null);

            store.getAllProducts();
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error('Fout bij het updaten van het product. Probeer het opnieuw.');
        }
    };


    useEffect(() => {
        if(!cookieCutter.get('LARS-AUTH')){
            router.push('/products');
        }
    }, []);

    useEffect(() => {
        if (userData && userData._id) {
            const fetchCartData = async () => {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/${userData._id}`, {credentials: "include"});
                    useEffect(() => {
                        if (userData && userData._id) {
                            const fetchCartData = async () => {
                                try {
                                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/${userData._id}`, {credentials: "include"});
                                    if (!response.ok) {
                                        throw new Error('Failed to fetch cart data');
                                    }
                                    const cartData = await response.json();
                                    setCartItems(cartData.items || []);

                                } catch (error) {
                                    console.error('Error fetching cart data:', error);
                                }
                            };

                            fetchCartData();
                        }
                    }, [userData]);
                    if (!response.ok) {
                        throw new Error('Failed to fetch cart data');
                    }
                    const cartData = await response.json();
                } catch (error) {
                    console.error('Error fetching cart data:', error);
                }
            };

            fetchCartData();
        }
    }, [userData]);

    const handleEditClick = (product : ProductData) => {
        setIsEditing(product._id);
        reset({
            naam: product.naam,
            categorie: product.categorie,
            beschrijving: product.beschrijving,
            prijs: product.prijs,
        });
    };

    const handleLoginClick = () => {
        router.push('/login');
    };



    const addToCart = async (product: ProductData) => {
        const userId = userData?._id;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    productId: product._id,
                    aantal: 1,
                    naam: product.naam,
                    prijs: product.prijs
                }),
                credentials: 'include',
            });

            if (response.ok) {
                toast.success(`${product.naam} is toegevoegd aan de winkelwagen!`);
                const updatedCartResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/${userId}`, { credentials: "include" });
                const updatedCartData = await updatedCartResponse.json();
                setCartItems(updatedCartData.items || []);
            } else {
                toast.error('Fout bij het toevoegen aan de winkelwagen. Probeer het opnieuw.');
            }
        } catch (error) {
            console.error('Error adding product to cart:', error);
            toast.error('Fout bij het communiceren met de server.');
        }
    };
    const addProduct = async (newProductData: FieldValues) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/createProduct`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newProductData),
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Product toevoegen mislukt');
            }

            const addedProduct = await response.json();
            toast.success(`${addedProduct.naam} is succesvol toegevoegd!`);
            setIsCreatingNew(false);
            reset({
                naam: '',
                categorie: '',
                beschrijving: '',
                prijs: '',
            });
        } catch (error) {
            console.error('Error adding product:', error);
            toast.error('Fout bij het toevoegen van het product. Probeer het opnieuw.');
        }
    };

    const deleteProduct = async (productId: number) => {
        try {
            const url = `${process.env.NEXT_PUBLIC_API_URL}/product/${productId}`;
            const response = await fetch(url, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Product kon niet worden verwijderd');
            }

            toast.success('Product succesvol verwijderd');
            store.getAllProducts();
        } catch (error) {
            console.error('Fout bij het verwijderen van het product:', error);
            toast.error('Fout bij het verwijderen van het product');
        }
    };

    const calculateSize = () => {
        let size = 0;
        cartItems.forEach((item) => {
            size += item.aantal;
        });
        return size;
    }


    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5
            }
        }
    };

    const handleLogout = () => {
        cookieCutter.set('LARS-AUTH', '', { expires: new Date(0) });

        setLoggedIn(false);
        toast.success('U bent uitgelogd');
        router.push('/login');
    };

    return (
        <>
            <div className={"container-fluid bg-light"}>
                <Navbar  expand="lg" className=" row__admin shadow-sm sticky-top">
                    <Container>
                        <Navbar.Brand href="/">  <Navbar.Text>
                            Welkom, {userData ? userData.username : 'Loading...'}
                        </Navbar.Text></Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto">
                                <Nav.Link href="/profile">
                                    <FontAwesomeIcon icon={faUser} /> Profiel
                                </Nav.Link>
                                <Nav.Link onClick={() => {
                                    router.push('/products')
                                }}>
                                    <FontAwesomeIcon icon={faShoppingCart} /> Producten
                                </Nav.Link>
                            </Nav>
                            <Nav className="ms-auto">

                                <div className="cart-icon text-start">
                                    <svg onClick={() => {
                                        router.push('/cart')

                                    }}
                                         xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-cart3 cursor-pointer" viewBox="0 0 16 16">
                                        <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L1.01 3.607 0.61 2H0v-.5ZM3.102 4l1.313 7h8.17l1.313-7H3.102Z"/>
                                        <path d="M11 14a2 2 0 1 1-4 0 a2 2 0 0 1 4 0ZM3 14a2 2 0 1 1-4 0 a2 2 0 0 1 4 0Z"/>
                                    </svg>
                                    <span className="cart-count">{calculateSize()}</span>
                                </div>
                                {canViewPage ? (
                                    <>


                                        <Nav.Link onClick={() => router.push('/')}>
                                            <FontAwesomeIcon icon={faSignOutAlt} /> Uitloggen
                                        </Nav.Link>
                                        <Nav.Link onClick={() => router.push('/admin')}>
                                            <FontAwesomeIcon icon={faUserTie} /> Admin Portal
                                        </Nav.Link>

                                    </>
                                ) : (
                               ""
                                )}
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
                {isLoggedIn ? (

                    <motion.div
                        className="row pt-4"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginTop: '20px',
                            width : '100%',
                        }}>
                            <motion.div
                                style={{
                                    display: 'flex',
                                    gap: '20px',
                                    justifyContent: 'center',
                                    padding: '20px',
                                    width : '100%',
                                }}
                                initial="hidden"
                                animate="show"
                                variants={{
                                    hidden: { opacity: 0 },
                                    show: {
                                        opacity: 1,
                                        transition: {
                                            staggerChildren: 0.1
                                        }
                                    }
                                }}
                            >
                                {productData.map((product) => (
                                    <motion.div
                                        className="card h-100 shadow-sm my-card"
                                        key={product._id}
                                        variants={{
                                            hidden: { y: 20, opacity: 0 },
                                            show: { y: 0, opacity: 1 }
                                        }}
                                        whileHover={{ scale: 1.03 }}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            padding: '15px',
                                            borderRadius: '8px',
                                            border: '1px solid #eaeaea',
                                            width : '20%',
                                        }}
                                    >
                                        {isEditing === product._id ? (
                                            <form onSubmit={handleSubmit((data) => onSubmit(data, product._id))} className="card-body">
                                                <input defaultValue={product.naam} {...register("naam")} className="form-control mb-2" />
                                                <input defaultValue={product.categorie} {...register("categorie")} className="form-control mb-2" />
                                                <input defaultValue={product.beschrijving} {...register("beschrijving")} className="form-control mb-2" />
                                                <input defaultValue={product.prijs} {...register("prijs")} type="number" className="form-control mb-2" />
                                                <button type="submit" className="btn btn-primary">Opslaan</button>
                                                <button type="button" onClick={() => setIsEditing(null)} className="btn btn-secondary">Annuleren</button>
                                            </form>
                                        ) : (
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <h5 className="card-title">{product.naam}</h5>
                                                    {canViewPage && (
                                                        <div style={{ display: 'flex', gap: '10px' }}>
                                                            <motion.svg
                                                                whileHover="hover"
                                                                variants={{
                                                                    hover: {
                                                                        scale: 1.2,
                                                                        transition: { duration: 0.2 },
                                                                    },
                                                                }}
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="24"
                                                                height="24"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                onClick={() => handleEditClick(product)}
                                                                style={{ cursor: 'pointer' }}
                                                            >
                                                                <path
                                                                    d="M5 21C4.45 21 3.97917 20.8042 3.5875 20.4125C3.19583 20.0208 3 19.55 3 19V5.00001C3 4.45001 3.19583 3.97917 3.5875 3.58751C3.97917 3.19584 4.45 3.00001 5 3.00001H13.925L11.925 5.00001H5V19H19V12.05L21 10.05V19C21 19.55 20.8042 20.0208 20.4125 20.4125C20.0208 20.8042 19.55 21 19 21H5ZM9 15V10.75L18.175 1.57501C18.375 1.37501 18.6 1.22501 18.85 1.12501C19.1 1.02501 19.35 0.975006 19.6 0.975006C19.8667 0.975006 20.1208 1.02501 20.3625 1.12501C20.6042 1.22501 20.825 1.37501 21.025 1.57501L22.425 3.00001C22.6083 3.20001 22.75 3.42084 22.85 3.66251C22.95 3.90417 23 4.15001 23 4.40001C23 4.65001 22.9542 4.89584 22.8625 5.13751C22.7708 5.37917 22.625 5.60001 22.425 5.80001L13.25 15H9ZM11 13H12.4L18.2 7.20001L17.5 6.50001L16.775 5.80001L11 11.575V13Z"
                                                                    fill="#2559F6"/>                                                            </motion.svg>
                                                            <motion.svg
                                                                whileHover="hover"
                                                                variants={{
                                                                    hover: {
                                                                        scale: 1.2,
                                                                        transition: { duration: 0.2 },
                                                                    },
                                                                }}
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="24"
                                                                height="24"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() => deleteProduct(product._id)}
                                                            >
                                                                <path
                                                                    d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6H4V4H9V3H15V4H20V6H19V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM17 6H7V19H17V6ZM9 17H11V8H9V17ZM13 17H15V8H13V17Z"
                                                                    fill="#2559F6"/>                                                            </motion.svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="card-header">
                                                <h6 className="card-subtitle mb-2 text-muted">{product.categorie}</h6>
                                                </div>
                                                <div className="card-body">
                                                <p className="card-text">{product.beschrijving}</p>
                                                </div>
                                                <div className="card-footer" style={{ borderTop: '1px solid #eaeaea' }}>
                                                    <small className="text-muted">Prijs: €{product.prijs}</small>
                                                    <button className="btn btn-primary float-end"  onClick={() => addToCart(product)}>Add to Cart</button>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </motion.div>
                            {canViewPage && (
                                <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                                    {!isCreatingNew ? (
                                        <motion.svg  onClick={() => setIsCreatingNew(true)} whileHover={{ scale: 1.1 }} xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="currentColor" className="bi bi-plus-circle-fill" viewBox="0 0 16 16" style={{ cursor: 'pointer', margin: '0 auto' }}>
                                            <path d="M 90 31.079 v 27.841 c 0 1.155 -0.936 2.092 -2.092 2.092 H 2.092 C 0.936 61.012 0 60.076 0 58.921 V 31.079 c 0 -1.155 0.936 -2.092 2.092 -2.092 h 85.817 C 89.064 28.988 90 29.924 90 31.079 z"  transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
                                        </motion.svg>
                                    ) : (
                                        <motion.div
                                            className="card h-100 shadow-sm"
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                padding: '15px',
                                                borderRadius: '8px',
                                                border: '1px solid #eaeaea',
                                                maxWidth: '250px',
                                            }}
                                            variants={itemVariants}
                                            initial="hidden"
                                            animate="visible"
                                        >
                                            <form onSubmit={handleSubmit((formData) => {
                                                addProduct(formData);
                                                setIsCreatingNew(false);
                                                reset(
{
                                                        naam: '',
                                                        categorie: '',
                                                        beschrijving: '',
                                                        prijs: '',
                                                    }
                                                )
                                            })}>
                                                <input {...register("naam")} placeholder="Naam" className="form-control mb-2" />
                                                <input {...register("categorie")} placeholder="Categorie" className="form-control mb-2" />
                                                <input {...register("beschrijving")} placeholder="Beschrijving" className="form-control mb-2" />
                                                <input {...register("prijs")} placeholder="Prijs" type="number" className="form-control mb-2" />
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <button type="submit" className="btn btn-primary">Opslaan</button>
                                                    <button type="button" onClick={() => setIsCreatingNew(false)} className="btn btn-secondary">Annuleren</button>
                                                </div>
                                            </form>
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>

                ) : (
                    ""   )}
            </div>
            <ToastContainer position="bottom-right" autoClose={5000} />

        </>

    );
};


export default Page;