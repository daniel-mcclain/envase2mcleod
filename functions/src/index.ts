import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

admin.initializeApp();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.password
  }
});

export const onTaskUpdate = functions.firestore
  .document('build_tasks/{taskId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();
    
    // Check if there's a meaningful change
    if (
      newData.status === previousData.status &&
      newData.subTasks.length === previousData.subTasks.length &&
      JSON.stringify(newData.subTasks) === JSON.stringify(previousData.subTasks)
    ) {
      return null;
    }

    // Get all subscriptions for this task
    const subscriptionsSnapshot = await admin
      .firestore()
      .collection('task_subscriptions')
      .where('taskId', '==', context.params.taskId)
      .get();

    const emailPromises = subscriptionsSnapshot.docs.map(async (doc) => {
      const subscription = doc.data();
      
      // Prepare email content
      const emailContent = {
        from: '"Task Update" <noreply@yourdomain.com>',
        to: subscription.email,
        subject: `Task Update: ${newData.title}`,
        html: `
          <h2>Task Update Notification</h2>
          <p><strong>Task:</strong> ${newData.title}</p>
          <p><strong>Status:</strong> ${newData.status}</p>
          <p><strong>Description:</strong> ${newData.description}</p>
          ${
            newData.subTasks.length > 0
              ? `
                <h3>Subtasks:</h3>
                <ul>
                  ${newData.subTasks
                    .map(
                      (st: any) => `
                    <li>${st.title} - ${st.completed ? '✅ Completed' : '⏳ Pending'}</li>
                  `
                    )
                    .join('')}
                </ul>
              `
              : ''
          }
          <p>
            <small>You are receiving this email because you subscribed to updates for this task. 
            To unsubscribe, click the bell icon on the task in the application.</small>
          </p>
        `
      };

      try {
        await transporter.sendMail(emailContent);
      } catch (error) {
        console.error('Error sending email:', error);
      }
    });

    await Promise.all(emailPromises);
    return null;
  });