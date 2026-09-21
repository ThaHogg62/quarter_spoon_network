import { prisma } from "@/lib/prisma";

export async function LeadAnalyticsDashboard() {
  // Fetch real-time metrics grouped by app and endpoint status
  const totalLeads = await prisma.leadConversion.count();
  const primaryLeads = await prisma.leadConversion.count({
    where: { endpointUsed: "PRIMARY_XQARR3VL" },
  });
  const failoverLeads = await prisma.leadConversion.count({
    where: { endpointUsed: "BACKUP_MLGWJNYK" },
  });

  const recentLeads = await prisma.leadConversion.findMany({
    take: 15,
    orderBy: { createdAt: "desc" },
  });

  const appBreakdown = await prisma.leadConversion.groupBy({
    by: ["appName"],
    _count: { id: true },
  });

  return (
    <div className="w-full space-y-8 p-6 bg-black border border-white/10 rounded-2xl">
      {/* Metric Cards Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 bg-qse-slate/50 border border-white/10 rounded-xl">
          <p className="text-xs uppercase tracking-widest text-qse-chrome font-mono">
            TOTAL SYSTEM LEADS
          </p>
          <h3 className="text-3xl font-extrabold text-white mt-2">{totalLeads}</h3>
        </div>
        <div className="p-5 bg-emerald-950/20 border border-emerald-500/30 rounded-xl">
          <p className="text-xs uppercase tracking-widest text-emerald-400 font-mono">
            PRIMARY ENDPOINT (XQARR3VL)
          </p>
          <h3 className="text-3xl font-extrabold text-emerald-400 mt-2">{primaryLeads}</h3>
        </div>
        <div className="p-5 bg-amber-950/20 border border-amber-500/30 rounded-xl">
          <p className="text-xs uppercase tracking-widest text-amber-400 font-mono">
            FAILOVER REROUTED (MLGWJNYK)
          </p>
          <h3 className="text-3xl font-extrabold text-amber-400 mt-2">{failoverLeads}</h3>
        </div>
      </div>

      {/* App Breakdown Grid */}
      <div className="p-6 bg-qse-slate/30 border border-white/10 rounded-xl">
        <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
          MULTI-APP CONVERSION DISTRIBUTION
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {appBreakdown.map((item) => (
            <div
              key={item.appName}
              className="p-4 bg-black/60 border border-white/10 rounded-lg"
            >
              <span className="text-xs text-qse-chrome font-mono block truncate">
                {item.appName}
              </span>
              <span className="text-xl font-bold text-white block mt-1">
                {item._count.id} Leads
              </span>
            </div>
          ))}
          {appBreakdown.length === 0 && (
            <div className="col-span-full py-4 text-center text-xs font-mono text-qse-chrome">
              No conversions recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* Real-Time Conversion Table */}
      <div className="p-6 bg-qse-slate/30 border border-white/10 rounded-xl overflow-x-auto">
        <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
          REAL-TIME CONVERSION LOG (HARD-LOCKED ACCESS)
        </h4>
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-white/10 text-qse-chrome">
              <th className="py-3 px-4">TIMESTAMP</th>
              <th className="py-3 px-4">EMAIL</th>
              <th className="py-3 px-4">APP ORIGIN</th>
              <th className="py-3 px-4">SOURCE</th>
              <th className="py-3 px-4">ENDPOINT USED</th>
              <th className="py-3 px-4">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {recentLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-white/[0.02] text-white">
                <td className="py-3 px-4 text-qse-chrome">
                  {new Date(lead.createdAt).toLocaleString()}
                </td>
                <td className="py-3 px-4 font-bold">{lead.email}</td>
                <td className="py-3 px-4 text-qse-neon-blue">{lead.appName}</td>
                <td className="py-3 px-4 text-qse-chrome">{lead.source}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded text-[10px] ${
                      lead.endpointUsed === "PRIMARY_XQARR3VL"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {lead.endpointUsed}
                  </span>
                </td>
                <td className="py-3 px-4 text-emerald-400 font-bold">{lead.status}</td>
              </tr>
            ))}
            {recentLeads.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-6 text-center text-xs font-mono text-qse-chrome"
                >
                  No conversion logs available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
