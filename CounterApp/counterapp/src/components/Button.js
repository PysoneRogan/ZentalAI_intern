import React from 'react';

function Button({ onClick, children, styleType = "primary" }) {
  const baseStyle = {
    padding: "10px 20px",
    fontSize: "16px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    margin: "15px"
    
  };

  const styleVariants = {
    primary: { backgroundColor: "#dc3545", color: "#fff" },
    secondary: { backgroundColor: "#6c757d", color: "#fff" },
    success: { backgroundColor: "#28a745", color: "#fff" },
    danger: { backgroundColor: "#007bff", color: "#fff" }
  };

  const buttonStyle = { ...baseStyle, ...styleVariants[styleType] };

  return (
    <button onClick={onClick} style={buttonStyle}>
      {children}
    </button>
  );
}

export default Button;
