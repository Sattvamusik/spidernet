import { getBoardBySlug, getWidgetsForBoard } from "@/lib/spidernet/router";

type PreparedBoardProps = {
  slug: string;
};

export function PreparedBoard({ slug }: PreparedBoardProps) {
  const board = getBoardBySlug(slug);

  if (!board) {
    return null;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-[0_12px_50px_rgba(15,23,42,0.08)]">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Prepared Board Shell</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
          {board.title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{board.description}</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Route</p>
            <p className="mt-2 text-sm font-medium text-slate-950">{board.route}</p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Registry Status</p>
            <p className="mt-2 text-sm font-medium capitalize text-slate-950">{board.status}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/70 bg-slate-950 p-5 text-slate-100 shadow-[0_12px_50px_rgba(15,23,42,0.14)]">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Registered Modules</p>
        <div className="mt-4 space-y-3">
          {getWidgetsForBoard(board.id).length > 0 ? (
            getWidgetsForBoard(board.id).map((widget) => (
              <div key={widget.id} className="rounded-[22px] bg-slate-900 px-4 py-3">
                <p className="text-sm font-medium text-white">{widget.title}</p>
                <p className="mt-1 text-sm text-slate-400">{widget.description}</p>
              </div>
            ))
          ) : (
            <div className="rounded-[22px] bg-slate-900 px-4 py-3 text-sm text-slate-400">
              Page shell and registry metadata are prepared. Full implementation is intentionally deferred.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
