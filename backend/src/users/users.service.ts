import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_AVATAR =
  'https://i.pinimg.com/736x/82/68/c7/8268c7aadf0a9077396836037307adeb.jpg';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getById(id: string) {
    const userId = Number(id);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return null;

    return {
      ...user,
      avatarUrl: user.avatarUrl || DEFAULT_AVATAR,
    };
  }

  async create(data: { username: string; email: string }) {
    return this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash: '123',
        avatarUrl: DEFAULT_AVATAR,
      },
    });
  }

  async update(
    id: string,
    data: {
      username: string;
      email: string;
      avatarUrl?: string;
      bio?: string;
    },
  ) {
    const userId = Number(id);

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        avatarUrl: data.avatarUrl || DEFAULT_AVATAR,
      },
    });
  }

  async deleteWithCheck(id: string, auth: string) {
    const userId = Number(id);
    const currentUser = Number(auth);

    if (currentUser !== userId && currentUser !== 1) {
      return false;
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return true;
  }
}
