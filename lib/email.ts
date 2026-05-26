import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendInvitationParams {
  toEmail: string
  inviterName: string
  workspaceName: string
  role: string
  invitationToken: string
}

export async function sendTeamInvitation({
  toEmail,
  inviterName,
  workspaceName,
  role,
  invitationToken,
}: SendInvitationParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const inviteUrl = `${appUrl}/invitation/${invitationToken}`

  const roleLabels: Record<string, string> = {
    owner: 'Propriétaire',
    admin: 'Administrateur',
    editor: 'Éditeur',
    viewer: 'Lecteur',
  }

  const roleLabel = roleLabels[role] || role

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Invitation à rejoindre l'équipe ${workspaceName}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9f9fb; margin: 0; padding: 0;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #eef0f5; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Creatabl.ia</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px 40px 32px 40px;">
              <h2 style="margin-top: 0; color: #1e1b4b; font-size: 20px; font-weight: 700; line-height: 1.3;">Rejoignez l'équipe ${workspaceName}</h2>
              <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 16px 0 24px 0;">
                Bonjour,
              </p>
              <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 16px 0 24px 0;">
                <strong>${inviterName}</strong> vous invite à rejoindre son espace de travail <strong>${workspaceName}</strong> sur Creatabl.ia en tant que <strong>${roleLabel}</strong>.
              </p>
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${inviteUrl}" style="background-color: #4f46e5; color: #ffffff; display: inline-block; font-size: 14px; font-weight: 600; line-height: 50px; text-align: center; text-decoration: none; width: 220px; border-radius: 12px; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2); transition: all 0.2s;">
                      Accepter l'invitation
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 24px 0 0 0; text-align: center;">
                Cette invitation expirera dans 7 jours. Si vous n'attendiez pas cette invitation, vous pouvez ignorer cet e-mail.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background-color: #f9f9fb; border-top: 1px solid #eef0f5; text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                &copy; 2026 Creatabl.ia. Tous droits réservés.
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@creatabl-ia.com'

  try {
    const data = await resend.emails.send({
      from: `Creatabl.ia <${fromEmail}>`,
      to: toEmail,
      subject: `${inviterName} vous invite à rejoindre son équipe sur Creatabl.ia`,
      html,
    })
    return { success: true, data }
  } catch (error) {
    console.error('Error sending invitation email via Resend:', error)
    return { success: false, error }
  }
}
