import { sendNotificationEmail } from "./plunk";

export const NOTIFICATION_TEMPLATES = {
  POST_PUBLISHED: (data: { postTitle: string; platform: string }) => ({
    subject: `🚀 Post Published: ${data.postTitle}`,
    body: `Your post "${data.postTitle}" has been successfully published to ${data.platform}. Check it out now!`,
  }),
  COMMENT_RECEIVED: (data: { platform: string; commenter: string; commentBody: string }) => ({
    subject: `💬 New Comment on ${data.platform}`,
    body: `${data.commenter} just commented on your post: "${data.commentBody}"`,
  }),
  WEEKLY_REPORT: (data: { totalEngagement: number; topPost: string }) => ({
    subject: `📊 Your Weekly Performance Report`,
    body: `Last week, your posts reached ${data.totalEngagement} people. Your top post was "${data.topPost}".`,
  }),
  SCHEDULED_REMINDER: (data: { postTitle: string; time: string }) => ({
    subject: `⏰ Reminder: Scheduled Post`,
    body: `Your post "${data.postTitle}" is scheduled to go live at ${data.time}.`,
  }),
  NEW_FOLLOWER: (data: { platform: string; followerName: string }) => ({
    subject: `🎉 New Follower on ${data.platform}`,
    body: `Great news! ${data.followerName} just started following you on ${data.platform}.`,
  }),
};

export async function notifyUser(
  email: string,
  type: keyof typeof NOTIFICATION_TEMPLATES,
  data: any
) {
  const template = NOTIFICATION_TEMPLATES[type](data);
  await sendNotificationEmail({
    to: email,
    subject: template.subject,
    body: template.body,
  });
}
