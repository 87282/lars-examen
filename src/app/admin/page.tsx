"use client";

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import OverviewUser from "@/app/components/OverviewUser/user";
import "./page.scss";
import {Button, Container, Form, Modal, Nav, Navbar, } from "react-bootstrap";
import { useRouter } from 'next/navigation'
import cookieCutter from 'cookie-cutter';
import {toast, ToastContainer} from "react-toastify";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faShoppingCart, faSignOutAlt, faUser, faUserTie} from "@fortawesome/free-solid-svg-icons";

interface UserData {
  role: string;
  _id: number;
  username: string;
  email: string;
  password: string;
}

const Page = () => {
  const [data, setData] = useState<UserData[]>([]);
  const { control, handleSubmit, setValue } = useForm();
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [ , setLoggedIn] = useState(true);
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [userData, setUserData] = useState<UserData[]>([]);
const [ showNewUserModal, setShowNewUserModal ] = useState(false);

  const canViewPage = userData && userData.role !== "user";

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);


  useEffect(() => {
    if(!cookieCutter.get('LARS-AUTH')){
      router.push('/admin');
    }

    const fetchData = async () => {
      let token;
      if (typeof window !== "undefined") {
        token = localStorage.getItem('token');
      }
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {credentials: "include", headers: {
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {credentials: "include", headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },});
        const userData = await response.json();
        setUserData(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
    fetchData();
  }, []);


  const handleUserClick = (user: any) => {
    setSelectedUser(user);
    setValue('username', user.username);
    setValue('email', user.email);
    setValue('role', user.role);
  };
  const handleDeleteUser = async () => {
    let token;
    if (typeof window !== "undefined") {
      token = localStorage.getItem('token');
    }
    console.log("Selected user at delete:", selectedUser);
    if (selectedUser && selectedUser._id) {
      const deleteUserUrl = `${process.env.NEXT_PUBLIC_API_URL}/users/${selectedUser._id}`;

      try {
        const response = await fetch(deleteUserUrl, {
          method: 'DELETE',
          credentials: "include",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          toast.success('Gebruiker succesvol verwijderd');
          setData(data.filter(user => user._id !== selectedUser._id));
          setShow(false);
        } else {
          toast.error('Er is iets misgegaan bij het verwijderen van de gebruiker');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Er is een fout opgetreden bij het verwijderen');
      }
    }
  };

  const onSubmitNewUser = async (formData: any) => {
    let token;
    if (typeof window !== "undefined") {
      token = localStorage.getItem('token');
    }
    const createUserUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/register`;

    const { password, ...formDataWithoutPassword } = formData;

    try {
      const response = await fetch(createUserUrl, {
        method: 'POST',
        body: JSON.stringify(formData),
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        handleClose();
        const newUser: UserData = await response.json();
        toast.success('Gebruiker succesvol aangemaakt');
        setData(prevData => [...prevData, newUser]);
        setShowNewUserModal(false);

      } else {
        toast.error('Er is iets misgegaan bij het aanmaken van de gebruiker');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Er is een fout opgetreden');
    }
  }
  const onSubmit = async (formData: any) => {
    let token;
    if (typeof window !== "undefined") {
      token = localStorage.getItem('token');
    }

    if (selectedUser && selectedUser._id) {
      const updateUserUrl = `${process.env.NEXT_PUBLIC_API_URL}/users/${selectedUser._id}`;

      try {
        const response = await fetch(updateUserUrl, {
          method: 'PUT',
          body: JSON.stringify(formData),
          credentials: "include",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          handleClose();
          toast.success('Gebruiker succesvol bijgewerkt');
          setData(await response.json());
        } else {
          toast.error('Er is iets misgegaan bij het bijwerken van de gebruiker');
        }
      } catch (error) {
        console.error('Error updating user:', error);
        toast.error('Er is een fout opgetreden');
      }
    }
  };



  return (
    <>
      <Modal show={showNewUserModal} onHide={() => setShowNewUserModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Nieuwe gebruiker aanmaken</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(onSubmitNewUser)}>
            <Form.Group className="mb-3">
              <Form.Label>Gebruikersnaam</Form.Label>
              <Controller
                  name="username"
                  control={control}
                  render={({ field }) => <Form.Control {...field} placeholder="Gebruikersnaam" />}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Controller
                  name="email"
                  control={control}
                  render={({ field }) => <Form.Control type="email" {...field} placeholder="Email" />}
              />
            </Form.Group>


            <Form.Group className="mb-3">
              <Form.Label>Wachtwoord</Form.Label>
              <Controller
                  name="password"
                  control={control}
                  render={({ field }) => <Form.Control type="password" {...field} placeholder="Wachtwoord" />}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Rol</Form.Label>
              <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                      <Form.Select {...field}>
                        <option value="user">Gebruiker</option>
                        <option value="admin">Admin</option>
                      </Form.Select>
                  )}
              />
            </Form.Group>
            <button className={"btn btn-primary"} type={"submit"}>Opslaan</button>
          </Form>
        </Modal.Body>
      </Modal>





      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Account informatie van {selectedUser ? selectedUser.username : 'Gebruiker'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Controller
                  name="username"
                  control={control}
                  render={({ field }) => (
                      <Form.Control size="lg" {...field} placeholder="Gebruikersnaam" />
                  )}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Email address</Form.Label>
              <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                      <Form.Control size="lg" type="email" {...field} placeholder="E-mailadres" />
                  )}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Rol</Form.Label>
              <div style={{ display: 'flex', justifyContent: 'start', gap: '20px', marginBottom : '20px' }}>

                <Controller
                  name="role"
                  control={control}
                  defaultValue={selectedUser?.role}
                  render={({ field: { onChange, value } }) => (
                      <>
                        <Form.Check
                            type="checkbox"
                            label="Admin"
                            id="role-admin"
                            checked={value === "admin"}
                            onChange={() => onChange("admin")}
                        />
                        <Form.Check
                            type="checkbox"
                            label="User"
                            id="role-user"
                            checked={value === "user"}
                            onChange={() => onChange("user")}
                        />
                      </>
                  )}
              />
              </div>
            </Form.Group>
            <div className="d-flex justify-content-between">
              <Button variant="secondary" onClick={handleClose}>
                Sluiten
              </Button>
              <Button variant="primary" type="submit">
                Wijzigingen Opslaan
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>


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
      {canViewPage ? (

        <div className="row row__admin">
          <div className="col-3">

          </div>
          <div className="col-5">
            {data?.map((user: any) => (
              <OverviewUser
                key={user.id}
                name={user.username}
                id={user.id}
                email={user.email}
                onClick={() => {
                  handleShow();
                  handleUserClick(user);
                }}
                onClick2={() => {
                  setSelectedUser(user);
                  handleDeleteUser();
                }
                }
              />
            ))}
            <button className={"btn btn-primary"} onClick={() => {
                setShowNewUserModal(true);

            }}>+ Maak een nieuwe gebruiker</button>
          </div>
          <div className="col-4">

          </div>
        </div>

      ) : (
          ""
   )}
    </div>
      <ToastContainer position="bottom-right" autoClose={5000} />

    </>
  );
};

export default Page;

