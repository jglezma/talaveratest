Feature: Authentication
  As a user
  I want to be able to sign up and sign in
  So that I can access the application

  Background:
    Given the API is running

  Scenario: User signup with valid data
    Given I have valid user registration data
    When I send a POST request to "/api/auth/signup"
    Then the response status should be 201
    And the response should contain a user object
    And the response should contain a JWT token

  Scenario: User signup with invalid email
    Given I have invalid email format
    When I send a POST request to "/api/auth/signup"
    Then the response status should be 400
    And the response should contain validation errors

  Scenario: User signup with existing email
    Given a user already exists with email "test@example.com"
    When I try to signup with the same email
    Then the response status should be 400
    And the response should contain "User with this email already exists"

  Scenario: User signin with valid credentials
    Given a user exists with email "test@example.com" and password "password123"
    When I send a POST request to "/api/auth/signin" with valid credentials
    Then the response status should be 200
    And the response should contain a user object
    And the response should contain a JWT token

  Scenario: User signin with invalid credentials
    When I send a POST request to "/api/auth/signin" with invalid credentials
    Then the response status should be 401
    And the response should contain "Invalid credentials"

  Scenario: Get user profile with valid token
    Given I am authenticated as a user
    When I send a GET request to "/api/auth/profile"
    Then the response status should be 200
    And the response should contain user profile data

  Scenario: Get user profile without token
    When I send a GET request to "/api/auth/profile" without authentication
    Then the response status should be 401
    And the response should contain "Access token required"