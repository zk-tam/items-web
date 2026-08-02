import { loginAction } from "@/app/admin/actions";

type LoginPageProps = { searchParams: Promise<{ error?: string }> };

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <form action={loginAction} className="grid w-full max-w-md gap-5 border border-items-blue p-7">
        <div><h1 className="text-3xl font-black">ITEMS ADMIN</h1><p className="mt-2 font-bold">Sign in to manage the catalog and orders.</p></div>
        {error ? <p className="border border-red-600 p-3 text-sm font-bold text-red-700">Invalid email or password.</p> : null}
        <label className="grid gap-1 font-bold">Email<input name="email" type="email" required autoComplete="email" className="border border-items-blue bg-transparent p-3" /></label>
        <label className="grid gap-1 font-bold">Password<input name="password" type="password" required autoComplete="current-password" className="border border-items-blue bg-transparent p-3" /></label>
        <button className="bg-items-blue px-5 py-3 font-black text-items-white">Sign in</button>
      </form>
    </main>
  );
}
