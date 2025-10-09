import { Head, router, Link } from '@inertiajs/react';
import { useState } from 'react';
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
  X
} from 'lucide-react';
import DashboardLayout from '@/Layouts/DashboardLayout';

export default function DocumentsShow({ shipment, documents, documentsByType }) {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  const getFileIcon = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      return <ImageIcon className="w-12 h-12 text-blue-500" />;
    }
    if (ext === 'pdf') {
      return <FileText className="w-12 h-12 text-red-500" />;
    }
    return <File className="w-12 h-12 text-slate-400" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = (docId) => {
    if (confirm('Tem certeza que deseja excluir este documento?')) {
      router.delete(`/documents/${docId}`, {
        preserveScroll: true
      });
    }
  };

  const isImage = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  };

  return (
    <DashboardLayout>
      <Head title={`Documentos - ${shipment.reference_number}`} />

      <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/documents"
            className="inline-flex items-center gap-2 mb-4 font-medium text-blue-600 transition hover:text-blue-800"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para Processos
          </Link>

          {/* Shipment Info Card */}
          <div className="p-8 mb-6 text-white shadow-2xl bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                  <FolderOpen className="w-12 h-12" />
                </div>
                <div>
                  <h1 className="mb-2 text-3xl font-bold">{shipment.reference_number}</h1>
                  {shipment.client && (
                    <p className="flex items-center gap-2 text-blue-100">
                      <Building2 className="w-5 h-5" />
                      {shipment.client.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <div className="text-4xl font-bold">{documents.length}</div>
                  <div className="mt-1 text-sm text-blue-100">Documento{documents.length !== 1 && 's'}</div>
                </div>
              </div>
            </div>

            {shipment.bl_number && (
              <div className="pt-4 mt-4 border-t border-blue-400/30">
                <span className="text-blue-100">BL: </span>
                <span className="font-semibold">{shipment.bl_number}</span>
              </div>
            )}
          </div>

          {/* Actions Bar */}
          <div className="flex items-center justify-between p-4 bg-white shadow-lg rounded-xl">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg transition ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg transition ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-6 py-3 font-semibold text-white transition bg-green-600 rounded-lg shadow-lg hover:bg-green-700"
            >
              <Upload className="w-5 h-5" />
              Carregar Documento
            </button>
          </div>
        </div>

        {/* Documents Display */}
        {documents.length === 0 ? (
          <div className="p-16 text-center bg-white shadow-lg rounded-2xl">
            <FileText className="w-32 h-32 mx-auto mb-6 text-slate-300" />
            <h3 className="mb-2 text-2xl font-bold text-slate-900">Nenhum documento</h3>
            <p className="mb-6 text-slate-600">Este processo ainda não possui documentos anexados.</p>
            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-white transition bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700"
            >
              <Upload className="w-5 h-5" />
              Carregar Primeiro Documento
            </button>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              // GRID VIEW
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="overflow-hidden transition-all duration-300 bg-white border-2 border-transparent shadow-md group rounded-xl hover:shadow-2xl hover:border-blue-500"
                  >
                    {/* Preview */}
                    <div className="relative flex items-center justify-center h-48 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                      {isImage(doc.name) ? (
                        <img
                          src={`/storage/${doc.path}`}
                          alt={doc.name}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        getFileIcon(doc.name)
                      )}

                      {/* Hover Actions */}
                      <div className="absolute inset-0 flex items-center justify-center gap-3 transition-opacity opacity-0 bg-black/60 group-hover:opacity-100">
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="p-3 transition bg-white rounded-full hover:bg-blue-50"
                          title="Visualizar"
                        >
                          <Eye className="w-5 h-5 text-blue-600" />
                        </button>
                        <a
                          href={`/documents/${doc.id}/download`}
                          className="p-3 transition bg-white rounded-full hover:bg-green-50"
                          title="Download"
                        >
                          <Download className="w-5 h-5 text-green-600" />
                        </a>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-3 transition bg-white rounded-full hover:bg-red-50"
                          title="Excluir"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="mb-2 font-semibold truncate text-slate-900" title={doc.name}>
                        {doc.name}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{formatFileSize(doc.size)}</span>
                        <span>{formatDate(doc.created_at)}</span>
                      </div>
                      {doc.type && (
                        <div className="mt-2">
                          <span className="inline-block px-2 py-1 text-xs text-blue-700 bg-blue-100 rounded">
                            {doc.type}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // LIST VIEW
              <div className="overflow-hidden bg-white shadow-lg rounded-xl">
                <table className="min-w-full">
                  <thead className="border-b-2 bg-slate-50 border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-left uppercase text-slate-700">
                        Documento
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-left uppercase text-slate-700">
                        Tipo
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-left uppercase text-slate-700">
                        Tamanho
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-left uppercase text-slate-700">
                        Data
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-right uppercase text-slate-700">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="transition hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {getFileIcon(doc.name)}
                            <div>
                              <div className="font-medium text-slate-900">{doc.name}</div>
                              {doc.uploader && (
                                <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                                  <User className="w-3 h-3" />
                                  {doc.uploader.name}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {doc.type && (
                            <span className="inline-block px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                              {doc.type}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {formatFileSize(doc.size)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {formatDate(doc.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Preview Modal */}
      {selectedDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80"
          onClick={() => setSelectedDoc(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">{selectedDoc.name}</h3>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-2 transition rounded-lg hover:bg-slate-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[70vh] overflow-auto">
              {isImage(selectedDoc.name) ? (
                <img
                  src={`/storage/${selectedDoc.path}`}
                  alt={selectedDoc.name}
                  className="w-full rounded-lg"
                />
              ) : selectedDoc.name.endsWith('.pdf') ? (
                <iframe
                  src={`/storage/${selectedDoc.path}`}
                  className="w-full h-[60vh] rounded-lg border-2 border-slate-200"
                  title="PDF Preview"
                />
              ) : (
                <div className="py-12 text-center">
                  {getFileIcon(selectedDoc.name)}
                  <p className="mt-4 text-slate-600">Pré-visualização não disponível</p>
                  <a
                    href={`/documents/${selectedDoc.id}/download`}
                    className="inline-flex items-center gap-2 px-6 py-3 mt-4 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    <Download className="w-5 h-5" />
                    Fazer Download
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
              <div className="text-sm text-slate-600">
                <div>Tamanho: {formatFileSize(selectedDoc.size)}</div>
                <div>Upload: {formatDate(selectedDoc.created_at)}</div>
              </div>
              <a
                href={`/documents/${selectedDoc.id}/download`}
                className="flex items-center gap-2 px-6 py-3 font-semibold text-white transition bg-green-600 rounded-lg hover:bg-green-700"
              >
                <Download className="w-5 h-5" />
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
