  import { Product, User, Transaction, Role, Category } from './types';
  import { invoke } from '@tauri-apps/api/core';
  import { Role as MockRole } from './types';

  export async function getProducts() {
    try {
      const products = await invoke('get_products');
      const categories = await invoke('get_categories');

      return (products as any[]).map(product => {
        const category = (categories as any[]).find((c: any) => c.id === product.category_id);
        return {
          ...product,
          id: product.id.toString(),
          categoryId: product.category_id,
          category: category?.category_name || 'Uncategorized',
          categoryCode: category?.category_code || 'UNC'
        };
      }) as Product[];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  export async function getCategories() {
    try {
      const categories = await invoke('get_categories');
      return (categories as any[]).map(c => ({
        id: c.id,
        categoryCode: c.category_code,
        categoryName: c.category_name
      })) as Category[];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  export async function getDiscountCodes() {
    try {
      const discountCodes = await invoke('get_discount_codes');
      return discountCodes as Array<{ id: number; name: string; percent: number }>;
    } catch (error) {
      console.error('Error fetching discount codes:', error);
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

  export async function createTransaction(transactionData: any) {
    try {
      const result = await invoke('create_transaction', { transactionData });
      return result as Transaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  export async function loginUser(cashierUserCode: number, pin: string) {
    try {
      const user = await invoke('login_user', { cashierUserCode, pin });
      const roles = await invoke('get_roles');

      const foundRole = (roles as any[]).find((r: any) => r.id === (user as any).role_id);
      return {
        ...(user as any),
        id: (user as any).id.toString(),
        role: foundRole ? {
          id: foundRole.id,
          name: foundRole.role_name
        } : null
      };
    } catch (error) {
      // Login failed (invalid credentials) - return null silently
      return null;
    }
  }


