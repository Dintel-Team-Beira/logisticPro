import { useState } from 'react';
import { router } from '@inertiajs/react';
import {
  Upload, FileText, Download, Trash2, Check, X,
  FileCheck, Truck, Bell, ShieldCheck, Calculator,
  FileBarChart, BadgeCheck, PackageCheck, FolderCheck,
  Calendar, MapPin, FileKey, PenTool, PackageX, File as FileIcon
} from 'lucide-react';

const PHASE_NAMES = {
  1: 'Coleta de Despesas',
  2: 'Legalização',
  3: 'Alfândegas',
  4: 'Cornelder',
  5: 'Carregamentos',
  6: 'Facturação',
  7: 'POD',
};

const DOCUMENT_TYPES_BY_PHASE = {
  2: [
    { value: 'bl_legalizado', label: 'BL Legalizado', icon: FileCheck },
    { value: 'delivery_order', label: 'Delivery Order (DO)', icon: Truck },
    { value: 'outro', label: 'Outro', icon: FileIcon },
  ],
  3: [
    { value: 'aviso_taxacao', label: 'AVISO', icon: Bell },
    { value: 'autorizacao_saida', label: 'Autorização', icon: ShieldCheck },
    { value: 'sad', label: 'SAD', icon: FileBarChart },
    { value: 'packing_list', label: 'Packing List', icon: FileText },
    { value: 'commercial_invoice', label: 'Commercial Invoice', icon: FileText },
    { value: 'outro', label: 'Outro', icon: FileIcon },
  ],
  4: [
    { value: 'recibo_cornelder', label: 'RECIBO', icon: Check },
    { value: 'ido', label: 'IDO', icon: FileKey },
    { value: 'processo_completo_cornelder', label: 'PROCESSO COMPLETO', icon: FolderCheck },
    { value: 'appointment', label: 'APPOINTMENT', icon: Calendar },
    { value: 'draft_cornelder', label: 'Draft', icon: FileText },
    { value: 'storage', label: 'Storage', icon: FileText },
    { value: 'outro', label: 'Outro', icon: FileIcon },
  ],
  5: [
    { value: 'sad', label: 'SAD', icon: FileBarChart },
    { value: 'processo_completo_taxacao', label: 'Processos Completo', icon: FolderCheck },
    { value: 'carta_porte', label: 'Carta de Porte', icon: MapPin },
    { value: 'outro', label: 'Outro', icon: FileIcon },
  ],
  6: [
    { value: 'factura_cliente', label: 'Factura', icon: FileText },
    { value: 'pop_cliente', label: 'POP do Cliente', icon: BadgeCheck },
    { value: 'outro', label: 'Outro', icon: FileIcon },
  ],
  7: [
    { value: 'pod', label: 'POD', icon: PackageCheck },
    { value: 'devolucao_vazio', label: 'Devolução do Vazio', icon: PackageX },
    { value: 'assinatura_cliente', label: 'POP', icon: PenTool },
    { value: 'outro', label: 'Outro', icon: FileIcon },
  ],
};

