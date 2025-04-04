import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { CategoryForm } from "../components/category-form";

export const metadata = {
  title: "Create Category",
  description: "Create a new event category",
};

export default async function CreateCategoryPage() {
  const session = await auth();
  
  if (!session || !(session.user.role === 'admin' || session.user.role === 'manager')) {
    redirect('/sign-in');
  }
  
  return (
    <div className="container py-10">
      <Heading
        title="Create Category"
        description="Add a new event category"
      />
      <Separator className="my-6" />
      
      <div className="max-w-4xl mx-auto">
        <CategoryForm />
      </div>
    </div>
  );
} 