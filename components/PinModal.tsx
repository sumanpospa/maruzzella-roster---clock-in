
import React, { useState, useEffect, useRef } from 'react';
import { Employee } from '../types';
import { BackspaceIcon } from './icons/BackspaceIcon';

interface PinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    employee: Employee;
}

const PinModal: React.FC<PinModalProps> = ({ isOpen, onClose, onSuccess, employee }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const firstButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!isOpen) {
            setPin('');
            setError('');
        } else {
            // Focus the first button when modal opens for keyboard navigation
            firstButtonRef.current?.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        if (pin.length === 4) {
            if (pin === employee.pin) {
                onSuccess();
            } else {
                setError('Incorrect PIN. Please try again.');
                setTimeout(() => {
                    setPin('');
                    setError('');
                }, 1000);
            }
        }
    }, [pin, employee.pin, onSuccess]);

    const handlePinClick = (digit: string) => {
        if (pin.length < 4) {
            setPin(prev => prev + digit);
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
    };

    if (!isOpen) return null;

    const pinDots = Array.from({ length: 4 }).map((_, index) => (
        <div
            key={index}
            className={`w-4 h-4 rounded-full border-2 transition-colors duration-200 ${
                index < pin.length ? 'bg-orange-600 border-orange-600' : 'border-stone-300'
            } ${error ? '!border-red-500 !bg-red-100' : ''}`}
        />
    ));

    const keypadButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((key, i) => {
        if (key === '') return <div key={i} />;
        if (key === 'del') {
            return (
                <button
                    key={i}
                    onClick={handleDelete}
                    className="h-16 flex items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    aria-label="Delete last digit"
                >
                    <BackspaceIcon className="h-7 w-7" />
                </button>
            );
        }
        return (
            <button
                key={i}
                ref={i === 0 ? firstButtonRef : null}
                onClick={() => handlePinClick(key)}
                className="h-16 rounded-full text-2xl font-semibold text-slate-700 transition-colors hover:bg-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
                {key}
            </button>
        );
    });

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 transition-opacity duration-300 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pin-modal-title"
        >
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-xs p-6 pt-8 animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                <div className="text-center">
                    <h2 id="pin-modal-title" className="text-xl font-bold text-slate-800">Enter PIN</h2>
                    <p className="text-stone-500 mb-6">for {employee.name}</p>
                </div>
                <div className="flex justify-center items-center gap-3 mb-6 h-6">
                    {error ? <p className="text-red-600 text-sm font-medium animate-shake">{error}</p> : pinDots}
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {keypadButtons}
                </div>
            </div>
            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
                @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
                .animate-shake { animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both; }
            `}</style>
        </div>
    );
};

export default PinModal;