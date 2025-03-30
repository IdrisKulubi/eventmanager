'use server';

import { revalidatePath } from 'next/cache';
import { eq, like, desc, asc, count, sql } from 'drizzle-orm';
import { auth } from '../../../auth';
import { eventCategories, eventToCategory } from '@/db/schema';
import db from '@/db/drizzle';
import { CategoryFormData } from '../validators';


// Define User type with role property
interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: 'admin' | 'manager' | 'user';
}

// Authorization check for category management
async function checkCategoryManagementPermission() {
  const session = await auth();
  if (!session) {
    return false;
  }

  // Only admin and manager roles can manage categories
  const user = session.user as User;
  return user.role === 'admin' || user.role === 'manager';
}

export async function getCategories({
  page = 1,
  limit = 10,
  search,
  sortBy = 'name',
  sortOrder = 'asc',
}: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  try {
    const offset = (page - 1) * limit;
    
    // Get total count for pagination
    const totalCategories = await db.select({
      value: count()
    }).from(eventCategories);
    
    const total = totalCategories[0]?.value || 0;
    
    // Apply search, sorting and pagination in a single query
    const paginatedQuery = db.select().from(eventCategories)
      .where(search ? like(eventCategories.name, `%${search}%`) : undefined)
      .orderBy(
        sortBy === 'name' 
          ? (sortOrder === 'desc' ? desc(eventCategories.name) : asc(eventCategories.name))
          : asc(eventCategories.id)
      )
      .limit(limit)
      .offset(offset);
    
    // Execute query
    const categoriesList = await paginatedQuery;
    
    // Get event counts for each category
    const categoryIds = categoriesList.map(cat => cat.id);
    const eventCounts = categoryIds.length > 0 
      ? await db.select({
          categoryId: eventToCategory.categoryId,
          count: count()
        })
        .from(eventToCategory)
        .where(sql`${eventToCategory.categoryId} IN (${categoryIds.join(',')})`)
        .groupBy(eventToCategory.categoryId)
      : [];
    
    // Create a map of category IDs to counts
    const countMap = new Map(eventCounts.map(ec => [ec.categoryId, ec.count]));
    
    // Add event count to each category
    const categoriesWithCounts = categoriesList.map(cat => ({
      ...cat,
      eventCount: countMap.get(cat.id) || 0
    }));
    
    return { categories: categoriesWithCounts, count: total };
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }
}

export async function getAllCategories() {
  try {
    const categories = await db.select().from(eventCategories).orderBy(asc(eventCategories.name));
    return categories;
  } catch (error) {
    console.error('Error fetching all categories:', error);
    throw new Error('Failed to fetch categories');
  }
}

export async function getCategoryById(id: number) {
  try {
    const category = await db.select().from(eventCategories).where(eq(eventCategories.id, id)).limit(1);
    
    if (!category.length) {
      return null;
    }
    
    return category[0];
  } catch (error) {
    console.error('Error fetching category:', error);
    throw new Error('Failed to fetch category');
  }
}

export async function createCategory(formData: CategoryFormData) {
  const hasPermission = await checkCategoryManagementPermission();
  if (!hasPermission) {
    throw new Error('Unauthorized: You do not have permission to create categories');
  }
  
  try {
    // Check if category with the same name already exists
    const existingCategory = await db.select()
      .from(eventCategories)
      .where(eq(eventCategories.name, formData.name))
      .limit(1);
    
    if (existingCategory.length > 0) {
      throw new Error('A category with this name already exists');
    }
    
    const [newCategory] = await db.insert(eventCategories)
      .values(formData)
      .returning();
    
    revalidatePath('/dashboard/categories');
    return { success: true, categoryId: newCategory.id };
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
}

export async function updateCategory(id: number, formData: CategoryFormData) {
  const hasPermission = await checkCategoryManagementPermission();
  if (!hasPermission) {
    throw new Error('Unauthorized: You do not have permission to update categories');
  }
  
  try {
    // Check if another category with the same name already exists
    const existingCategory = await db.select()
      .from(eventCategories)
      .where(
        eq(eventCategories.name, formData.name)
      )
      .limit(1);
    
    if (existingCategory.length > 0 && existingCategory[0].id !== id) {
      throw new Error('Another category with this name already exists');
    }
    
    await db.update(eventCategories)
      .set(formData)
      .where(eq(eventCategories.id, id));
    
    revalidatePath('/dashboard/categories');
    revalidatePath(`/dashboard/categories/${id}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
}

export async function deleteCategory(id: number) {
  const hasPermission = await checkCategoryManagementPermission();
  if (!hasPermission) {
    throw new Error('Unauthorized: You do not have permission to delete categories');
  }
  
  try {
    // Check if the category has any associated events
    const categoryEvents = await db.select()
      .from(eventToCategory)
      .where(eq(eventToCategory.categoryId, id))
      .limit(1);
    
    if (categoryEvents.length > 0) {
      throw new Error('Cannot delete category with associated events');
    }
    
    // Delete the category
    await db.delete(eventCategories).where(eq(eventCategories.id, id));
    
    revalidatePath('/dashboard/categories');
    return { success: true };
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
} 