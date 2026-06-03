  import { Product, User, Transaction, Role, Category, 
    TransactionRequest, PosZxReadingRequest, VoidTransactionRequest, ExchangeTransactionRequest,
    UserResponse, RoleResponse, ProductResponse, CategoryResponse, 
    DiscountCodeResponse, TransactionResponse } from './types';
  import { invoke } from '@tauri-apps/api/core';

  export async function getProducts() {
    try {
      const products = await invoke('get_products');
      const categories = await invoke('get_categories');

      return (products as ProductResponse[]).map(product => {
        const category = (categories as CategoryResponse[]).find((c: CategoryResponse) => c.id === product.category_id);
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
      return (categories as CategoryResponse[]).map((c: CategoryResponse) => ({
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
      return discountCodes as DiscountCodeResponse[];
    } catch (error) {
      console.error('Error fetching discount codes:', error);
      return [];
    }
  }

  export async function getUsers() {
    try {
      const users = await invoke('get_users');
      const roles = await invoke('get_roles');

      return (users as UserResponse[]).map((user: UserResponse) => ({
        ...user,
        id: user.id.toString(),
        role: (roles as RoleResponse[]).find((r: RoleResponse) => r.id === user.role_id)?.role_name ? {
          id: (roles as RoleResponse[]).find((r: RoleResponse) => r.id === user.role_id)!.id,
          name: (roles as RoleResponse[]).find((r: RoleResponse) => r.id === user.role_id)!.role_name
        } : null
      })) as User[];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  export async function createTransaction(transactionData: TransactionRequest): Promise<TransactionResponse> {
    try {
      const result = await invoke<TransactionResponse>('create_transaction', { transactionData });
      return result;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  export async function createPosZxReading(zxReadingData: PosZxReadingRequest): Promise<void> {
    try {
      await invoke('create_pos_zx_reading', { data: zxReadingData });
    } catch (error) {
      console.error('Error creating POS ZX reading:', error);
      throw error;
    }
  }

  export async function loginUser(cashierUserCode: number, pin: string) {
    try {
      const user = await invoke('login_user', { cashierUserCode, pin });
      const roles = await invoke('get_roles');

      const foundRole = (roles as RoleResponse[]).find((r: RoleResponse) => r.id === (user as UserResponse).role_id);
      return {
        ...(user as UserResponse),
        id: (user as UserResponse).id.toString(),
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

  export async function getTransactionDetails(invoiceNo: number) {
    try {
      const data = await invoke('get_transaction_details', { invoiceNo });
      return data;
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      throw error;
    }
  }

  export async function getCurrentTransactionDetails(invoiceNo: number) {
    try {
      const data = await invoke('get_current_transaction_details', { invoiceNo });
      return data;
    } catch (error) {
      console.error('Error fetching current transaction details:', error);
      throw error;
    }
  }

  export async function voidTransaction(data: VoidTransactionRequest): Promise<number> {
    try {
      const result = await invoke<number>('void_transaction', { data });
      return result;
    } catch (error) {
      console.error('Error voiding transaction:', error);
      throw error;
    }
  }

  export async function exchangeTransaction(data: ExchangeTransactionRequest) {
    try {
      const result = await invoke('exchange_transaction', { data });
      return result;
    } catch (error) {
      console.error('Error processing exchange:', error);
      throw error;
    }
  }


