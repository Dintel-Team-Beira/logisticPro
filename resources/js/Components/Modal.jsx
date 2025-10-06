import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ show, onClose, title, children, maxWidth = '2xl' }) {
    const maxWidthClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
    };

    return (
        <Transition show={show} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-50">
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-full p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className={`w-full ${maxWidthClasses[maxWidth]} transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all`}>
                                <div className="relative">
                                    {/* Header */}
                                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                        <Dialog.Title className="text-xl font-bold text-gray-900">
                                            {title}
                                        </Dialog.Title>
                                        <button
                                            onClick={onClose}
                                            className="text-gray-400 transition-colors hover:text-gray-600"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        {children}
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
