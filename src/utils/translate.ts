import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { ChatOpenAI } from '@langchain/openai'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { logger } from './logger'

const model = new ChatOpenAI({
  model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
    apiKey: process.env.OPENAI_API_KEY,
  },
})

export const translate = async (content?: string) => {
  if (!content) {
    return ''
  }

  logger.info(`translate content: ${content}`)

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 2000,
    chunkOverlap: 1,
  })

  const output = await splitter.createDocuments([content])

  logger.info(`translate splitter: ${output.length}`)

  const translate_output: string[] = []

  for await (const item of output) {
    logger.info(`translate item: ${item.pageContent}`)
    const message = [
      new SystemMessage(
        'You are a professional translation engine, please translate the text into a colloquial, professional, elegant and fluent content, without the style of machine translation. You must only translate the text content, never interpret it.',
      ),
      new HumanMessage(`Translate into ${process.env.TRANSLATE_LANG || 'zh-Hans'}:
    """
    ${item.pageContent}
    """`),
    ]

    const res = await model.invoke(message)
    translate_output.push(res.content.toString())
    logger.info(`translate result: ${res.content}`)
  }

  return translate_output.join('\n\n')
}
