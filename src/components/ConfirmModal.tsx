interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'danger'
}

export function ConfirmModal({
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default'
}: ConfirmModalProps) {
  if (!isOpen) return null

  const variantStyles = {
    default: {
      confirmBg: 'bg-blue-500 hover:bg-blue-600',
      cancelBg: 'bg-gray-300 hover:bg-gray-400'
    },
    danger: {
      confirmBg: 'bg-red-500 hover:bg-red-600',
      cancelBg: 'bg-gray-300 hover:bg-gray-400'
    }
  }[variant]

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none"
      onClick={onClose}
    >
      <div 
        className="relative w-auto max-w-lg mx-auto my-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-solid rounded-t border-blueGray-200">
            <h3 className="text-2xl font-semibold">{title}</h3>
            <button
              className="float-right p-1 ml-auto text-3xl font-semibold leading-none text-black bg-transparent border-0 outline-none opacity-5 focus:outline-none"
              onClick={onClose}
            >
              <span className="block w-6 h-6 text-2xl text-black bg-transparent opacity-5 focus:outline-none">
                ×
              </span>
            </button>
          </div>

          {/* Body */}
          <div className="relative flex-auto p-6">
            <p className="my-4 text-blueGray-500 text-lg leading-relaxed">
              {message}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end p-6 border-t border-solid rounded-b border-blueGray-200">
            <button
              className={`
                px-6 py-2 mr-2 text-sm font-bold text-black uppercase 
                ${variantStyles.cancelBg} rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150
              `}
              type="button"
              onClick={onClose}
            >
              {cancelText}
            </button>
            <button
              className={`
                px-6 py-2 text-sm font-bold text-white uppercase 
                ${variantStyles.confirmBg} rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150
              `}
              type="button"
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
