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
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState('')

  // Chat state
  const [question, setQuestion] = useState('')
  const [chatResponse, setChatResponse] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<Array<{question: string, response: string}>>([])

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Balance Sheet Analyst
          </h1>
          <p className="text-gray-600 text-lg">
            Please sign in to access your dashboard.
          </p>
        </div>
      </div>
    )
  }

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert('Please select a PDF file first')
      return
    }

    setUploadLoading(true)
    try {
      await uploadBalanceSheet(selectedFile, 'default', new Date().getFullYear())
      setUploadSuccess('Balance sheet uploaded successfully!')
      setSelectedFile(null)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Balance Sheet Analyst
          </h1>
          <p className="text-lg text-gray-600">
            Upload your balance sheet and ask me anything
          </p>
        </div>

        {/* Main Chat Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">AI Assistant</h2>
            
            {/* Chat Messages */}
            <div className="mb-6 h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
              {chatHistory.length === 0 && !chatResponse ? (
                <div className="text-center text-gray-500 mt-8">
                  <div className="text-6xl mb-4">🤖</div>
                  <p className="text-lg">Ask me anything about your balance sheets!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatHistory.map((chat, index) => (
                    <div key={index}>
                      <div className="bg-blue-100 p-3 rounded-lg mb-2">
                        <p className="text-blue-800"><strong>You:</strong> {chat.question}</p>
                      </div>
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <p className="text-gray-800"><strong>AI:</strong> {chat.response}</p>
                      </div>
                    </div>
                  ))}
                  {chatResponse && !chatHistory.find(chat => chat.response === chatResponse) && (
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <p className="text-gray-800"><strong>AI:</strong> {chatResponse}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Upload Success Message */}
            {uploadSuccess && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                {uploadSuccess}
              </div>
            )}

            {/* Chat Input and Upload */}
            <div className="space-y-4">
              {/* Upload Button - Small and Compact */}
              <div className="flex justify-center">
                <label className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
                  
                  <span className="text-sm font-medium text-gray-700">
                    {uploadLoading ? 'Uploading...' : 'Upload PDF'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setSelectedFile(file)
                        handleFileUpload()
                      }
                    }}
                    className="hidden"
                    disabled={uploadLoading}
                  />
                </label>
              </div>

              {/* Chat Input */}
              <form onSubmit={handleChatSubmit}>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask a question about your balance sheet..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={chatLoading}
                  />
                  <Button 
                    type="submit"
                    disabled={!question.trim() || chatLoading}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200"
                  >
                    {chatLoading ? '...' : 'Ask'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}