import { Given, When, Then, Before, After } from "@cucumber/cucumber";
import request from "supertest";
import app from "../../src/app";
import { query } from "../../src/database/connection";

// Test context to store state between steps
interface TestContext {
  response: any;
  userData: any;
  projectData: any;
  token: string | null;
  userId: number | null;
}

let context: TestContext = {
  response: null,
  userData: null,
  projectData: null,
  token: null,
  userId: null,
};

// Cleanup before each scenario
Before(async function () {
  context = {
    response: null,
    userData: null,
    projectData: null,
    token: null,
    userId: null,
  };

  // Clean up test data
  await query(
    "DELETE FROM invoices WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%test%')"
  );
  await query(
    "DELETE FROM projects WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%test%')"
  );
  await query("DELETE FROM users WHERE email LIKE '%test%'");
});

// API Setup
Given("the API is running", function () {
  // API should be running - this is verified by the test framework
});

// Authentication steps
Given("I have valid user registration data", function () {
  context.userData = {
    email: "test@example.com",
    password: "password123",
    name: "Test User",
  };
});

Given("I have invalid user registration data", function () {
  context.userData = {
    email: "invalid-email",
    password: "123",
    name: "",
  };
});

Given("I have valid login credentials", async function () {
  // First register a user
  const userData = {
    email: "test@example.com",
    password: "password123",
    name: "Test User",
  };

  await request(app).post("/api/auth/signup").send(userData);

  context.userData = {
    email: userData.email,
    password: userData.password,
  };
});

Given("I have invalid login credentials", function () {
  context.userData = {
    email: "wrong@example.com",
    password: "wrongpassword",
  };
});

Given("I am authenticated", async function () {
  // Register and login user
  const userData = {
    email: "test@example.com",
    password: "password123",
    name: "Test User",
  };

  await request(app).post("/api/auth/signup").send(userData);

  const loginResponse = await request(app).post("/api/auth/signin").send({
    email: userData.email,
    password: userData.password,
  });

  context.token = loginResponse.body.token;
  context.userId = loginResponse.body.user.id;
});

// Project steps
Given("I have valid project data", function () {
  context.projectData = {
    title: "Test Project",
    description: "This is a test project",
  };
});

Given("I have a project", async function () {
  if (!context.token) {
    throw new Error("User must be authenticated first");
  }

  const projectData = {
    title: "Test Project",
    description: "This is a test project",
  };

  const response = await request(app)
    .post("/api/projects")
    .set("Authorization", `Bearer ${context.token}`)
    .send(projectData);

  context.projectData = response.body;
});

// API Request steps
When("I register a new user", async function () {
  context.response = await request(app)
    .post("/api/auth/signup")
    .send(context.userData);
});

When("I login with credentials", async function () {
  context.response = await request(app)
    .post("/api/auth/signin")
    .send(context.userData);
});

When("I request my profile", async function () {
  context.response = await request(app)
    .get("/api/auth/profile")
    .set("Authorization", `Bearer ${context.token}`);
});

When("I create a new project", async function () {
  context.response = await request(app)
    .post("/api/projects")
    .set("Authorization", `Bearer ${context.token}`)
    .send(context.projectData);
});

When("I get my projects", async function () {
  context.response = await request(app)
    .get("/api/projects")
    .set("Authorization", `Bearer ${context.token}`);
});

When("I update the project", async function () {
  const updateData = {
    title: "Updated Project Title",
    status: "completed",
  };

  context.response = await request(app)
    .put(`/api/projects/${context.projectData.id}`)
    .set("Authorization", `Bearer ${context.token}`)
    .send(updateData);
});

When("I delete the project", async function () {
  context.response = await request(app)
    .delete(`/api/projects/${context.projectData.id}`)
    .set("Authorization", `Bearer ${context.token}`);
});

When("I get available plans", async function () {
  context.response = await request(app).get("/api/plans");
});

When("I subscribe to a plan", async function () {
  const subscriptionData = {
    plan_id: 1,
  };

  context.response = await request(app)
    .post("/api/subscriptions")
    .set("Authorization", `Bearer ${context.token}`)
    .send(subscriptionData);
});

// Assertion steps
Then("I should receive a {int} status code", function (statusCode: number) {
  if (context.response.status !== statusCode) {
    throw new Error(
      `Expected status ${statusCode}, but got ${
        context.response.status
      }. Response: ${JSON.stringify(context.response.body)}`
    );
  }
});

Then("I should receive a success response", function () {
  if (context.response.status < 200 || context.response.status >= 300) {
    throw new Error(
      `Expected success status, but got ${
        context.response.status
      }. Response: ${JSON.stringify(context.response.body)}`
    );
  }
});

Then("I should receive an authentication token", function () {
  if (!context.response.body.token) {
    throw new Error("Expected authentication token in response");
  }
  context.token = context.response.body.token;
});

Then("I should receive user information", function () {
  if (!context.response.body.user) {
    throw new Error("Expected user information in response");
  }
});

Then("I should receive project information", function () {
  if (!context.response.body.id || !context.response.body.title) {
    throw new Error("Expected project information in response");
  }
});

Then("I should receive a list of projects", function () {
  if (!Array.isArray(context.response.body)) {
    throw new Error("Expected array of projects in response");
  }
});

Then("I should receive a list of plans", function () {
  if (
    !Array.isArray(context.response.body) ||
    context.response.body.length === 0
  ) {
    throw new Error("Expected array of plans in response");
  }
});

Then("I should receive subscription confirmation", function () {
  if (!context.response.body.invoice_id) {
    throw new Error("Expected subscription confirmation with invoice_id");
  }
});

Then("the response should contain an error message", function () {
  if (!context.response.body.error) {
    throw new Error("Expected error message in response");
  }
});
