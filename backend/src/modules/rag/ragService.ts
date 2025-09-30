import { Injectable } from '@nestjs/common'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'
//import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase'
import { SupabaseService } from '../../database/supabaseClient'
//./ragController
import { BalanceSheetService } from '../balancesheet/balanceSheetService'
import { combineDocs } from './ragUtil'
import { Inject, forwardRef } from '@nestjs/common'

@Injectable()
export class RAGService {
  private pdfChunks: string[]=[]
  constructor(
    private readonly supabaseService: SupabaseService
  ) {}

  async processForRAG(file: Express.Multer.File, userId: string, companyId: string, year: number) {
    try {
      // Extract text from PDF directly (returns string)
      const extractedText = await this.extractTextFromPDF(file.buffer)

      // Create text chunks from extracted text
      const chunks = await this.createTextChunks(extractedText)

      // Generate embeddings
      const embeddings = await this.generateEmbeddings(chunks)

      // Generate a simple ID for this processing session
      const balanceSheetId = `rag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Store embeddings in vector database
      await this.storeEmbeddings(embeddings, {
        userId,
        balanceSheetId,
        filename: file.originalname
      })

      return {
        success: true,
        chunks: chunks.length,
        balanceSheetId,
        extractedText
      }
    } catch (error) {
      console.error('Error processing for RAG:', error)
      throw error
    }
  }

  async queryRAG(question: string, userId?: string, k = 3) {
    console.log('🔍 Direct RAG query for:', question)
    
    if (this.pdfChunks.length === 0) {
      console.log('⚠️ No PDF content available')
      return 'No PDF content available for questions.'
    }

    // Simple keyword-based relevance scoring
    const questionWords = question.toLowerCase().split(' ')
    const scoredChunks = this.pdfChunks.map(chunk => {
      const chunkLower = chunk.toLowerCase()
      let score = 0
      
      questionWords.forEach(word => {
        if (chunkLower.includes(word) && word.length > 3) {
          score += 1
        }
      })
      
      return { chunk, score }
    })
    
    scoredChunks.sort((a, b) => b.score - a.score)
    const relevantChunks = scoredChunks.slice(0, k).map(item => item.chunk)
    
    console.log(`✅ Found ${relevantChunks.length} relevant chunks`)
    return relevantChunks.join('\n\n')
  }

  // Direct method for chat service - combines query and context retrieval
  async getContextForQuestion(question: string): Promise<string> {
    try {
      return await this.queryRAG(question, undefined, 3)
    } catch (error) {
      console.error('Context retrieval failed:', error)
      return 'Unable to retrieve relevant context.'
    }
  }

  // Direct PDF processing method
  async processPDFDirect(file: Express.Multer.File): Promise<{chunks: number, text: string}> {
    console.log('📄 Starting PDF processing:', file.originalname)

    const useTextract = process.env.RAG_USE_TEXTRACT === 'true'
    const useHeuristic = process.env.RAG_USE_DIGITAL_TABLES === 'true'

    // Base text via pdf-parse
    let extractedText = await this.extractTextFromPDF(file.buffer)

    if (useTextract) {
      // Will auto-fallback if SDK/env not available
      extractedText = await this.extractStructuredTextFromPDF(file.buffer, file.originalname)
    } else if (useHeuristic) {
      // AWS-free digital-PDF table heuristic; ignored for scanned PDFs
      const tablesMd = await this.extractDigitalTablesHeuristic(file.buffer)
      if (tablesMd && tablesMd.trim().length > 0) {
        extractedText = [extractedText.trim(), tablesMd.trim()].filter(Boolean).join('\n\n')
      }
    }

    console.log('📝 Text extracted, length:', extractedText.length)

    const chunks = await this.createTextChunks(extractedText)
    console.log('✂️ Created', chunks.length, 'text chunks')

    // Store in memory for immediate querying
    this.pdfChunks = chunks
    console.log('💾 Stored chunks in memory for RAG querying')

    return {
      chunks: chunks.length,
      text: extractedText
    }
  }
////////////////////////////////////////////// PUBLIC IMPORTANT ABOVE,PRIVATE HELPERS BELOW ////////////////////////////////////////////
   async createTextChunks(text: string): Promise<string[]> {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    })
    
    const chunks = await splitter.createDocuments([text])
    console.log('✂️ Created', chunks.length, 'text chunks')
    return chunks.map(chunk => chunk.pageContent)
  }

   async generateEmbeddings(chunks: string[]): Promise<Array<{chunk: string, embedding: number[]}>> {
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY!, // ✅ Fixed: No VITE_ prefix
      model: "models/embedding-001",
    })
    
    const results = []
    for (const chunk of chunks) {
      const embedding = await embeddings.embedQuery(chunk)
      results.push({ chunk, embedding })
    }
    
    return results
  }
  //Alr used in balanceSheetService which has its own implementation
  public async extractTextFromPDF(fileBuffer: Buffer): Promise<string> {
    const pdfParse = require('pdf-parse')
    try {
      const data = await pdfParse(fileBuffer)
      console.log('📝 Text extracted, length:', data.text.length)
      return data.text
    } catch (error) {
      console.error('PDF extraction error:', error)
      throw new Error('Failed to extract text from PDF')
    }
  }
    
  // Optional structured extraction via Textract (tables) + pdf-parse (flowing text)
  // Loads AWS SDK lazily; if not installed or not configured, it simply returns flowing text.
  public async extractStructuredTextFromPDF(fileBuffer: Buffer, originalName: string): Promise<string> {
    const pdfParse = require('pdf-parse')

    // 1) Fast flowing text for digital PDFs
    let flowingText = ''
    try {
      const data = await pdfParse(fileBuffer)
      flowingText = data.text || ''
    } catch {}

    // Try to load AWS SDK only when needed
    let S3Client: any, PutObjectCommand: any, TextractClient: any, StartDocumentAnalysisCommand: any, GetDocumentAnalysisCommand: any
    try {
      ;({ S3Client, PutObjectCommand } = require('@aws-sdk/client-s3'))
      ;({ TextractClient, StartDocumentAnalysisCommand, GetDocumentAnalysisCommand } = require('@aws-sdk/client-textract'))
    } catch {
      return flowingText
    }

    // 2) Tables via Textract (requires S3 + AWS creds); fall back gracefully
    const region = process.env.AWS_REGION || 'us-east-1'
    const bucket = process.env.TEXTRACT_BUCKET
    if (!bucket) {
      return flowingText
    }

    try {
      const s3 = new S3Client({ region })
      const key = `uploads/${Date.now()}_${originalName}`
      await s3.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: 'application/pdf'
      }))

      const textract = new TextractClient({ region })
      const start = await textract.send(new StartDocumentAnalysisCommand({
        DocumentLocation: { S3Object: { Bucket: bucket, Name: key } },
        FeatureTypes: ['TABLES']
      }))

      const jobId = start.JobId!
      let blocks: any[] = []
      // Basic polling; for low usage this is fine
      while (true) {
        const res = await textract.send(new GetDocumentAnalysisCommand({ JobId: jobId }))
        if (res.JobStatus === 'SUCCEEDED') {
          blocks = res.Blocks || []
          break
        }
        if (res.JobStatus === 'FAILED') throw new Error('Textract failed')
        await new Promise(r => setTimeout(r, 1500))
      }

      const tablesMd = this.textractTablesToMarkdown(blocks)
      const combined = [flowingText.trim(), tablesMd.trim()].filter(Boolean).join('\n\n')
      return combined.length ? combined : flowingText
    } catch (e) {
      console.error('Textract table extraction failed, falling back:', e)
      return flowingText
    }
  }

  // AWS-free: heuristic table extraction for digital PDFs using pdf2json
  // Best-effort; scanned PDFs won't work here.
  private async extractDigitalTablesHeuristic(fileBuffer: Buffer): Promise<string> {
    let PDFParser: any
    try {
      PDFParser = require('pdf2json')
    } catch {
      return ''
    }

    const decode = (t: string) => {
      try { return decodeURIComponent(t) } catch { return t }
    }

    const groupByTolerance = (values: number[], tol: number) => {
      const groups: number[][] = []
      for (const v of values.sort((a,b)=>a-b)) {
        const g = groups.find(arr => Math.abs(arr[0]-v) <= tol)
        if (g) g.push(v); else groups.push([v])
      }
      return groups.map(arr => arr[0])
    }

    const mdParts: string[] = []
    const rowsTol = 1.5 // y tolerance for same row
    const gapThreshold = 6 // x gap threshold for new cell (empirical)

    const text = await new Promise<string>((resolve) => {
      const parser = new PDFParser()
      parser.on('pdfParser_dataError', () => resolve(''))
      parser.on('pdfParser_dataReady', (pdfData: any) => {
        const pages = pdfData?.Pages || []
        for (const page of pages) {
          const texts = page.Texts || []
          const items = texts.flatMap((t: any) => {
            const str = (t.R || []).map((r: any) => decode(r.T || '')).join('')
            return [{ x: t.x, y: t.y, str }]
          }).filter((i: any) => i.str && i.str.trim().length > 0)

          // Group y positions to rows
                   // Group y positions to rows (normalize and de-jitter)
                   const ys = Array.from(
                    new Set(
                      items
                        .map((i: any) => (Number.isFinite(i.y) ? Number(i.y) : undefined))
                        .filter((v: any) => typeof v === 'number')
                        .map((v: number) => +v.toFixed(1)) // stabilize float jitter
                    )
                  )
                  const rowKeys: number[] = groupByTolerance(ys as number[], rowsTol)
          const rows: { y: number, cells: { x: number, str: string }[] }[] = rowKeys.map(y0 => ({
            y: y0,
            cells: items.filter((i: any)=>Math.abs(i.y - y0) <= rowsTol).map((i: any)=>({ x: i.x, str: i.str }))
          }))

          rows.sort((a,b)=>a.y - b.y)

          // Build markdown table per page
          if (rows.length > 1) {
            const mkRow = (cells: {x:number,str:string}[]) => {
              const sorted = cells.sort((a,b)=>a.x - b.x)
              const cols: string[] = []
              let curr = ''
              for (let i=0;i<sorted.length;i++) {
                const prev = sorted[i-1]
                if (i>0 && (sorted[i].x - prev.x) > gapThreshold) {
                  cols.push(curr.trim())
                  curr = sorted[i].str
                } else {
                  curr = (curr ? curr + ' ' : '') + sorted[i].str
                }
              }
              if (curr) cols.push(curr.trim())
              return cols
            }

            const headerCols = mkRow(rows[0].cells)
            if (headerCols.length >= 2) {
              mdParts.push(
                '| ' + headerCols.join(' | ') + ' |',
                '| ' + headerCols.map(()=> '---').join(' | ') + ' |'
              )
              for (const r of rows.slice(1)) {
                const cols = mkRow(r.cells)
                mdParts.push('| ' + cols.join(' | ') + ' |')
              }
              mdParts.push('') // blank line after table
            }
          }
        }
        resolve(mdParts.join('\n'))
      })
      parser.parseBuffer(fileBuffer)
    })

    return text
  }

  private textractTablesToMarkdown(blocks: any[] = []): string {
    const blockMap = new Map<string, any>()
    for (const b of blocks) blockMap.set(b.Id, b)

    const tables = blocks.filter(b => b.BlockType === 'TABLE')
    const mdParts: string[] = []

    const getTextForIds = (ids?: string[]): string => {
      if (!ids) return ''
      const words: string[] = []
      for (const id of ids) {
        const b = blockMap.get(id)
        if (!b) continue
        if (b.BlockType === 'WORD' && b.Text) words.push(b.Text)
        if (b.BlockType === 'SELECTION_ELEMENT' && b.SelectionStatus === 'SELECTED') words.push('[x]')
        if (b.Relationships) {
          for (const r of b.Relationships) {
            if (r.Type === 'CHILD') words.push(getTextForIds(r.Ids))
          }
        }
      }
      return words.join(' ').replace(/\s+/g, ' ').trim()
    }

    for (const table of tables) {
      const rel = table.Relationships?.find((r: any) => r.Type === 'CHILD')
      const cellBlocks = (rel?.Ids ?? [])
        .map((id: string) => blockMap.get(id))
        .filter((b: any) => b?.BlockType === 'CELL')

      let maxRow = 0, maxCol = 0
      for (const c of cellBlocks) {
        maxRow = Math.max(maxRow, c.RowIndex || 0)
        maxCol = Math.max(maxCol, c.ColumnIndex || 0)
      }
      const grid: string[][] = Array.from({ length: maxRow }, () => Array(maxCol).fill(''))

      for (const c of cellBlocks) {
        const childRel = c.Relationships?.find((r: any) => r.Type === 'CHILD')
        const text = getTextForIds(childRel?.Ids)
        grid[(c.RowIndex || 1) - 1][(c.ColumnIndex || 1) - 1] = text
      }

      const header = grid[0] ?? []
      const divider = header.map(() => '---')
      const body = grid.slice(1)

      mdParts.push(
        '| ' + header.map(v => v || ' ').join(' | ') + ' |',
        '| ' + divider.join(' | ') + ' |',
        ...body.map(row => '| ' + row.map(v => v || ' ').join(' | ') + ' |'),
        ''
      )
    }
    return mdParts.join('\n')
  }

  public async storeEmbeddings(
    embeddings: Array<{chunk: string, embedding: number[]}>,
    metadata: { userId: string, balanceSheetId: string, filename: string }
  ): Promise<void> {
    const supabase = this.supabaseService.getClient()

    // Store each embedding chunk in the Vector_embeddings table
    const embeddingsData = embeddings.map(({ chunk, embedding }) => ({
      balance_sheet_data_id: metadata.balanceSheetId,
      user_id: metadata.userId,
      content: chunk,
      embedding: JSON.stringify(embedding), // Store as JSON string for Supabase
      filename: metadata.filename,
      created_at: new Date().toISOString()
    }))

    const { error } = await supabase
      .from('Vector_embeddings')
      .insert(embeddingsData)

    if (error) {
      console.error('Error storing embeddings:', error)
      throw new Error(`Failed to store embeddings: ${error.message}`)
    }

    console.log(`✅ Stored ${embeddings.length} embeddings for ${metadata.filename}`)
  }
}