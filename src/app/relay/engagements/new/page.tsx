import { db } from "@/db";
import { consultants } from "@/db/schema/rebound-relay";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { createEngagement, createInvoiceAndCheckoutInfo } from "@/lib/relay/actions";
import { auth } from "@/auth";

export default async function RelayNewEngagementPage({ searchParams }: { searchParams: { consultantId?: string } }) {
    if (!searchParams.consultantId) return notFound();

    const [consultant] = await db.select().from(consultants).where(eq(consultants.id, searchParams.consultantId)).limit(1);
    if (!consultant) return notFound();

    async function handleSubmit(formData: FormData) {
        "use server";
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const amount = Number(formData.get("amount")) * 100; // to cents

        // In MVP, assuming the client is the currently logged in user implicitly representing their Org
        const session = await auth();
        if (!session?.user) throw new Error("Unauthorized");
        const clientId = session.user.id; // use orgId in a fully configured environment

        const engagementId = await createEngagement(consultant.id, title, description, clientId);
        const { checkoutUrl } = await createInvoiceAndCheckoutInfo(engagementId, amount);

        // Redirect to checkout
        if (checkoutUrl) {
            redirect(checkoutUrl);
        }
    }

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">Initiate Engagement</h1>
            <p className="text-gray-500">You are initiating an engagement with {consultant.headline}. Define the scope and initial invoice details.</p>

            <form action={handleSubmit} className="border p-6 rounded-lg bg-white shadow-sm flex flex-col gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Engagement Title</label>
                    <input name="title" required className="border w-full p-2 rounded" placeholder="e.g. Higher Ed Strategy Consulting" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description / Scope of Work</label>
                    <textarea name="description" required rows={4} className="border w-full p-2 rounded" placeholder="Details of the consulting service..." />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Initial Invoice Amount (USD)</label>
                    <input name="amount" type="number" step="0.01" required className="border w-full p-2 rounded" placeholder="e.g. 5000" />
                </div>

                <div className="pt-4 flex justify-end gap-2">
                    <button type="button" className="text-gray-500 hover:text-gray-700 px-4 py-2">Cancel</button>
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700">Submit & Pay Invoice</button>
                </div>
            </form>
        </div>
    );
}
