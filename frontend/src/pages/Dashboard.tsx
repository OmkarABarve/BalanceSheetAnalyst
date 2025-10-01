import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/Button'
import { askChat } from '../services/chatAPI'
import { processPDFForRAG } from '../services/balanceSheetAPI'

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
      <div className="min-h-screen bg-gradient-to-br from-emerald-100 to-blue-200 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Welcome to Balance Sheet Analyst
          </h1>
          <p className="text-slate-600 text-lg">
            Please sign in to access your dashboard.
          </p>
          <div className="mt-6 flex justify-center">
            <Link to="/login">
              <Button className="px-8 py-3 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const handleFileUpload = async (file: File) => {
    setUploadLoading(true)
    try {
      await processPDFForRAG(file, 'default', new Date().getFullYear(), user?.id)
      setUploadSuccess('PDF processed and ready for questions!')
      setSelectedFile(null)
      setTimeout(() => setUploadSuccess(''), 3000)
    } catch (error:unknown) {
      console.error('Upload failed:', error)
      alert(`Upload failed: ${error}`)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Balance Sheet Analyst
          </h1>
          <p className="text-lg text-slate-600">
            Upload your balance sheet and ask me anything
          </p>
        </div>

        {/* Main Chat Section */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">AI Assistant</h2>

            {/* Chat Messages */}
            <div className="mb-6 h-96 overflow-y-auto border border-slate-200 rounded-xl p-4 bg-slate-50">
              {chatHistory.length === 0 && !chatResponse ? (
                <div className="text-center text-slate-500 mt-8">
                  <div className="text-6xl mb-4">🤖</div>
                  <p className="text-lg">Upload a PDF and ask me anything about your balance sheets!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatHistory.map((chat, index) => (
                    <div key={index}>
                      <div className="bg-blue-50 p-4 rounded-xl mb-2 border border-blue-100">
                        <p className="text-slate-700"><strong className="text-blue-700">You:</strong> {chat.question}</p>
                      </div>
                      <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
                        <p className="text-slate-700"><strong className="text-slate-800">AI:</strong> {chat.response}</p>
                      </div>
                    </div>
                  ))}
                  {chatResponse && !chatHistory.find(chat => chat.response === chatResponse) && (
                    <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
                      <p className="text-slate-700"><strong className="text-slate-800">AI:</strong> {chatResponse}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Upload Success Message */}
            {uploadSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium">
                {uploadSuccess}
              </div>
            )}

            {/* Chat Input and Upload */}
            <div className="space-y-4">
              {/* Upload Button - Compact */}
              <div className="flex justify-center">
                <label className="inline-flex items-center px-5 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors border border-slate-200">
                 
                  <span className="text-sm font-medium text-slate-700">
                    {uploadLoading ? 'Processing...' : 'Upload PDF'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setSelectedFile(file)
                        handleFileUpload(file)
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
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-700 placeholder-slate-400"
                    disabled={chatLoading}
                  />
                  <Button
                    type="submit"
                    disabled={!question.trim() || chatLoading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
