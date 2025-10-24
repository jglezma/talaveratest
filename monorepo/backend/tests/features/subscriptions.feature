Feature: Subscriptions and Plans
  As a user
  I want to view and subscribe to plans
  So that I can access premium features

  Background:
    Given the API is running

  Scenario: Get available plans
    When I send a GET request to "/api/subscriptions/plans"
    Then the response status should be 200
    And the response should contain a list of plans
    And each plan should have required fields

  Scenario: Create subscription with valid plan
    Given I am authenticated as a user
    And a plan exists with ID 1
    When I send a POST request to "/api/subscriptions" with plan ID 1
    Then the response status should be 201
    And the response should contain the created subscription
    And the subscription status should be "paid"

  Scenario: Create subscription with invalid plan
    Given I am authenticated as a user
    When I send a POST request to "/api/subscriptions" with plan ID 999
    Then the response status should be 400
    And the response should contain "Plan not found"

  Scenario: Create subscription without authentication
    When I send a POST request to "/api/subscriptions" without authentication
    Then the response status should be 401
    And the response should contain "User not authenticated"

  Scenario: Get user subscriptions
    Given I am authenticated as a user
    And I have existing subscriptions
    When I send a GET request to "/api/subscriptions"
    Then the response status should be 200
    And the response should contain a list of user subscriptions

  Scenario: Payment processing simulation - success
    Given I am authenticated as a user
    And payment processing will succeed
    When I create a subscription
    Then the subscription should be marked as "paid"

  Scenario: Payment processing simulation - failure
    Given I am authenticated as a user
    And payment processing will fail
    When I create a subscription
    Then the subscription should be marked as "failed"
    And the response should contain payment error