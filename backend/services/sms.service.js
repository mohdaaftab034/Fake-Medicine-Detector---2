import twilio from 'twilio'

const getClient = () => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) return null
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
}

export const sendOTP = async (phone, otp) => {
  try {
    const client = getClient()
    if (!client) return console.log(`[Twilio Mock] OTP ${otp} sent to ${phone}`)
    
    await client.messages.create({
      body: `Your MediGuard verification code is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    })
    console.log(`OTP sent to ${phone}`)
  } catch (error) {
    console.error('Error sending OTP SMS:', error.message)
  }
}

export const sendAlertSMS = async (phone, alertTitle, area) => {
  try {
    const client = getClient()
    if (!client) return console.log(`[Twilio Mock] Alert SMS sent to ${phone}`)
    
    await client.messages.create({
      body: `MediGuard Alert for ${area}: ${alertTitle}. Check app for details.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    })
    console.log(`Alert SMS sent to ${phone}`)
  } catch (error) {
    console.error('Error sending Alert SMS:', error.message)
  }
}

export const sendReportConfirmationSMS = async (phone, caseId) => {
  try {
    const client = getClient()
    if (!client) return console.log(`[Twilio Mock] Report SMS sent to ${phone}`)
    
    await client.messages.create({
      body: `Your MediGuard report was received. Track status using Case ID: ${caseId}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    })
    console.log(`Report confirmation SMS sent to ${phone}`)
  } catch (error) {
    console.error('Error sending Report SMS:', error.message)
  }
}
