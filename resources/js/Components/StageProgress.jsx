import { motion } from 'framer-motion';
import { Check, Clock, AlertCircle } from 'lucide-react';

export default function StageProgress({ stages, currentStage }) {
    const stagesList = [
        { key: 'coleta_dispersa', label: 'Coleta de Dispersa', icon: '📦' },
        { key: 'legalizacao', label: 'Legalização', icon: '📝' },
        { key: 'alfandegas', label: 'Alfândegas', icon: '🏛️' },
        { key: 'cornelder', label: 'Cornelder', icon: '🚢' },
        { key: 'taxacao', label: 'Taxação', icon: '💰' }
    ];

    const getStageStatus = (stageKey) => {
        const stage = stages.find(s => s.stage === stageKey);
        return stage?.status || 'pending';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-500';
            case 'in_progress': return 'bg-blue-500';
            case 'blocked': return 'bg-red-500';
            default: return 'bg-gray-300';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <Check className="w-4 h-4 text-white" />;
            case 'in_progress': return <Clock className="w-4 h-4 text-white" />;
            case 'blocked': return <AlertCircle className="w-4 h-4 text-white" />;
            default: return null;
        }
    };

    return (
        <div className="py-8">
            <div className="relative flex items-center justify-between">
                {/* Progress Line */}
                <div className="absolute left-0 right-0 h-1 bg-gray-200 top-5" style={{ zIndex: 0 }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{
                            width: `${(stages.filter(s => s.status === 'completed').length / stagesList.length) * 100}%`
                        }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                    />
                </div>

                {/* Stages */}
                {stagesList.map((stage, index) => {
                    const status = getStageStatus(stage.key);
                    const isActive = currentStage === stage.key;

                    return (
                        <div key={stage.key} className="relative flex flex-col items-center" style={{ zIndex: 1 }}>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className={`
                                    w-10 h-10 rounded-full flex items-center justify-center
                                    ${getStatusColor(status)}
                                    ${isActive ? 'ring-4 ring-blue-200 ring-offset-2' : ''}
                                    shadow-lg transition-all duration-300
                                `}
                            >
                                {getStatusIcon(status)}
                            </motion.div>

                            <div className="mt-3 text-center">
                                <p className="mb-1 text-2xl">{stage.icon}</p>
                                <p className={`text-xs font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                                    {stage.label}
                                </p>
                                {status === 'in_progress' && (
                                    <motion.p
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="mt-1 text-xs font-semibold text-blue-600"
                                    >
                                        Em progresso
                                    </motion.p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
