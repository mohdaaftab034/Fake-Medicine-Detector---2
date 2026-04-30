import cron from 'node-cron'
import Alert from '../models/Alert.model.js'

export const startAlertNotificationJob = () => {
  // Can be used to periodically check alerts and notify users 
  // who haven't read critical alerts
  cron.schedule('0 12 * * *', async () => {
    try {
      console.log('Running daily alert notification reminder...')
      // Implementation logic here
    } catch (error) {
      console.error('Error in alert notification job:', error)
    }
  })
}
