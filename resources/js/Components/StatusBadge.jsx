export default function StatusBadge({ status }) {
    const statusConfig = {
        draft: { label: 'Rascunho', color: 'slate' },
        coleta_dispersa: { label: 'Coleta', color: 'blue' },
        legalizacao: { label: 'Legalização', color: 'purple' },
        alfandegas: { label: 'Alfândegas', color: 'amber' },
        cornelder: { label: 'Cornelder', color: 'cyan' },
        taxacao: { label: 'Taxação', color: 'indigo' },
        completed: { label: 'Concluído', color: 'emerald' },
        cancelled: { label: 'Cancelado', color: 'red' },
    };

    const config = statusConfig[status] || { label: status, color: 'slate' };

    const colorClasses = {
        slate: 'bg-slate-100 text-slate-700',
        blue: 'bg-blue-100 text-blue-700',
        purple: 'bg-purple-100 text-purple-700',
        amber: 'bg-amber-100 text-amber-700',
        cyan: 'bg-cyan-100 text-cyan-700',
        indigo: 'bg-indigo-100 text-indigo-700',
        emerald: 'bg-emerald-100 text-emerald-700',
        red: 'bg-red-100 text-red-700',
    };


}
