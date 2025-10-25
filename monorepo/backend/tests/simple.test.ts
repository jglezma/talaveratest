describe("Simple Test", () => {
  it("should work", () => {
    expect(1 + 1).toBe(2);
  });

  it("should have environment variables", () => {
    expect(process.env.NODE_ENV).toBe("test");
    expect(process.env.JWT_SECRET).toBeDefined();
  });
});
