Feature: Projects Management
  As an authenticated user
  I want to manage my projects
  So that I can organize my work

  Background:
    Given the API is running
    And I am authenticated as a user

  Scenario: Get user projects
    When I send a GET request to "/api/projects"
    Then the response status should be 200
    And the response should contain a list of projects

  Scenario: Create a new project
    Given I have valid project data
    When I send a POST request to "/api/projects"
    Then the response status should be 201
    And the response should contain the created project
    And the project should belong to the authenticated user

  Scenario: Create project with missing title
    Given I have project data without title
    When I send a POST request to "/api/projects"
    Then the response status should be 400
    And the response should contain validation errors

  Scenario: Get a specific project
    Given I have a project with ID 1
    When I send a GET request to "/api/projects/1"
    Then the response status should be 200
    And the response should contain the project details

  Scenario: Get non-existent project
    When I send a GET request to "/api/projects/999"
    Then the response status should be 404
    And the response should contain "Project not found"

  Scenario: Update a project
    Given I have a project with ID 1
    And I have valid update data
    When I send a PUT request to "/api/projects/1"
    Then the response status should be 200
    And the response should contain the updated project

  Scenario: Update project with invalid status
    Given I have a project with ID 1
    When I send a PUT request to "/api/projects/1" with invalid status
    Then the response status should be 400
    And the response should contain "Invalid project status"

  Scenario: Delete a project
    Given I have a project with ID 1
    When I send a DELETE request to "/api/projects/1"
    Then the response status should be 200
    And the response should contain success message

  Scenario: Try to access another user's project
    Given another user has a project with ID 2
    When I send a GET request to "/api/projects/2"
    Then the response status should be 404
    And the response should contain "Project not found"