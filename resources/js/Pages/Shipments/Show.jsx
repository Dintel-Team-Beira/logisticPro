import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import Card from '@/Components/Card';
import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import StageProgress from '@/Components/StageProgress';
import FileUpload from '@/Components/FileUpload';
import Modal from '@/Components/Modal';
import {
    ArrowLeft,
    Ship,
    Edit,
    Trash2,
    FileText,
    DollarSign,
    Clock,
    User,
    Download,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';

export default function ShipmentsShow({ auth, shipment }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedStage, setSelectedStage] = useState(null);

    const tabs = [
        { id: 'overview', label: 'Visão Geral', icon: Ship },
        { id: 'documents', label: 'Documentos', icon: FileText },
        { id: 'invoices', label: 'Faturas', icon: DollarSign },
        { id: 'activity', label: 'Atividades', icon: Clock },
    ];

    const handleStageUpdate = (stage, status) => {
        router.post(`/shipments/${shipment.id}/stages/${stage.id}/status`, {
            status: status,
            notes: '',
        });
    };

    const handleDelete = () => {
        if (confirm('Tem certeza que deseja remover este shipment?')) {
            router.delete(`/shipments/${shipment.id}`);
        }
    };

    const openUploadModal = (stage) => {
        setSelectedStage(stage);
        setShowUploadModal(true);
    };

    return (
        <AppLayout auth={auth}>
            <Head title={shipment.reference_number} />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <Link href="/shipments" className="inline-flex items-center mb-4 text-blue-600 hover:text-blue-700">
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Voltar para Shipments
                        </Link>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-4 shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                                    <Ship className="w-10 h-10 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold text-gray-900">
                                        {shipment.reference_number}
                                    </h1>
                                    <p className="mt-1 text-gray-600">
                                        {shipment.shipping_line?.name}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Link href={`/shipments/${shipment.id}/edit`}>
                                    <Button variant="outline">
                                        <Edit className="w-5 h-5" />
                                        Editar
                                    </Button>
                                </Link>
                                <Button variant="danger" onClick={handleDelete}>
                                    <Trash2 className="w-5 h-5" />
                                    Remover
                                </Button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Progress */}
                    <Card className="mb-8">
                        <div className="p-8">
                            <StageProgress
                                stages={shipment.stages}
                                currentStage={shipment.status}
                            />
                        </div>
                    </Card>

                    {/* Tabs */}
                    <div className="mb-6">
                        <div className="flex gap-2 border-b border-gray-200">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        flex items-center gap-2 px-6 py-3 font-medium transition-all
                                        ${activeTab === tab.id
                                            ? 'text-blue-600 border-b-2 border-blue-600'
                                            : 'text-gray-600 hover:text-gray-900'
                                        }
                                    `}
                                >
                                    <tab.icon className="w-5 h-5" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-6 lg:col-span-2">
                            {activeTab === 'overview' && (
                                <OverviewTab shipment={shipment} />
                            )}
                            {activeTab === 'documents' && (
                                <DocumentsTab
                                    shipment={shipment}
                                    onUpload={(stage) => openUploadModal(stage)}
                                />
                            )}
                            {activeTab === 'invoices' && (
                                <InvoicesTab shipment={shipment} />
                            )}
                            {activeTab === 'activity' && (
                                <ActivityTab shipment={shipment} />
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Stages Card */}
                            <Card>
                                <div className="p-6 border-b border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Stages do Processo
                                    </h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    {shipment.stages?.map((stage) => (
                                        <StageCard
                                            key={stage.id}
                                            stage={stage}
                                            onUpdateStatus={handleStageUpdate}
                                            onUpload={() => openUploadModal(stage.stage)}
                                        />
                                    ))}
                                </div>
                            </Card>

                            {/* Info Card */}
                            <Card>
                                <div className="p-6 border-b border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Informações
                                    </h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    <InfoRow label="Container" value={shipment.container_number || '-'} />
                                    <InfoRow label="BL Number" value={shipment.bl_number || '-'} />
                                    <InfoRow label="Navio" value={shipment.vessel_name || '-'} />
                                    <InfoRow label="Origem" value={shipment.origin_port || '-'} />
                                    <InfoRow label="Destino" value={shipment.destination_port || '-'} />
                                    <InfoRow
                                        label="Chegada"
                                        value={shipment.arrival_date ? new Date(shipment.arrival_date).toLocaleDateString('pt-BR') : '-'}
                                    />
                                    <InfoRow
                                        label="Criado por"
                                        value={shipment.creator?.name || '-'}
                                    />
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload Modal */}
            <Modal
                show={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                title="Upload de Documentos"
                maxWidth="2xl"
            >
                {selectedStage && (
                    <FileUpload
                        shipmentId={shipment.id}
                        stage={selectedStage}
                        onSuccess={() => {
                            setShowUploadModal(false);
                            router.reload();
                        }}
                    />
                )}
            </Modal>
        </AppLayout>
    );
}

function OverviewTab({ shipment }) {
    return (
        <div className="space-y-6">
            <Card>
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Detalhes do Shipment</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Referência</label>
                            <p className="mt-1 text-lg font-semibold text-gray-900">
                                {shipment.reference_number}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Linha de Navegação</label>
                            <p className="mt-1 text-lg font-semibold text-gray-900">
                                {shipment.shipping_line?.name}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">BL Number</label>
                            <p className="mt-1 text-lg font-semibold text-gray-900">
                                {shipment.bl_number || '-'}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Container</label>
                            <p className="mt-1 text-lg font-semibold text-gray-900">
                                {shipment.container_number || '-'}
                            </p>
                        </div>
                    </div>

                    {shipment.cargo_description && (
                        <div className="mt-6">
                            <label className="text-sm font-medium text-gray-500">Descrição da Carga</label>
                            <p className="mt-2 text-gray-900 whitespace-pre-wrap">
                                {shipment.cargo_description}
                            </p>
                        </div>
                    )}
                </div>
            </Card>

            <Card>
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Estatísticas</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-3 gap-6">
                        <StatCard
                            label="Documentos"
                            value={shipment.documents?.length || 0}
                            icon={FileText}
                            color="blue"
                        />
                        <StatCard
                            label="Faturas"
                            value={shipment.invoices?.length || 0}
                            icon={DollarSign}
                            color="green"
                        />
                        <StatCard
                            label="Atividades"
                            value={shipment.activities?.length || 0}
                            icon={Clock}
                            color="purple"
                        />
                    </div>
                </div>
            </Card>
        </div>
    );
}

function DocumentsTab({ shipment, onUpload }) {
    const groupedDocs = shipment.documents?.reduce((acc, doc) => {
        if (!acc[doc.stage]) acc[doc.stage] = [];
        acc[doc.stage].push(doc);
        return acc;
    }, {}) || {};

    const stages = ['coleta_dispersa', 'legalizacao', 'alfandegas', 'cornelder', 'taxacao'];
    const stageLabels = {
        coleta_dispersa: 'Coleta de Dispersa',
        legalizacao: 'Legalização',
        alfandegas: 'Alfândegas',
        cornelder: 'Cornelder',
        taxacao: 'Taxação'
    };

    return (
        <div className="space-y-6">
            {stages.map((stage) => (
                <Card key={stage}>
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900">
                            📄 {stageLabels[stage]}
                        </h3>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onUpload(stage)}
                        >
                            <FileText className="w-4 h-4" />
                            Upload
                        </Button>
                    </div>
                    <div className="p-6">
                        {groupedDocs[stage]?.length > 0 ? (
                            <div className="space-y-3">
                                {groupedDocs[stage].map((doc) => (
                                    <DocumentCard key={doc.id} document={doc} />
                                ))}
                            </div>
                        ) : (
                            <p className="py-8 text-center text-gray-500">
                                Nenhum documento enviado
                            </p>
                        )}
                    </div>
                </Card>
            ))}
        </div>
    );
}

function InvoicesTab({ shipment }) {
    return (
        <Card>
            <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Faturas</h3>
            </div>
            <div className="p-6">
                {shipment.invoices?.length > 0 ? (
                    <div className="space-y-4">
                        {shipment.invoices.map((invoice) => (
                            <InvoiceCard key={invoice.id} invoice={invoice} />
                        ))}
                    </div>
                ) : (
                    <p className="py-8 text-center text-gray-500">
                        Nenhuma fatura registrada
                    </p>
                )}
            </div>
        </Card>
    );
}

function ActivityTab({ shipment }) {
    return (
        <Card>
            <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Histórico de Atividades</h3>
            </div>
            <div className="p-6">
                {shipment.activities?.length > 0 ? (
                    <div className="space-y-4">
                        {shipment.activities.map((activity) => (
                            <ActivityCard key={activity.id} activity={activity} />
                        ))}
                    </div>
                ) : (
                    <p className="py-8 text-center text-gray-500">
                        Nenhuma atividade registrada
                    </p>
                )}
            </div>
        </Card>
    );
}

function StageCard({ stage, onUpdateStatus, onUpload }) {
    const stageLabels = {
        coleta_dispersa: 'Coleta de Dispersa',
        legalizacao: 'Legalização',
        alfandegas: 'Alfândegas',
        cornelder: 'Cornelder',
        taxacao: 'Taxação'
    };

    const statusIcons = {
        pending: <Clock className="w-5 h-5 text-gray-400" />,
        in_progress: <Clock className="w-5 h-5 text-blue-500 animate-pulse" />,
        completed: <CheckCircle className="w-5 h-5 text-green-500" />,
        blocked: <XCircle className="w-5 h-5 text-red-500" />
    };

    return (
        <div className="p-4 transition-colors border border-gray-200 rounded-lg hover:border-blue-300">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    {statusIcons[stage.status]}
                    <span className="font-medium text-gray-900">
                        {stageLabels[stage.stage]}
                    </span>
                </div>
                <Badge variant={
                    stage.status === 'completed' ? 'success' :
                    stage.status === 'in_progress' ? 'primary' :
                    stage.status === 'blocked' ? 'danger' : 'default'
                }>
                    {stage.status}
                </Badge>
            </div>

            {stage.status === 'in_progress' && (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="success"
                        onClick={() => onUpdateStatus(stage, 'completed')}
                        className="flex-1"
                    >
                        Completar
                    </Button>
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={onUpload}
                    >
                        <FileText className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}

function DocumentCard({ document }) {
    return (
        <div className="flex items-center justify-between p-4 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100">
            <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-500" />
                <div>
                    <p className="font-medium text-gray-900">{document.file_name}</p>
                    <p className="text-sm text-gray-500">
                        {document.formatted_size} • {document.uploader?.name}
                    </p>
                </div>
            </div>

                href={`/documents/${document.id}/download`}
                className="text-blue-600 hover:text-blue-700"
            >
                <Download className="w-5 h-5" />
            </a>
        </div>
    );
}

function InvoiceCard({ invoice }) {
    return (
        <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">{invoice.invoice_number}</span>
                <Badge variant={
                    invoice.status === 'paid' ? 'success' :
                    invoice.status === 'overdue' ? 'danger' : 'warning'
                }>
                    {invoice.status}
                </Badge>
            </div>
            <p className="text-sm text-gray-600">{invoice.issuer}</p>
            <p className="mt-2 text-xl font-bold text-gray-900">
                {invoice.amount} {invoice.currency}
            </p>
        </div>
    );
}

function ActivityCard({ activity }) {
    return (
        <div className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
            <div className="p-2 bg-blue-100 rounded-lg h-fit">
                <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
                <p className="font-medium text-gray-900">{activity.description}</p>
                <p className="text-sm text-gray-500">
                    {activity.user?.name} • {new Date(activity.created_at).toLocaleString('pt-BR')}
                </p>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color }) {
    return (
        <div className="text-center">
            <div className={`inline-flex p-3 rounded-xl bg-${color}-100 mb-2`}>
                <Icon className={`h-6 w-6 text-${color}-600`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-600">{label}</p>
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
            <span className="text-sm text-gray-600">{label}</span>
            <span className="text-sm font-semibold text-gray-900">{value}</span>
        </div>
    );
}
