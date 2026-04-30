import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

const testAI = async () => {
  const key = process.env.ANTHROPIC_API_KEY
  console.log('Testing Key:', key ? key.substring(0, 10) + '...' : 'UNDEFINED')
  
  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hello' }]
      },
      {
        headers: {
          'x-api-key': key.trim(),
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      }
    )
    console.log('Success! Status:', response.status)
    console.log('Response:', response.data.content[0].text)
  } catch (error) {
    console.error('FAILED!')
    if (error.response) {
      console.error('Status:', error.response.status)
      console.error('Data:', JSON.stringify(error.response.data))
    } else {
      console.error('Error:', error.message)
    }
  }
}

testAI()
