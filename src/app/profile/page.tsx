"use client";

import React, {useEffect, useState} from 'react';
import {Container, Row, Col, Button, ListGroup, Form, Navbar, Nav} from 'react-bootstrap';
import "./page.scss";
import useUserStore from "@/stores/UserStore";
import {router} from "next/client";
import {useRouter} from "next/navigation";
import { useForm, Controller } from 'react-hook-form';
import {toast, ToastContainer} from "react-toastify";
import {faShoppingCart, faSignOutAlt, faUser, faUserTie} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

interface UserData {
    role: string;
    _id: number;
    username: string;
    email: string;
}

interface MailData {
    name: string;
    email: string;
    message: string;
}

const Page = () => {
    const [data , setData] = useState<UserData[]>([]);
    const userData = useUserStore(state => state.UserData);
    const getUserBySessionToken = useUserStore(state => state.getUserBySessionToken);
    const canViewPage = userData && userData.role === "admin";
    const router = useRouter();
    const [key, setKey] = useState('profile');
    const { control, handleSubmit, setValue } = useForm();


    const { register, formState: { errors }, reset } = useForm<MailData>();

    const onSubmit2 = (data: MailData) => {
        const { name, email, message } = data;
        const mailtoLink = `mailto:info@jouwbedrijf.com?subject=Contactverzoek van ${name}&body=${message}%0D%0A%0D%0AContactgegevens:%0D%0AEmail: ${email}`;
        window.location.href = mailtoLink;
        reset();
    };
    useEffect(() => {
        getUserBySessionToken();
    }, [getUserBySessionToken]);

    useEffect(() => {
        setValue('username', userData?.username || '');
        setValue('email', userData?.email || '');
    }, [userData, setValue]);


    const onSubmit = async (formData: any) => {

        if (userData && userData._id) {
            const updateUserUrl = `${process.env.NEXT_PUBLIC_API_URL}/users/${userData._id}`;
let token;
        if (typeof window !== 'undefined') {
            token = localStorage.getItem('token');
        }
            try {
                const response = await fetch(updateUserUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(formData),
                    credentials: "include",
                });

                if (response.ok) {
                    toast.success('Gebruiker succesvol bijgewerkt');
                    setData(await response.json());
                    getUserBySessionToken();
                } else {
                    toast.error('Er is iets misgegaan bij het bijwerken van de gebruiker');
                }
            } catch (error) {
                console.error('Error updating user:', error);
                toast.error('Er is een fout opgetreden');
            }
        }
    };
    const renderContent = () => {
        switch(key) {
            case 'profile':
                return (
                    <>
                        <div className="user-details">
                            <div className="user-initials">{userData.username ? userData.username[0] : ''}</div>
                            <h2>{userData.username ? userData.username : 'Loading...'}</h2>
                        </div>
                        <Form onSubmit={handleSubmit(onSubmit)}>
                            <Form.Group className="mb-3">
                                <Form.Label>Username</Form.Label>
                                <Controller
                                    name="username"
                                    control={control}
                                    render={({field}) => (
                                        <Form.Control size="lg" {...field} placeholder="Gebruikersnaam"/>
                                    )}/>
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label>Email address</Form.Label>
                                <Controller
                                    name="email"
                                    control={control}
                                    render={({field}) => (
                                        <Form.Control size="lg" type="email" {...field} placeholder="E-mailadres"/>
                                    )}/>
                            </Form.Group>


                            <button className={"btn btn-primary"} type="submit">Opslaan</button>
                        </Form></>
                );
            case 'orders':
                return (
                    <>
                        <div className="user-details">
                            <div className="user-initials">{userData.username ? userData.username[0] : ''}</div>
                            <h2>{userData.username ? userData.username : 'Loading...'}</h2>
                        </div>
                        <h3>Laatste orders</h3><ListGroup>
                        <ListGroup.Item className="order-item">
                            Geen bestelling geplaatst nog
                        </ListGroup.Item>

                    </ListGroup>
            </>

                );
            case 'contact':
                return(
                <div>
                <div className="user-details">
                    <div className="user-initials">{userData.username ? userData.username[0] : ''}</div>
                    <h2>{userData.username ? userData.username : 'Loading...'}</h2>
                </div>
                <Form onSubmit={handleSubmit(onSubmit2)}>
                    <Form.Group className="mb-3">
                        <Form.Label>Naam</Form.Label>
                        <Form.Control type="text" placeholder="Jouw naam" {...register('name', { required: true })} />
                        {errors.name && <p className="text-danger">Naam is verplicht</p>}
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" placeholder="Jouw email" {...register('email', { required: true })} />
                        {errors.email && <p className="text-danger">Email is verplicht</p>}
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Bericht</Form.Label>
                        <Form.Control as="textarea" rows={3} placeholder="Jouw bericht" {...register('message', { required: true })} />
                        {errors.message && <p className="text-danger">Bericht is verplicht</p>}
                    </Form.Group>

                    <Button variant="primary" type="submit">
                        Verstuur
                    </Button>
                </Form>
                </div>);
            default:
                return <div>Selecteer een tab</div>;
        }
    };


    return (
        <>
            <Navbar  expand="lg" className=" row__admin shadow-sm sticky-top">
                <Container>
                    <Navbar.Brand >  <Navbar.Text>
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
        <Container className="profile-page mt-10">
            <Row>
                <Col md={4} className="sidebar">
                    <ListGroup>
                        <ListGroup.Item action onClick={() => setKey('profile')} className="sidebar-item">Profile</ListGroup.Item>
                        <ListGroup.Item action onClick={() => setKey('orders')} className="sidebar-item">Orders</ListGroup.Item>
                        <ListGroup.Item action onClick={() => setKey('contact')} className="sidebar-item">Contact</ListGroup.Item>
                    </ListGroup>
                </Col>
                <Col md={8} className="order-details">
                    {renderContent()}
                </Col>
            </Row>
        </Container>
            <ToastContainer position="bottom-right" autoClose={5000} />

        </>
    );
};

export default Page;
