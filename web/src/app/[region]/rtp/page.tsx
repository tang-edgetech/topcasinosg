import { getRtpEntries, toTitleCase } from "../_lib/api";

export default async function RegionRtpPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const { region } = await params;
  const rtpEntries = await getRtpEntries(region);

  if (rtpEntries.length === 0) {
    return (
      <div id="region-rtp-page" className="region-rtp">
        <h2 className="mb-4 text-xl font-semibold text-primary-900">RTP (Return to Player)</h2>
        <p className="region-rtp__empty text-sm text-primary-500">
          No RTP entries available for this region yet.
        </p>
      </div>
    );
  }

  const sortedEntries = [...rtpEntries].sort((a, b) => b.rtpPercentage - a.rtpPercentage);

  return (
    <div id="region-rtp-page" className="region-rtp flex flex-col gap-6">
      <h2 className="text-xl font-semibold text-primary-900">RTP (Return to Player)</h2>

      <div className="region-rtp__table-wrapper overflow-x-auto rounded-lg border border-primary-100">
        <table className="region-rtp__table w-full min-w-[480px] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-primary-50">
              <th className="px-4 py-3 font-semibold text-primary-900">Game</th>
              <th className="px-4 py-3 font-semibold text-primary-900">Category</th>
              <th className="px-4 py-3 text-right font-semibold text-primary-900">RTP %</th>
            </tr>
          </thead>
          <tbody>
            {sortedEntries.map((entry) => (
              <tr key={entry.id} className="region-rtp__row border-t border-primary-100">
                <td className="px-4 py-3 text-primary-900">{entry.gameName}</td>
                <td className="px-4 py-3 text-primary-600">{toTitleCase(entry.category)}</td>
                <td className="px-4 py-3 text-right font-semibold text-primary-900">
                  {entry.rtpPercentage.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
