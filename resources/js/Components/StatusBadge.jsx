const statusConfig = {
    draft: {
        label: 'Rascunho',
        color: 'bg-slate-100 text-slate-700 border-slate-200'
    },
    coleta_dispersa: {
        label: 'Coleta',
        color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    legalizacao: {
        label: 'Legalização',
        color: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    alfandegas: {
        label: 'Alfândegas',
        color: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    cornelder: {
        label: 'Cornelder',
        color: 'bg-orange-50 text-orange-700 border-orange-200'
    },
    taxacao: {
        label: 'Taxação',
        color: 'bg-pink-50 text-pink-700 border-pink-200'
    },
    completed: {
        label: 'Concluído',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    pending: {
        label: 'Pendente',
        color: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    paid: {
        label: 'Pago',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    overdue: {
        label: 'Vencida',
        color: 'bg-red-50 text-red-700 border-red-200'
    },
};

export default function StatusBadge({ status }) {
    const config = statusConfig[status] || statusConfig.draft;

    return (
        <span className={`
            inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md border
            ${config.color}
        `}>
            {config.label}
        </span>
    );
}
