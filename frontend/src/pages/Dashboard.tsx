// frontend/src/pages/Dashboard.tsx
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { FileUpload } from '../components/FileUpload'
import { Button } from '../components/Button'
import { askChat } from '../services/chatAPI'
import { uploadBalanceSheet } from '../services/balanceSheetAPI'

export const Dashboard = () => {
  const { user } = useAuth()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [companyId, setCompanyId] = useState('')
  const [year, setYear] = useState(new Date().getFullYear())
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState('')

  // Chat state
  const [question, setQuestion] = useState('')
  const [chatResponse, setChatResponse] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<Array<{question: string, response: string}>>([])

  if (!user) {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Balance Sheet Analyst
        </h1>
        <p className="text-gray-600">
          Please sign in to access your dashboard.
        </p>
      </div>
    )
  }

  const handleFileUpload = async () => {
    if (!selectedFile || !companyId) {
      alert('Please select a file and enter company information')
      return
    }

    setUploadLoading(true)
    try {
      await uploadBalanceSheet(selectedFile, companyId, year)
      setUploadSuccess('Balance sheet uploaded successfully!')
      setSelectedFile(null)
      setCompanyId('')
      setTimeout(() => setUploadSuccess(''), 3000)
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploadLoading(false)
    }
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return

    setChatLoading(true)
    try {
      const response = await askChat(question)
      setChatResponse(response)
      setChatHistory(prev => [...prev, { question, response }])
      setQuestion('')
    } catch (error) {
      console.error('Chat failed:', error)
      setChatResponse('Sorry, I encountered an error. Please try again.')
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">
        Dashboard
      </h1>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Assets</h3>
          <p className="text-3xl font-bold text-blue-600">$0</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Liabilities</h3>
          <p className="text-3xl font-bold text-red-600">$0</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Equity</h3>
          <p className="text-3xl font-bold text-green-600">$0</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* File Upload Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Upload Balance Sheet</h2>
          
          {uploadSuccess && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {uploadSuccess}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company ID
              </label>
              <input
                type="text"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter company ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="2000"
                max={new Date().getFullYear()}
              />
            </div>

            <FileUpload
              label="Select Balance Sheet PDF"
              accept=".pdf"
              onFileSelect={setSelectedFile}
              maxSize={10}
            />

            <Button 
              onClick={handleFileUpload}
              disabled={!selectedFile || !companyId || uploadLoading}
              className="w-full"
            >
              {uploadLoading ? 'Uploading...' : 'Upload Balance Sheet'}
            </Button>
          </div>
        </div>

        {/* Chat Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">AI Assistant</h2>
          
          {/* Chat History */}
          <div className="mb-4 h-64 overflow-y-auto border border-gray-200 rounded-md p-3 bg-gray-50">
            {chatHistory.length === 0 ? (
              <p className="text-gray-500 text-center">Ask me anything about your balance sheets!</p>
            ) : (
              chatHistory.map((chat, index) => (
                <div key={index} className="mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg mb-2">
                    <p className="text-sm text-blue-800"><strong>You:</strong> {chat.question}</p>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <p className="text-sm text-gray-800"><strong>AI:</strong> {chat.response}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleChatSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ask a question about your balance sheets
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                placeholder="e.g., What is the total equity for company XYZ in 2023?"
                disabled={chatLoading}
              />
            </div>
            
            <Button 
              type="submit"
              disabled={!question.trim() || chatLoading}
              className="w-full"
            >
              {chatLoading ? 'Thinking...' : 'Ask AI'}
            </Button>
          </form>
        </div>
      </div>

      {/* Balance Sheets List (Placeholder) */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Your Balance Sheets</h2>
        <div className="text-center text-gray-500 py-8">
          <p>No balance sheets uploaded yet.</p>
          <p className="text-sm mt-2">Upload a PDF above to get started!</p>
        </div>
      </div>
    </div>
  )
}
