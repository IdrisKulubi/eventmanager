import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCategories } from "@/lib/actions/category.actions";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { CategoryTable } from "./components/category-table";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type SearchParams = {
  page?: string;
  limit?: string;
  search?: string;
  sort?: string;
};

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const session = await auth();
  
  // Check if user is authenticated and has required role
  if (!session || !(session.user.role === 'admin' || session.user.role === 'manager')) {
    redirect('/sign-in');
  }
  
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const search = params.search || '';
  const sort = params.sort || 'name-asc';
  
  const [sortField, sortOrder] = sort.split('-');
  
  const { categories, count } = await getCategories({
    page,
    limit,
    search,
    sortBy: sortField as string,
    sortOrder: sortOrder as 'asc' | 'desc',
  });
  
  return (
    <div className="container py-10">
      <div className="flex justify-between">
        <Heading
          title="Categories"
          description="Manage event categories"
        />
        <Button asChild>
          <Link href="/dashboard/categories/create">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Category
          </Link>
        </Button>
      </div>
      <Separator className="my-6" />
      
      <div className="max-w-4xl mx-auto">
        <CategoryTable categories={categories} count={count} />
      </div>
    </div>
  );
} 