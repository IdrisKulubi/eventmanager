import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getCategoryById } from "@/lib/actions/category.actions";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { CategoryForm } from "../../components/category-form";

export const metadata = {
  title: "Edit Category",
  description: "Edit an existing event category",
};

export default async function EditCategoryPage({
  params:paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  
  if (!session || !(session.user.role === 'admin' || session.user.role === 'manager')) {
    redirect('/sign-in');
  }
  
  const params = await paramsPromise;
  const categoryId = parseInt(params.id, 10);
  
  if (isNaN(categoryId)) {
    redirect('/dashboard/categories');
  }
  
  const category = await getCategoryById(categoryId);
  
  if (!category) {
    redirect('/dashboard/categories');
  }
  
  return (
    <div className="container py-10">
      <Heading
        title="Edit Category"
        description="Update an existing event category"
      />
      <Separator className="my-6" />
      
      <div className="max-w-4xl mx-auto">
        <CategoryForm initialData={category} />
      </div>
    </div>
  );
} 