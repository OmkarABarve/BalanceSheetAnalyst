// frontend/src/components/FileUpload.tsx
import { useState, useRef, DragEvent } from 'react'
import { Button } from './Button'

interface FileUploadProps {
  label?: string
  accept?: string
  multiple?: boolean
  maxSize?: number // in MB
  onFileSelect: (file: File | null) => void
  error?: string
  disabled?: boolean
}

export const FileUpload = ({ 
  label, 
  accept = ".pdf,.doc,.docx,.xlsx",
  multiple = false,
  maxSize = 10,
  onFileSelect,
  error,
  disabled = false
}: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`
    }
    return null
  }

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) {
      setSelectedFile(null)
      onFileSelect(null)
      return
    }

    const file = files[0] // Take first file for single upload
    const validationError = validateFile(file)

    if (validationError) {
      alert(validationError)
      return
    }

    setSelectedFile(file)
    onFileSelect(file)
  }

  const handleDrag = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (disabled) return
    
    handleFiles(e.dataTransfer.files)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const clearFile = () => {
    setSelectedFile(null)
    onFileSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      {/* Drop Zone */}
      <div 
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${
          error ? 'border-red-500 bg-red-50' : ''
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!disabled ? openFileDialog : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => {
            console.log('[FileUpload:onChange] fired', { time: e.timeStamp })
            if (disabled) { console.warn('[FileUpload:onChange] ignored (disabled)'); return }
            const files = e.currentTarget.files
            console.log('[FileUpload:onChange] files:', files)
            if (!files || files.length === 0) {
              console.warn('[FileUpload:onChange] no file selected')
              return
            }
            const file = files[0]
            console.log('[FileUpload:onChange] selected:', { name: file.name, size: file.size, type: file.type })
            handleFiles(files)
            e.currentTarget.value = ''
          }}
          className="hidden"
          disabled={disabled}
        />

        <div className="space-y-2">
          {selectedFile ? (
            <>
              <div className="text-green-600">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-sm text-gray-600">
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-xs">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              {!disabled && (
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    clearFile()
                  }}
                >
                  Remove
                </Button>
              )}
            </>
          ) : (
            <>
              <div className="text-gray-400">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="text-sm text-gray-600">
                <p className="font-medium">Click to upload or drag and drop</p>
                <p className="text-xs">PDF, DOC, DOCX, XLSX up to {maxSize}MB</p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}