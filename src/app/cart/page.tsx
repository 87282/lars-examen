"use client";

import React, {useEffect, useState} from 'react';
import "./page.scss";
import {useRouter} from "next/navigation";
import {toast, ToastContainer} from "react-toastify";
import cookieCutter from "cookie-cutter";
import { motion } from 'framer-motion';
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



    useEffect(() => {


        const fetchData = async () => {
            let token;
            if (typeof window !== "undefined") {
                token = localStorage.getItem('token');
            }
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/`, {credentials: "include", headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },});
                const data = await response.json();
                setData(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        const fetchUserData = async () => {
            let token;
            if (typeof window !== "undefined") {
                token = localStorage.getItem('token');
            }
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`
                ,{headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                credentials: "include"}
                );
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
            let token;
            if (typeof window !== "undefined") {
                token = localStorage.getItem('token');
            }
            try {
                if (userData && userData._id) {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/${userData._id}`, { credentials: "include", headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        }, });
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
                <Navbar  expand="lg" className=" row__admin shadow-sm sticky-top">
                    <Container>
                        <Navbar.Brand>  <Navbar.Text>
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
                                    <Nav.Link onClick={() => router.push('/login')}>
                                        <FontAwesomeIcon icon={faSignOutAlt} /> Uitloggen
                                    </Nav.Link>
                                )}
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
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