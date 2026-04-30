import nodemailer from 'nodemailer'

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })
}

export const sendWelcomeEmail = async (user) => {
  try {
    const transporter = createTransporter()
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Welcome to MediGuard',
      html: `<h1>Welcome ${user.name}!</h1><p>Thank you for joining MediGuard.</p>`
    })
    console.log(`Welcome email sent to ${user.email}`)
  } catch (error) {
    console.error('Error sending welcome email:', error.message)
  }
}

export const sendReportConfirmation = async (email, caseId) => {
  try {
    const transporter = createTransporter()
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `MediGuard Report Received - ${caseId}`,
      html: `<h2>Report Confirmation</h2><p>Your report has been received. Case ID: ${caseId}</p>`
    })
    console.log(`Report confirmation email sent to ${email}`)
  } catch (error) {
    console.error('Error sending report confirmation email:', error.message)
  }
}

export const sendChemistApproval = async (chemist) => {
  try {
    const transporter = createTransporter()
    const user = await chemist.populate('user')
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.user.email,
      subject: 'MediGuard Chemist Verification Approved',
      html: `<h2>Verification Approved</h2><p>Your shop ${chemist.shopName} has been verified.</p>`
    })
    console.log(`Chemist approval email sent to ${user.user.email}`)
  } catch (error) {
    console.error('Error sending chemist approval email:', error.message)
  }
}

export const sendChemistRejection = async (chemist, reason) => {
  try {
    const transporter = createTransporter()
    const user = await chemist.populate('user')
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.user.email,
      subject: 'MediGuard Chemist Verification Rejected',
      html: `<h2>Verification Rejected</h2><p>Your shop ${chemist.shopName} verification was rejected. Reason: ${reason}</p>`
    })
    console.log(`Chemist rejection email sent to ${user.user.email}`)
  } catch (error) {
    console.error('Error sending chemist rejection email:', error.message)
  }
}

export const sendAlertEmail = async (users, alert) => {
  try {
    const transporter = createTransporter()
    const emails = users.map(user => user.email).join(', ')
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER, // Send to self
      bcc: emails, // Use BCC for bulk emails
      subject: `MediGuard Alert: ${alert.title}`,
      html: `<h2>Critical Alert</h2><p>${alert.description}</p><p>Affected States: ${alert.affectedStates.join(', ')}</p>`
    })
    console.log(`Alert email sent to ${users.length} users`)
  } catch (error) {
    console.error('Error sending alert email:', error.message)
  }
}
