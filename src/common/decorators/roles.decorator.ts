import { SetMetadata } from '@nestjs/common';

export enum Role {
  Member = 'Member',
  Admin = 'Admin',
}

export const ROLES_KEY = 'roles';
export const Roles = (role: Role) => SetMetadata(ROLES_KEY, role);
