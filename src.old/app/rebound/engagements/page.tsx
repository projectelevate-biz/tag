import { db } from "@/db";
import { engagements } from "@/db/schema/rebound-relay";
import { eq } from "drizzle-orm";
import { getConsultantProfile } from "@/lib/rebound/actions";

export default async function ReboundEngagementsPage() {
    const profile = await getConsultantProfile();
    let myEngagements: typeof engagements.$inferSelect[] = [];

    if (profile) {
        myEngagements = await db.select().from(engagements).where(eq(engagements.consultantId, profile.id));
    }

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">Engagements</h1>
            <p className="text-gray-500">Track and manage your client engagements.</p>

            <div className="border p-6 rounded-lg bg-white shadow-sm space-y-4">
                {myEngagements.map(e => (
                    <div key={e.id} className="p-4 border rounded flex justify-between">
                        <div>
                            <h3 className="font-medium">{e.title}</h3>
                            <p className="text-sm text-gray-500">{e.description}</p>
                        </div>
                        <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded">{e.status}</span>
                    </div>
                ))}
                {myEngagements.length === 0 && <p className="text-gray-500">No active engagements.</p>}
            </div>
        </div>
    );
}
