import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center backdrop-blur-sm"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div 
                className="bg-card-light dark:bg-card-dark w-full max-w-2xl rounded-lg shadow-2xl shadow-accent/20 border border-primary/30 m-4"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-primary/20">
                    <h2 id="modal-title" className="text-xl font-bold font-display text-primary">{title}</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-text-light/70 dark:text-text-dark/70 hover:bg-primary/20" aria-label="Close modal">
                        <X />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
