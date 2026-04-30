import cron from 'node-cron'
import axios from 'axios'
import * as cheerio from 'cheerio'
import Alert from '../models/Alert.model.js'

export const scrapeAlerts = async () => {
  try {
    const response = await axios.get('https://cdsco.gov.in/opencms/opencms/en/Drugs/DrugsAlerts/', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    })
    const $ = cheerio.load(response.data)
    const alerts = []
    // Parse table rows from CDSCO page
    $('table tr').each((i, row) => {
      if (i === 0) return // skip header
      const cells = $(row).find('td')
      if (cells.length >= 3) {
        alerts.push({
          title: $(cells[0]).text().trim() || 'CDSCO Alert',
          description: $(cells[1]).text().trim(),
          dateIssued: $(cells[2]).text().trim()
        })
      }
    })
    // Save new alerts to database
    // Send notifications to affected users
    console.log(`Scraped ${alerts.length} alerts from CDSCO`)
  } catch (error) {
    console.error('CDSCO scraping failed:', error.message)
    // Don't crash the server if scraping fails
  }
}

export const startAllJobs = () => {
  // Run every 6 hours
  cron.schedule('0 */6 * * *', scrapeAlerts)
  console.log('CDSCO scraper job scheduled — runs every 6 hours')
  
  // Run daily at midnight to deactivate expired alerts
  cron.schedule('0 0 * * *', async () => {
    try {
      await Alert.updateMany(
        { expiresAt: { $lt: new Date() } },
        { isActive: false }
      )
      console.log('Expired alerts deactivated')
    } catch(err) {
      console.error('Error deactivating alerts:', err)
    }
  })
}
