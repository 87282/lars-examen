"use client";

import React, {useEffect, useState} from 'react';
import "./page.scss";
import {useRouter} from "next/navigation";
import {toast, ToastContainer} from "react-toastify";
import cookieCutter from "cookie-cutter";
import { motion } from 'framer-motion';

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
    items: ProductData[];
}

interface CartData {
    _id: string;
    items: ProductData[];
    user: string;
    __v: number;
}

const Page = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const canViewPage = userData && userData.role === "admin";
    const [data, setData] = useState<UserData[]>([]);
    const [isLoggedIn , setLoggedIn] = useState(true);
    const router = useRouter();
    const [cartData, setCartData] = useState<CartData | null>(null);
    const [cartItems, setCartItems] = useState<ProductData[]>([]);
    const [totalPrice, setTotalPrice] = useState<number>(0);

    const handleLoginClick = () => {
        router.push('/login');
    };

    const handleLogout = () => {
        cookieCutter.set('LARS-AUTH', '', { expires: new Date(0) });

        setLoggedIn(false);
        toast.success('U bent uitgelogd');
        router.push('/login');
    };

    const calculateSize = () => {
        let size = 0;
        cartItems.forEach((item) => {
            size += item.aantal;
        });
        return size;
    }

    useEffect(() => {
        if(!cookieCutter.get('LARS-AUTH')){
            window.location.href = '/login';
        }

        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:8081/users', {credentials: "include"});
                const data = await response.json();
                setData(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        const fetchUserData = async () => {
            try {
                const response = await fetch('http://localhost:8081/me', {credentials: "include"});
                const userData = await response.json();
                setUserData(userData);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchUserData();
        fetchData();
    }, []);

    useEffect(() => {
        const fetchCartData = async () => {
            try {
                if (userData && userData._id) {
                    const response = await fetch(`http://localhost:8081/cart/${userData._id}`, { credentials: "include" });
                    if (!response.ok) {
                        throw new Error('Failed to fetch cart data');
                    }
                    const cartData = await response.json();
                    setCartData(cartData);
                    calculateTotalPrice(cartData.items || []);
                }
            } catch (error) {
                console.error('Error fetching cart data:', error);
            }
        };

        fetchCartData();
    }, [userData]);

    const listVariants = {
        hidden: { opacity: 0, x: -100 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { x: -10, opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
            },
        },
    };
    const calculateTotalPrice = (cartItems: ProductData[]) => {
        let total = 0;
        cartItems.forEach(item => {
            total += item.prijs * item.aantal;
        });
        setTotalPrice(total);
    }

    return (
        <>
            <div className={"container-fluid bg-light"}>
                <div className="row row__admin shadow-sm sticky-top">
                    <div className="col-6">
                        <p className={"text__nav"}>Welkom, {userData ? userData.username : 'Loading...'}</p>
                    </div>
                    <div className="col-6">
                        {canViewPage ?
                            (
                                <button className="btn btn-primary text-end float-end ml-3" onClick={() => {
                                    router.push('/admin')
                                }}>
                                    Admin Portal
                                </button>
                            ):(
                                ""
                            )}
                        {isLoggedIn ? (
                            <>


                                <button className="btn btn-primary text-end float-end" onClick={handleLogout}>
                                    Uitloggen
                                </button>
                            </>
                        ) : (
                            <p className="text-end text__nav" onClick={handleLoginClick}>
                                Login
                            </p>
                        )}
                    </div>
                </div>
                {isLoggedIn ? (
                    <div className="row pt-4 justify-content-center">
                        <div className="col-8">
                            <h2 className="text-center">Winkelmandje</h2>
                            <motion.ul
                                className="list-unstyled"
                                variants={listVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                {cartData && cartData.items.map((item) => (
                                    <motion.li key={item._id} className="border-bottom mb-3 pb-3" variants={itemVariants}>
                                        <h4>{item.naam}</h4>
                                        <p>Aantal: {item.aantal}</p>
                                        <p>Prijs per stuk: €{item.prijs}</p>
                                    </motion.li>
                                ))}
                            </motion.ul>
                            <p className="text-center">Totaalprijs: €{totalPrice}</p>
                            <div className="text-center">
                                <button className="btn btn-primary">Afrekenen</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    ""   )}
            </div>
            <ToastContainer position="bottom-right" autoClose={5000} />

        </>

    );
};

export default Page;