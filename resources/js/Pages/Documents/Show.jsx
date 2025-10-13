import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  File,
  Download,
  Eye,
  Trash2,
  Upload,
  Grid3x3,
  List,
  FolderOpen,
  Building2,
  Package,
  Calendar,
  User,
  X,
  Ship,
  Filter,
  Clock,
  Tag,
  AlertCircle,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';

export default function DocumentsShow({ shipment, documents, documentsByType }) {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);

  // File type detection
  const getFileIcon = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      return ImageIcon;
    }
    if (ext === 'pdf') {
      return FileText;
    }
    return File;
  };

  const getFileColor = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      return 'text-blue-500 bg-blue-100';
    }
    if (ext === 'pdf') {
      return 'text-red-500 bg-red-100';
    }
    return 'text-slate-500 bg-slate-100';
  };

  const isImage = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-MZ', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Document type labels
  const typeLabels = {
    bl: 'BL (Bill of Lading)',
    invoice: 'Fatura Comercial',
    receipt: 'Recibo',
    pop: 'Comprovativo de Pagamento',
    carta_endosso: 'Carta de Endosso',
    packing_list: 'Packing List',
    aviso: 'Aviso',
    autorizacao: 'Autorização',
    draft: 'Draft',
    storage: 'Storage',
    sad: 'SAD (Trânsito)',
    termo: 'Termo da Linha',
    ido: 'IDO',
    pod: 'POD (Proof of Delivery)',
    other: 'Outro',
  };

  // Handle file upload
  const handleUpload = (e) => {
    e.preventDefault();

    if (!file || !docType) {
      alert('Por favor, selecione um arquivo e o tipo de documento.');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', docType);
    formData.append('notes', notes);

    router.post(`/shipments/${shipment.id}/documents`, formData, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        setShowUpload(false);
        setFile(null);
        setDocType('');
        setNotes('');
        setUploading(false);
      },
      onError: () => {
        setUploading(false);
      },
    });
  };

  const handleDelete = (docId) => {
    if (confirm('Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.')) {
      router.delete(`/documents/${docId}`, {
        preserveScroll: true,
      });
    }
  };

  // Filter documents by type
  const filteredDocuments = filterType === 'all'
    ? documents
    : documents.filter(doc => doc.type === filterType);

  // Get unique document types
  const availableTypes = [...new Set(documents.map(doc => doc.type))].filter(Boolean);

  // Stats
  const stats = {
    total: documents.length,
    byType: Object.keys(documentsByType || {}).length,
    totalSize: documents.reduce((acc, doc) => acc + (doc.size || 0), 0),
  };

  // Stat Card Component
  const StatCard = ({ title, value, icon: Icon, color }) => {
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-600',
      purple: 'bg-purple-100 text-purple-600',
      green: 'bg-emerald-100 text-emerald-600',
    };

    return (
      <div className="p-4 bg-white border rounded-lg border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-600">{title}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          </div>
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </div>
    );
  };

  // Document Card Component (Grid)
  const DocumentCard = ({ doc }) => {
    const Icon = getFileIcon(doc.name);
    const colorClass = getFileColor(doc.name);

    return (
      <div className="relative overflow-hidden transition-all duration-300 bg-white border-2 border-transparent group rounded-xl hover:shadow-2xl hover:border-blue-500">
        {/* Preview Area */}
        <div className="relative flex items-center justify-center h-48 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
          {isImage(doc.name) ? (
            <img
              src={`/storage/${doc.path}`}
              alt={doc.name}
              className="object-cover w-full h-full transition-transform group-hover:scale-110"
            />
          ) : (
            <div className={`p-6 rounded-2xl ${colorClass}`}>
              <Icon className="w-16 h-16" />
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 flex items-center justify-center gap-2 transition-opacity opacity-0 bg-black/60 group-hover:opacity-100">
            <button
              onClick={() => setSelectedDoc(doc)}
              className="p-3 text-white transition-transform bg-blue-600 rounded-full hover:scale-110"
              title="Visualizar"
            >
              <Eye className="w-5 h-5" />
            </button>
            <a
              href={`/documents/${doc.id}/download`}
              className="p-3 text-white transition-transform bg-green-600 rounded-full hover:scale-110"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </a>
            <button
              onClick={() => handleDelete(doc.id)}
              className="p-3 text-white transition-transform bg-red-600 rounded-full hover:scale-110"
              title="Excluir"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info Area */}
        <div className="p-4 border-t border-slate-100">
          <h3 className="mb-2 text-sm font-semibold truncate text-slate-900" title={doc.name}>
            {doc.name}
          </h3>

          {doc.type && (
            <span className="inline-block px-2 py-1 mb-2 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
              {typeLabels[doc.type] || doc.type}
            </span>
          )}

          <div className="space-y-1 text-xs text-slate-600">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatFileSize(doc.size)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(doc.created_at)}</span>
            </div>
            {doc.uploader && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span className="truncate">{doc.uploader.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Document List Item Component
  const DocumentListItem = ({ doc }) => {
    const Icon = getFileIcon(doc.name);
    const colorClass = getFileColor(doc.name);

    return (
      <div className="flex items-center gap-4 p-4 transition-all bg-white border rounded-lg border-slate-200 hover:shadow-md hover:border-blue-300">
        {/* Icon */}
        <div className={`flex-shrink-0 p-3 rounded-lg ${colorClass}`}>
          <Icon className="w-8 h-8" />
        </div>

        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <h3 className="mb-1 text-sm font-semibold truncate text-slate-900">
            {doc.name}
          </h3>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
            {doc.type && (
              <span className="px-2 py-1 font-medium text-blue-700 bg-blue-100 rounded-full">
                {typeLabels[doc.type] || doc.type}
              </span>
            )}
            <span>{formatFileSize(doc.size)}</span>
            <span>{formatDate(doc.created_at)}</span>
            {doc.uploader && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{doc.uploader.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDoc(doc)}
            className="p-2 text-blue-600 transition rounded-lg hover:bg-blue-50"
            title="Visualizar"
          >
            <Eye className="w-5 h-5" />
          </button>
          <a
            href={`/documents/${doc.id}/download`}
            className="p-2 text-green-600 transition rounded-lg hover:bg-green-50"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </a>
          <button
            onClick={() => handleDelete(doc.id)}
            className="p-2 text-red-600 transition rounded-lg hover:bg-red-50"
            title="Excluir"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <Head title={`Documentos - ${shipment.reference_number}`} />

      <div className="p-6 ml-5 -mt-3 space-y-6 rounded-lg bg-white/50 backdrop-blur-xl border-gray-200/50">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/documents"
            className="inline-flex items-center gap-2 mb-4 text-sm transition-colors text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Repositório
          </Link>

          {/* Process Info Card */}
          <div className="p-6 mb-4 bg-white border rounded-lg border-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                  <FolderOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="mb-1 text-2xl font-bold text-slate-900">
                    {shipment.reference_number}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                    {shipment.client && (
                      <div className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        <span>{shipment.client.name}</span>
                      </div>
                    )}
                    {shipment.bl_number && (
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        <span>BL: {shipment.bl_number}</span>
                      </div>
                    )}
                    {shipment.shipping_line && (
                      <div className="flex items-center gap-1">
                        <Ship className="w-4 h-4" />
                        <span>{shipment.shipping_line.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <span className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                {shipment.phase_label || shipment.current_phase || 'Em Processo'}
              </span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
            <StatCard
              title="Total de Documentos"
              value={stats.total}
              icon={FileText}
              color="blue"
            />
            <StatCard
              title="Tipos Diferentes"
              value={stats.byType}
              icon={Tag}
              color="purple"
            />
            <StatCard
              title="Tamanho Total"
              value={formatFileSize(stats.totalSize)}
              icon={TrendingUp}
              color="green"
            />
          </div>

          {/* Actions Bar */}
          <div className="flex items-center justify-between gap-4">
            {/* Filter by Type */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-600" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 text-sm border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="all">Todos os Tipos ({stats.total})</option>
                {availableTypes.map((type) => (
                  <option key={type} value={type}>
                    {typeLabels[type] || type} ({documents.filter(d => d.type === type).length})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              {/* View Toggle */}
              <div className="flex gap-1 p-1 bg-white border rounded-lg border-slate-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Upload Button */}
              <button
                onClick={() => setShowUpload(true)}
                className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
              >
                <Upload className="w-4 h-4" />
                Carregar Documento
              </button>
            </div>
          </div>
        </div>

        {/* Documents Display */}
        {filteredDocuments.length === 0 ? (
          /* Empty State */
          <div className="py-16 text-center bg-white border rounded-lg border-slate-200">
            <FileText className="w-24 h-24 mx-auto mb-4 text-slate-300" />
            <h3 className="mb-2 text-xl font-semibold text-slate-900">
              {filterType === 'all' ? 'Nenhum documento' : 'Nenhum documento deste tipo'}
            </h3>
            <p className="mb-6 text-slate-600">
              {filterType === 'all'
                ? 'Este processo ainda não possui documentos anexados.'
                : `Não há documentos do tipo "${typeLabels[filterType] || filterType}".`}
            </p>
            <button
              onClick={() => {
                if (filterType !== 'all') setFilterType('all');
                else setShowUpload(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              {filterType === 'all' ? (
                <>
                  <Upload className="w-4 h-4" />
                  Carregar Primeiro Documento
                </>
              ) : (
                <>
                  <X className="w-4 h-4" />
                  Ver Todos os Documentos
                </>
              )}
            </button>
          </div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredDocuments.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} />
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-3">
                {filteredDocuments.map((doc) => (
                  <DocumentListItem key={doc.id} doc={doc} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowUpload(false)}
        >
          <div
            className="w-full max-w-lg p-6 bg-white shadow-2xl rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-full">
                  <Upload className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Carregar Documento
                  </h3>
                  <p className="text-sm text-slate-600">
                    {shipment.reference_number}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUpload(false)}
                className="p-1 transition-colors rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Upload Form */}
            <form onSubmit={handleUpload} className="space-y-4">
              {/* File Input */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Arquivo *
                </label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-green-500"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                  required
                />
                <p className="mt-1 text-xs text-slate-500">
                  Formatos aceitos: PDF, Imagens, Word, Excel (Max: 10MB)
                </p>
              </div>

              {/* Document Type */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Tipo de Documento *
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Selecione o tipo</option>
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Observações (Opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2 border rounded-lg resize-none border-slate-300 focus:ring-2 focus:ring-green-500"
                  placeholder="Adicione notas sobre este documento..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUpload(false)}
                  disabled={uploading}
                  className="flex-1 px-4 py-3 text-sm font-medium transition-colors bg-white border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading || !file || !docType}
                  className="flex items-center justify-center flex-1 gap-2 px-4 py-3 text-sm font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Carregar Documento
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {selectedDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedDoc(null)}
        >
          <div
            className="w-full max-w-5xl overflow-hidden bg-white rounded-xl shadow-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{selectedDoc.name}</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {formatFileSize(selectedDoc.size)} • {formatDate(selectedDoc.created_at)}
                </p>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-2 transition-colors rounded-lg hover:bg-slate-100"
              >
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 p-6 overflow-auto">
              {isImage(selectedDoc.name) ? (
                <img
                  src={`/storage/${selectedDoc.path}`}
                  alt={selectedDoc.name}
                  className="max-w-full mx-auto rounded-lg"
                />
              ) : selectedDoc.name.endsWith('.pdf') ? (
                <iframe
                  src={`/storage/${selectedDoc.path}`}
                  className="w-full h-[70vh] rounded-lg border border-slate-200"
                  title="PDF Preview"
                />
              ) : (
                <div className="py-16 text-center">
                  <div className="inline-flex items-center justify-center p-6 mb-4 rounded-full bg-slate-100">
                    {(() => {
                      const Icon = getFileIcon(selectedDoc.name);
                      return <Icon className="w-16 h-16 text-slate-400" />;
                    })()}
                  </div>
                  <p className="mb-2 text-lg font-medium text-slate-900">
                    Pré-visualização não disponível
                  </p>
                  <p className="mb-6 text-sm text-slate-600">
                    Faça o download para visualizar este arquivo
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
              <div className="text-sm text-slate-600">
                {selectedDoc.type && (
                  <span className="px-2 py-1 mr-2 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                    {typeLabels[selectedDoc.type] || selectedDoc.type}
                  </span>
                )}
                {selectedDoc.uploader && (
                  <span>Enviado por: {selectedDoc.uploader.name}</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(selectedDoc.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 transition-colors bg-red-100 rounded-lg hover:bg-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </button>
                <a
                  href={`/documents/${selectedDoc.id}/download`}
                  className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
