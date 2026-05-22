  import { Product, User, Transaction, Role, Category } from './types';
  import { invoke } from '@tauri-apps/api/core';
  import { Role as MockRole } from './types';


  export async function getProducts() {
    try {
      const products = await invoke('get_products');
      return products as Product[];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  export async function getCategories() {
    try {
      const categories = await invoke('get_categories');
      return categories as Category[];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  export async function getUsers() {
    try {
      const users = await invoke('get_users');
      const roles = await invoke('get_roles');

      return (users as any[]).map(user => ({
        ...user,
        id: user.id.toString(),
        role: (roles as any[]).find((r: any) => r.id === user.role_id)?.role_name ? {
          id: (roles as any[]).find((r: any) => r.id === user.role_id).id,
          name: (roles as any[]).find((r: any) => r.id === user.role_id).role_name
        } : null
      })) as User[];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }


