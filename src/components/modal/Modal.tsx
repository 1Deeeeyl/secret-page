'use client';
import React from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function Modal({ open, onClose, children }: ModalProps) {
  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 flex justify-center items-center transition-colors duration-300
  ${
    open
      ? 'visible pointer-events-auto bg-black/20'
      : 'invisible pointer-events-none bg-transparent'
  }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative bg-white rounded-lg p-8 shadow-xl max-w-md w-full mx-4 transform transition-all duration-50 ease-in-out flex flex-col
          ${open ? 'scale-100 opacity-100' : 'scale-110 opacity-0'}`}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-5 font-extrabold text-xl text-gray-400 transition-all hover:text-gray-600"
        >
          X
        </button>
        {children}
      </div>
    </div>
  );
}

export default Modal;
