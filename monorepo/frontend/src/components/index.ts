import React from "react";

export const Dashboard: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Dashboard</h1>
      <p>Welcome to TalaveraTest! This is a basic dashboard component.</p>
      <div style={{ margin: "20px 0" }}>
        <h2>Quick Actions</h2>
        <button style={{ margin: "0 10px", padding: "10px 20px" }}>
          Create Project
        </button>
        <button style={{ margin: "0 10px", padding: "10px 20px" }}>
          View Plans
        </button>
      </div>
    </div>
  );
};

export const Login: React.FC = () => {
  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
      <h1>Login</h1>
      <form style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <input type="email" placeholder="Email" style={{ padding: "10px" }} />
        <input
          type="password"
          placeholder="Password"
          style={{ padding: "10px" }}
        />
        <button
          type="submit"
          style={{
            padding: "12px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Sign In
        </button>
      </form>
    </div>
  );
};

export const Projects: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Projects</h1>
      <p>Manage your projects here.</p>
      <button
        style={{
          padding: "10px 20px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "4px",
        }}
      >
        Create New Project
      </button>
    </div>
  );
};