export default function DocumentUploadByPhase({ shipment, documents = [], currentPhase = 1 }) {
  const [selectedPhase, setSelectedPhase] = useState(currentPhase);
  const [uploadingPhase, setUploadingPhase] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [notes, setNotes] = useState('');

  const getPhaseDocuments = (phase) => {
    return documents.filter(doc => {
      const docType = doc.type;
      const phaseTypes = DOCUMENT_TYPES_BY_PHASE[phase] || [];
      return phaseTypes.some(type => type.value === docType);
    });
  };

  const handleFileSelect = (e, phase) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadingPhase(phase);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile || !selectedDocType) {
      alert('Por favor selecione um arquivo e o tipo de documento');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('type', selectedDocType);
    formData.append('notes', notes);

    router.post(`/documents/${shipment.id}`, formData, {
      onSuccess: () => {
        setSelectedFile(null);
        setSelectedDocType('');
        setNotes('');
        setUploadingPhase(null);
      },
      onError: (errors) => {
        console.error('Erro ao fazer upload:', errors);
        alert('Erro ao fazer upload do documento');
      }
    });
  };

  const handleDelete = (documentId) => {
    if (confirm('Tem certeza que deseja excluir este documento?')) {
      router.delete(`/documents/${documentId}`);
    }
  };

  const cancelUpload = () => {
    setSelectedFile(null);
    setSelectedDocType('');
    setNotes('');
    setUploadingPhase(null);
  };

  const phaseDocTypes = DOCUMENT_TYPES_BY_PHASE[selectedPhase] || [];
  const phaseDocuments = getPhaseDocuments(selectedPhase);

  return (
    <div className="p-6 bg-white border rounded-xl border-slate-200">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Documentos por Fase
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Faça upload dos documentos específicos de cada fase do processo
        </p>
      </div>

      {/* Phase Selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {Object.entries(PHASE_NAMES).map(([phase, name]) => (
          <button
            key={phase}
            onClick={() => setSelectedPhase(parseInt(phase))}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              selectedPhase === parseInt(phase)
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-white/20">
                {phase}
              </span>
              {name}
              {getPhaseDocuments(parseInt(phase)).length > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-emerald-500 text-white">
                  {getPhaseDocuments(parseInt(phase)).length}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Upload Section */}
      <div className="p-4 mb-6 border-2 border-dashed rounded-lg border-slate-300 bg-slate-50">
        {uploadingPhase === selectedPhase ? (
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Tipo de Documento
                </label>
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione o tipo</option>
                  {phaseDocTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Arquivo Selecionado
                </label>
                <div className="px-4 py-2 border rounded-lg border-slate-300 bg-white">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-slate-700 truncate">
                      {selectedFile.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Observações (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Adicione observações sobre este documento..."
                className="w-full px-4 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Upload className="w-4 h-4" />
                Fazer Upload
              </button>
              <button
                type="button"
                onClick={cancelUpload}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 transition-colors bg-white border rounded-lg border-slate-300 hover:bg-slate-50"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <input
              type="file"
              id={`file-upload-${selectedPhase}`}
              className="hidden"
              onChange={(e) => handleFileSelect(e, selectedPhase)}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <label
              htmlFor={`file-upload-${selectedPhase}`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 transition-colors bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100"
            >
              <Upload className="w-4 h-4" />
              Selecionar Arquivo para {PHASE_NAMES[selectedPhase]}
            </label>
            <p className="mt-2 text-xs text-slate-500">
              PDF, JPG ou PNG até 10MB
            </p>
          </div>
        )}
      </div>

      {/* Documents List */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-slate-700">
          Documentos da Fase {selectedPhase} - {PHASE_NAMES[selectedPhase]}
        </h3>

        {phaseDocuments.length === 0 ? (
          <div className="p-8 text-center border rounded-lg border-slate-200 bg-slate-50">
            <FileText className="w-12 h-12 mx-auto text-slate-400" />
            <p className="mt-2 text-sm font-medium text-slate-900">
              Nenhum documento nesta fase
            </p>
            <p className="text-xs text-slate-500">
              Faça upload dos documentos necessários acima
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {phaseDocuments.map((doc) => {
              const docTypeInfo = phaseDocTypes.find(t => t.value === doc.type) ||
                { label: doc.type, icon: FileIcon };
              const Icon = docTypeInfo.icon;

              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg border-slate-200 bg-white hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        {docTypeInfo.label}
                      </div>
                      <div className="text-xs text-slate-500">
                        {doc.name} • {(doc.size / 1024).toFixed(1)} KB
                      </div>
                      {doc.metadata?.notes && (
                        <div className="text-xs text-slate-600 mt-1">
                          {doc.metadata.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`/documents/${doc.id}/download`}
                      className="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-50"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 p-4 mt-6 border-t md:grid-cols-4 border-slate-200">
        {Object.entries(PHASE_NAMES).map(([phase, name]) => {
          const count = getPhaseDocuments(parseInt(phase)).length;
          return (
            <div key={phase} className="text-center">
              <div className="text-2xl font-bold text-slate-900">{count}</div>
              <div className="text-xs text-slate-500">{name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
