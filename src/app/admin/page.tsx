"use client";

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import OverviewUser from "@/app/components/OverviewUser/user";
import "./page.scss";
import {Button, Form, Modal, Nav, Row, Tab} from "react-bootstrap";
import {useRouter} from "next/navigation";
import cookieCutter from 'cookie-cutter';
import {toast, ToastContainer} from "react-toastify";

interface UserData {
  role: string;
  _id: number;
  username: string;
  email: string;
}

const Page = () => {
  const [data, setData] = useState<UserData[]>([]);
  const { control, handleSubmit, setValue } = useForm();
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [ , setLoggedIn] = useState(true);
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [userData, setUserData] = useState<UserData[]>([]);


  const canViewPage = userData && userData.role !== "user";

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);


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


  const handleUserClick = (user: any) => {
    setSelectedUser(user);
    setValue('username', user.username);
    setValue('email', user.email);
    setValue('role', user.role);
  };
  const handleDeleteUser = async () => {
    console.log("Selected user at delete:", selectedUser);
    if (selectedUser && selectedUser._id) {
      const deleteUserUrl = `http://localhost:8081/users/${selectedUser._id}`;

      try {
        const response = await fetch(deleteUserUrl, {
          method: 'DELETE',
          credentials: "include",
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

  const onSubmit = async (formData: any) => {
    console.log(selectedUser)

    if (selectedUser && selectedUser._id) {
      const updateUserUrl = `http://localhost:8081/users/${selectedUser._id}`;

      try {
        const response = await fetch(updateUserUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
          credentials: "include",
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

  const handleLoginClick = () => {
    router.push('/login');
  };

  const handleLogout = () => {
    cookieCutter.set('LARS-AUTH', '', { expires: new Date(0) });

    setLoggedIn(false);
    toast.success('U bent uitgelogd');
    router.push('/login');
  };

  return (
    <>
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
      <div className="row row__admin shadow-sm sticky-top">
        <div className="col-6">
          <p className={"text__nav"}>Welkom, {userData ? userData.username : 'Loading...'}</p>
        </div>
        <div className="col-6">
          {canViewPage ? (
              <div>
            <button className="btn btn-primary text-end float-end" onClick={handleLogout}>
              Uitloggen
            </button>

              <button className="btn btn-primary text-end float-end" onClick={() =>{
                window.location.href = '/products'

              }}>
                Klanten pagina
              </button>
              </div>
          ) : (
            <p className="text-end text__nav" onClick={handleLoginClick}>
              Login
            </p>
          )}
        </div>
      </div>
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
          </div>
          <div className="col-4">

          </div>
        </div>

      ) : (
window.location.href = '/login'    )}
    </div>
      <ToastContainer position="bottom-right" autoClose={5000} />

    </>
  );
};

export default Page;

