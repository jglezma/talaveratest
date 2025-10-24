import bcrypt from "bcryptjs";
import { UserRepository } from "../repositories/user.repository";
import { CreateUserRequest, LoginRequest, User } from "../types";
import { generateToken } from "../utils/jwt.util";

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async signup(
    userData: CreateUserRequest
  ): Promise<{ user: Omit<User, "password">; token: string }> {
    const { email, password, name } = userData;

    // Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear el usuario
    const user = await this.userRepository.create({
      email,
      password: hashedPassword,
      name,
    });

    // Generar token
    const token = generateToken({ userId: user.id, email: user.email });

    // Retornar usuario sin contraseña y token
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async signin(
    loginData: LoginRequest
  ): Promise<{ user: Omit<User, "password">; token: string }> {
    const { email, password } = loginData;

    // Buscar usuario por email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    // Generar token
    const token = generateToken({ userId: user.id, email: user.email });

    // Retornar usuario sin contraseña y token
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async getProfile(userId: number): Promise<Omit<User, "password"> | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
