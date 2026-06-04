  import { Product, User, Transaction, Role, Category,
    TransactionRequest, PosZxReadingRequest, VoidTransactionRequest, ExchangeTransactionRequest,
    UserResponse, RoleResponse, ProductResponse, CategoryResponse,
    DiscountCodeResponse, TransactionResponse,
    UnitMasterResponse, CreateUnitMasterRequest,
    IngredientMasterFileResponse, CreateIngredientRequest, UpdateIngredientStockRequest, UpdateIngredientRequest,
    ConversionFileResponse, CreateConversionRequest,
    ProductsRecipeResponse, CreateRecipeRequest, UpdateRecipeRequest,
    CreateProductRequest, UpdateProductRequest,
    CreateCategoryRequest, UpdateCategoryRequest,
    CsvProductRow, BatchImportRequest, BatchImportResponse } from './types';
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

  // Unit Management Functions
  export async function getUnits(): Promise<UnitMasterResponse[]> {
    try {
      const units = await invoke('get_units');
      return units as UnitMasterResponse[];
    } catch (error) {
      console.error('Error fetching units:', error);
      return [];
    }
  }

  export async function createUnitMaster(data: CreateUnitMasterRequest): Promise<UnitMasterResponse> {
    try {
      const result = await invoke('create_unit_master', { data });
      return result as UnitMasterResponse;
    } catch (error) {
      console.error('Error creating unit:', error);
      throw error;
    }
  }

  // Ingredient Management Functions
  export async function getIngredients(): Promise<IngredientMasterFileResponse[]> {
    try {
      const ingredients = await invoke('get_ingredients');
      return ingredients as IngredientMasterFileResponse[];
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      return [];
    }
  }

  export async function createIngredient(data: CreateIngredientRequest): Promise<IngredientMasterFileResponse> {
    try {
      const result = await invoke('create_ingredient', { data });
      return result as IngredientMasterFileResponse;
    } catch (error) {
      console.error('Error creating ingredient:', error);
      throw error;
    }
  }

  export async function updateIngredientStock(data: UpdateIngredientStockRequest): Promise<void> {
    try {
      await invoke('update_ingredient_stock', { data });
    } catch (error) {
      console.error('Error updating ingredient stock:', error);
      throw error;
    }
  }

  export async function updateIngredient(data: UpdateIngredientRequest): Promise<IngredientMasterFileResponse> {
    try {
      const result = await invoke('update_ingredient', { data });
      return result as IngredientMasterFileResponse;
    } catch (error) {
      console.error('Error updating ingredient:', error);
      throw error;
    }
  }

  export async function deleteIngredient(ingredientId: number): Promise<void> {
    try {
      await invoke('delete_ingredient', { ingredientId });
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      throw error;
    }
  }

  // Conversion Management Functions
  export async function getConversions(): Promise<ConversionFileResponse[]> {
    try {
      const conversions = await invoke('get_conversions');
      return conversions as ConversionFileResponse[];
    } catch (error) {
      console.error('Error fetching conversions:', error);
      return [];
    }
  }

  export async function createConversion(data: CreateConversionRequest): Promise<ConversionFileResponse> {
    try {
      const result = await invoke('create_conversion', { data });
      return result as ConversionFileResponse;
    } catch (error) {
      console.error('Error creating conversion:', error);
      throw error;
    }
  }

  // Recipe Management Functions
  export async function getProductRecipe(productId: number): Promise<ProductsRecipeResponse[]> {
    try {
      const recipes = await invoke('get_product_recipe', { productId });
      return recipes as ProductsRecipeResponse[];
    } catch (error) {
      console.error('Error fetching product recipe:', error);
      return [];
    }
  }

  export async function createRecipe(data: CreateRecipeRequest): Promise<ProductsRecipeResponse> {
    try {
      const result = await invoke('create_recipe', { data });
      return result as ProductsRecipeResponse;
    } catch (error) {
      console.error('Error creating recipe:', error);
      throw error;
    }
  }

  export async function deleteRecipe(recipeId: number): Promise<void> {
    try {
      await invoke('delete_recipe', { recipeId });
    } catch (error) {
      console.error('Error deleting recipe:', error);
      throw error;
    }
  }

  export async function updateRecipe(data: UpdateRecipeRequest): Promise<ProductsRecipeResponse> {
    try {
      const result = await invoke('update_recipe', { data });
      return result as ProductsRecipeResponse;
    } catch (error) {
      console.error('Error updating recipe:', error);
      throw error;
    }
  }

  export async function recalculateProductCost(productId: number): Promise<number> {
    try {
      const result = await invoke('recalculate_product_cost', { productId });
      return result as number;
    } catch (error) {
      console.error('Error recalculating product cost:', error);
      throw error;
    }
  }

  export async function updateProductPriceFromCost(productId: number): Promise<number> {
    try {
      const result = await invoke('update_product_price_from_cost', { productId });
      return result as number;
    } catch (error) {
      console.error('Error updating product price from cost:', error);
      throw error;
    }
  }

  export async function createProduct(data: CreateProductRequest): Promise<ProductResponse> {
    try {
      const result = await invoke('create_product', { data });
      return result as ProductResponse;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  export async function updateProduct(data: UpdateProductRequest): Promise<ProductResponse> {
    try {
      const result = await invoke('update_product', { data });
      return result as ProductResponse;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  export async function deleteProduct(productId: number): Promise<void> {
    try {
      await invoke('delete_product', { productId });
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  export async function createCategory(data: CreateCategoryRequest): Promise<CategoryResponse> {
    try {
      const result = await invoke('create_category', { data });
      return result as CategoryResponse;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  export async function updateCategory(data: UpdateCategoryRequest): Promise<CategoryResponse> {
    try {
      const result = await invoke('update_category', { data });
      return result as CategoryResponse;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  export async function deleteCategory(categoryId: number): Promise<void> {
    try {
      await invoke('delete_category', { categoryId });
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  export async function batchImportProducts(data: BatchImportRequest): Promise<BatchImportResponse> {
    try {
      const result = await invoke('batch_import_products', { data });
      return result as BatchImportResponse;
    } catch (error) {
      console.error('Error batch importing products:', error);
      throw error;
    }
  }


