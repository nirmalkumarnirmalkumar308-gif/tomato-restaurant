import React from "react";
import { HiArrowLeft } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import "./AdminBackButton.css";

const AdminBackButton = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/admin");
  };

  return (
    <button
      type="button"
      className="admin-back-dashboard"
      onClick={handleBack}
    >
      <HiArrowLeft />
      <span>Back to Dashboard</span>
    </button>
  );
};

export default AdminBackButton;