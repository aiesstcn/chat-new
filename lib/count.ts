import { prisma } from './prisma';

interface User {
  id: number;
  ip: string;
  count: number;
  vip: number;
  disabled: boolean;
  deadline: string
}

export async function getIpCount(ip: string): Promise<any> {
  if (!ip) {
    return { userCount: 0, vipCount: 0 };
  }

  const user = await prisma.user.findUnique({ where: { ip } });

  if (user) {
    return { userCount: user.count || 0, vipCount: user.vip || 0 };
  } else {
    return { userCount: 0, vipCount: 0 };
  }
}


export async function incrementIpCount(ip: string): Promise<number> {
  if (!ip) {
    return 0;
  }

  const user = await prisma.user.findUnique({ where: { ip } });

  let updatedUser: User;

  if (user) {
    updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { count: user.count + 1, vip: user.vip + 1 }
    });
  } else {
    updatedUser = await prisma.user.create({
      data: { ip, vip: 1, count: 1, disabled: false, deadline: '' }
    });
  }

  return updatedUser.count;
}
