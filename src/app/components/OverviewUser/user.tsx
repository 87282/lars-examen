import React from 'react';
import "./page.scss";
import Image from "next/image";
import { motion } from 'framer-motion';

interface overviewUser {
  name: string;
  email: string;
  id: number;
  onClick: () => void;
  onClick2: () => void;
}

const OverviewUser = (user: overviewUser) => {

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const svgHoverVariants = {
    hover: {
      scale: 1.2,
      transition: { duration: 0.2 }
    }
  };

  return (
      <motion.div
          className="padding-10 account-row"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
      >
        <div className="row account-highlight shadow-sm ">
          <div className="col-2"></div>
          <div className="col-10">
            <div className="profile-text row d-flex align-items-center justify-content-center py-2">
              <div className="col-4 col-md-6 col-lg-4">
                <p className="profile-p mb-0">{user.name}</p>
              </div>
              <div className="col-4 col-md-6 col-lg-4 text-center">
                <p className="mb-0">{user.email}</p>
              </div>
              <div className="col-4 col-md-12 col-lg-4 d-flex justify-content-end">
                <motion.svg
                    whileHover="hover"
                    variants={svgHoverVariants}
                    onClick={user.onClick}
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                >
                  <path d="M5 21C4.45 21 3.97917 20.8042 3.5875 20.4125C3.19583 20.0208 3 19.55 3 19V5.00001C3 4.45001 3.19583 3.97917 3.5875 3.58751C3.97917 3.19584 4.45 3.00001 5 3.00001H13.925L11.925 5.00001H5V19H19V12.05L21 10.05V19C21 19.55 20.8042 20.0208 20.4125 20.4125C20.0208 20.8042 19.55 21 19 21H5ZM9 15V10.75L18.175 1.57501C18.375 1.37501 18.6 1.22501 18.85 1.12501C19.1 1.02501 19.35 0.975006 19.6 0.975006C19.8667 0.975006 20.1208 1.02501 20.3625 1.12501C20.6042 1.22501 20.825 1.37501 21.025 1.57501L22.425 3.00001C22.6083 3.20001 22.75 3.42084 22.85 3.66251C22.95 3.90417 23 4.15001 23 4.40001C23 4.65001 22.9542 4.89584 22.8625 5.13751C22.7708 5.37917 22.625 5.60001 22.425 5.80001L13.25 15H9ZM11 13H12.4L18.2 7.20001L17.5 6.50001L16.775 5.80001L11 11.575V13Z" fill="#2559F6"/>                </motion.svg>
                <motion.svg
                    whileHover="hover"
                    variants={svgHoverVariants}
                    onClick={user.onClick2}
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                >
                  <path d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6H4V4H9V3H15V4H20V6H19V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM17 6H7V19H17V6ZM9 17H11V8H9V17ZM13 17H15V8H13V17Z" fill="#2559F6"/>                </motion.svg>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
  );
};

export default OverviewUser;