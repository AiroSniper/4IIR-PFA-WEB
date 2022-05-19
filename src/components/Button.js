import React from "react";

const Button = ({ name, onClick }) => {
  return (
    <button
      style={{
        margin: 8,
        padding: "10px 16px",
        color: "white",
        backgroundColor: "#6200EE",
        border: "none",
        borderRadius: ".4rem",
      }}
      onClick={onClick}
    >
      {name}
    </button>
  );
};

export default Button;
